import { Colors } from "@/constants/Colors";
import { createContext, ReactNode, useState } from "react";
import { Appearance } from "react-native";

interface IProps {
    children: ReactNode
}

export const ThemeContext = createContext<{
    theme: {
        text: string,
        background: string
        secondary: string
        main: string
    } | null
    colorScheme: "light" | "dark" | null | undefined,
    setColorScheme: React.Dispatch<React.SetStateAction<"light" | "dark" | null | undefined>>
}>( {colorScheme: null,
    theme: null,
    setColorScheme: () => null})

export const ThemeContextProvider = ({children}: IProps) => {
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const theme = colorScheme === "dark" ? Colors.dark : Colors.light

    return (
        <ThemeContext.Provider value={{
            colorScheme, setColorScheme, theme
        }}>
            {children}
        </ThemeContext.Provider>
    )


}