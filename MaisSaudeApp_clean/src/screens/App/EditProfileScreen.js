import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useProfile } from '../../contexts/ProfileContext';
import { 
  requestMediaPermission, 
  pickImageFromLibrary, 
  saveImageToAppDir,
  takePictureWithCamera,
  deleteImageFromAppDir
} from '../../utils/imagePicker';

export default function EditProfileScreen({ navigation }) {
  const { profile: contextProfile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: '', photoUri: null });

  useEffect(() => {
    // Carrega perfil do context ao montar
    if (contextProfile) {
      setProfile(contextProfile);
    }
  }, [contextProfile]);

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Escolher da galeria', 'Tirar foto', 'Remover foto'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromGallery();
          if (buttonIndex === 2) takePhoto();
          if (buttonIndex === 3) removePhoto();
        }
      );
    } else {
      Alert.alert(
        'Foto de perfil',
        'Escolha uma opção',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Galeria', onPress: pickFromGallery },
          { text: 'Câmera', onPress: takePhoto },
          ...(profile.photoUri ? [{ text: 'Remover foto', onPress: removePhoto, style: 'destructive' }] : []),
        ]
      );
    }
  };

  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestMediaPermission();
      if (!hasPermission) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
        return;
      }

      setLoading(true);
      const result = await pickImageFromLibrary({ 
        allowsEditing: true, 
        aspect: [1, 1],
        quality: 0.8 
      });

      if (!result) {
        setLoading(false);
        return;
      }

      // Deleta foto antiga se existir
      if (profile.photoUri) {
        await deleteImageFromAppDir(profile.photoUri);
      }

      // Salva nova foto no diretório do app
      const savedUri = await saveImageToAppDir(result.uri, 'profile');
      setProfile(prev => ({ ...prev, photoUri: savedUri }));
      
    } catch (e) {
      console.warn('Erro ao escolher imagem:', e);
      Alert.alert('Erro', e.message || 'Não foi possível selecionar a imagem.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);
      const result = await takePictureWithCamera({ 
        allowsEditing: true, 
        aspect: [1, 1],
        quality: 0.8 
      });

      if (!result) {
        setLoading(false);
        return;
      }

      // Deleta foto antiga
      if (profile.photoUri) {
        await deleteImageFromAppDir(profile.photoUri);
      }

      // Salva nova foto
      const savedUri = await saveImageToAppDir(result.uri, 'profile');
      setProfile(prev => ({ ...prev, photoUri: savedUri }));
      
    } catch (e) {
      console.warn('Erro ao tirar foto:', e);
      Alert.alert('Erro', e.message || 'Não foi possível tirar a foto.');
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = async () => {
    try {
      if (profile.photoUri) {
        await deleteImageFromAppDir(profile.photoUri);
      }
      setProfile(prev => ({ ...prev, photoUri: null }));
    } catch (e) {
      console.warn('Erro ao remover foto:', e);
    }
  };

  const onSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, insira seu nome.');
      return;
    }

    setLoading(true);
    try {
      // Atualiza no context (que persiste automaticamente)
      await updateProfile(profile);
      Alert.alert('Sucesso', 'Perfil salvo com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.warn('Erro ao salvar perfil:', e);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Editar perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formCard}>
        {/* Avatar com loading overlay */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            onPress={showImageOptions} 
            style={styles.avatarContainer}
            disabled={loading}
            activeOpacity={0.7}
          >
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={48} color="#999" />
              </View>
            )}
            
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
            
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Toque para alterar foto</Text>
        </View>

        {/* Campo Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput 
            value={profile.name} 
            onChangeText={t => setProfile(prev => ({ ...prev, name: t }))} 
            style={styles.input} 
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
          onPress={onSave} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.saveBtnText}>Salvar alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    paddingTop: 50 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { 
    fontSize: 22, 
    fontWeight: 'bold',
  },
  formCard: { 
    marginHorizontal: SIZES.padding, 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  photoHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: { 
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    padding: 14, 
    borderRadius: 10, 
    backgroundColor: '#fafafa',
    fontSize: 15,
  },
  saveBtn: { 
    marginTop: 8,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
