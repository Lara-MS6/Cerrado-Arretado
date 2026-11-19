import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import TopoMarca from '../components/TopoMarca';
import { Card } from './HomeScreen';
import { cores, tipo as t, MARGEM } from '../theme';

export default function FavoritesScreen({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => {
    (async () => {
      const { data } = await supabase.from('favoritos').select('eventos(*, categorias(nome))');
      setEventos((data ?? []).map((f) => f.eventos).filter(Boolean));
      setCarregando(false);
    })();
  }, []));

  return (
    <View style={s.tela}>
      <TopoMarca />
      {carregando ? <ActivityIndicator color={cores.laranja} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={eventos}
          keyExtractor={(e) => e.id}
          contentContainerStyle={s.lista}
          ListHeaderComponent={<View><Text style={s.titulo}>Favoritos</Text><Text style={s.sub}>Os eventos que você salvou para não perder.</Text></View>}
          ListEmptyComponent={<View style={s.vazio}><Ionicons name="heart-outline" size={42} color={cores.laranja} /><Text style={s.vazioTitulo}>Nada por aqui ainda</Text><Text style={s.sub}>Toque em “Favoritar” na página de um evento para vê-lo aqui.</Text></View>}
          renderItem={({ item }) => <Card evento={item} compacto aoAbrir={() => navigation.navigate('Evento', { evento: item })} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel },
  lista: { padding: MARGEM, paddingBottom: 40, gap: 24 },
  titulo: { ...t.tituloTela, color: cores.texto },
  sub: { ...t.corpo, color: cores.cinza, marginTop: 5 },
  vazio: { alignItems: 'center', marginTop: 70, gap: 12 },
  vazioTitulo: { ...t.tituloSecao, color: cores.texto, textAlign: 'center' },
});
