import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { cores, fontes, tipo as t, MARGEM } from '../theme';

const logo = require('../../assets/branding/logo-cerrado.png');

export default function EventFormScreen({ route, navigation }) {
  const evento = route.params?.evento;
  const [categorias, setCategorias] = useState([]); const [categoriaId, setCategoriaId] = useState(evento?.categoria_id ? String(evento.categoria_id) : '');
  const [titulo, setTitulo] = useState(evento?.titulo || ''); const [data, setData] = useState(evento?.data_hora ? new Date(evento.data_hora).toISOString().slice(0, 10) : '');
  const [horario, setHorario] = useState(evento?.data_hora ? new Date(evento.data_hora).toTimeString().slice(0, 5) : ''); const [descricao, setDescricao] = useState(evento?.descricao || '');
  const [organizador, setOrganizador] = useState(evento?.organizador_nome || ''); const [endereco, setEndereco] = useState(evento?.local || ''); const [mapaUrl, setMapaUrl] = useState(evento?.mapa_url || ''); const [acessibilidade, setAcessibilidade] = useState(evento?.acessibilidade || '');
  const [fotoEvento, setFotoEvento] = useState(null); const [logoOrganizador, setLogoOrganizador] = useState(null); const [imagemAtual, setImagemAtual] = useState(evento?.imagem_url || null); const [logoAtual, setLogoAtual] = useState(evento?.organizador_logo_url || null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: userData }] = await Promise.all([supabase.from('categorias').select('*').order('nome'), supabase.auth.getUser()]);
      setCategorias(cats ?? []);
      if (!evento && userData.user) {
        const { data: perfil } = await supabase.from('profiles').select('nome').eq('id', userData.user.id).maybeSingle();
        setOrganizador(perfil?.nome || userData.user.user_metadata?.nome || '');
      }
    })();
  }, [evento]);

  async function escolherImagem(tipo) {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return Alert.alert('Permissão necessária', 'Permita o acesso às fotos para selecionar uma imagem.');
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: tipo === 'evento' ? [16, 9] : [1, 1], quality: 0.82 });
    if (resultado.canceled || !resultado.assets?.[0]) return;
    if (tipo === 'evento') setFotoEvento(resultado.assets[0]); else setLogoOrganizador(resultado.assets[0]);
  }

  async function enviarImagem(asset, pasta, userId) {
    if (!asset?.uri) return null;
    const ext = (asset.fileName?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const caminho = `${userId}/${Date.now()}-${pasta}.${ext}`;
    const arrayBuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());
    const contentType = asset.mimeType || (ext === 'png' ? 'image/png' : 'image/jpeg');
    const { error } = await supabase.storage.from('event-media').upload(caminho, arrayBuffer, { contentType, upsert: false });
    if (error) throw error;
    return supabase.storage.from('event-media').getPublicUrl(caminho).data.publicUrl;
  }

  async function salvar() {
    if (!titulo.trim() || !data.trim() || !horario.trim() || !descricao.trim() || !organizador.trim() || !endereco.trim()) return Alert.alert('Campos obrigatórios', 'Preencha nome, data, horário, descrição, organizador e endereço.');
    const dataHora = new Date(`${data}T${horario}:00`);
    if (Number.isNaN(dataHora.getTime())) return Alert.alert('Data inválida', 'Use a data no formato AAAA-MM-DD e o horário HH:MM.');
    setSalvando(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Sua sessão expirou. Entre novamente.');
      const userId = userData.user.id;
      const fotoUrl = fotoEvento ? await enviarImagem(fotoEvento, 'evento', userId) : imagemAtual;
      const logoUrl = logoOrganizador ? await enviarImagem(logoOrganizador, 'organizador', userId) : logoAtual;
      const payload = {
        titulo: titulo.trim(), descricao: descricao.trim(), categoria_id: categoriaId ? Number(categoriaId) : null,
        organizador_id: userId, organizador_nome: organizador.trim(), data_hora: dataHora.toISOString(), local: endereco.trim(),
        acessibilidade: acessibilidade.trim(), imagem_url: fotoUrl, organizador_logo_url: logoUrl, mapa_url: mapaUrl.trim() || null,
      };
      const resultado = evento
        ? await supabase.from('eventos').update(payload).eq('id', evento.id).select().single()
        : await supabase.from('eventos').insert(payload).select().single();
      if (resultado.error) throw resultado.error;
      Alert.alert('Evento salvo', 'As informações do evento foram salvas.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Não foi possível salvar', e.message || 'Tente novamente.'); }
    finally { setSalvando(false); }
  }

  return <View style={s.tela}>
    <View style={s.topo}><Pressable onPress={() => navigation.goBack()} hitSlop={12}><Ionicons name="chevron-back" size={27} color={cores.branco} /></Pressable><Image source={logo} style={s.logo} resizeMode="contain" /><Text style={s.topoAcao}>{evento ? 'Editar' : 'Novo'}</Text></View>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        <LinearTitulo texto={evento ? 'Editar evento' : 'Cadastro de evento'} />
        <Secao titulo="Informações">
          <Campo label="Nome do Evento" value={titulo} onChangeText={setTitulo} placeholder="Ex: Noite de forró" />
          <View style={s.linha}><View style={{ flex: 1.3 }}><Campo label="Data (AAAA-MM-DD)" value={data} onChangeText={setData} placeholder="2026-12-20" /></View><View style={{ flex: 0.9 }}><Campo label="Horário" value={horario} onChangeText={setHorario} placeholder="18:00" /></View></View>
          <Text style={s.label}>Categoria</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categorias}>{categorias.map((c) => <Pressable key={c.id} onPress={() => setCategoriaId(String(c.id))} style={[s.chip, categoriaId === String(c.id) && s.chipAtivo]}><Text style={[s.chipTxt, categoriaId === String(c.id) && { color: cores.branco }]}>{c.nome}</Text></Pressable>)}</ScrollView>
          <Campo label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Conte um pouco sobre o evento..." multiline />
          <Upload label="Foto do evento" legenda="Escolha uma imagem para aparecer nos cards e detalhes" asset={fotoEvento} atual={imagemAtual} onPress={() => escolherImagem('evento')} />
        </Secao>
        <Secao titulo="Organizador"><Campo label="Nome" value={organizador} onChangeText={setOrganizador} placeholder="Nome do organizador" /><Upload label="Logo" legenda="Adicione a identidade visual do organizador" asset={logoOrganizador} atual={logoAtual} onPress={() => escolherImagem('logo')} quadrado /></Secao>
        <Secao titulo="Localização"><Campo label="Endereço" value={endereco} onChangeText={setEndereco} placeholder="Ex: QNB 24, Taguatinga - DF" /><Campo label="Link do Google Maps (opcional)" value={mapaUrl} onChangeText={setMapaUrl} placeholder="Cole o link de localização" /></Secao>
        <Secao titulo="Acessibilidade"><Campo label="Descrição" value={acessibilidade} onChangeText={setAcessibilidade} placeholder="Informe recursos de acessibilidade" multiline /></Secao>
        <Pressable style={[s.salvar, salvando && { opacity: 0.65 }]} onPress={salvar} disabled={salvando}>{salvando ? <ActivityIndicator color={cores.branco} /> : <Text style={s.salvarTxt}>Salvar</Text>}</Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
function LinearTitulo({ texto }) { return <View style={s.faixa}><Text style={s.faixaTxt}>{texto}</Text></View>; }
function Secao({ titulo, children }) { return <View style={s.secao}><Text style={s.secaoTitulo}>{titulo}</Text><View style={s.traco} />{children}</View>; }
function Campo({ label, multiline, ...props }) { return <View style={s.campoWrap}><Text style={s.label}>{label}</Text><TextInput {...props} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} placeholderTextColor="#9A8D86" style={[s.input, multiline && s.multiline]} /></View>; }
function Upload({ label, legenda, asset, atual, onPress, quadrado }) { const uri = asset?.uri || atual; return <View style={s.uploadWrap}><Text style={s.label}>{label}</Text><Text style={s.legenda}>{legenda}</Text><Pressable onPress={onPress} style={[s.upload, quadrado && s.uploadQuadrado, uri && s.uploadComImagem]}>{uri ? <Image source={{ uri }} style={s.uploadImagem} resizeMode="cover" /> : <><Ionicons name="add" size={36} color={cores.cinza} /><Text style={s.uploadTxt}>Adicionar imagem</Text></>}</Pressable><Pressable onPress={onPress} style={s.selecionar}><Ionicons name="images-outline" size={17} color={cores.laranja} /><Text style={s.selecionarTxt}>{uri ? 'Trocar imagem' : 'Selecionar imagem'}</Text></Pressable></View>; }
const s = StyleSheet.create({
  flex: { flex: 1 }, tela: { flex: 1, backgroundColor: cores.papel }, topo: { height: 104, paddingTop: 42, paddingHorizontal: MARGEM, backgroundColor: cores.brasa, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, logo: { width: 48, height: 48 }, topoAcao: { ...t.organizador, color: cores.branco }, conteudo: { paddingBottom: 42 },
  faixa: { marginHorizontal: MARGEM, marginTop: 20, height: 116, borderRadius: 8, backgroundColor: cores.coral, alignItems: 'center', justifyContent: 'center' }, faixaTxt: { ...t.tituloTela, color: cores.branco, fontSize: 27 },
  secao: { marginHorizontal: MARGEM, marginTop: 28 }, secaoTitulo: { ...t.tituloSecao, color: cores.texto }, traco: { height: 2, width: 170, backgroundColor: cores.coral, marginTop: 3, marginBottom: 18 }, campoWrap: { marginHorizontal: 20, marginBottom: 18 }, label: { ...t.organizador, color: cores.texto, marginBottom: 8 }, input: { minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: '#DED8D4', backgroundColor: cores.branco, paddingHorizontal: 16, color: cores.texto, fontFamily: fontes.corpo, fontSize: 13, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 2 }, multiline: { minHeight: 132, paddingTop: 13 }, linha: { flexDirection: 'row', gap: 12, marginHorizontal: 20 }, categorias: { paddingHorizontal: 20, gap: 8, marginBottom: 18 }, chip: { borderWidth: 1, borderColor: cores.laranja, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8 }, chipAtivo: { backgroundColor: cores.laranja }, chipTxt: { ...t.organizador, color: cores.laranja },
  uploadWrap: { marginHorizontal: 20, marginBottom: 20 }, legenda: { ...t.metadado, color: cores.cinza, marginBottom: 9 }, upload: { minHeight: 124, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CFC7C1', borderRadius: 9, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden' }, uploadQuadrado: { minHeight: 112 }, uploadComImagem: { borderStyle: 'solid' }, uploadImagem: { width: '100%', height: 150 }, uploadTxt: { ...t.organizador, color: cores.cinza }, selecionar: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginTop: 8 }, selecionarTxt: { ...t.organizador, color: cores.laranja },
  salvar: { marginHorizontal: '18%', marginTop: 20, height: 50, borderRadius: 28, backgroundColor: cores.coral, alignItems: 'center', justifyContent: 'center' }, salvarTxt: { ...t.botao, color: cores.branco },
});
