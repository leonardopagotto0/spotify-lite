import React from 'react';
import { invoke } from '@tauri-apps/api';

import './style.css';

function TrackCard({id, name, image, artist, album, duration}) {

    async function playTrack(trackId)
    {
        try {
            await invoke("load_track", {id: trackId});
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='track_card' onClick={() => playTrack(id)}>
            <div className='about'>
                <img className='image' src={image} alt="" />
                <div className='music_data'>
                    <span className='name'>{name}</span>
                    <span className='artist'>{artist}</span>
                </div>
            </div>
            <span className='album'>{album}</span>
            <span className='duration'>{duration}</span>
        </div>
    );
}

export default TrackCard;