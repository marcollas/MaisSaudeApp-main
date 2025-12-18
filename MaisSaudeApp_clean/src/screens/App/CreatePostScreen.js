import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { addPost } from '../../storage/postsStorage';
import { getProfile } from '../../storage/profileStorage';
import { 
  requestMediaPermission, 
  pickImageFromLibrary, 
  saveImageToAppDir,
  deleteImageFromAppDir
} from '../../utils/imagePicker';
import AnimatedPressable from '../../components/AnimatedPressable';

const MAX_CHARS = 280;

export default function CreatePostScreen({ navigation }) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getProfile();
    setProfile(data);
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestMediaPermission();
      if (!hasPermission) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
        return;
      }

      const result = await pickImageFromLibrary({ 
        allowsEditing: false,
        quality: 0.7 
      });

      if (!result) return;

      // Deleta imagem antiga se existir
      if (imageUri) {
        await deleteImageFromAppDir(imageUri);
      }

      // Salva nova imagem
      const savedUri = await saveImageToAppDir(result.uri, 'post');
      setImageUri(savedUri);
      
    } catch (e) {
      console.warn('Erro ao escolher imagem:', e);
      Alert.alert('Erro', e.message || 'Não foi possível selecionar a imagem.');
    }
  };

  const removeImage = async () => {
    try {
      if (imageUri) {
        await deleteImageFromAppDir(imageUri);
      }
      setImageUri(null);
    } catch (e) {
      console.warn('Erro ao remover imagem:', e);
    }
  };

  const submit = async () => {
    if (!text.trim() && !imageUri) {
      Alert.alert('Publicação vazia', 'Escreva algo ou adicione uma imagem.');
      return;
    }

    setLoading(true);
    try {
      await addPost({
        text: text.trim(),
        imageUri,
        authorName: profile?.name || 'Usuário',
        authorPhotoUri: profile?.photoUri || null,
      });

      Alert.alert('Sucesso!', 'Publicação criada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.warn('Erro ao criar post:', e);
      Alert.alert('Erro', 'Não foi possível criar a publicação.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const isValid = (text.trim() || imageUri) && charCount <= MAX_CHARS;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Nova publicação</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Card de publicação */}
        <View style={styles.postCard}>
          {/* Input de texto */}
          <TextInput 
            style={styles.input} 
            placeholder="No que você está pensando?" 
            placeholderTextColor="#999"
            value={text} 
            onChangeText={setText} 
            multiline 
            maxLength={MAX_CHARS}
            editable={!loading}
          />
          
          {/* Contador de caracteres */}
          <View style={styles.charCounter}>
            <Text style={[
              styles.charCountText,
              charCount > MAX_CHARS && styles.charCountError
            ]}>
              {charCount}/{MAX_CHARS}
            </Text>
          </View>

          {/* Preview da imagem */}
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={removeImage}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={32} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Botão adicionar imagem */}
          {!imageUri && (
            <AnimatedPressable 
              style={styles.addImageBtn} 
              onPress={pickImage}
              disabled={loading}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addImageText}>Adicionar imagem</Text>
            </AnimatedPressable>
          )}
        </View>

        {/* Botão publicar */}
        <AnimatedPressable 
          style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]} 
          onPress={submit} 
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.submitBtnText}>Publicar</Text>
            </>
          )}
        </AnimatedPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: { 
    minHeight: 120, 
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  charCounter: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  charCountText: {
    fontSize: 12,
    color: '#999',
  },
  charCountError: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addImageText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  preview: { 
    width: '100%', 
    height: 240, 
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
  },
  submitBtn: { 
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
