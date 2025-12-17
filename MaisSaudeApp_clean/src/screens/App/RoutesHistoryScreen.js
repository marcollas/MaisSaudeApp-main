import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants/theme';

export default function RoutesHistoryScreen({ navigation }) {
  const [routes, setRoutes] = useState([]);
  useEffect(() => { loadRoutes(); }, []);

  const loadRoutes = async () => {
    try {
      const raw = await AsyncStorage.getItem('routes');
      const arr = raw ? JSON.parse(raw) : [];
      // sort by most recent
      arr.sort((a,b) => b.startTime - a.startTime);
      setRoutes(arr);
    } catch (e) {
      console.warn('Erro carregando rotas', e);
    }
  };

  const formatDuration = (sec) => {
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.startTime).toLocaleString();
    const km = (item.distanceMeters/1000).toFixed(2);
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RouteDetail', { routeData: item })}>
        <View style={{flex:1}}>
          <Text style={styles.title}>{date}</Text>
          <Text style={styles.meta}>Distância: {km} km • Duração: {formatDuration(item.duration)} • Vel. média: {item.avgSpeedKmh} km/h</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico de rotas</Text>
      <FlatList data={routes} keyExtractor={(i)=>i.id} renderItem={renderItem} ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>Nenhuma rota registrada.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: SIZES.padding, backgroundColor: COLORS.background },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '600' },
  meta: { color: COLORS.textSecondary, marginTop: 6 },
  chev: { fontSize: 24, color: '#ccc', marginLeft: 8 }
});
