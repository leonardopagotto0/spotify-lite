import { invoke } from "@tauri-apps/api";

async function validateAccessToken(accessToken) {
    try {
        await invoke("validate_access_token", { accessToken });
    } catch (err) {
        return false;
    }

    return true;
}

export default validateAccessToken;