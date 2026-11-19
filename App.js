import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { supabase } from './src/lib/supabase';
import { cores } from './src/theme';
import AuthScreen from './src/screens/AuthScreen';
import Tabs from './src/navigation/Tabs';
import EventScreen from './src/screens/EventScreen';
import EventFormScreen from './src/screens/EventFormScreen';

const Stack = createNativeStackNavigator();
export default function App() {
  const [fontesOk] = useFonts({ CormorantGaramond_600SemiBold, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold });
  const [sessao, setSessao] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!fontesOk || sessao === undefined) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.noite }}><ActivityIndicator color={cores.sol} size="large" /></View>;
  return <NavigationContainer>
    <StatusBar style="light" />
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sessao ? <>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Evento" component={EventScreen} />
        <Stack.Screen name="CadastroEvento" component={EventFormScreen} />
      </> : <Stack.Screen name="Auth" component={AuthScreen} />}
    </Stack.Navigator>
  </NavigationContainer>;
}
