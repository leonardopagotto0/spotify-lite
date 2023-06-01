import { WebviewWindow } from "@tauri-apps/api/window";
import { emit } from "@tauri-apps/api/event"

async function requestBackground(){
    let closed = false;

    const webview = new WebviewWindow("auth", {
        url: "/auth/background/login",
        title: "Spotify Login",
        width: 800,
        height: 600,
        fullscreen: false,
        visible: false,
        focus: false,
    });

    webview.once('tauri://created', function (event) {
        console.log(event);
    })

    webview.once('tauri://error', async function (event) {
        await emit("client://background-loggin-error");
        await webview.close();
    })

    webview.once("loggedIn",async e => {
        await webview.emit("client://background-loggin-success");
        await webview.close();
    });

    webview.onCloseRequested(event => {
        closed = true;
    });

    // Request a explicit user login
    setTimeout(async () => {
        if(closed) return;
        await emit("client://background-loggin-error");
        await webview.close();
    }, 1000);
}

export async function requestExplicit(callbackUrl)
{
    const scope = "user-read-private user-read-email playlist-read-private user-modify-playback-state streaming";

    let args = new URLSearchParams({
        response_type: 'token',
        client_id: window.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: callbackUrl,
    });
        
    const url = `https://accounts.spotify.com/authorize?${args}`;

    location.href = url;
}