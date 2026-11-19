# Atualização 2: barra inferior, Perfil, Favoritos e login/registro

1. Faça backup do projeto, extraia este zip e copie por cima da raiz (aceite substituir `App.js`, `theme.js`, `HomeScreen.js`, `PartnerEventsScreen.js` e `AuthScreen.js`).
2. Instale a barra inferior:
   ```
   npx expo install @react-navigation/bottom-tabs
   ```
3. Reinicie: `npx expo start -c`

## O que muda
- Barra inferior: Início, Meus eventos (parceiro) ou Favoritos (usuário), e Perfil.
- Novas telas: Perfil e Favoritos. "Meus eventos" ganhou o mesmo cabeçalho das demais.
- Home: cabeçalho com nome do app, botão "+" redondo, cores com mais contraste.
- Login e registro: cartão escuro, links brancos e sublinhados, campos de 52 px.
- Campos de texto: removido o `lineHeight` herdado do tema, que deslocava o texto digitado para baixo e cortava letras como "g" e "y".
- Novas cores no tema: `acento` (#C4401A) e `laranjaTexto` (#B5470A).
