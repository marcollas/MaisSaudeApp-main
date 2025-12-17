# MaisSaúde App

App de saúde e fitness desenvolvido com React Native e Expo, focado em monitoramento de métricas de saúde e treinos.

## 🚀 Requisitos

- Node.js 16+
- npm ou yarn
- Expo Go app no celular (Android/iOS)
- Conta Firebase (para autenticação e dados)

## 📦 Instalação

```bash
cd MaisSaudeApp_clean
npm install
```

## ▶️ Rodar o Projeto

```bash
npx expo start
```

Escaneie o QR Code com o Expo Go para testar no celular.

Para limpar cache (recomendado se houver problemas):
```bash
npx expo start -c
```

## 🔧 Configuração Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Email/Password)
3. Configure Firestore e Storage
4. Copie as credenciais Web para `src/firebase/config.js`
5. Aplique as regras do arquivo `firebase.rules`

## 🎯 Funcionalidades

### Saúde Diária
- **Calorias**: Registre consumo diário com metas personalizáveis
- **Água**: Acompanhe hidratação em mL
- **Sono**: Monitore horas de sono
- Persistência local com AsyncStorage
- Edição de metas individuais

### Treinos
- **Corrida/Caminhada**: Cronômetro + GPS tracking (opcional)
- **Força**: Registro de séries, reps e carga
- **Histórico**: Lista completa com filtros e resumo semanal
- Estatísticas: duração, distância, ritmo, calorias

### Social
- Perfil com avatar personalizável
- Feed de posts com imagens
- Integração com Firebase Storage

## 📂 Estrutura do Projeto

```
MaisSaudeApp_clean/
├── App.js                 # Entry point
├── app.json              # Config do Expo
├── package.json
├── src/
│   ├── screens/          # Telas do app
│   │   ├── Auth/         # Login, Register
│   │   └── App/          # Home, Workouts, Social, Profile
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Context API (Auth, Health, Workouts)
│   ├── storage/          # AsyncStorage helpers
│   ├── models/           # Modelos de dados e validações
│   ├── services/         # Firestore, Storage
│   ├── utils/            # Funções auxiliares
│   ├── navigation/       # Navegação (tabs, stacks)
│   ├── constants/        # Temas, cores, imagens
│   └── firebase/         # Config Firebase
├── assets/               # Imagens, fontes
└── android/              # Configuração nativa Android
```

## 🛠️ Scripts Úteis

- `npm start` - Inicia o servidor Metro
- `npx expo start -c` - Inicia limpando cache
- `npm run android` - Abre no emulador Android
- `npm run ios` - Abre no simulador iOS (macOS)

## ⚠️ Problemas Comuns

**App não carrega:**
- Limpe cache: `npx expo start -c`
- Delete `node_modules` e reinstale: `rm -rf node_modules && npm install`

**Erro de Firebase:**
- Verifique credenciais em `src/firebase/config.js`
- Confirme regras do Firestore/Storage

**GPS não funciona (treinos):**
- Conceda permissão de localização no celular
- GPS funciona apenas em foreground (limitação do Expo Go)

## 🎓 Tecnologias

- React Native + Expo SDK 54
- React Navigation
- Firebase (Auth, Firestore, Storage)
- AsyncStorage
- Expo Location (GPS)
- Context API + Hooks

## 📱 Compatibilidade

✅ 100% compatível com Expo Go (sem necessidade de build nativo)

---

**Documentação técnica detalhada:** Veja `docs/archive/` para arquitetura e guias de implementação.

Desenvolvido como projeto acadêmico de Sistemas de Informação.
