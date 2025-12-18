# MaisSaúde App

Aplicativo de saúde em React Native/Expo para registrar calorias, água, sono, treinos e publicações simples.

## Requisitos
- Node.js 16+ e npm
- Expo Go instalado no celular

## Instalação
```bash
cd MaisSaudeApp_clean
npm install
```

## Uso
```bash
npx expo start
```
Abra o QR Code no Expo Go. Se tiver cache estranho, use `npx expo start -c`.

## Funcionalidades rápidas
- Calorias/Água/Sono: registre valores e metas na Home
- Treinos: corrida/caminhada/força com histórico
- Social: criar posts com texto e imagem
- Perfil: editar nome e foto

## Estrutura de pastas
```
src/
	components/
	contexts/
	screens/
	storage/
	services/
	utils/
	navigation/
	constants/
	firebase/
assets/
App.js
```

## Firebase (opcional)
Preencha `src/firebase/config.js` com suas credenciais e use as regras em `firebase.rules`.
