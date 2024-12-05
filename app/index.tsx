import { Appearance, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as MediaLibrary from 'expo-media-library';
import { useContext, useEffect, useState } from "react";
import { Audio, AVPlaybackStatus } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from "@/constants/Colors";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeContext } from "@/context/ThemeContext";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";


export default function Index() {

  const [audioFiles, setAudioFiles] = useState<MediaLibrary.Asset[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [g, setCurrentSongg] = useState<{
    title: string | null,
    uri: string | null,
    duration: number | null
    index: number | null
  } | null>(null)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [position, setPosition] = useState(0)

  const {theme, colorScheme, setColorScheme} = useContext(ThemeContext)

  const {setCurrentSong, currentSong, setSongs, songs} = useMusicPlayer()


  const styles = createStyles(theme)




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
        setSongs(media.assets)
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
      <View style={{width: "100%", height: 52, backgroundColor: theme?.background, display: "flex",
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8,
        borderBottomWidth: 2, borderColor: theme?.main
      }}>
          <Text style={{color: theme?.text, fontSize: 18, fontWeight: "600"}}>My Music</Text>
          <Pressable onPress={() => setColorScheme((prev) => prev === 'dark' ? 'light' : 'dark')}>
          <Ionicons name={colorScheme === "dark" ? 'sunny' : 'moon'} size={26} color={theme?.text} />
          </Pressable>
      </View>
      <SafeAreaView style={{
        flex: 1,
        width: "100%",
        paddingHorizontal: 8
      }}>
        <FlatList 
          data={songs}
          contentContainerStyle={{
            width: "100%",
            paddingTop: 8
          }}
          renderItem={({item, index}) => <Pressable style={styles.song}
          onPress={() => { 
            setCurrentSong({title: item.filename, uri: item.uri, duration: item.duration, index: index})
            //playSound({ title: item.filename, uri: item.uri, duration: item.duration, index: index})
          }}>
            <View style={{
              height: 60,
              width: 60,
              backgroundColor: theme?.main,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
                {item.filename === currentSong?.title ? 
                <FontAwesome name="volume-up" size={40} color={theme?.text} />                
                :
                <Ionicons name="musical-note"  size={40} color={theme?.text} />}
            </View>
            <View style={{
              height: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly"
            }}>
              <Text style={[styles.text,
                currentSong?.title === item.filename ? {color: theme?.main} : {}
              ]} numberOfLines={1} ellipsizeMode="clip">
                {item.filename}
              </Text>
              <Text style={{
                color: theme?.text,
                fontSize: 16,
                fontWeight: "600"
              }}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </Pressable>}
        />
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: {
  text: string;
  background: string;
  secondary: string;
  main: string;
} | null) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme?.background
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
      color: theme?.text,
      fontSize: 16,
    }
  })
}