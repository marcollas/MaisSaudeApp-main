import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { uploadUri } from '../../services/storage';
import { createPost } from '../../services/firestore';
import { auth } from '../../firebase/config';

export default function CreatePostScreen({ navigation }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permissão de acesso à galeria é necessária para selecionar imagens.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, quality: 0.7 });
    if (!res.cancelled) setImage(res.uri);
  }

  async function submit() {
    try {
      setLoading(true);
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      let imageUrl = null;
      if (image && uid) {
        const path = `posts/${uid}/${Date.now()}.jpg`;
        imageUrl = await uploadUri(path, image);
      }
      await createPost({ userId: uid, userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Usuário', text: text.trim(), imageUrl, createdAt: new Date() });
      navigation.goBack();
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar publicação</Text>
      <TextInput style={styles.input} placeholder="Escreva algo..." value={text} onChangeText={setText} multiline />
      <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
        <Text style={{ color: 'white' }}>{image ? 'Alterar imagem' : 'Adicionar imagem'}</Text>
      </TouchableOpacity>
      {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}
      <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Publicar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SIZES.padding, backgroundColor: COLORS.background, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { minHeight: 100, backgroundColor: 'white', borderRadius: 8, padding: 10, textAlignVertical: 'top' },
  pickBtn: { marginTop: 12, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtn: { marginTop: 20, backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center' },
  preview: { marginTop: 12, width: '100%', height: 200, borderRadius: 8 }
});
