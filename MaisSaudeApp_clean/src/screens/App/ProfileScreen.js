import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile, createUserProfile, ensureUserProfileExists } from '@/services/firestore';
import { uploadUri } from '@/services/storage';

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      try {
        const p = await getUserProfile(user.uid);
        if (p) {
          if (mounted) setProfile(p);
          return;
        }
        // seed a lightweight profile for quick testing
        const defaults = { name: user.email ? user.email.split('@')[0] : 'Usuário' };
        const seeded = await ensureUserProfileExists(user.uid, defaults);
        if (mounted) setProfile(seeded);
      } catch (e) {
        console.warn('Failed to load profile', e);
      }
    }

    load();

    const unsub = navigation.addListener('focus', () => {
      load();
    });

    return () => { mounted = false; unsub(); };
  }, [user]);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão de acesso à galeria é necessária para selecionar imagens.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, quality: 0.8 });
      if (!res.cancelled) {
      const previous = profile?.avatar || null;
      // optimistic preview
      setProfile(prev => ({ ...prev, avatar: res.uri }));
      setUploading(true);
      try {
        const url = await uploadUri(`avatars/${user.uid}/${Date.now()}.jpg`, res.uri, (progress) => {
          // optional: could set UI progress state
        });
        await createUserProfile(user.uid, { avatar: url });
        setProfile(prev => ({ ...prev, avatar: url }));
      } catch (e) {
        console.warn('Upload failed', e);
        Alert.alert('Erro', 'Falha ao enviar imagem. ' + (e?.message || 'Tente novamente.'));
        // revert optimistic preview
        setProfile(prev => ({ ...prev, avatar: previous }));
      } finally {
        setUploading(false);
      }
      }
    } catch (e) {
      console.warn('pickAvatar failed', e);
      Alert.alert('Erro', 'Não foi possível abrir a galeria. ' + (e?.message || ''));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.header}>Meu perfil</Text>

      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickAvatar}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={40} color="#777" />
            </View>
          )}
          {uploading ? (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color="white" />
            </View>
          ) : null}
        </TouchableOpacity>
        <Text style={styles.name}>{profile?.name || 'Seu nome'}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={{ fontSize: 12 }}>Editar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuTitle}>Conquistas</Text>
        <Text style={{ color: COLORS.textSecondary }}>Nenhuma conquista</Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo semanal</Text>
        <Text style={styles.summaryDate}>17 - 23 de dezembro</Text>

        <View style={styles.row}>
          <Text>Tempo ativo médio</Text>
          <Text style={{ fontWeight: 'bold' }}>48min</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text>Média de sono</Text>
          <Text style={{ fontWeight: 'bold' }}>8h</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: SIZES.padding, marginBottom: 20 },
  profileCard: { marginHorizontal: SIZES.padding, backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, backgroundColor: '#eee' },
  name: { fontSize: 20, fontWeight: 'bold' },
  editBtn: { position: 'absolute', right: 20, top: 20, backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  menuItem: { marginHorizontal: SIZES.padding, backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20 },
  menuTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  summaryCard: { marginHorizontal: SIZES.padding, backgroundColor: 'white', padding: 20, borderRadius: 15 },
  summaryTitle: { fontWeight: 'bold', fontSize: 16 },
  summaryDate: { color: COLORS.textSecondary, marginBottom: 20, fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 }
  ,uploadOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 60 }
});