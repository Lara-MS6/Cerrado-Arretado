
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../lib/supabase';
import { imagemLocalDoEvento } from '../lib/eventImages';
import TopoMarca from '../components/TopoMarca';
import {
  cores,
  fontes,
  tipo as t,
  MARGEM,
  formatarData,
} from '../theme';

export default function HomeScreen({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [filtro, setFiltro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('usuario');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [
        { data: userData },
        ev,
        cat,
        fav,
        perfil,
      ] = await Promise.all([
        supabase.auth.getUser(),

        supabase
          .from('eventos')
          .select('*, categorias(nome)')
          .order('data_hora'),

        supabase
          .from('categorias')
          .select('*')
          .order('id'),

        supabase
          .from('favoritos')
          .select('evento_id'),

        supabase
          .from('profiles')
          .select('tipo')
          .maybeSingle(),
      ]);

      if (ev.error) {
        throw ev.error;
      }

      setEventos(ev.data ?? []);
      setCategorias(cat.data ?? []);

      setFavIds(
        (fav.data ?? []).map((f) => f.evento_id)
      );

      setTipoPerfil(
        perfil.data?.tipo ||
        userData.user?.user_metadata?.tipo ||
        'usuario'
      );

    } catch (error) {
      console.error('Erro ao carregar HomeScreen:', error);

      setErro(
        'Não foi possível carregar os eventos. Puxe a tela para tentar novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const secoes = useMemo(() => {
    const base = filtro
      ? eventos.filter((e) => e.categoria_id === filtro)
      : eventos;

    return [
      {
        titulo: 'Seus favoritos',
        icone: 'heart-outline',
        dados: base.filter((e) => favIds.includes(e.id)),
      },
      {
        titulo: 'Destaques da semana',
        icone: 'star-outline',
        dados: base.filter((e) => e.destaque),
      },
      {
        titulo: 'Mais vistos',
        icone: 'eye-outline',
        dados: [...base].sort(
          (a, b) =>
            (b.visualizacoes || 0) -
            (a.visualizacoes || 0)
        ),
      },
      {
        titulo: 'Novidades',
        icone: 'sparkles-outline',
        dados: [...base].sort(
          (a, b) =>
            new Date(b.created_at || b.data_hora) -
            new Date(a.created_at || a.data_hora)
        ),
      },
      {
        titulo: 'Recomendados',
        icone: 'compass-outline',
        dados: base,
      },
    ].filter((secao) => secao.dados.length > 0);
  }, [eventos, favIds, filtro]);

  return (
    <View style={s.tela}>
      <TopoMarca />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.conteudo}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregar}
            tintColor={cores.laranja}
            colors={[cores.laranja]}
          />
        }
      >
        {/* FILTROS DE CATEGORIA */}

        <View style={s.filtrosContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtros}
          >
            <Chip
              rotulo="Todos"
              ativo={filtro === null}
              onPress={() => setFiltro(null)}
            />

            {categorias.map((c) => (
              <Chip
                key={c.id}
                rotulo={c.nome}
                ativo={filtro === c.id}
                onPress={() => setFiltro(c.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* CARREGAMENTO */}

        {carregando && eventos.length === 0 && (
          <View style={s.estado}>
            <ActivityIndicator
              size="large"
              color={cores.laranja}
            />
            <Text style={s.estadoTexto}>
              Carregando eventos...
            </Text>
          </View>
        )}

        {/* ERRO */}

        {!!erro && (
          <View style={s.estado}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color={cores.laranja}
            />

            <Text style={s.estadoTexto}>
              {erro}
            </Text>

            <Pressable
              style={s.tentarNovamente}
              onPress={carregar}
            >
              <Text style={s.tentarTexto}>
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        )}

        {/* ESTADO VAZIO */}

        {!carregando &&
          !erro &&
          secoes.length === 0 && (
            <View style={s.estado}>
              <Ionicons
                name="calendar-outline"
                size={42}
                color={cores.coral}
              />

              <Text style={s.estadoTitulo}>
                Nenhum evento encontrado
              </Text>

              <Text style={s.estadoTexto}>
                Ainda não existem eventos disponíveis
                nessa categoria.
              </Text>
            </View>
          )}

        {/* SEÇÕES DE EVENTOS */}

        {!erro &&
          secoes.map((secao) => (
            <View
              key={secao.titulo}
              style={s.secaoWrap}
            >
              <View style={s.secaoCabecalho}>
                <View style={s.secaoTituloLinha}>
                  <Text style={s.secao}>
                    {secao.titulo}
                  </Text>

                  <Text style={s.quantidade}>
                    {secao.dados.length}
                  </Text>
                </View>

                <View style={s.traco} />
              </View>

              <FlatList
                horizontal
                data={secao.dados}
                keyExtractor={(item) => String(item.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.lista}
                renderItem={({ item }) => (
                  <Card
                    evento={item}
                    aoAbrir={() =>
                      navigation.navigate('Evento', {
                        evento: item,
                      })
                    }
                  />
                )}
              />
            </View>
          ))}

        <View style={s.rodapeConteudo}>
          <Text style={s.rodapeTexto}>
            Descubra o melhor do Cerrado.
          </Text>
        </View>
      </ScrollView>

      {/* BOTÃO DE CADASTRO PARA PARCEIROS */}

      {tipoPerfil === 'parceiro' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar novo evento"
          style={({ pressed }) => [
            s.fab,
            pressed && s.fabPressionado,
          ]}
          onPress={() =>
            navigation.navigate('CadastroEvento')
          }
        >
          <Ionicons
            name="add"
            size={30}
            color={cores.branco}
          />
        </Pressable>
      )}
    </View>
  );
}

// =====================================================
// FILTRO DE CATEGORIA
// =====================================================

function Chip({ rotulo, ativo, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        ativo && s.chipAtivo,
        pressed && s.chipPressionado,
      ]}
    >
      <Text
        style={[
          s.chipTxt,
          ativo && s.chipTxtAtivo,
        ]}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

// =====================================================
// CARD DE EVENTO
// =====================================================

export function Card({
  evento,
  aoAbrir,
  compacto = false,
}) {
  const local = imagemLocalDoEvento(evento);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes do evento ${evento.titulo}`}
      onPress={aoAbrir}
      style={({ pressed }) => [
        s.card,
        compacto && s.cardCompacto,
        pressed && s.cardPressionado,
      ]}
    >
      {/* IMAGEM */}

      <View
        style={[
          s.foto,
          compacto && s.fotoCompacta,
        ]}
      >
        {evento.imagem_url ? (
          <Image
            source={{ uri: evento.imagem_url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : local ? (
          <Image
            source={local}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[cores.sol, cores.terra]}
            style={[
              StyleSheet.absoluteFillObject,
              s.semFoto,
            ]}
          >
            <Ionicons
              name="sunny-outline"
              size={46}
              color="rgba(255,255,255,0.8)"
            />

            <Text style={s.semFotoTexto}>
              Cerrado Arretado
            </Text>
          </LinearGradient>
        )}

        {/* CATEGORIA */}

        {!!evento.categorias?.nome && (
          <View style={s.pilula}>
            <Text
              style={s.pilulaTxt}
              numberOfLines={1}
            >
              {evento.categorias.nome}
            </Text>
          </View>
        )}

        {/* INDICADOR DE DESTAQUE */}

        {evento.destaque && (
          <View style={s.destaqueIcone}>
            <Ionicons
              name="star"
              size={15}
              color="#FFFFFF"
            />
          </View>
        )}
      </View>

      {/* INFORMAÇÕES */}

      <View style={s.cardInfo}>
        <Text
          style={s.nome}
          numberOfLines={2}
        >
          {evento.titulo}
        </Text>

        <Text
          style={s.org}
          numberOfLines={1}
        >
          Organizador: {evento.organizador_nome}
        </Text>

        <View style={s.dataLinha}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={cores.cinza}
          />

          <Text
            style={s.data}
            numberOfLines={1}
          >
            {formatarData(evento.data_hora)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const s = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.papel,
  },

  conteudo: {
    paddingBottom: 115,
  },

  // FILTROS

  filtrosContainer: {
    marginTop: 8,
    marginBottom: 4,
  },

  filtros: {
    paddingHorizontal: MARGEM,
    paddingVertical: 12,
    gap: 10,
  },

  chip: {
    minHeight: 40,
    paddingHorizontal: 19,
    borderRadius: 24,
    borderWidth: 1.4,
    borderColor: cores.acento,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipAtivo: {
    backgroundColor: cores.acento,
    borderColor: cores.acento,
  },

  chipPressionado: {
    opacity: 0.75,
  },

  chipTxt: {
    ...t.organizador,
    fontSize: 14,
    color: cores.laranjaTexto,
  },

  chipTxtAtivo: {
    color: cores.branco,
  },

  // SEÇÕES

  secaoWrap: {
    marginTop: 25,
  },

  secaoCabecalho: {
    marginHorizontal: MARGEM,
    marginBottom: 14,
  },

  secaoTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  secao: {
    ...t.tituloSecao,
    fontSize: 25,
    color: cores.texto,
  },

  quantidade: {
    fontFamily: fontes.medio,
    fontSize: 12,
    color: cores.laranjaTexto,
    backgroundColor: '#F4E7DA',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },

  traco: {
    height: 3,
    width: 145,
    backgroundColor: cores.coral,
    borderRadius: 3,
    marginTop: 6,
  },

  lista: {
    paddingHorizontal: MARGEM,
    gap: 15,
    paddingBottom: 5,
  },

  // CARDS

  card: {
    width: 300,
    backgroundColor: '#FFFCF8',
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE2D9',
    shadowColor: '#4A1A0B',
    shadowOpacity: 0.09,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  cardCompacto: {
    width: '100%',
  },

  cardPressionado: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  foto: {
    height: 185,
    overflow: 'hidden',
    backgroundColor: cores.cacto,
  },

  fotoCompacta: {
    height: 168,
  },

  semFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  semFotoTexto: {
    fontFamily: fontes.titulo,
    fontSize: 17,
    color: cores.branco,
  },

  pilula: {
    position: 'absolute',
    left: 13,
    bottom: 12,
    maxWidth: '75%',
    backgroundColor: cores.acento,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  pilulaTxt: {
    ...t.metadado,
    color: cores.branco,
    fontFamily: fontes.medio,
    fontSize: 12,
  },

  destaqueIcone: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(58,11,2,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // INFORMAÇÕES DO EVENTO

  cardInfo: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 15,
  },

  nome: {
    ...t.eventoNome,
    color: cores.texto,
    fontSize: 17,
    lineHeight: 23,
    minHeight: 46,
  },

  org: {
    ...t.organizador,
    fontSize: 13,
    color: cores.laranjaTexto,
    marginTop: 5,
  },

  dataLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },

  data: {
    ...t.metadado,
    color: cores.cinza,
    fontSize: 12,
    flex: 1,
  },

  // ESTADOS DA TELA

  estado: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MARGEM,
    marginTop: 55,
    gap: 12,
  },

  estadoTitulo: {
    ...t.tituloSecao,
    color: cores.texto,
    textAlign: 'center',
  },

  estadoTexto: {
    ...t.corpo,
    color: cores.cinza,
    textAlign: 'center',
    lineHeight: 22,
  },

  tentarNovamente: {
    backgroundColor: cores.acento,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 5,
  },

  tentarTexto: {
    ...t.organizador,
    color: cores.branco,
  },

  // RODAPÉ

  rodapeConteudo: {
    alignItems: 'center',
    marginTop: 38,
    paddingHorizontal: MARGEM,
  },

  rodapeTexto: {
    fontFamily: fontes.titulo,
    fontSize: 16,
    color: cores.laranjaTexto,
    opacity: 0.8,
  },

  // BOTÃO FLUTUANTE

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.acento,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: '#3A0B02',
    shadowOpacity: 0.28,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  fabPressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});
