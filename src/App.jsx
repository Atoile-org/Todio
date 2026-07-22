import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createContext, useState } from 'react';
import { colors } from './utils/themes';
import HomeScreen from './Screens/Home/HomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export const TodioCtx = createContext()

export default function App() {
  const [theme, setTheme] = useState(colors.amoled);
  const [playing, setPlaying] = useState();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <TodioCtx.Provider
          value={{
            theme,
            setTheme,
            playing,
            setPlaying,
          }}
        >
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />

            </Stack.Navigator>
          </NavigationContainer>
        </TodioCtx.Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
