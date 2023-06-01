import React, {useEffect, useState} from 'react';

import './style.css'
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';

function Navbar({playlists}) {
    return (
        <div className='navbar'>
            <div className='routes'>
                <span><span class="material-icons">home_outline</span> Home</span>
                <span style={{marginTop: "20px"}}><span class="material-icons">search_outline</span> Search</span>
            </div>
            <span className='title'><span class="material-icons">library_music</span>Your Library</span>
            <div className='user-area'>
                {playlists?.items.map(playlist => {
                    return <PlaylistCard key={playlist.id} id={playlist.id} name={playlist.name} owner={playlist.owner.display_name} image={playlist.images[0].url} callback={playlists.callback} />
                })}
            </div>
        </div>
    );
}

export default Navbar;