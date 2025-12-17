import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { auth } from '@/firebase/config';
import { getUserProfile } from '@/services/firestore';
import { useHealth } from '../../contexts/HealthContext';
import { formatSleepTime, formatNumber, formatSleepGoal } from '../../utils/date';
import { calculateProgress } from '../../models/healthModels';
import AddMetricModal from '../../components/AddMetricModal';
import MetricCard, { MetricCardSkeleton } from '../../components/MetricCard';

const ActivityButton = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.activityBtn} onPress={onPress}>
        <View style={styles.iconCircle}>
        <VectorIcons.MaterialCommunityIcons name={icon} size={24} color={COLORS.textPrimary} />
      </View>
        <Text style={styles.activityText}>{label}</Text>
    </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const { daily, goals, isReady, addCalories, addWater, setSleep, setCaloriesGoal, setWaterGoalMl, setSleepGoalMin } = useHealth();
  
  // Estados para controlar os modais
  const [modalVisible, setModalVisible] = useState({
    calories: false,
    water: false,
    sleep: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const u = await getUserProfile(uid);
        if (mounted) setProfile(u);
      } catch (e) {
        // ignore
      }
    })();
    return () => (mounted = false);
  }, []);

  const openModal = (type) => {
    setModalVisible({ ...modalVisible, [type]: true });
  };

  const closeModal = (type) => {
    setModalVisible({ ...modalVisible, [type]: false });
  };

  const caloriesProgress = calculateProgress(daily.calories, goals.caloriesGoal);
  const waterProgress = calculateProgress(daily.waterMl, goals.waterGoalMl);
  const sleepProgress = calculateProgress(daily.sleepMin, goals.sleepGoalMin);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>+Saúde</Text>
          <VectorIcons.Ionicons name="log-out-outline" size={24} color="black" />
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: SIZES.padding }}>
          <View style={styles.profileSummary}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextBlock}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
            <View style={styles.skeletonHeart} />
          </View>
          <View style={styles.statsContainer}>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{profile?.name ? profile.name : '+Saúde'}</Text>
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <VectorIcons.Ionicons name="log-out-outline" size={24} color="black" />
      </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 100, paddingHorizontal: SIZES.padding}}>
        <View style={styles.profileSummary}>
             {profile?.avatar ? (
               <Image source={{ uri: profile.avatar }} style={styles.avatar} />
             ) : (
               <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                 <VectorIcons.MaterialCommunityIcons name="account" size={28} color={COLORS.textSecondary} />
               </View>
             )}
           <View style={{marginLeft: 15, flex: 1}}>
             <Text style={{fontWeight: 'bold', fontSize: 16}}>{profile?.name || auth.currentUser?.email?.split('@')[0] || 'Usuário'}</Text>
             {profile?.age ? <Text style={{color: COLORS.textSecondary}}>{profile.age + ' anos'}</Text> : null}
             {profile?.birthDate ? <Text style={{color: COLORS.danger, fontWeight: 'bold', fontSize: 12}}>Data Nascimento: {profile.birthDate}</Text> : null}
           </View>
           <VectorIcons.MaterialCommunityIcons name="heart-pulse" size={50} color="#4DB6AC"/>
        </View>

        <View style={styles.activitiesRow}>
            <ActivityButton label="Caminhada" icon="walk" onPress={() => navigation.navigate('ActivityTracker')} />
            <ActivityButton label="Corrida" icon="run" onPress={() => {}} />
            <ActivityButton label="Ciclismo" icon="bike" onPress={() => {}} />
            <ActivityButton label="Mais" icon="menu" onPress={() => {}} />
        </View>

        <View style={styles.statsContainer}>
          <MetricCard
            title="Calorias"
            icon="food-apple"
            valueText={`${formatNumber(daily.calories)} kcal`}
            goalText={`Meta ${formatNumber(goals.caloriesGoal)} kcal`}
            progress={caloriesProgress}
            color={COLORS.primary}
            onPress={() => openModal('calories')}
          />
          <MetricCard
            title="Sono"
            icon="bed-clock"
            valueText={formatSleepTime(daily.sleepMin)}
            goalText={`Meta ${formatSleepGoal(goals.sleepGoalMin)}`}
            progress={sleepProgress}
            color="#6C63FF"
            onPress={() => openModal('sleep')}
          />
          <MetricCard
            title="Água"
            icon="water"
            valueText={`${formatNumber(daily.waterMl)} mL`}
            goalText={`Meta ${formatNumber(goals.waterGoalMl)} mL`}
            progress={waterProgress}
            color="#2196F3"
            onPress={() => openModal('water')}
          />
        </View>
      </ScrollView>

      {/* Modais */}
      <AddMetricModal
        visible={modalVisible.calories}
        onClose={() => closeModal('calories')}
        title="Adicionar Calorias"
        icon="food-apple"
        unitLabel="kcal"
        currentValue={daily.calories}
        goalValue={goals.caloriesGoal}
        metricType="calories"
        onSubmit={addCalories}
        onEditGoal={setCaloriesGoal}
        quickAddButtons={[100, 250, 500, 1000]}
      />

      <AddMetricModal
        visible={modalVisible.water}
        onClose={() => closeModal('water')}
        title="Adicionar Água"
        icon="water"
        unitLabel="mL"
        currentValue={daily.waterMl}
        goalValue={goals.waterGoalMl}
        metricType="water"
        onSubmit={addWater}
        onEditGoal={setWaterGoalMl}
        quickAddButtons={[200, 300, 500, 750]}
      />

      <AddMetricModal
        visible={modalVisible.sleep}
        onClose={() => closeModal('sleep')}
        title="Registrar Sono"
        icon="bed-clock"
        unitLabel="horas"
        currentValue={daily.sleepMin}
        goalValue={goals.sleepGoalMin}
        metricType="sleep"
        onSubmit={setSleep}
        onEditGoal={setSleepGoalMin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { paddingHorizontal: SIZES.padding, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  profileSummary: { backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, flexDirection: 'row', alignItems: 'center', elevation: 2, marginBottom: 25 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  activitiesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  activityBtn: { alignItems: 'center', flex: 1 },
  iconCircle: { width: 50, height: 50, backgroundColor: COLORS.white, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 2, marginBottom: 5 },
  activityText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  statsContainer: { gap: 14, marginBottom: 20 },
  skeletonAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0' },
  skeletonTextBlock: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  skeletonLine: { height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, marginBottom: 8, width: '80%' },
  skeletonHeart: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0E0E0' },
});