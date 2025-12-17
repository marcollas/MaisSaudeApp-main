import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import * as VectorIcons from '@expo/vector-icons';

export default function RouteDetailScreen({ route, navigation }) {
  const data = route?.params?.routeData || route?.params?.data || null;
  if (!data) return (<View style={styles.container}><Text>Rota inválida</Text></View>);

  const coords = data.coords || [];
  const start = coords[0];
  const last = coords[coords.length - 1];
  const initialRegion = start ? { latitude: start.latitude, longitude: start.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 } : { latitude: -23.55, longitude: -46.63, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  let MapViewComponent = null;
  let PolylineComp = null;
  let MarkerComp = null;
  if (Platform.OS !== 'web') {
    const RNMaps = require('react-native-maps');
    MapViewComponent = RNMaps.default || RNMaps;
    PolylineComp = RNMaps.Polyline;
    MarkerComp = RNMaps.Marker;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <VectorIcons.Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhe da rota</Text>
      </View>

      {Platform.OS !== 'web' && MapViewComponent ? (
        <MapViewComponent style={styles.map} initialRegion={initialRegion}>
          {coords.length > 0 && <PolylineComp coordinates={coords} strokeWidth={4} strokeColor={COLORS.primary} />}
          {start && <MarkerComp coordinate={start} pinColor="green" />}
          {last && <MarkerComp coordinate={last} />}
        </MapViewComponent>
      ) : (
        <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}>
          <Text style={{ color: '#666' }}>Mapa não disponível na web</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoText}>Distância: {(data.distanceMeters ? data.distanceMeters / 1000 : 0).toFixed(2)} km</Text>
        <Text style={styles.infoText}>Duração: {data.startTime ? new Date(data.startTime).toLocaleString() : '—'} → {data.endTime ? new Date(data.endTime).toLocaleString() : '—'}</Text>
        <Text style={styles.infoText}>Vel. média: {data.avgSpeedKmh ?? '—'} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SIZES.padding, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  map: { flex: 1 },
  info: { padding: SIZES.padding, backgroundColor: 'white' },
  infoText: { marginBottom: 6 }
});
