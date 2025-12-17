# MaisSaudeApp (clean)

Minimal instructions to run and finish setup.

Prerequisites
- Node.js (16+ recommended)
- Expo CLI (optional) or use `npx expo`
- An Expo Go app on your device (matching SDK 54 ideally)

Run locally (Expo)

1. Install dependencies:

```bash
cd MaisSaudeApp_clean
npm install
```

2. Start Metro (tunnel recommended for device testing):

```bash
npx expo start --tunnel
```

Firebase setup
1. In the Firebase Console create a project and enable Authentication (Email/Password).
2. Create a Web app in Firebase and copy the Web config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId). Place those values in `src/firebase/config.js` where indicated. The current project contains Android config extracted from google-services.json, but a Web config is recommended for the JS SDK.
3. In Firestore, copy/paste the rules from `firebase.rules` and publish.
4. In Storage, set appropriate rules (allow authenticated writes under `posts/` and `avatars/`) for your environment.

Notes
- Use the app via Expo Go (`npx expo start`) or build a dev client / production build using EAS if you need native modules.
- Implemented MVP features: Profile (edit + avatar upload), Social (create post with optional image), Workouts (start/stop tracker and save workout durations).
- Pending: manual QA, small UI polish, progress indicators and likes/comments for posts.

Delivery
- If you want an APK/IPA build, I can prepare EAS build steps and assist with keystore/provisioning.
Projeto limpo gerado a partir do original.

Para testar:

1. Abra terminal na pasta MaisSaudeApp_clean
2. Instale dependências: npm install
3. Rode o projeto: npm start (ou npx expo start)

Observações:
- Alguns pacotes nativos (react-native-maps) requerem configuração nativa para Android/iOS.
- Removi scripts geradores intencionais. Não execute os arquivos `build_*.js` no projeto original sem revisar.