import { Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, fontes, MARGEM } from '../theme';

const logo = require('../../assets/branding/logo-cerrado.png');

// Cabeçalho padrão das telas com barra inferior: logo + nome do app centralizados.
export default function TopoMarca() {
  return (
    <LinearGradient colors={[cores.sol, cores.brasa]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.topo}>
      <Image source={logo} style={s.logo} resizeMode="contain" />
      <Text style={s.marca}>Cerrado Arretado</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  topo: { 
    height: 104, 
    paddingTop: 40, 
    paddingHorizontal: MARGEM, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', // <-- Centraliza a logo e o texto no meio
    gap: 12 
  },
  logo: { width: 52, height: 52 },
  marca: { fontFamily: fontes.titulo, fontSize: 26, color: cores.branco },
});