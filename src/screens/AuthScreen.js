
import { useState } from 'react';
import {
  Alert, Image, ImageBackground, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { cores, fontes, tipo as t, MARGEM } from '../theme';

const fundo = require('../../assets/backgrounds/cerrado-auth-bg.png');
const logo = require('../../assets/branding/logo-cerrado.png');

export default function AuthScreen() {
  const [etapa, setEtapa] = useState('escolha');
  const [perfil, setPerfil] = useState('usuario');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  function escolher(p) {
    setPerfil(p);
    setEtapa('login');
    setSenha('');
  }

  async function enviar() {
    const emailTratado = email.trim();

    if (!emailTratado || senha.length < 6) {
      Alert.alert(
        'Confira os dados',
        'Informe um e-mail e uma senha com pelo menos 6 caracteres.'
      );
      return;
    }

    if (etapa === 'registro' && !nome.trim()) {
      Alert.alert('Confira os dados', 'Informe seu nome.');
      return;
    }

    setCarregando(true);

    try {
      if (etapa === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailTratado,
          password: senha,
        });

        if (error) {
          Alert.alert(
            'Não foi possível entrar',
            'Confira seu e-mail e sua senha.'
          );
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: emailTratado,
          password: senha,
          options: {
            data: {
              nome: nome.trim(),
              tipo: perfil,
            },
          },
        });

        if (error) {
          Alert.alert('Não foi possível criar a conta', error.message);
        } else if (!data.session) {
          Alert.alert(
            'Quase lá',
            'Enviamos um link de confirmação para o seu e-mail.'
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Ocorreu um erro',
        'Não foi possível concluir sua solicitação. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ImageBackground
      source={fundo}
      resizeMode="cover"
      style={s.fundo}
    >
      <View pointerEvents="none" style={s.sombra} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}
      >
        <ScrollView
          contentContainerStyle={s.conteudo}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <View style={s.topoMarca}>
            <View style={s.logoContainer}>
              <Image
                source={logo}
                style={s.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={s.marcaTxt}>Cerrado Arretado</Text>
            <Text style={s.marcaLegenda}>
              Uma experiência do Cerrado
            </Text>
          </View>

          {etapa === 'escolha' ? (
            <View style={s.escolhaWrap}>
              <Text style={s.tituloBoas}>
                Seja bem-vindo(a)!
              </Text>

              <Text style={s.subBoas}>
                Como deseja acessar?
              </Text>

              <View style={s.opcoes}>
                <Opcao
                  icone="person-outline"
                  rotulo="Usuário"
                  onPress={() => escolher('usuario')}
                />

                <View style={s.divisorOu}>
                  <View style={s.linhaOu} />
                  <Text style={s.ou}>ou</Text>
                  <View style={s.linhaOu} />
                </View>

                <Opcao
                  icone="people-outline"
                  rotulo="Parceiro"
                  onPress={() => escolher('parceiro')}
                />
              </View>
            </View>
          ) : (
            <View style={s.cartao}>
              <Pressable
                accessibilityRole="button"
                style={s.voltar}
                onPress={() => {
                  setEtapa('escolha');
                  setSenha('');
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={19}
                  color={cores.branco}
                />
                <Text style={s.voltarTxt}>
                  Alterar tipo de acesso
                </Text>
              </Pressable>

              <Text style={s.cartaoTitulo}>
                {etapa === 'login'
                  ? 'Que bom ter você de volta!'
                  : 'Crie sua conta'}
              </Text>

              <Text style={s.cartaoSubtitulo}>
                {etapa === 'login'
                  ? 'Entre para continuar'
                  : 'Preencha seus dados para começar'}
              </Text>

              {etapa === 'registro' && (
                <Campo
                  valor={nome}
                  aoMudar={setNome}
                  placeholder="Nome completo"
                  icone="person-outline"
                />
              )}

              <Campo
                valor={email}
                aoMudar={setEmail}
                placeholder="E-mail"
                icone="mail-outline"
                teclado="email-address"
              />

              <Campo
                valor={senha}
                aoMudar={setSenha}
                placeholder="Senha (mínimo 6 caracteres)"
                icone="lock-closed-outline"
                segredo
              />

              <Pressable
                accessibilityRole="button"
                style={[
                  s.botao,
                  carregando && s.desabilitado,
                ]}
                onPress={enviar}
                disabled={carregando}
              >
                <Text style={s.botaoTxt}>
                  {carregando
                    ? 'Aguarde...'
                    : etapa === 'login'
                    ? 'Entrar'
                    : 'Criar conta'}
                </Text>

                {!carregando && (
                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={cores.noite}
                  />
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={s.alternarConta}
                onPress={() =>
                  setEtapa(
                    etapa === 'login' ? 'registro' : 'login'
                  )
                }
              >
                <Text style={s.rodape}>
                  {etapa === 'login'
                    ? 'Não tem conta? '
                    : 'Já tem conta? '}

                  <Text style={s.link}>
                    {etapa === 'login'
                      ? 'Registre-se'
                      : 'Entrar'}
                  </Text>
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

function Opcao({ icone, rotulo, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Acessar como ${rotulo.toLowerCase()}`}
      style={({ pressed }) => [
        s.opcao,
        pressed && s.opcaoPressionada,
      ]}
      onPress={onPress}
    >
      <View style={s.opcaoIcone}>
        <Ionicons
          name={icone}
          size={42}
          color={cores.noite}
        />
      </View>

      <Text style={s.opcaoTxt}>{rotulo}</Text>

      <View style={s.opcaoRodape}>
        <Text style={s.opcaoAcao}>Acessar</Text>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={cores.cacto}
        />
      </View>
    </Pressable>
  );
}

function Campo({
  valor,
  aoMudar,
  placeholder,
  icone,
  segredo,
  teclado,
}) {
  return (
    <View style={s.campo}>
      <Ionicons
        name={icone}
        size={19}
        color={cores.cacto}
      />

      <TextInput
        style={s.input}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor="#76665F"
        accessibilityLabel={placeholder}
        secureTextEntry={segredo}
        keyboardType={teclado || 'default'}
        autoCapitalize={
          teclado === 'email-address' ? 'none' : 'sentences'
        }
        autoCorrect={false}
        returnKeyType={segredo ? 'done' : 'next'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  flex: {
    flex: 1,
  },

  fundo: {
    flex: 1,
    backgroundColor: cores.noite,
  },

  sombra: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 8, 0, 0.38)',
  },

  conteudo: {
    flexGrow: 1,
    paddingHorizontal: MARGEM,
    paddingTop: Platform.OS === 'ios' ? 54 : 38,
    paddingBottom: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topoMarca: {
    alignItems: 'center',
    marginBottom: 38,
  },

  logoContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 10,
  },

  logo: {
    width: 62,
    height: 62,
  },

  marcaTxt: {
    fontFamily: fontes.titulo,
    fontSize: 27,
    color: cores.branco,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 2 },
  },

  marcaLegenda: {
    fontFamily: fontes.corpo,
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
    letterSpacing: 0.7,
  },

  escolhaWrap: {
    width: '100%',
    alignItems: 'center',
  },

  tituloBoas: {
    ...t.tituloTela,
    fontSize: 32,
    color: cores.branco,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 2 },
  },

  subBoas: {
    ...t.tituloSecao,
    fontSize: 18,
    color: 'rgba(255,255,255,0.94)',
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 30,
  },

  opcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },

  opcao: {
    flex: 1,
    minWidth: 0,
    minHeight: 174,
    backgroundColor: '#FFF8EE',
    borderRadius: 22,
    borderTopWidth: 4,
    borderTopColor: '#F6A51A',
    paddingHorizontal: 10,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2C0800',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },

  opcaoPressionada: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },

  opcaoIcone: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F7E8D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  opcaoTxt: {
    fontFamily: fontes.titulo,
    fontSize: 21,
    color: cores.noite,
    textAlign: 'center',
    marginTop: 10,
  },

  opcaoRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },

  opcaoAcao: {
    fontFamily: fontes.forte,
    fontSize: 12,
    color: cores.cacto,
  },

  divisorOu: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  linhaOu: {
    width: 1,
    height: 25,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  ou: {
    fontFamily: fontes.titulo,
    fontSize: 17,
    color: cores.branco,
  },

  cartao: {
    width: '100%',
    backgroundColor: 'rgba(58, 11, 2, 0.82)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    gap: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },

  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    marginBottom: 2,
  },

  voltarTxt: {
    fontFamily: fontes.corpo,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  cartaoTitulo: {
    ...t.tituloTela,
    fontSize: 25,
    color: cores.branco,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 4,
  },

  cartaoSubtitulo: {
    fontFamily: fontes.corpo,
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginTop: -9,
    marginBottom: 3,
  },

  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },

  input: {
    flex: 1,
    fontFamily: fontes.corpo,
    fontSize: 15,
    color: cores.texto,
    paddingVertical: 0,
    height: '100%',
    textAlignVertical: 'center',
  },

  botao: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#FFF3DF',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  botaoTxt: {
    ...t.botao,
    color: cores.noite,
    fontSize: 16,
  },

  desabilitado: {
    opacity: 0.6,
  },

  alternarConta: {
    paddingTop: 2,
  },

  rodape: {
    ...t.corpo,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  link: {
    fontFamily: fontes.forte,
    color: cores.branco,
    textDecorationLine: 'underline',
  },
});
