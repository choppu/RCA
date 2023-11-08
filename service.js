import TrackPlayer, { Event, State } from "react-native-track-player"
import { tracks, config, getTrackData } from "./tracks"
import BackgroundTimer from 'react-native-background-timer';

module.exports = async function () {

  const pauseHandler = async () => {
    BackgroundTimer.stopBackgroundTimer();
    const pstate = await TrackPlayer.getState();
    if (pstate == State.Playing) {
      await TrackPlayer.skip(1)
      await TrackPlayer.pause();
    }
  };

  const playHandler = async () => {
    const pstate = await TrackPlayer.getState();
    const queue = await TrackPlayer.getQueue();
    if (pstate == State.None || pstate == State.Paused || pstate == State.Stopped || pstate == State.Buffering || pstate == State.Connecting) {
      if (queue.length === 0) {
        await TrackPlayer.add(tracks)
      }
      await TrackPlayer.skip(0)
      await TrackPlayer.play()
      try {
        BackgroundTimer.runBackgroundTimer(() => {
          getTrackData();
        },
          config.pollInterval);
      } catch (e) { }
    }
  };

  const stopHandler = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add(tracks);
    await pauseHandler()
  }

  TrackPlayer.addEventListener(Event.RemotePlay, playHandler)
  TrackPlayer.addEventListener(Event.RemotePause, pauseHandler)
  TrackPlayer.addEventListener(Event.RemoteStop, stopHandler)
}