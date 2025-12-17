import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { auth } from '../../firebase/config';
import { createWorkout } from '../../services/firestore';

export default function WorkoutTrackerScreen({ route, navigation }) {
  const { type } = route.params || { type: 'Treino' };
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function start() {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }

  async function stop() {
    if (!running) return;
    clearInterval(timerRef.current);
    setRunning(false);
    try {
      const uid = auth.currentUser ? auth.currentUser.uid : null;
      await createWorkout({ userId: uid, type, duration: seconds, createdAt: new Date() });
    } catch (e) {
      console.warn(e);
    } finally {
      setSeconds(0);
      navigation.goBack();
    }
  }

  function formatTime(s) {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{type}</Text>
      <Text style={styles.timer}>{formatTime(seconds)}</Text>
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: running ? '#f44336' : COLORS.primary }]} onPress={running ? stop : start}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>{running ? 'Parar' : 'Iniciar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { marginLeft: 12 }]} onPress={() => { clearInterval(timerRef.current); setSeconds(0); setRunning(false); }}>
          <Text style={{ color: '#333' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SIZES.padding, paddingTop: 80, backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: 'bold' },
  timer: { fontSize: 48, fontWeight: '700', marginTop: 20 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }
});
