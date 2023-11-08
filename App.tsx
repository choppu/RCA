import React, { useEffect, useRef, useState } from "react"
import TrackPlayer, { Event, State, Capability, AppKilledPlaybackBehavior } from "react-native-track-player"
import { StyleSheet, View, TouchableOpacity, Text, Image, Linking, AppState, LogBox } from "react-native"
import { tracks, config, getTrackData } from "./tracks"
import BackgroundTimer from 'react-native-background-timer';


const App = () => {
  LogBox.ignoreLogs(['new NativeEventEmitter']);
  const [title, setTitle] = useState('RCA');
  const [song, setSong] = useState('');
  const [cover, setCover] = useState(config.logo);
  const [playerState, setState] = useState(false);

  const checkStateForIcon = async () => {
    const currentState = await TrackPlayer.getState()
    if (currentState == State.Playing) {
      setState(true);
    } else {
      setState(false);
    }
  }

  const setUpTrackPlayer = async () => {

    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop
        ]
      });
    } catch (e) {
      await checkStateForIcon();
    }
    await getTrackData();
    await updateScreen();
    await checkStateForIcon();
  };

  const updateScreen = async () => {
    const pstate = await TrackPlayer.getState();
    const currentTrackNumber = await TrackPlayer.getCurrentTrack();
    if (currentTrackNumber != null && (await TrackPlayer.getQueue()).length > 0 && pstate == State.Playing) {
      setTitle(tracks[currentTrackNumber].title);
      setSong(tracks[currentTrackNumber].artist);
      setCover(tracks[currentTrackNumber].artwork);
    } else {
      setTitle(tracks[1].title);
      setSong(tracks[1].artist);
      setCover(tracks[1].artwork);
    }
    setTimeout(updateScreen, config.pollInterval);
  }

  const handlePlayPress = async () => {
    const pstate = await TrackPlayer.getState();
    if (pstate == State.Playing) {
      await TrackPlayer.skip(1)
      await TrackPlayer.pause()
      await TrackPlayer.reset()
      BackgroundTimer.stopBackgroundTimer();
    } else {
      if (pstate == State.None || pstate == State.Paused || pstate == State.Stopped || pstate == State.Connecting) {
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
  }

  useEffect(() => {
    setUpTrackPlayer();

    return () => { };
  }, []);

  TrackPlayer.addEventListener(Event.PlaybackState, async (e) => {
    switch (e.state) {
      case State.Playing:
      case State.Buffering:
      case State.Ready:
        setState(true)
        break;
      case State.Paused:
      case State.Connecting:
      case State.None:
      case State.Stopped:
        setState(false);
        break;
      default:
        setState(false);
        break;
    }
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1E2223",
    },

    topContainer: {
      height: '88%',
      justifyContent: "center",
      alignItems: "center",
    },
    btn: {
      backgroundColor: "#8F0A26",
      borderRadius: 80,
      shadowColor: 'rgba(0, 0, 0, 0.7)',
      shadowOpacity: 0.8,
      elevation: 6,
      shadowRadius: 15,
      shadowOffset: { width: 1, height: 13 },
      marginBottom: 50
    },
    btnPlay: {
      width: 50,
      height: 50,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 25,
      marginRight: 15
    },
    btnPause: {
      width: 30,
      height: 30,
      margin: 30
    },
    title: {
      color: "white",
      textAlign: "center",
      fontSize: 17,
      fontFamily: 'monospace',
      marginBottom: 5,
      paddingLeft: '5%',
      paddingRight: '5%',
    },
    songText: {
      color: "white",
      textAlign: "center",
      fontSize: 13,
      fontFamily: 'monospace',
      marginBottom: '5%',
      paddingLeft: '5%',
      paddingRight: '5%',
    },
    cover: {
      marginTop: '13%',
      width: 250,
      height: 250,
      borderRadius: 250,
      marginBottom: '12%'
    },
    bottomRow: {
      backgroundColor: '#8F0A26',
      flex: 1,
      width: '100%',
      maxHeight: '12%',
      justifyContent: "center",
      alignItems: "center"
    },
    whatsapp: {
      width: 60,
      height: 60
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View>
          <Image source={{ uri: cover }} style={styles.cover} />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View>
          <Text style={styles.songText}>{song}</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.btn} onPress={() => handlePlayPress()}>
            <Image style={playerState ? styles.btnPause : styles.btnPlay} source={playerState ? require("./pause.png") : require("./play.png")} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={() => Linking.openURL(config.whatsApp)}>
          <Image source={require('./whatsapp.png')} style={styles.whatsapp} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default App;
