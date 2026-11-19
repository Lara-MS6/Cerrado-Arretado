import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { imagemLocalDoEvento } from '../lib/eventImages';
import { cores, tipo as t, MARGEM, formatarData } from '../theme';
const logo = require('../../assets/branding/logo-cerrado.png');

export default function EventScreen({ route, navigation }) {
  const [evento, setEvento] = useState(route.params.evento);
  const [favorito, setFavorito] = useState(false); const [userId, setUserId] = useState(null);
  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!ativo) return;
      setUserId(data.user?.id ?? null);
      if (data.user) {
        const { data: f } = await supabase.from('favoritos').select('evento_id').eq('evento_id', evento.id).eq('usuario_id', data.user.id).maybeSingle();
        if (ativo) setFavorito(!!f);
      }
      await supabase.rpc('registrar_visualizacao', { evento: evento.id });
      const { data: atualizado } = await supabase.from('eventos').select('*, categorias(nome)').eq('id', evento.id).maybeSingle();
      if (ativo && atualizado) setEvento(atualizado);
    })();
    return () => { ativo = false; };
  }, [evento.id]);
  async function alternarFavorito() {
    if (!userId) return;
    const proximo = !favorito; setFavorito(proximo);
    const { error } = proximo
      ? await supabase.from('favoritos').insert({ usuario_id: userId, evento_id: evento.id })
      : await supabase.from('favoritos').delete().eq('usuario_id', userId).eq('evento_id', evento.id);
    if (error) setFavorito(!proximo);
  }
  const abrirMapa = () => Linking.openURL(evento.mapa_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.local)}`);
  const imagemLocal = imagemLocalDoEvento(evento);
  return <View style={s.tela}>
    <LinearGradient colors={[cores.sol, cores.brasa]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.topo}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Ionicons name="chevron-back" size={28} color={cores.branco} /></Pressable>
      <Image source={logo} style={s.logo} resizeMode="contain" /><View style={{ width: 28 }} />
    </LinearGradient>
    <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
      <View style={s.foto}>
        {evento.imagem_url ? (
          <Image source={{ uri: evento.imagem_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : imagemLocal ? (
          <Image source={imagemLocal} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[cores.sol, cores.terra]} style={[StyleSheet.absoluteFill, s.semFoto]}>
            <Ionicons name="sunny" size={64} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        )}
      </View>
      <View style={s.bloco}><Text style={s.titulo}>{evento.titulo}</Text><Text style={s.local}>{evento.local}</Text><Text style={s.data}>{formatarData(evento.data_hora)}</Text><Text style={[s.corpo, { marginTop: 16 }]}>{evento.descricao}</Text></View>
      <Secao titulo="Organizador"><View style={s.org}>
        {evento.organizador_logo_url ? <Image source={{ uri: evento.organizador_logo_url }} style={s.logoOrg} /> : <View style={s.avatar}><Text style={s.avatarTxt}>{evento.organizador_nome?.charAt(0) || 'C'}</Text></View>}
        <View><Text style={s.orgNome}>{evento.organizador_nome}</Text>{evento.organizador_nota != null && <Text style={s.data}>Nota: {Number(evento.organizador_nota).toFixed(1)}</Text>}</View>
      </View></Secao>
      <Secao titulo="Localização"><Text style={s.corpo}>{evento.local}</Text><Pressable onPress={abrirMapa} style={s.mapaBotao}><Ionicons name="map-outline" size={18} color={cores.laranja} /><Text style={s.mapaTxt}>Abrir no mapa</Text></Pressable></Secao>
      {!!evento.acessibilidade && <Secao titulo="Acessibilidade"><Text style={s.corpo}>{evento.acessibilidade}</Text></Secao>}
    </ScrollView>
    <View style={s.rodape}><Pressable style={[s.botao, favorito && s.botaoAtivo]} onPress={alternarFavorito}><Ionicons name={favorito ? 'heart' : 'heart-outline'} size={20} color={favorito ? cores.laranja : cores.branco} /><Text style={[s.botaoTxt, favorito && { color: cores.laranja }]}>{favorito ? 'Favoritado' : 'Favoritar'}</Text></Pressable></View>
  </View>;
}
function Secao({ titulo, children }) { return <View style={s.bloco}><Text style={s.secao}>{titulo}</Text><View style={s.traco} />{children}</View>; }
const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel }, 
  topo: { height: 104, paddingTop: 40, paddingHorizontal: MARGEM, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
  logo: { width: 48, height: 48 },
  foto: { height: 220, marginHorizontal: MARGEM, marginTop: MARGEM, marginBottom: 0, borderRadius: 16, overflow: 'hidden', backgroundColor: cores.cacto }, 
  semFoto: { alignItems: 'center', justifyContent: 'center' }, 
  bloco: { marginHorizontal: MARGEM, marginTop: 24 }, 
  titulo: { ...t.tituloTela, color: cores.texto }, 
  local: { ...t.organizador, color: cores.laranja, marginTop: 6 }, 
  data: { ...t.metadado, color: cores.cinza, marginTop: 4 }, 
  corpo: { ...t.corpo, color: cores.texto }, 
  secao: { ...t.tituloSecao, color: cores.texto }, 
  traco: { height: 2, width: 150, backgroundColor: cores.coral, marginTop: 4, marginBottom: 14 },
  org: { flexDirection: 'row', alignItems: 'center', gap: 14 }, 
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: cores.cacto, alignItems: 'center', justifyContent: 'center' }, 
  logoOrg: { width: 50, height: 50, borderRadius: 25, resizeMode: 'contain' }, 
  avatarTxt: { ...t.eventoNome, color: cores.branco }, 
  orgNome: { ...t.eventoNome, color: cores.texto }, 
  mapaBotao: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }, 
  mapaTxt: { ...t.organizador, color: cores.laranja },
  rodape: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: MARGEM, paddingBottom: 28, backgroundColor: cores.papel }, 
  botao: { flexDirection: 'row', gap: 8, backgroundColor: cores.laranja, borderRadius: 28, height: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: cores.laranja }, 
  botaoAtivo: { backgroundColor: cores.papel }, 
  botaoTxt: { ...t.botao, color: cores.branco },
});