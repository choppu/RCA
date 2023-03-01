import React, { useEffect, useState } from "react"
import TrackPlayer, {Event, State, Capability } from "react-native-track-player"
import { StyleSheet, View, TouchableOpacity, Text, Image, Linking } from "react-native"

const config = {
    title: "Radio città aperta",
    streamUrl: "https://www.radiocittaperta.it/redirected-weighted.php",
    streamDataUrl: "https://www.radiocittaperta.it/index.php?__api=1&onair=1",
    logo: "https://radiocittaperta.it/img/logo.png",
    artist: "RCA",
    whatsApp: "393332675681"
}

const tracks = [
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
        await TrackPlayer.add(tracks);
        await TrackPlayer.updateOptions({
            stopWithApp: false,
            capabilities: [
                Capability.Play,
                Capability.Pause,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause
            ],
        });
        await getTrackData();
     } catch (e) {
      //console.error(e);
    }
  };

 const handlePlayPress = async() => {
      if(await TrackPlayer.getState() == State.Playing) {
        TrackPlayer.pause();
        setState(false);
      }
      else {
        TrackPlayer.play();
        setState(true);
      }
  }

  const getTrackData = async() => {
        let trackInfo;

        const resp = await fetch(config.streamDataUrl);
        trackInfo = await resp.json();
        setTitle(trackInfo.title);
        setSong(trackInfo.song);
        setCover(trackInfo.cover);
        TrackPlayer.updateMetadataForTrack(0, {
           title: trackInfo.title,
           artist: trackInfo.song,
           artwork: trackInfo.cover
        });
         setTimeout(getTrackData, 10000);
   };

  useEffect(() => {
    setUpTrackPlayer();
    return () => {};
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1E2223",
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
      marginBottom: 5
    },
    songText: {
      color: "white",
      textAlign: "center",
      fontSize: 13,
      fontFamily: 'monospace',
      marginBottom: '5%'
    },
    cover: {
      marginTop: '15%',
      width: 250,
      height: 250,
      borderRadius: 250,
      marginBottom: '12%'
    },
    bottomRow: {
        backgroundColor: '#8F0A26',
        flex: 1,
        width: '100%',
        maxHeight: '18%',
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
        <View style={styles.bottomRow}>
            <Image source={require('./whatsapp.png')} style={styles.whatsapp} onPress={() => Linking.openURL('https://wa.me/' + {whatsApp})} />
        </View>
    </View>
  )
}

export default App;
