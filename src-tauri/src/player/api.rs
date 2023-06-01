use std::sync::{Mutex, Arc};

use librespot::core::authentication::Credentials;
use librespot::core::config::SessionConfig;
use librespot::core::session::Session;
use librespot::core::spotify_id::{SpotifyId, SpotifyItemType};
use librespot::playback::audio_backend;
use librespot::playback::config::{AudioFormat, Bitrate, PlayerConfig, VolumeCtrl};
use librespot::playback::mixer::softmixer::SoftMixer;
use librespot::playback::mixer::{MixerConfig, Mixer};
use librespot::playback::player::{Player, PlayerEventChannel, PlayerEvent};
use tauri::{AppHandle, Manager};

use crate::PLAYER_STATE;
use crate::player::models::{Volume, SessionData, PlayerState, PlayerEventMessage, self};

use super::models::PlayerEventData;

#[tauri::command]
pub fn load_track(id: String) -> Result<(), ()>
{
    let guard = PLAYER_STATE.lock().unwrap();
    let mut player = guard.as_ref().unwrap().lock().unwrap();

    let mut track = SpotifyId::from_base62(&id).unwrap();
    track.item_type = SpotifyItemType::Track;

    player.load(track);

    Ok(())
}

#[tauri::command]
pub fn play_track() -> Result<(), ()>
{
    let guard = PLAYER_STATE.lock().unwrap();
    let mut player = guard.as_ref().unwrap().lock().unwrap();

    player.play();

    Ok(())
}

#[tauri::command]
pub fn pause_track()
{
    let guard = PLAYER_STATE.lock().unwrap();
    let mut player = guard.as_ref().unwrap().lock().unwrap();

    player.pause();
}

#[tauri::command]
pub fn set_volume(volume: u16){
    let guard = PLAYER_STATE.lock().unwrap();
    let mut player = guard.as_ref().unwrap().lock().unwrap();

    player.set_volume(volume);
}

#[tauri::command]
pub fn set_track_position(position: u32)
{
    let guard = PLAYER_STATE.lock().unwrap();
    let mut player = guard.as_ref().unwrap().lock().unwrap();

    player.set_position(position);
}

pub async fn start_player(app_handle: AppHandle)
{
    let session_config = SessionConfig::default();
    let credentials = Credentials::with_password("your_email", "your_password");

    let player_config = PlayerConfig {
        bitrate: Bitrate::Bitrate160,
        gapless: false,
        passthrough: false,
        normalisation: false,
        normalisation_pregain_db: 0.0,
        normalisation_threshold_dbfs: 0.0,
        normalisation_attack_cf: 0.0,
        normalisation_release_cf: 0.0,
        normalisation_knee_db: 0.0,
        ditherer: None,
        ..Default::default()
    };

    let session = Session::new(session_config, None);
    session.connect(credentials, false).await.unwrap();

    // spotify:track:6JzzI3YxHCcjZ7MCQS2YS1
    let audio_format = AudioFormat::default();
    let backend = audio_backend::find(None).unwrap();

    let mix = Box::new(SoftMixer::open(MixerConfig {
        volume_ctrl: VolumeCtrl::Linear,
        ..Default::default()
    }));

    
    let player = Player::new(player_config, session.clone(), mix.get_soft_volume(), move || {
        backend(None, audio_format)
    });

    tokio::spawn(start_player_channel(player.get_player_event_channel(), app_handle));
    let player_arc = Arc::new(Mutex::new(player));
    
    *PLAYER_STATE.lock().unwrap() = Some(Mutex::new(PlayerState{
        player: player_arc,
        volume: Volume::new(mix),
        session: SessionData {
            session: session,
        }
    }));
}

async fn start_player_channel(mut player_channel: PlayerEventChannel, app_handle: AppHandle)
-> ! {
    loop {
        let event = match player_channel.recv().await {
            Some(event) => event,
            None => continue,  
        };

        match event {
            PlayerEvent::VolumeChanged { volume } => {
                println!("Volume changed to {}", volume);
            },
            PlayerEvent::PositionCorrection { play_request_id, position_ms, track_id } => {
                println!("Position correction for play request {:?} at position {} for track {:?}", play_request_id, position_ms, track_id);
            },
            PlayerEvent::Stopped { .. } => {
                println!("Stopped");
            },
            PlayerEvent::EndOfTrack { .. } => {
                println!("End of track");
            },
            PlayerEvent::Loading { play_request_id, track_id, position_ms } => {
                println!("Loading track {:?} for play request {:?} at position {}", track_id, play_request_id, position_ms);
            },
            PlayerEvent::Preloading { track_id } => {
                println!("Preloading track {:?}", track_id);
            },
            PlayerEvent::Playing { play_request_id: _, position_ms, track_id} => {
                app_handle.emit_all("player://general", PlayerEventMessage {
                    event: models::PlayerEvents::Playing,
                    data: Some( PlayerEventData {
                        position_ms: position_ms,
                        track_id: track_id.to_base62().unwrap(),
                    }),
                }).unwrap();
            },
            PlayerEvent::Paused { play_request_id: _, position_ms, track_id } => {
                app_handle.emit_all("player://general", PlayerEventMessage {
                    event: models::PlayerEvents::Paused,
                    data: Some( PlayerEventData {
                        position_ms: position_ms,
                        track_id: track_id.to_base62().unwrap(),
                    }),
                }).unwrap();
            },
            PlayerEvent::Stopped { play_request_id, track_id: _} => {
                println!("Stopped at {}", play_request_id);
            },
            PlayerEvent::TimeToPreloadNextTrack { track_id, play_request_id: _ } => {
                println!("Time to preload next track {:?}", track_id);
            },
            PlayerEvent::Unavailable { play_request_id:_, track_id } => {
                println!("Unavailable track {:?}", track_id);
            },
            PlayerEvent::Seeked { play_request_id, track_id, position_ms } => todo!(),
            PlayerEvent::TrackChanged { audio_item } => todo!(),
            PlayerEvent::SessionConnected { connection_id, user_name } => todo!(),
            PlayerEvent::SessionDisconnected { connection_id, user_name } => todo!(),
            PlayerEvent::SessionClientChanged { client_id, client_name, client_brand_name, client_model_name } => todo!(),
            PlayerEvent::ShuffleChanged { shuffle } => todo!(),
            PlayerEvent::RepeatChanged { repeat } => todo!(),
            PlayerEvent::AutoPlayChanged { auto_play } => todo!(),
            PlayerEvent::FilterExplicitContentChanged { filter } => todo!(),
        }
        
    }
}