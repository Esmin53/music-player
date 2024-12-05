import { create } from "zustand"
import {
    createJSONStorage,
    persist,
  } from 'zustand/middleware'
  import * as MediaLibrary from 'expo-media-library';

type State = {
    songs: MediaLibrary.Asset[],
    currentSong: {
        title: string | null,
        uri: string | null,
        duration: number | null
        index: number | null
      } | null,
      setCurrentSong: (song: {title: string | null,
        uri: string | null,
        duration: number | null
        index: number | null }) => void,
    setSongs: (audioFiles: MediaLibrary.Asset[]) => void
}


export const useMusicPlayer = create<State >()(
    persist(
      (set) => ({
        songs: [],
        currentSong: null,
        setCurrentSong: (song) =>
            set((state) => ({ currentSong: song})),
        setSongs: (audioFiles) => 
            set((state) => ({ songs: audioFiles}))
      }),
      {
        name: 'music-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )