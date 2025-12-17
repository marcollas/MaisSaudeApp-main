import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import { updateProfile } from 'firebase/auth';
import { getUserProfile, createUserProfile } from '@/services/firestore';
import { uploadUri } from '@/services/storage';

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: '', avatar: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      const p = await getUserProfile(user.uid);
      if (mounted && p) setProfile({ name: p.name || '', avatar: p.avatar || null });
    })();
    return () => (mounted = false);
  }, [user]);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão de acesso à galeria é necessária para selecionar imagens.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, quality: 0.8 });
      if (res.cancelled) return;
      // optimistic local preview
      setProfile(prev => ({ ...prev, avatar: res.uri }));
      setLoading(true);
      try {
        const url = await uploadUri(`avatars/${user.uid}/${Date.now()}.jpg`, res.uri);
        setProfile(prev => ({ ...prev, avatar: url }));
      } catch (e) {
        console.warn(e);
        Alert.alert('Erro', 'Não foi possível enviar a imagem. ' + (e?.message || ''));
      }
    } catch (e) {
      console.warn(e);
      Alert.alert('Erro', 'Não foi possível abrir a galeria. ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let avatarUrl = profile.avatar || null;
      // if avatar is a local uri, upload it first
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        try {
          avatarUrl = await uploadUri(`avatars/${user.uid}/${Date.now()}.jpg`, avatarUrl);
        } catch (e) {
          console.warn('Avatar upload failed on save', e);
          Alert.alert('Erro', 'Não foi possível enviar a imagem de perfil. ' + (e?.message || ''));
        }
      }
      await createUserProfile(user.uid, { name: profile.name || 'Usuário', avatar: avatarUrl || null });
      // also update firebase auth profile for consistency (optional)
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: profile.name || undefined, photoURL: avatarUrl || undefined });
        }
      } catch (e) {
        console.warn('Failed to update auth profile', e);
      }
      navigation.goBack();
    } catch (e) {
      console.warn(e);
      Alert.alert('Erro', 'Não foi possível salvar o perfil. ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Editar perfil</Text>

      <View style={styles.formCard}>
        <TouchableOpacity onPress={pickAvatar} style={{ alignSelf: 'center', marginBottom: 10 }}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#666' }}>Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nome</Text>
        <TextInput value={profile.name} onChangeText={t => setProfile(prev => ({ ...prev, name: t }))} style={styles.input} placeholder="Seu nome" />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Salvar</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: SIZES.padding, marginBottom: 16 },
  formCard: { marginHorizontal: SIZES.padding, backgroundColor: 'white', borderRadius: 12, padding: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' },
  label: { marginTop: 12, color: COLORS.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, backgroundColor: '#fff' },
  saveBtn: { marginTop: 16, backgroundColor: '#2f95dc', padding: 12, borderRadius: 8, alignItems: 'center' }
});
