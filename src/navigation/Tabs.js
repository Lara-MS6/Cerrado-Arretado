import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import HomeScreen from '../screens/HomeScreen';
import PartnerEventsScreen from '../screens/PartnerEventsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { cores, fontes } from '../theme';

const Tab = createBottomTabNavigator();
const ICONES = {
  Inicio: ['home', 'home-outline'],
  MeusEventos: ['calendar', 'calendar-outline'],
  Favoritos: ['heart', 'heart-outline'],
  Perfil: ['person', 'person-outline'],
};

// Parceiro: Início, Meus eventos, Perfil. Usuário: Início, Favoritos, Perfil.
export default function Tabs() {
  const [tipoPerfil, setTipoPerfil] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('profiles').select('tipo').eq('id', data.user.id).maybeSingle();
      setTipoPerfil(p?.tipo || data.user?.user_metadata?.tipo || 'usuario');
    })();
  }, []);

  if (!tipoPerfil) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.papel }}><ActivityIndicator color={cores.laranja} size="large" /></View>;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.acento,
        tabBarInactiveTintColor: cores.cinza,
        tabBarLabelStyle: { fontFamily: fontes.medio, fontSize: 12 },
        tabBarStyle: { backgroundColor: cores.branco, borderTopColor: cores.borda },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={ICONES[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      {tipoPerfil === 'parceiro'
        ? <Tab.Screen name="MeusEventos" component={PartnerEventsScreen} options={{ tabBarLabel: 'Meus eventos' }} />
        : <Tab.Screen name="Favoritos" component={FavoritesScreen} options={{ tabBarLabel: 'Favoritos' }} />}
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
