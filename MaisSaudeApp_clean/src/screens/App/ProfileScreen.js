import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../../storage/profileStorage';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data || { name: 'Usuário', photoUri: null });
    } catch (e) {
      console.warn('Erro ao carregar perfil:', e);
      setProfile({ name: 'Usuário', photoUri: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    // Recarrega quando voltar para a tela
    const unsub = navigation.addListener('focus', loadProfile);
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={styles.header}>Meu perfil</Text>

      {/* Card do Perfil - Melhorado */}
      <View style={styles.profileCard}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          {profile?.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color="#999" />
            </View>
          )}
          <View style={styles.editIconBadge}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.name}>{profile?.name || 'Usuário'}</Text>
        <Text style={styles.hint}>Toque na foto para editar perfil</Text>
        
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="pencil" size={14} color="#666" />
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Conquistas - Estado vazio melhorado */}
      <View style={styles.menuItem}>
        <Text style={styles.menuTitle}>Conquistas</Text>
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={32} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma conquista ainda</Text>
          <Text style={styles.emptyHint}>Complete desafios para ganhar troféus</Text>
        </View>
      </View>

      {/* Resumo Semanal */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryTitle}>Resumo semanal</Text>
            <Text style={styles.summaryDate}>17 - 23 de dezembro</Text>
          </View>
          <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Tempo ativo médio</Text>
          </View>
          <Text style={styles.rowValue}>48min</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={20} color={COLORS.primary} />
            <Text style={styles.rowLabel}>Média de sono</Text>
          </View>
          <Text style={styles.rowValue}>8h</Text>
        </View>
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
  header: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    paddingHorizontal: SIZES.padding, 
    marginBottom: 24 
  },
  profileCard: { 
    marginHorizontal: SIZES.padding, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center', 
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconBadge: {
    position: 'absolute',
    right: 0,
    bottom: 12,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  editBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f5', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
  },
  editBtnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  menuItem: { 
    marginHorizontal: SIZES.padding, 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 20,
    elevation: 1,
  },
  menuTitle: { 
    fontWeight: 'bold', 
    fontSize: 17, 
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  summaryCard: { 
    marginHorizontal: SIZES.padding, 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 15,
    elevation: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryTitle: { 
    fontWeight: 'bold', 
    fontSize: 17,
  },
  summaryDate: { 
    color: COLORS.textSecondary, 
    fontSize: 12,
    marginTop: 2,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: '#333',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: { 
    height: 1, 
    backgroundColor: '#f0f0f0', 
    marginVertical: 4,
  },
});