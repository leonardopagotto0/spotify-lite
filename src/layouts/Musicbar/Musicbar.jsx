import React, { useEffect, useRef, useState } from 'react';
import * as tauriEvent from '@tauri-apps/api/event';
import * as player from "../../services/player.js";

import './style.css';
import music_cape from '../../assets/examples/music_cape.jpg';

function Musicbar() {

    const playOptions = {
        current : "play_circle_filled",
        play: "play_circle_filled",
        pause: "pause_circle_filled"
    }
    const playerEvents = {
        play: "Playing",
        pause: "Paused",
        Stopped: "Stopped",
        EndOfTrack: "EndOfTrack",
    }

    const [ playBtn, setPlayBtn ] = React.useState(playOptions.play);
    const [volume, setVolume] = useState(100);
    const [trackPosition, setTrackPosition] = useState(0);
    const playBtnState = useRef("playing");
    const intervalTrackBar = useRef(null);

    async function updateTrackPosition(durationMs, currentPosition){

        const progressBar = document.getElementById('track-bar-current');
        const intervalMs = 1000; // Intervalo em milissegundos (1 segundo)
        const maxProgress = 100; // Valor máximo do input range
        const progressIncrement = maxProgress / (durationMs / intervalMs);
        // pocição autla em porcentagem
        const positionProcent = (currentPosition / durationMs) * 100;
        console.log(positionProcent);
        let isUserInteracting = false; 

        let currentValue = positionProcent;

        clearInterval(intervalTrackBar.current);

        intervalTrackBar.current = setInterval(() => {
            currentValue += progressIncrement;

            if (currentValue > maxProgress) {
                clearInterval(intervalTrackBar.current);
                currentValue = maxProgress;
            }

            if(isUserInteracting) return;
            
            progressBar.value = currentValue;
        }, intervalMs);

        progressBar.addEventListener('input', (event) => {
            isUserInteracting = true; // Marca a interação do usuário
        });
        
        progressBar.addEventListener('change', (event) => {
            const newPositionProcent = event.currentTarget.value;
            const newPositionMs = (durationMs / maxProgress) * newPositionProcent;

            player.seek(parseInt(newPositionMs));
            isUserInteracting = false; // Desmarca a interação do usuário
        });
    }

    async function init(){
        tauriEvent.listen("player://general", (event) => {
            const { payload } = event;

            if(payload.event == playerEvents.play){
                playBtnState.current = "playing";
                setPlayBtn(playOptions.pause);
                updateTrackPosition(payload.data.duration_ms, payload.data.position_ms);             
            }
            if(payload.event == playerEvents.pause){
                playBtnState.current = "paused";
                setPlayBtn(playOptions.play);
            }
            if(payload.event == playerEvents.Stopped){
                setPlayBtn(playOptions.play);
            }
            
            console.log("Event", event);
        });

    }

    useEffect(() => {
        init();
        console.log("loading");
    }, []);

    return (
            <div className='musicbar'>
                <div className='current-music'>
                    <img src={music_cape} alt="" />
                    <div className='data'>
                        <span className='title'>Cupid</span>
                        <span className='band'>FIFTY FIFTY</span>
                    </div>
                    <span style={{color: "white"}} id='heart'>&#x2764;</span>
                </div>
                <div className="controllers">
                    <div className='options'>
                        <i class="material-icons">shuffle</i>
                        <i class="material-icons">skip_previous</i>
                        <i class="material-icons play_btn" onClick={() => player.playPauseSeter(playBtnState.current)}>{playBtn}</i>
                        <i class="material-icons">skip_next</i>
                        <i class="material-icons">all_inclusive</i>
                    </div>
                    <input type="range" id='track-bar-current' className='track-radio-controller' defaultValue={0} min={0} max={100} />
                </div>
                <div className='geral_conf'>
                    <i class="material-icons">volume_up</i>
                    <input type="range" className='volume_bar' defaultValue={volume} min={0} max={100} onChange={(el) => player.setVolume(parseInt(el.target.value))}/>
                </div>
            </div>
    );
}

export default Musicbar;