import { ThemeContext } from "@/context/ThemeContext"
import { useMusicPlayer } from "@/hooks/useMusicPlayer"
import { FontAwesome } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useContext, useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"


const MusicPlayer = () => {
    const [isPaused, setIsPaused] = useState(false)
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const {theme ,colorScheme, setColorScheme} = useContext(ThemeContext)

    const {currentSong, setCurrentSong, songs} = useMusicPlayer()

    const styles = createStyles(theme)

    const playSound = async () => {
      setIsPaused(false)
      
      if(sound) {
        await sound.stopAsync();
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: currentSong?.uri! },
        { shouldPlay: true },
      );

      setSound(newSound)
      await newSound.playAsync();
    }

    const pauseSound = async () => {
      await sound?.pauseAsync()
      setIsPaused(true)
    }
    
    const unpauseSound = async () => {
      await sound?.playAsync()
      setIsPaused(false)
    }

    const handleNextSong = async () => {
      if(typeof currentSong?.index === "number" && sound) {
        let index = currentSong.index + 1 === songs.length ? 0 : currentSong.index + 1
        const nextSong = songs[index]
  
        setCurrentSong({uri: nextSong.uri, title: nextSong.filename, duration: nextSong.duration, index: index})
      }  
    }

    const handlePrevSong = async () => {
      if(currentSong?.index === 0 && sound && songs.length !== 1) {
        const nextSong = songs[songs.length - 1]
  
        setCurrentSong({uri: nextSong.uri, title: nextSong.filename, duration: nextSong.duration, index: songs.length - 1})
        return
      }
      if(currentSong?.index && sound) {
        let index = currentSong.index - 1 <  0 ? songs.length : currentSong.index - 1
        const nextSong = songs[index]
  
        setCurrentSong({uri: nextSong.uri, title: nextSong.filename, duration: nextSong.duration, index: index})
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
      playSound()
    }, [currentSong?.uri])

    return (
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
            style={{fontSize: 14, color: theme?.text, fontWeight: "600"}}>{currentSong?.title ? currentSong?.title : "Title "}</Text>
            <View style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "center"
            }}>
                <View style={{ height: 3, backgroundColor: theme?.text}}>
                  <View style={{height: 3, backgroundColor: theme?.main}} />
                </View>
                <Text style={{color: theme?.text, fontWeight: "600"}}>{currentSong?.duration ? formatDuration(currentSong?.duration) : null}</Text>
            </View>
            </View>
                <View style={styles.controls}>
                <Pressable style={styles.button} onPress={() => handlePrevSong()}>
                <FontAwesome name="fast-backward" size={18} color={theme?.main} />
                </Pressable>
                <View style={styles.button}>
                {
                    isPaused ? <Pressable onPress={() => unpauseSound()}>
                    <FontAwesome name="play" size={18} color={theme?.main} 
                    />
                    </Pressable> :
                    <Pressable onPress={() => pauseSound()}>
                    <FontAwesome name="pause" size={18} color={theme?.main} />
                    </Pressable>
                }
                </View>
                <Pressable style={styles.button} onPress={() => handleNextSong()}>
                <FontAwesome name="fast-forward" size={18} color={theme?.main} />
                </Pressable>

        </View>
      </View>
    )
}

const createStyles = (theme: {
    text: string;
    background: string;
    secondary: string;
    main: string;
  } | null) => {
    return StyleSheet.create({

      footer: {
        width: "100%",
        height: 86,
        marginTop: "auto",
        backgroundColor: theme?.secondary,
        display:"flex",
        flexDirection: "row",
        gap: 24,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 6,
        borderTopWidth: 2,
        borderTopColor: theme?.main
      },
      controls: {
        display:"flex",
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme?.secondary
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

export default MusicPlayer;