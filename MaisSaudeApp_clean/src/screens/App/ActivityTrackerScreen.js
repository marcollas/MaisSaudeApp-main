import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Alert, Platform } from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants/theme';
const { width, height } = Dimensions.get('window');
const StatBox = ({ label, value, unit, isBig }) => (
    <View style={[styles.statBox, isBig && styles.statBoxBig]}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, isBig && {fontSize: 28}]}>{value} {unit && <Text style={styles.statUnit}>{unit}</Text>}</Text>
    </View>
);
export default function ActivityTrackerScreen({ navigation }) {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [region, setRegion] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [distanceMeters, setDistanceMeters] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [avgSpeed, setAvgSpeed] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const intervalRef = useRef(null);
    const locationSubscriptionRef = useRef(null);
    const mapRef = useRef(null);
    const lastTimestampRef = useRef(null);
    useEffect(() => {
        if (isActive && !isPaused) {
            intervalRef.current = setInterval(() => { setSeconds((prevSeconds) => prevSeconds + 1); }, 1000);
        } else { clearInterval(intervalRef.current); }
        return () => clearInterval(intervalRef.current);
    }, [isActive, isPaused]);
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    const handleStart = () => { setIsActive(true); setIsPaused(false); };
    const handlePause = () => { setIsPaused(!isPaused); };
    const handleFinish = () => { setIsActive(false); setIsPaused(false); setSeconds(0); navigation.goBack(); };
    
    // Start tracking with location permissions + watchPosition
    const startTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Não foi possível acessar a localização.');
                return;
            }
            // reset route data
            setRouteCoords([]);
            setDistanceMeters(0);
            setCurrentSpeed(0);
            setAvgSpeed(0);
            setStartTime(Date.now());
            setEndTime(null);
            lastTimestampRef.current = null;

            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            const { latitude, longitude } = pos.coords;
            const initialRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
            setRegion(initialRegion);
            setRouteCoords((prev) => [...prev, { latitude, longitude }]);
            lastTimestampRef.current = pos.timestamp || Date.now();
            // start watching
            locationSubscriptionRef.current = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
                (p) => {
                    const { latitude: lat, longitude: lon, speed } = p.coords;
                    const newCoord = { latitude: lat, longitude: lon };
                    setRouteCoords((prev) => {
                        // compute incremental distance
                        if (prev.length > 0) {
                            const last = prev[prev.length - 1];
                            const inc = haversineMeters(last, newCoord);
                            setDistanceMeters((d) => d + inc);
                        }
                        return [...prev, newCoord];
                    });
                    // update speed: use native speed if available, otherwise estimate
                    const now = p.timestamp || Date.now();
                    let instSpeed = speed;
                    if (instSpeed == null && lastTimestampRef.current && routeCoords.length > 0) {
                        const last = routeCoords[routeCoords.length - 1];
                        const dt = (now - lastTimestampRef.current) / 1000; // seconds
                        if (dt > 0) {
                            const dist = haversineMeters(last, newCoord);
                            instSpeed = dist / dt; // m/s
                        }
                    }
                    if (instSpeed != null) {
                        setCurrentSpeed(instSpeed * 3.6); // convert to km/h
                    }
                    lastTimestampRef.current = now;
                    // update avg speed
                    setAvgSpeed((prevAvg) => {
                        const durationSec = (Date.now() - (startTime || Date.now())) / 1000;
                        if (durationSec > 0) return ((distanceMeters + 0) / 1000) / (durationSec / 3600); // km/h
                        return prevAvg;
                    });

                    setRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.005, longitudeDelta: 0.005 });
                    // animate camera if available
                    if (mapRef.current && mapRef.current.animateToRegion) {
                        mapRef.current.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
                    }
                }
            );
        } catch (err) {
            console.warn('Erro ao iniciar tracking', err);
        }
    };

    const stopLocationUpdates = () => {
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove();
            locationSubscriptionRef.current = null;
        }
    };

    // Wrap the existing handlers so they start/stop location updates
    const handleStartWithLocation = async () => {
        await startTracking();
        setIsActive(true);
        setIsPaused(false);
    };

    const handlePauseWithLocation = async () => {
        if (!isPaused) {
            // pause -> stop updates
            stopLocationUpdates();
            setIsPaused(true);
        } else {
            // resume -> restart watch
            try {
                if (routeCoords.length > 0) {
                    // resume from last coord
                    const last = routeCoords[routeCoords.length - 1];
                    setRegion({ ...last, latitudeDelta: 0.005, longitudeDelta: 0.005 });
                }
                locationSubscriptionRef.current = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
                    (p) => {
                        const { latitude: lat, longitude: lon } = p.coords;
                        const newCoord = { latitude: lat, longitude: lon };
                        setRouteCoords((prev) => [...prev, newCoord]);
                        setRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.005, longitudeDelta: 0.005 });
                        if (mapRef.current && mapRef.current.animateToRegion) {
                            mapRef.current.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
                        }
                    }
                );
                setIsPaused(false);
            } catch (err) {
                console.warn('Erro ao retomar tracking', err);
            }
        }
    };

    const handleFinishWithLocation = async () => {
        try {
            stopLocationUpdates();
            setIsActive(false);
            setIsPaused(false);
            setEndTime(Date.now());
            const durationSec = seconds;
            const distance = distanceMeters; // meters
            const avgSp = durationSec > 0 ? (distance / 1000) / (durationSec / 3600) : 0; // km/h
            const entry = {
                id: `route-${Date.now()}`,
                startTime: startTime || Date.now(),
                endTime: Date.now(),
                duration: durationSec,
                distanceMeters: Math.round(distance),
                avgSpeedKmh: Number(avgSp.toFixed(2)),
                coords: routeCoords,
            };
            // persist
            try {
                const raw = await AsyncStorage.getItem('routes');
                const arr = raw ? JSON.parse(raw) : [];
                arr.push(entry);
                await AsyncStorage.setItem('routes', JSON.stringify(arr));
            } catch (e) {
                console.warn('Erro salvando rota', e);
            }
            // reset timer/state
            setSeconds(0);
            // optionally clear route
            // setRouteCoords([]);
            navigation.goBack();
        } catch (err) {
            console.warn('Erro ao finalizar tracking', err);
            navigation.goBack();
        }
    };
    // helper: haversine
    function haversineMeters(a, b) {
        const R = 6371000; // meters
        const toRad = (deg) => deg * Math.PI / 180;
        const dLat = toRad(b.latitude - a.latitude);
        const dLon = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const sinDLat = Math.sin(dLat/2);
        const sinDLon = Math.sin(dLon/2);
        const aa = sinDLat*sinDLat + sinDLon*sinDLon * Math.cos(lat1)*Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
        return R * c;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><VectorIcons.Ionicons name="chevron-back" size={30} color={COLORS.textPrimary} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Caminhada</Text>
                <VectorIcons.MaterialCommunityIcons name="spotify" size={28} color={COLORS.textPrimary} style={{opacity: 0.7}} />
            </View>
            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' ? (
                    (() => {
                        const RNMaps = require('react-native-maps');
                        const MapViewComponent = RNMaps.default || RNMaps;
                        const PolylineComp = RNMaps.Polyline;
                        const MarkerComp = RNMaps.Marker;
                        return (
                            <MapViewComponent
                                ref={mapRef}
                                style={styles.mapImage}
                                initialRegion={{
                                    latitude: -23.55052,
                                    longitude: -46.633308,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                region={region || undefined}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                            >
                                {routeCoords.length > 0 && (
                                    <PolylineComp coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.primary} />
                                )}
                                {routeCoords.length > 0 && (
                                    <MarkerComp coordinate={routeCoords[routeCoords.length - 1]} />
                                )}
                            </MapViewComponent>
                        );
                    })()
                ) : (
                    <View style={[styles.mapImage, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0'}]}>
                        <VectorIcons.MaterialCommunityIcons name="map" size={72} color="#9E9E9E" />
                    </View>
                )}
                <View style={[styles.mapOverlay, { pointerEvents: 'none' }]}>{!isActive && <View style={styles.startMarker} />}</View>
            </View>
            <View style={styles.bottomSheet}>
                <View style={styles.timerContainer}><Text style={styles.timerLabel}>Hora</Text><Text style={styles.timerText}>{formatTime(seconds)}</Text></View>
                <View style={styles.statsGrid}>
                    {
                        (() => {
                            const distKm = (distanceMeters / 1000) || 0;
                            const distStr = distKm > 0 ? distKm.toFixed(2) : '0.00';
                            const speedStr = (currentSpeed && currentSpeed > 0) ? currentSpeed.toFixed(1) : (avgSpeed && avgSpeed > 0) ? avgSpeed.toFixed(1) : '--';
                            return (
                                <View>
                                    <View style={styles.statsRow}><StatBox label="Distância" value={distStr} unit="km" /><StatBox label="Velocidade" value={isActive ? speedStr : '--'} unit="km/h" /></View>
                                    <View style={styles.statsRow}><StatBox label="Elevação" value="199" unit="m" /><StatBox label="Ritmo" value={isActive ? "--" : "--"} unit="km/h" /></View>
                                </View>
                            );
                        })()
                    }
                </View>
                <View style={[styles.statsRow, { marginTop: 20, justifyContent: 'space-around', paddingHorizontal: 30 }]}>
                    {
                        (() => {
                            const calories = Math.round((distanceMeters / 1000) * 60) || 0; // approx 60 kcal per km
                            return (
                                <StatBox
                                    label="Calorias"
                                    value={isActive ? calories : 0}
                                    unit="kcal"
                                    isBig
                                />
                            );
                        })()
                    }
                </View>
                <View style={styles.controlsContainer}>
                    {!isActive ? (
                        <TouchableOpacity style={styles.startButton} onPress={handleStartWithLocation}><Text style={styles.startButtonText}>Iniciar</Text></TouchableOpacity>
                    ) : (
                        <View style={styles.activeControls}>
                            <TouchableOpacity style={styles.pauseButton} onPress={handlePauseWithLocation}><Text style={styles.pauseButtonText}>{isPaused ? "Retomar" : "Pausar"}</Text></TouchableOpacity>
                             <TouchableOpacity style={styles.finishButton} onPress={handleFinishWithLocation}><Text style={styles.finishButtonText}>Concluir</Text></TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.padding, paddingVertical: 15, backgroundColor: COLORS.white, zIndex: 10 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    mapContainer: { height: height * 0.35, width: '100%', position: 'relative' },
    mapImage: { width: '100%', height: '100%' },
    mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    startMarker: { width: 20, height: 20, backgroundColor: COLORS.primary, borderRadius: 10, borderWidth: 3, borderColor: 'white', shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, elevation: 5 },
    bottomSheet: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, paddingTop: 20, paddingHorizontal: SIZES.padding, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, elevation: 10 },
    timerContainer: { alignItems: 'center', marginBottom: 20 },
    timerLabel: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
    timerText: { fontSize: 48, fontWeight: 'bold', color: COLORS.textPrimary },
    statsGrid: { marginBottom: 10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 5 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
    statUnit: { fontSize: 16, fontWeight: 'normal', color: COLORS.textSecondary },
    controlsContainer: { marginTop: 'auto', marginBottom: 30 },
    startButton: { backgroundColor: '#E0E0E0', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
    startButtonText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    activeControls: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
    pauseButton: { flex: 1, backgroundColor: '#E0E0E0', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
    pauseButtonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    finishButton: { flex: 1, backgroundColor: COLORS.danger, paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
    finishButtonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
});