import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {invoke} from '@tauri-apps/api/tauri';
import validateAccessToken from '../services/validateAccessToken.js';
import requestAccessToken from '../services/requestAccessToken.js';
import { once as TauriEventOnce } from "@tauri-apps/api/event"

import Musicbar from "../layouts/Musicbar/Musicbar";
import Navbar from '../layouts/Navbar/Navbar';

import './home.css';
import Playlist from '../layouts/Playlist/Playlist';

function Home() {

    const navegate = useNavigate();
    const [ playlists, setPlaylists ] = useState();
    const [ tracks, setTracks ] = useState([]);
    const accessToken = useRef(null)

    async function init(){
        async function validateToken(){
            accessToken.current = localStorage.getItem("access_token");

            if(accessToken.current == null){
                requestAccessToken();
                return;
            }

            const isValid = await validateAccessToken(accessToken.current);

            if(!isValid){
                requestAccessToken();
                return;
            }
        }

        await validateToken();
        getPlaylists();

        return;
    }

    useEffect(() => {
        init();
    }, []);

    async function getPlaylists()
    {
        try {

            let result = await invoke("get_playlist", {accessToken: accessToken.current});
            setPlaylists({items: result.items, callback: showPlaylist});

        } catch (err) {
            console.log(err);
        }
    }

    async function showPlaylist(playlistId)
    {
        let result = await invoke("get_playlist_tracks", {playlistId, offset: 0, limit: 10, accessToken: accessToken.current});
        
        setTracks(() => {
            return result?.items.map(i => {
                return i.track;
            })
        })
    }

    return (
        <>
            <div className='home'>
                <Navbar playlists={playlists} />
                <Playlist tracks={tracks} />
            </div>
            <Musicbar />
        </>
    );
}

export default Home;