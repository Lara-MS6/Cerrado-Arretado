// Fallbacks locais para os eventos demonstrativos que ainda não possuem imagem_url.
export function imagemLocalDoEvento(evento) {
  const texto = `${evento?.titulo ?? ''} ${evento?.categorias?.nome ?? ''}`.toLowerCase();
  if (texto.includes('caruru')) return require('../../assets/events/caruru.png');
  if (texto.includes('artesanato')) return require('../../assets/events/artesanato.png');
  if (texto.includes('compadecida')) return require('../../assets/events/auto-da-compadecida.png');
  if (texto.includes('são joão') || texto.includes('sao joao') || texto.includes('quadrilha')) return require('../../assets/events/sao-joao.png');
  if (texto.includes('nordestina')) return require('../../assets/events/festa-nordestina.png');
  if (texto.includes('mercado')) return require('../../assets/events/mercado-nordeste.png');
  if (texto.includes('forró') || texto.includes('forro')) return require('../../assets/events/forro.png');
  return null;
}
