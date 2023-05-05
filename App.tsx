import React, { useEffect, useState } from "react"
import TrackPlayer, {Event, State, Capability, AppKilledPlaybackBehavior} from "react-native-track-player"
import { StyleSheet, View, TouchableOpacity, Text, Image, Linking, AppState } from "react-native"

const config = {
    title: "Radio città aperta",
    streamUrl: "https://www.radiocittaperta.it/redirected-weighted.php",
    streamDataUrl: "https://www.radiocittaperta.it/index.php?__api=1&onair=1&c=",
    logo: "https://radiocittaperta.it/img/logo.png",
    artist: "RCA",
    whatsApp: "https://wa.me/393401974468",
    pollInterval: 30000
}

export const tracks = [
  {
    id: 1,
    url: config.streamUrl,
    title: config.title,
    artwork: config.logo,
    artist: config.artist
  }
]

const App = () => {
    const [title, setTitle] = useState('RCA');
    const [song, setSong] = useState('');
    const [cover, setCover] = useState(config.logo);
    const [playerState, setState] = useState(false);

    const setUpTrackPlayer = async () => {
     try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop
            ],
        });
     } catch (e) {
      if(await TrackPlayer.getState() == State.Playing) {
        setState(true);
      } else {
        setState(false);
      }
    }

    try {
        await getTrackData();
    } catch(e) {}
  };

 const handlePlayPress = async() => {
      pstate = await TrackPlayer.getState();
      if(pstate == State.Playing) {
        TrackPlayer.pause();
        TrackPlayer.reset();
        setState(false);
      } else {
        if (pstate == State.None) {
            await TrackPlayer.add(tracks);
        }
        TrackPlayer.play();
        setState(true);
      }
  }

  const getTrackData = async() => {
        let trackInfo;

        const resp = await fetch(config.streamDataUrl + new Date().getTime());
        trackInfo = await resp.json();
        setTitle(trackInfo.title);
        setSong(trackInfo.song);
        setCover(trackInfo.cover);

        if (await TrackPlayer.getState() != State.None) {
            await TrackPlayer.updateMetadataForTrack(0, {
               title: trackInfo.title,
               artist: trackInfo.song,
               artwork: trackInfo.cover
            });
        }

        setTimeout(getTrackData, config.pollInterval);
   };

  useEffect(() => {
    setUpTrackPlayer();

    return () => {};
  }, []);

  TrackPlayer.addEventListener(Event.PlaybackState, async (e) => {
    e.state == State.Playing ? setState(true) : setState(false);
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
      shadowRadius: 15 ,
      shadowOffset : { width: 1, height: 13},
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
            <Image source={{uri: cover}} style={styles.cover} />
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
