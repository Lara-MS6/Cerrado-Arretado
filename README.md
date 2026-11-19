# 🌵 Cerrado Arretado

O **Cerrado Arretado** é um aplicativo móvel desenvolvido para valorizar, divulgar e conectar a comunidade a eventos culturais, culinária, festas e peças teatrais da região do Cerrado, com foco inicial no Distrito Federal e entorno.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias e ferramentas:

* **[React Native](https://reactnative.dev/)** / **[Expo](https://expo.dev/)** - Framework para desenvolvimento mobile multiplataforma.
* **[Supabase](https://supabase.com/)** - Backend como serviço (BaaS) utilizado para autenticação, banco de dados relacional (PostgreSQL) e gerenciamento de favoritos e perfis.
* **[Expo Vector Icons](https://icons.expo.fyi/)** - Ícones modernos e consistentes.
* **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradientes visuais para a identidade temática do app.

---

## ✨ Funcionalidades

* **Autenticação Segura**: Login e cadastro separados por tipos de perfil (**Usuário** e **Parceiro**).
* **Exploração por Categorias**: Filtros dinâmicos (Culinária, Festas, Teatro, etc.).
* **Destaques e Recomendações**: Seções personalizadas para eventos em alta, favoritos e novidades.
* **Detalhes do Evento**: Informações completas, organizador com nota, integração direta com o **Google Maps** e opção de favoritar.
* **Painel do Parceiro**: Usuários com perfil de parceiro possuem permissão para cadastrar novos eventos na plataforma.

---

## 📂 Estrutura do Projeto

```text
cerrado-arretado/
├── assets/             # Imagens, logos e fundos temáticos
├── src/
│   ├── components/     # Componentes reutilizáveis (ex: TopoMarca)
│   ├── lib/            # Configurações de serviços (ex: Supabase, imagens locais)
│   ├── screens/        # Telas principais (Auth, Home, Event, Profile, etc.)
│   └── theme/          # Variáveis globais de estilo (cores, fontes, margens)
├── App.js              # Ponto de entrada e rotas principais
├── app.json            # Configurações do Expo
└── package.json        # Dependências do projeto
⚙️ Como Executar o Projeto Localmente
Pré-requisitos
Certifique-se de ter o Node.js e o npm (ou yarn/pnpm) instalados na sua máquina, além do aplicativo Expo Go no seu celular (ou um emulador configurado).

1. Clonar o repositório
Bash
git clone [https://github.com/SEU-USUARIO/cerrado-arretado.git](https://github.com/SEU-USUARIO/cerrado-arretado.git)
cd cerrado-arretado
2. Instalar as dependências
Bash
npm install
3. Configurar as variáveis de ambiente
Crie um arquivo .env na raiz do projeto baseando-se no arquivo .env.example e adicione as suas credenciais do Supabase:

Fragmento do código
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase_aqui
4. Iniciar o projeto
Bash
npx expo start
Escaneie o QR Code exibido no terminal utilizando o aplicativo Expo Go no seu smartphone ou abra em um emulador.
