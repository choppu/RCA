import React, { useEffect, useState } from "react"
import TrackPlayer, {Event, State, Capability } from "react-native-track-player"
import { StyleSheet, View, TouchableOpacity, Text, Image } from "react-native"

const config = {
    title: "Radio città aperta",
    streamUrl: "https://www.radiocittaperta.it/redirected-weighted.php",
    streamDataUrl: "https://www.radiocittaperta.it/index.php?__api=1&onair=1",
    logo: "https://radiocittaperta.it/img/logo.png",
    artist: "RCA"
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
     } catch (e) {
      //console.error(e);
    }
  };

 const handlePlayPress = async() => {
      if(await TrackPlayer.getState() == State.Playing) {
        TrackPlayer.pause();
      }
      else {
        TrackPlayer.play();
      }
  }

  const getTrackData = async() => {
        let trackInfo;
      setTimeout(async() => {
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
      }, 10000);
   };

  useEffect(() => {
    setUpTrackPlayer();
    getTrackData();
    return () => {};
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "black",
    },
    btn: {
      backgroundColor: "#ff0044",
      padding: 15,
      borderRadius: 5,
      margin: 10,
      width: 160,
    },
    text: {
      fontSize: 30,
      color: "white",
      textAlign: "center"
    },
    row: {
      flexDirection: "row",
      marginBottom: 20,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => handlePlayPress()}>
          <Text style={styles.text}>Play</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.text}>{title}</Text>
      </View>
      <View>
        <Text style={styles.text}>{song}</Text>
      </View>
      <View>
        <Image source={{uri: cover}} style={{width: 300, height: 300}} />
      </View>
    </View>
  )
}

export default App;
