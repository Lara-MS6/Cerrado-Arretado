// Identidade visual Cerrado Arretado: pôr do sol, terra e vegetação do Cerrado.
export const cores = {
  sol: '#FF8A2B', brasa: '#F0432A', terra: '#9B2000', cacto: '#5A1100', noite: '#3A0B02',
  laranja: '#F07A1E', coral: '#FF6B65', papel: '#FFF9F4', texto: '#2B1A14', cinza: '#76665F', branco: '#FFFFFF', borda: '#E9DCD4', acento: '#C4401A', laranjaTexto: '#B5470A',
};
export const fontes = {
  titulo: 'CormorantGaramond_600SemiBold', corpo: 'Montserrat_400Regular', medio: 'Montserrat_500Medium', forte: 'Montserrat_600SemiBold',
};
export const tipo = {
  tituloTela: { fontFamily: fontes.titulo, fontSize: 32, lineHeight: 38 },
  tituloSecao: { fontFamily: fontes.titulo, fontSize: 23, lineHeight: 28 },
  eventoNome: { fontFamily: fontes.forte, fontSize: 16 },
  corpo: { fontFamily: fontes.corpo, fontSize: 14, lineHeight: 22 },
  organizador: { fontFamily: fontes.medio, fontSize: 12 },
  metadado: { fontFamily: fontes.corpo, fontSize: 12 },
  botao: { fontFamily: fontes.forte, fontSize: 14 },
};
export const MARGEM = 20;
export function formatarData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const txt = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${txt.charAt(0).toUpperCase()}${txt.slice(1)}, às ${hora}`;
}
