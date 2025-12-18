import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useApiQuery } from '../../hooks/useApiQuery';
import { apiGet } from '../../services/api';

function useWgerSearch(query) {
  const key = useMemo(() => `exercises:${query || ''}`, [query]);
  const fetcher = useCallback(async () => {
    if (!query) return [];
    // wger API (public read). language=2 -> English
    const url = `https://wger.de/api/v2/exercise/?language=2&limit=20&name=${encodeURIComponent(query)}`;
    const json = await apiGet(url);
    return json?.results || [];
  }, [query]);
  return useApiQuery(key, fetcher, { ttlMs: 60 * 60 * 1000 });
}

export default function ExerciseSearchScreen({ navigation }) {
  const [q, setQ] = useState('push');
  const { data, loading, error, refetch } = useWgerSearch(q);

  const onSearch = () => {
    refetch();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      {item.category?.name ? <Text style={styles.category}>{item.category.name}</Text> : null}
      {item.description ? (
        <Text style={styles.desc} numberOfLines={3}>
          {String(item.description).replace(/<[^>]*>/g, '')}
        </Text>
      ) : null}
    </View>
  );

  const ListEmpty = () => (
    <View style={{ padding: 20, alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <Text style={{ color: COLORS.textSecondary }}>Nenhum exercício encontrado</Text>
      )}
    </View>
  );

  const ListFooter = () => (
    <View style={{ paddingVertical: 16 }}>
      {error ? (
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar exercícios</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Ex.: push, squat, run"
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
          <Ionicons name="search" size={18} color="white" />
          <Text style={styles.searchText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginBottom: 14,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SIZES.padding, marginBottom: 8 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#eee' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, borderRadius: 10 },
  searchText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 12, marginTop: 10, elevation: 1 },
  name: { fontWeight: 'bold', fontSize: 15 },
  category: { marginTop: 4, fontSize: 12, color: COLORS.textSecondary },
  desc: { marginTop: 6, fontSize: 13, color: '#333' },
  retryBtn: { alignSelf: 'center', flexDirection: 'row', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: 'white', fontWeight: 'bold' },
});
