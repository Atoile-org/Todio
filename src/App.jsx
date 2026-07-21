import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlayerScreen from './Screens/PlayerScreen';
import { createContext, useState } from 'react';
import { colors } from './utils/themes';
import HomeScreen from './Screens/Home/HomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export const TodioCtx = createContext()

export default function App() {
  const [theme, setTheme] = useState(colors.dark);

  return (
    <SafeAreaProvider>
      <TodioCtx.Provider value={{ theme, setTheme }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TodioCtx.Provider>
    </SafeAreaProvider>
  );
}
