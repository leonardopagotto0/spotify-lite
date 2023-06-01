import React, { useEffect } from 'react';

import TrackCard from '../../components/TrakerCard/TrackCard';

import './style.css';

function Playlist({tracks}) {

    useEffect(() => {
        console.log(tracks);
    }, [tracks]);

    return (
        <div className='playlist'>
            <div className='content'>
                {tracks?.map(track => {
                    return <TrackCard 
                        key={track.id}
                        id={track.id}
                        name={track.name} 
                        image={track.album.images[0].url} 
                        artist={track.album.artists[0].name} 
                        album={track.album.name} 
                        duration={track.duration_ms}
                    />
                })}
            </div>
        </div>
    );
}

export default Playlist;