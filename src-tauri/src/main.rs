#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use lazy_static::lazy_static;

mod spotify_api;
mod player;

lazy_static! {
    pub static ref PLAYER_STATE: Mutex<Option<Mutex<player::models::PlayerState>>> = Mutex::new(None);
}


#[tokio::main]
async fn main() {

    tauri::async_runtime::set(tokio::runtime::Handle::current());
    
    tauri::Builder::default()
        .setup(move |app| {
            let handle = app.handle();

            tokio::spawn(player::api::start_player(handle));
            
            return Ok(());
        })
        .invoke_handler(tauri::generate_handler![
            spotify_api::client::get_playlist,
            spotify_api::client::get_playlist_tracks,
            spotify_api::client::validate_access_token,
            player::api::play_track,
            player::api::pause_track,
            player::api::load_track,
            player::api::set_volume,
            player::api::set_track_position,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

