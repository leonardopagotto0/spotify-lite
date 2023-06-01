use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Page<T> {
    items: Option<Vec<T>>,
    offset: Option<usize>,
    limit: Option<usize>,
    total: usize,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Playlist {
    pub id: String,
    pub name: String,
    pub images: Vec<Image>,
    pub owner: PlaylistOwner,
    #[serde(rename = "type")]
    type_: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct PlaylistTrack {
    pub track: Track,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Track{
    pub id: String,
    pub name: String,
    pub album: Album,
    pub duration_ms: u32,
    pub uri: String,
    #[serde(rename = "type")]
    type_: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Album {
    pub id: String,
    pub name: String,
    pub images: Vec<Image>, 
    pub artists: Vec<Artist>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Artist {
    pub id: String,
    pub name: String,
    pub uri: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct PlaylistOwner {
    pub id: String,
    pub display_name: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Image {
    pub url: String,
    pub height: Option<u32>,
    pub width: Option<u32>,
}