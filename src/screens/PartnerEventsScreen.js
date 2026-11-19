import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Card } from './HomeScreen';
import TopoMarca from '../components/TopoMarca';
import { cores, tipo as t, MARGEM } from '../theme';

export default function PartnerEventsScreen({ navigation }) {
  const [eventos, setEventos] = useState([]); const [carregando, setCarregando] = useState(true);
  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('eventos').select('*, categorias(nome)').eq('organizador_id', user.user?.id).order('created_at', { ascending: false });
    if (error) Alert.alert('Não foi possível carregar', error.message);
    setEventos(data ?? []); setCarregando(false);
  }, []);
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));
  async function excluir(evento) {
    Alert.alert('Excluir evento?', `“${evento.titulo}” será removido.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('eventos').delete().eq('id', evento.id);
        if (error) Alert.alert('Não foi possível excluir', error.message); else carregar();
      } },
    ]);
  }
  return <View style={s.tela}>
    <TopoMarca />
    <View style={s.intro}><Text style={s.titulo}>Meus eventos</Text><Text style={s.sub}>Gerencie os eventos publicados pela sua organização.</Text></View>
    <Pressable style={s.novo} onPress={() => navigation.navigate('CadastroEvento')}><Ionicons name="add-circle-outline" size={21} color={cores.branco} /><Text style={s.novoTxt}>Cadastrar novo evento</Text></Pressable>
    {carregando ? <ActivityIndicator color={cores.laranja} style={{ marginTop: 40 }} /> : eventos.length === 0 ? <View style={s.vazio}><Ionicons name="calendar-outline" size={42} color={cores.laranja} /><Text style={s.vazioTitulo}>Você ainda não cadastrou eventos</Text><Text style={s.sub}>Comece adicionando um evento para aparecer na programação.</Text></View> : <FlatList data={eventos} keyExtractor={(e) => e.id} contentContainerStyle={s.lista} renderItem={({ item }) => <View style={s.item}><Card evento={item} compacto aoAbrir={() => navigation.navigate('Evento', { evento: item })} /><View style={s.acoes}><Pressable style={s.editar} onPress={() => navigation.navigate('CadastroEvento', { evento: item })}><Ionicons name="create-outline" size={18} color={cores.laranja} /><Text style={s.editarTxt}>Editar</Text></Pressable><Pressable style={s.excluir} onPress={() => excluir(item)}><Ionicons name="trash-outline" size={18} color="#B3261E" /><Text style={s.excluirTxt}>Excluir</Text></Pressable></View></View>} />}
  </View>;
}
const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel }, topo: { height: 104, paddingTop: 42, paddingHorizontal: MARGEM, backgroundColor: cores.brasa, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, topoTitulo: { ...t.tituloSecao, color: cores.branco }, intro: { margin: MARGEM, marginBottom: 12 }, titulo: { ...t.tituloTela, color: cores.texto }, sub: { ...t.corpo, color: cores.cinza, marginTop: 5 }, novo: { marginHorizontal: MARGEM, backgroundColor: cores.acento, height: 48, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }, novoTxt: { ...t.botao, color: cores.branco }, lista: { padding: MARGEM, paddingBottom: 40, gap: 22 }, item: { backgroundColor: cores.branco, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: cores.borda }, acoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }, editar: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: cores.laranja }, editarTxt: { ...t.organizador, color: cores.laranjaTexto }, excluir: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8 }, excluirTxt: { ...t.organizador, color: '#B3261E' }, vazio: { alignItems: 'center', marginTop: 80, marginHorizontal: 32, gap: 12 }, vazioTitulo: { ...t.tituloSecao, color: cores.texto, textAlign: 'center' },
});
