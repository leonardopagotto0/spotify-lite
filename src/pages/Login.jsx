import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import requestAccessToken from "../services/requestAccessToken.js";
import * as tokenManger from "../services/token.js";

import { invoke } from '@tauri-apps/api';
import { once as TauriEventOnce } from "@tauri-apps/api/event"

import "./login.css";
import spotifyLogo from "/src/assets/icons/spotify.svg";

function Login() {

    const navegate = useNavigate();

    async function init(){
        
        let access_token = localStorage.getItem('access_token');
        
        if(access_token) {
            try {
                await invoke("validate_access_token", { accessToken: access_token });
                navegate("/");
            } catch (err) {
                localStorage.removeItem("access_token");
                await requestAccessToken();
                TauriEventOnce("client://background-loggin-success",() => navegate("/"));
            }

            return;
        };

        const urlParams = new URLSearchParams(window.location.href.split('#')[1]);
        access_token = urlParams.get('access_token');

        if(!access_token) return;

        localStorage.setItem('access_token', access_token);
        navegate("/");
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div className='login_page'>
            <button onClick={() => {tokenManger.requestExplicit(location.href)}} className='spotify_login_btn'>
                LOGIN WITH SPOTIFY 
                <img src={spotifyLogo} alt="" />
            </button>
        </div>
    );
}

export default Login;