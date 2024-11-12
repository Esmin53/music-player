import { Appearance, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from "react";
import { Audio, AVPlaybackStatus } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from "@/constants/Colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';


export default function Index() {

  const [audioFiles, setAudioFiles] = useState<MediaLibrary.Asset[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<{
    title: string | null,
    uri: string | null,
    duration: number | null
    index: number | null
  } | null>(null)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [position, setPosition] = useState(0)

  const colorScheme = Appearance.getColorScheme();

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light

  const styles = createStyles(theme)

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);  
      console.log('Position:', status.positionMillis); 
    }
  };

  const playSound = async ({uri, title, duration, index}: {
    title: string | null,
    uri: string | null,
    duration: number | null
    index: number | null
  }) => {
    if (sound && currentSong?.uri === uri) {
      await sound.stopAsync();
      await sound.playFromPositionAsync(0)
      setIsPaused(false);
      return
    } else {
      if (sound) {
        await sound.stopAsync();
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: uri! },
        { shouldPlay: true },
      );


      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

      setCurrentSong({ uri, title, duration, index });
      setSound(newSound);
      setIsPaused(false);

      await newSound.playAsync();
    }
  };


  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync(); 
      setIsPaused(true);
    } 
  };
  
  const unpauseSound = async () => {
    if (sound) {
      await sound.playAsync(); 
      setIsPaused(false);
    } 
  };

  const handleNextSong = async () => {
    if(typeof currentSong?.index === "number" && sound) {
      let index = currentSong.index + 1 === audioFiles.length ? 0 : currentSong.index + 1
      const nextSong = audioFiles[index]

      playSound({uri: nextSong.uri, title: nextSong.filename, duration: nextSong.duration, index: index})
    }  
  }
  
  const handlePrevSong = async () => {
    if(currentSong?.index === 0 && sound && audioFiles.length !== 1) {
      const nextSong = audioFiles[audioFiles.length - 1]

      playSound({uri: nextSong.uri, title: nextSong.filename, duration: nextSong.duration, index: audioFiles.length - 1})
      return
    }
    if(currentSong?.index && sound) {
      let index = currentSong.index - 1 <  0 ? audioFiles.length : currentSong.index - 1
      const nextSong = audioFiles[index]

      playSound({uri: nextSong.uri, title: nextSong.filename, duration: nextSong.duration, index: index})
    }  
  }


  const formatDuration = (durationInSeconds: number | null) => {
    if(!durationInSeconds) return

    const minutes = Math.floor(durationInSeconds / 60); 
    const seconds = Math.floor(durationInSeconds % 60); 
 
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  
    return `${minutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    const fetchAudioFiles = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
        });

        setAudioFiles(media.assets);
      }
    };

    fetchAudioFiles();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

  
  return (
    <View
      style={styles.container}
    >
      <SafeAreaView style={{
        flex: 1,
        width: "100%",
        paddingHorizontal: 8
      }}>
        <FlatList 
          data={audioFiles}
          contentContainerStyle={{
            width: "100%"
          }}
          renderItem={({item, index}) => <Pressable style={styles.song}
          onPress={() => playSound({ title: item.filename, uri: item.uri, duration: item.duration, index: index})}>
            <View style={{
              height: 60,
              width: 60,
              backgroundColor: theme.main,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
                {item.filename === currentSong?.title ? 
                <FontAwesome name="volume-up" size={40} color={theme.text} />                
                :
                <Ionicons name="musical-note"  size={40} color={theme.text} />}
            </View>
            <View style={{
              height: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly"
            }}>
              <Text style={[styles.text,
                currentSong?.title === item.filename ? {color: theme.main} : {}
              ]} numberOfLines={1} ellipsizeMode="clip">
                {item.filename}
              </Text>
              <Text style={{
                color: "#EEEEEE",
                fontSize: 16,
                fontWeight: "600"
              }}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </Pressable>}
        />
      </SafeAreaView>
      <View style={styles.footer}>
        <View style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          padding: 4
        }}>
            <Text numberOfLines={1} ellipsizeMode="clip"
            style={{fontSize: 14, color: theme.text, fontWeight: "600"}}>{currentSong?.title}</Text>
            <View style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "center"
            }}>
                <View style={{ height: 3, backgroundColor: theme.text}}>
                  <View style={{height: 3, backgroundColor: theme.main}} />
                </View>
                <Text style={{color: theme.text, fontWeight: "600"}}>{formatDuration(currentSong?.duration!)}</Text>
            </View>
        </View>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={handlePrevSong}>
        <FontAwesome name="fast-backward" size={18} color={theme.main} />
        </Pressable>
        <View style={styles.button}>
          {
            isPaused ? <Pressable>
              <FontAwesome name="play" size={18} color={theme.main} 
              onPress={unpauseSound}/>
            </Pressable> :
            <Pressable onPress={pauseSound}>
              <FontAwesome name="pause" size={18} color={theme.main} />
            </Pressable>
        }
        </View>
        <Pressable style={styles.button} onPress={handleNextSong}>
        <FontAwesome name="fast-forward" size={18} color={theme.main} />
        </Pressable>
      </View>
      </View>
    </View>
  );
}

const createStyles = (theme: {
  text: string,
  background: string,
  secondary: string,
  main: string
}) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background
    },
    musicList: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      width: "100%",
      height: "100%",
      paddingHorizontal: 12,
      paddingVertical: 12
    },
    song: {
      width: "100%",
      height: 64,
      display:"flex",
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      marginBottom: 4,
    },
    footer: {
      width: "100%",
      height: 86,
      marginTop: "auto",
      backgroundColor: theme.secondary,
      display:"flex",
      flexDirection: "row",
      gap: 24,
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 6
    },
    info: {

    },
    controls: {
      display:"flex",
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      alignItems: "center"
    },
    button: {
      width: 40,
      height: 40,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: theme?.main,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    text: {
      color: theme.text,
      fontSize: 16,
    }
  })
}