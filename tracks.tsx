import TrackPlayer, { State } from "react-native-track-player";

export const config = {
  title: "Radio città aperta",
  streamUrl: "https://www.radiocittaperta.it/redirected-weighted.php",
  streamDataUrl: "https://www.radiocittaperta.it/index.php?__api=1&onair=1&c=",
  logo: "https://radiocittaperta.it/img/logo.png",
  artist: "RCA",
  whatsApp: "https://wa.me/393401974468",
  pollInterval: 3000
}

export let tracks = [
  {
    id: 1,
    url: config.streamUrl,
    title: config.title,
    artwork: config.logo,
    artist: config.artist,
    isLiveStream: true,
  },
  {
    id: 2,
    url: "silence.mp3",
    title: config.title,
    artwork: config.logo,
    artist: config.artist,
    duration: 0,
    isLiveStream: false,
  }
];

interface TrackInfo {
  title: string,
  song: string,
  cover: string
}

export const getTrackData = async () => {
  let trackInfo: TrackInfo;
  const pstate = await TrackPlayer.getState();
  const resp = await fetch(config.streamDataUrl + new Date().getTime());
  trackInfo = await resp.json();
  const currentTrackNumber = await TrackPlayer.getCurrentTrack();
  if (currentTrackNumber != null && (await TrackPlayer.getQueue()).length > 0 && pstate == State.Playing) {
    await TrackPlayer.updateMetadataForTrack(0, {
      title: trackInfo.title,
      artist: trackInfo.song,
      artwork: trackInfo.cover
    }).catch(reasons => { })
    tracks[0].title = trackInfo.title;
    tracks[0].artwork = trackInfo.cover
    tracks[0].artist = trackInfo.song
  } else {
    tracks[0].title = config.title;
    tracks[0].artwork = config.logo
    tracks[0].artist = config.artist
  }
};