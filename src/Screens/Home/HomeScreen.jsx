import { Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TodioCtx } from '../../App';
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SongList from "./SongList";
import {Music} from "lucide-react-native";
import {PlatformPressable} from "@react-navigation/elements";

export const Tab = createBottomTabNavigator();

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(TodioCtx);

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background, flex: 1 }}
      edges={['top']}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.background,
            height: 60,
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarButton: props => (
            <PlatformPressable {...props} pressColor={theme.accentMuted} />
          ),
        }}
      >
        <Tab.Screen
          name={'SongList'}
          component={SongList}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Music color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen name={'SongList2'} component={SongList} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
