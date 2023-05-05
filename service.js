import TrackPlayer, {Event} from "react-native-track-player"
module.exports = async function () {
  const pauseHandler = async () => {
     const t = await TrackPlayer.getTrack(0);
     TrackPlayer.pause();
     TrackPlayer.reset();
     TrackPlayer.add(t);
  };

  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play())
  TrackPlayer.addEventListener(Event.RemotePause, pauseHandler)
  TrackPlayer.addEventListener(Event.RemoteStop, pauseHandler)
}