
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../lib/supabase';
import TopoMarca from '../components/TopoMarca';

import {
  cores,
  fontes,
  tipo as t,
  MARGEM,
} from '../theme';

export default function ProfileScreen({ navigation }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarPerfil() {
        setCarregando(true);

        try {
          const { data: u, error: erroUsuario } =
            await supabase.auth.getUser();

          if (erroUsuario || !u.user) {
            throw erroUsuario || new Error('Usuário não encontrado.');
          }

          const user = u.user;

          const { data: p, error: erroPerfil } =
            await supabase
              .from('profiles')
              .select('nome,tipo')
              .eq('id', user.id)
              .maybeSingle();

          if (erroPerfil) throw erroPerfil;

          const tipo =
            p?.tipo ||
            user.user_metadata?.tipo ||
            'usuario';

          const consulta =
            tipo === 'parceiro'
              ? await supabase
                  .from('eventos')
                  .select('id', {
                    count: 'exact',
                    head: true,
                  })
                  .eq('organizador_id', user.id)
              : await supabase
                  .from('favoritos')
                  .select('evento_id', {
                    count: 'exact',
                    head: true,
                  })
                  .eq('usuario_id', user.id);

          if (consulta.error) throw consulta.error;

          if (ativo) {
            setDados({
              nome:
                p?.nome ||
                user.user_metadata?.nome ||
                'Sem nome',
              email: user.email,
              tipo,
              total: consulta.count ?? 0,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);

          if (ativo) {
            Alert.alert(
              'Não foi possível carregar',
              'Ocorreu um problema ao buscar seus dados. Tente novamente.'
            );
          }
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregarPerfil();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const sair = () => {
    Alert.alert(
      'Sair da conta?',
      'Você precisará entrar novamente para acessar seus eventos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();

            if (error) {
              Alert.alert(
                'Erro',
                'Não foi possível sair da conta.'
              );
            }
          },
        },
      ]
    );
  };

  if (carregando || !dados) {
    return (
      <View style={s.tela}>
        <TopoMarca />

        <View style={s.carregamento}>
          <ActivityIndicator
            size="large"
            color={cores.laranja}
          />

          <Text style={s.carregamentoTxt}>
            Carregando seu perfil...
          </Text>
        </View>
      </View>
    );
  }

  const parceiro = dados.tipo === 'parceiro';

  const inicial = dados.nome
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <View style={s.tela}>
      <TopoMarca />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.conteudo}
      >

        {/* IDENTIFICAÇÃO */}

        <View style={s.cabeca}>

          <View style={s.avatarBorda}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>
                {inicial}
              </Text>
            </View>
          </View>

          <Text style={s.nome}>
            {dados.nome}
          </Text>

          <Text style={s.email}>
            {dados.email}
          </Text>

          <View style={s.selo}>
            <Ionicons
              name={parceiro ? 'storefront-outline' : 'person-outline'}
              size={15}
              color={cores.branco}
            />

            <Text style={s.seloTxt}>
              {parceiro ? 'Parceiro' : 'Usuário'}
            </Text>
          </View>
        </View>

        {/* RESUMO */}

        <View style={s.secaoCabecalho}>
          <Text style={s.secao}>
            Resumo
          </Text>

          <View style={s.traco} />
        </View>

        <View style={s.resumo}>
          <View style={s.resumoIcone}>
            <Ionicons
              name={parceiro ? 'calendar-outline' : 'heart-outline'}
              size={27}
              color={cores.acento}
            />
          </View>

          <View style={s.resumoInfo}>
            <Text style={s.numero}>
              {dados.total}
            </Text>

            <Text style={s.resumoTxt}>
              {parceiro
                ? 'eventos publicados por você'
                : 'eventos nos seus favoritos'}
            </Text>
          </View>

          <Ionicons
            name="stats-chart-outline"
            size={20}
            color={cores.coral}
          />
        </View>

        {/* CONTA */}

        <View style={[s.secaoCabecalho, s.secaoConta]}>
          <Text style={s.secao}>
            Conta
          </Text>

          <View style={s.traco} />
        </View>

        <View style={s.acoes}>

          {parceiro && (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                s.linha,
                pressed && s.linhaPressionada,
              ]}
              onPress={() =>
                navigation.navigate('CadastroEvento')
              }
            >
              <View style={s.iconeAcao}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={cores.acento}
                />
              </View>

              <View style={s.linhaInfo}>
                <Text style={s.linhaTxt}>
                  Cadastrar novo evento
                </Text>

                <Text style={s.linhaSub}>
                  Divulgue uma nova programação
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={cores.cinza}
              />
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              s.linha,
              s.linhaSair,
              pressed && s.linhaPressionada,
            ]}
            onPress={sair}
          >
            <View style={s.iconeAcaoSair}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#B3261E"
              />
            </View>

            <View style={s.linhaInfo}>
              <Text style={s.linhaSairTxt}>
                Sair da conta
              </Text>

              <Text style={s.linhaSub}>
                Encerrar sua sessão
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={cores.cinza}
            />
          </Pressable>

        </View>

        {/* RODAPÉ */}

        <View style={s.rodape}>
          <View style={s.rodapeTraco} />

          <Text style={s.rodapeTxt}>
            Cerrado Arretado
          </Text>

          <Text style={s.rodapeSub}>
            Descubra, participe e valorize o Cerrado.
          </Text>
        </View>

      </ScrollView>
    </View>
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
    paddingHorizontal: MARGEM,
    paddingTop: 26,
    paddingBottom: 115,
  },

  // CARREGAMENTO

  carregamento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  carregamentoTxt: {
    ...t.corpo,
    color: cores.cinza,
  },

  // IDENTIFICAÇÃO

  cabeca: {
    alignItems: 'center',
    marginBottom: 38,
  },

  avatarBorda: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: cores.coral,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: cores.cacto,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarTxt: {
    fontFamily: fontes.titulo,
    fontSize: 49,
    color: cores.branco,
  },

  nome: {
    ...t.tituloTela,
    fontSize: 29,
    color: cores.texto,
    marginTop: 16,
    textAlign: 'center',
  },

  email: {
    ...t.corpo,
    fontSize: 15,
    color: cores.cinza,
    marginTop: 5,
    textAlign: 'center',
  },

  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: cores.acento,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 15,
  },

  seloTxt: {
    ...t.metadado,
    fontFamily: fontes.medio,
    fontSize: 13,
    color: cores.branco,
  },

  // TÍTULOS DAS SEÇÕES

  secaoCabecalho: {
    marginBottom: 15,
  },

  secaoConta: {
    marginTop: 32,
  },

  secao: {
    ...t.tituloSecao,
    fontSize: 25,
    color: cores.texto,
  },

  traco: {
    height: 3,
    width: 145,
    borderRadius: 3,
    backgroundColor: cores.coral,
    marginTop: 6,
  },

  // RESUMO

  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 19,
    gap: 13,
    minHeight: 112,
    shadowColor: '#4A1A0B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  resumoIcone: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F9E9DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumoInfo: {
    flex: 1,
    gap: 1,
  },

  numero: {
    fontFamily: fontes.titulo,
    fontSize: 35,
    color: cores.acento,
  },

  resumoTxt: {
    ...t.corpo,
    fontSize: 13,
    lineHeight: 19,
    color: cores.texto,
  },

  // AÇÕES DA CONTA

  acoes: {
    gap: 12,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 78,
    backgroundColor: cores.branco,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },

  linhaPressionada: {
    opacity: 0.75,
  },

  iconeAcao: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F9E9DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconeAcaoSair: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FCEBE9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linhaInfo: {
    flex: 1,
    gap: 4,
  },

  linhaTxt: {
    ...t.eventoNome,
    fontSize: 15,
    color: cores.texto,
  },

  linhaSub: {
    ...t.metadado,
    fontSize: 12,
    color: cores.cinza,
  },

  linhaSair: {
    borderColor: '#EBD9D5',
  },

  linhaSairTxt: {
    ...t.eventoNome,
    fontSize: 15,
    color: '#B3261E',
  },

  // RODAPÉ

  rodape: {
    alignItems: 'center',
    marginTop: 42,
    gap: 7,
  },

  rodapeTraco: {
    width: 45,
    height: 3,
    backgroundColor: cores.coral,
    borderRadius: 3,
    marginBottom: 5,
  },

  rodapeTxt: {
    fontFamily: fontes.titulo,
    fontSize: 18,
    color: cores.laranjaTexto,
  },

  rodapeSub: {
    ...t.metadado,
    fontSize: 12,
    color: cores.cinza,
    textAlign: 'center',
  },

});
