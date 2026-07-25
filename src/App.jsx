import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createContext, useEffect, useState } from 'react';
import { colors } from './utils/themes';
import HomeScreen from './Screens/Home/HomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeModules } from 'react-native';
import Effects from './Screens/Effects/Effects';

const Stack = createNativeStackNavigator();

export const TodioCtx = createContext()

export default function App() {
  const [theme, setTheme] = useState(colors.amoled);
  const [playing, setPlaying] = useState();
  const [effects, setEffects] = useState();

  const [playList, setPlayList] = useState([]);

  const { JuceBridge } = NativeModules;

  useEffect(() => {
    JuceBridge.setResamplingRatio(1);
    JuceBridge.setReverbBypass(true);
  }, [JuceBridge])

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <TodioCtx.Provider
          value={{
            theme,
            setTheme,
            playing,
            setPlaying,
            playList,
            setPlayList,
            effects,
            setEffects,
          }}
        >
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Effects" component={Effects} />
            </Stack.Navigator>
          </NavigationContainer>
        </TodioCtx.Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
