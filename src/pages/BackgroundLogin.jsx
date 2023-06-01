import React, { useEffect, useRef } from 'react';
import { emit } from "@tauri-apps/api/event"

function BackgroundLogin() {

    const redirectUri = useRef("http://localhost:1420/auth/background/login");

    async function executeLogin(){
        const scope = "user-read-private user-read-email playlist-read-private user-modify-playback-state streaming";

        let args = new URLSearchParams({
            response_type: 'token',
            client_id: window.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: redirectUri.current,
        });
        
        const url = `https://accounts.spotify.com/authorize?${args}`;

        location.href = url;
    }

    useEffect(() => {

        const params = new URLSearchParams(window.location.href.split('#')[1]);
        const accessToken = params.get("access_token");

        if(accessToken){
            localStorage.setItem("access_token", accessToken);
            emit("loggedIn");
            return;
        };


        executeLogin()
    }, []);

    return (<><h1 style={{color: "white"}}>Back</h1></>);
}

export default BackgroundLogin;