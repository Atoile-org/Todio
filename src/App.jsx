import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlayerScreen from './Screens/PlayerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Player" screenOptions={{headerShown: false}} >
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ title: 'Player' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
