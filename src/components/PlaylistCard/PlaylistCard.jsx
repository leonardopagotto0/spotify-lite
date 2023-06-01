import React from 'react'

function PlaylistCard({id, name, owner, image, callback}) {
    return (
        <div className='opt' onClick={() => callback(id)}>
            <img src={image} alt="" />
            <div className='specifications'>
                <span className='name'>{name}</span>
                <span className='type'>Playlist • {owner}</span>
            </div>
        </div>
    );
}

export default PlaylistCard;