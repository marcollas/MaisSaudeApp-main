# MaisSaúde App

Aplicativo mobile para rastreamento de saúde e bem-estar, desenvolvido com React Native e Expo. Permite registrar calorias, consumo de água, horas de sono, treinos físicos e interagir socialmente com outros usuários.

## Requisitos do Sistema

- Node.js versão 16 ou superior
- npm ou yarn
- Expo Go instalado no dispositivo móvel (iOS ou Android)
- Conta Expo (opcional, para publicação)

## Instalação

1. Clone o repositório e navegue até a pasta do projeto:
```bash
cd MaisSaudeApp_clean
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure o Firebase:
   - Abra `src/firebase/config.js`
   - Substitua as credenciais pelos dados do seu projeto Firebase
   - Configure as regras de segurança usando o arquivo `firebase.rules`

## Executando o Aplicativo

### Modo desenvolvimento
```bash
npx expo start
```

### Limpar cache (se necessário)
```bash
npx expo start -c
```

Após iniciar, um QR Code será exibido no terminal. Escaneie-o com:
- **iOS**: Câmera nativa do iPhone
- **Android**: App Expo Go

## Funcionalidades Principais

### Home
- Visualize o resumo diário de calorias, água e sono
- Adicione valores rápidos com botões de atalho
- Defina e edite metas personalizadas para cada métrica
- Acesse atalhos para iniciar treinos

### Treinos (Workouts)
- Inicie sessões de corrida, caminhada ou treino de força
- Rastreamento GPS para atividades outdoor (corrida/caminhada)
- Registro de exercícios de força com séries e repetições
- Visualize histórico completo e resumo semanal
- Métricas: duração, distância, calorias estimadas

### Social
- Crie publicações com texto e/ou imagem
- Visualize feed de publicações (próprias e de outros)
- Filtros por período: Recentes, Semana, Mês
- Paginação com "Carregar mais"

### Perfil
- Edite nome e foto de perfil
- Escolha imagem da galeria ou tire foto na hora
- Visualize resumo semanal de atividades
- Seção de conquistas (em desenvolvimento)

### Buscar Exercícios
- Busque exercícios na base de dados pública (wger API)
- Visualize descrições e instruções
- Use como referência para treinos

## Estrutura do Projeto

```
MaisSaudeApp_clean/
├── src/
│   ├── animations/          # Hooks de animação (Reanimated)
│   ├── components/          # Componentes reutilizáveis
│   ├── constants/           # Temas, cores, tamanhos
│   ├── contexts/            # Context API (Auth, Health, Workouts, Profile)
│   ├── firebase/            # Configuração Firebase
│   ├── hooks/               # Custom hooks
│   ├── models/              # Funções de cálculo e formatação
│   ├── navigation/          # Navegação (Tabs e Stacks)
│   ├── repositories/        # Sincronização Firestore
│   ├── screens/             # Telas do app
│   │   ├── App/            # Telas pós-login
│   │   └── Auth/           # Telas de autenticação
│   ├── services/            # APIs externas
│   ├── storage/             # AsyncStorage (offline-first)
│   └── utils/               # Utilitários gerais
├── assets/                  # Imagens e recursos estáticos
├── android/                 # Configurações Android
├── App.js                   # Entry point
├── app.json                 # Configuração Expo
├── babel.config.js          # Babel + Reanimated plugin
├── package.json             # Dependências
└── tsconfig.json            # TypeScript (parcial)
```

## Tecnologias Utilizadas

- **React Native** 0.81.5
- **Expo** SDK 54
- **React Navigation** 6.x (Tabs + Stack)
- **Firebase** 12.x (Auth, Firestore, Storage)
- **AsyncStorage** (persistência local)
- **React Native Reanimated** 4.x (animações)
- **Expo Location** (GPS/rastreamento)
- **Expo Image Picker** (galeria/câmera)

## Armazenamento de Dados

O app funciona **offline-first**:
- Dados são salvos localmente no AsyncStorage
- Sincronização automática com Firestore quando o usuário está logado
- Estratégia "last write wins" para conflitos

### Chaves AsyncStorage
- `@maisSaude/profile`: nome e foto do usuário
- `@maisSaude/posts`: publicações sociais
- `@maisSaude/workouts`: histórico de treinos
- `@maisSaude/dailyData_{data}`: métricas do dia (calorias, água, sono)
- `@maisSaude/goals`: metas personalizadas

## Autenticação

O app suporta autenticação via Firebase:
- Login com e-mail e senha
- Registro de novos usuários
- Recuperação de senha
- Persistência de sessão (AsyncStorage)

## Solução de Problemas

### Metro bundler não inicia
```bash
npx expo start -c
```

### Erros de cache do Expo
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Imagens não aparecem após reiniciar o app
Verifique se as URIs salvas apontam para `FileSystem.documentDirectory`. O código usa `expo-file-system/legacy` para compatibilidade.

### GPS não funciona
- Verifique se deu permissão de localização no dispositivo
- Teste em ambiente externo (GPS pode falhar em locais fechados)

## Desenvolvimento Futuro

Funcionalidades planejadas:
- Gráficos históricos (semana/mês)
- API de nutrição para buscar alimentos
- Notificações agendadas (lembretes)
- Login social (Google)
- Drawer navigation para configurações avançadas

## Licença

Projeto acadêmico - Sistemas de Informação (último período)
