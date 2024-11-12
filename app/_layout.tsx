import { ThemeContextProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeContextProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false}}/>
      </Stack>
    </ThemeContextProvider>

  );
}
