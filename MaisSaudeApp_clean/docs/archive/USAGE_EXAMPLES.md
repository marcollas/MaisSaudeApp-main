# Exemplos de Uso - HealthContext

## Como usar o HealthContext em outros componentes

### 1. Importar o Hook

```javascript
import { useHealth } from '../contexts/HealthContext';
```

### 2. Usar no Componente

```javascript
export default function MeuComponente() {
  const { daily, goals, isReady, addCalories, addWater, setSleep } = useHealth();

  // Esperar dados carregarem
  if (!isReady) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View>
      <Text>Calorias: {daily.calories} / {goals.caloriesGoal}</Text>
      <Text>Água: {daily.waterMl} mL / {goals.waterGoalMl} mL</Text>
      <Text>Sono: {daily.sleepMin} min / {goals.sleepGoalMin} min</Text>
      
      <Button title="Adicionar 100 kcal" onPress={() => addCalories(100)} />
      <Button title="Adicionar 250 mL" onPress={() => addWater(250)} />
      <Button title="Definir 8h de sono" onPress={() => setSleep(480)} />
    </View>
  );
}
```

---

## API do HealthContext

### Estado (State)

#### `daily` - Objeto com dados do dia atual
```javascript
{
  date: "2025-12-16",    // String no formato YYYY-MM-DD
  calories: 1200,         // Number (kcal consumidas)
  waterMl: 1500,          // Number (mL consumidos)
  sleepMin: 480           // Number (minutos de sono)
}
```

#### `goals` - Objeto com metas do usuário
```javascript
{
  caloriesGoal: 3220,     // Number (meta de kcal)
  waterGoalMl: 2000,      // Number (meta de mL)
  sleepGoalMin: 480       // Number (meta de minutos)
}
```

#### `isReady` - Boolean
- `true`: Dados foram carregados do AsyncStorage
- `false`: Ainda carregando dados

---

### Actions (Funções)

#### `addCalories(amount)`
Adiciona calorias ao total do dia.
```javascript
// Adicionar 500 kcal
addCalories(500);

// Resultado: daily.calories += 500
```

**Validações:**
- `amount` deve ser um número positivo
- Máximo: 20.000 kcal
- Se inválido, mostra warning no console e não altera o valor

#### `addWater(amountMl)`
Adiciona água ao total do dia.
```javascript
// Adicionar 300 mL
addWater(300);

// Resultado: daily.waterMl += 300
```

**Validações:**
- `amountMl` deve ser um número positivo
- Máximo: 20.000 mL
- Se inválido, mostra warning no console e não altera o valor

#### `setSleep(minutes)`
Define o total de sono do dia (substitui o valor anterior).
```javascript
// Definir 7h 30m (450 minutos)
setSleep(450);

// Resultado: daily.sleepMin = 450
```

**Validações:**
- `minutes` deve ser um número positivo
- Mínimo: 0, Máximo: 1.440 (24 horas)
- Se inválido, mostra warning no console e não altera o valor

#### `resetToday()`
Reseta os valores do dia para zero (mantém a data).
```javascript
resetToday();

// Resultado:
// daily.calories = 0
// daily.waterMl = 0
// daily.sleepMin = 0
```

---

## Exemplos Práticos

### Exemplo 1: Criar um Widget de Resumo

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHealth } from '../contexts/HealthContext';
import { formatSleepTime } from '../utils/date';

export default function HealthSummaryWidget() {
  const { daily, goals, isReady } = useHealth();

  if (!isReady) return null;

  const caloriesProgress = (daily.calories / goals.caloriesGoal) * 100;
  const waterProgress = (daily.waterMl / goals.waterGoalMl) * 100;
  const sleepProgress = (daily.sleepMin / goals.sleepGoalMin) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo de Hoje</Text>
      
      <View style={styles.row}>
        <Text>🍎 Calorias:</Text>
        <Text>{daily.calories} / {goals.caloriesGoal} kcal</Text>
        <Text>({Math.round(caloriesProgress)}%)</Text>
      </View>

      <View style={styles.row}>
        <Text>💧 Água:</Text>
        <Text>{daily.waterMl} / {goals.waterGoalMl} mL</Text>
        <Text>({Math.round(waterProgress)}%)</Text>
      </View>

      <View style={styles.row}>
        <Text>😴 Sono:</Text>
        <Text>{formatSleepTime(daily.sleepMin)} / {formatSleepTime(goals.sleepGoalMin)}</Text>
        <Text>({Math.round(sleepProgress)}%)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
```

---

### Exemplo 2: Botão de Ação Rápida

```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useHealth } from '../contexts/HealthContext';

export default function QuickWaterButton() {
  const { addWater } = useHealth();

  const handlePress = () => {
    addWater(250); // Adiciona 250 mL
    // Opcional: mostrar toast/feedback
    alert('Adicionado 250 mL de água!');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>💧 +250 mL</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: { color: '#fff', fontWeight: 'bold' },
});
```

---

### Exemplo 3: Tela de Estatísticas

```javascript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useHealth } from '../contexts/HealthContext';
import { calculateProgress } from '../models/healthModels';

export default function StatsScreen() {
  const { daily, goals } = useHealth();

  const stats = [
    {
      label: 'Calorias',
      current: daily.calories,
      goal: goals.caloriesGoal,
      unit: 'kcal',
      icon: '🍎',
    },
    {
      label: 'Água',
      current: daily.waterMl,
      goal: goals.waterGoalMl,
      unit: 'mL',
      icon: '💧',
    },
    {
      label: 'Sono',
      current: daily.sleepMin,
      goal: goals.sleepGoalMin,
      unit: 'min',
      icon: '😴',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Estatísticas de Hoje</Text>
      
      {stats.map((stat, index) => {
        const progress = calculateProgress(stat.current, stat.goal);
        const percentage = Math.round(progress * 100);
        
        return (
          <View key={index} style={styles.card}>
            <Text style={styles.icon}>{stat.icon}</Text>
            <Text style={styles.label}>{stat.label}</Text>
            <Text style={styles.value}>
              {stat.current} / {stat.goal} {stat.unit}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.percentage}>{percentage}% da meta</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15 },
  icon: { fontSize: 40, marginBottom: 10 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  value: { fontSize: 16, color: '#666', marginBottom: 10 },
  progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00C853' },
  percentage: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'right' },
});
```

---

## Funções Utilitárias

### Formatação de Valores

```javascript
import { formatSleepTime, formatNumber } from '../utils/date';

// Formatar sono (minutos → "Xh Ym")
formatSleepTime(450);  // "7h 30m"
formatSleepTime(120);  // "2h 0m"
formatSleepTime(0);    // "0h 0m"

// Formatar números com separador de milhares
formatNumber(1200);    // "1.200"
formatNumber(2500);    // "2.500"
```

### Cálculo de Progresso

```javascript
import { calculateProgress } from '../models/healthModels';

// Retorna um valor entre 0 e 1
const progress = calculateProgress(1200, 3220);  // 0.372...
const percentage = Math.round(progress * 100);   // 37%
```

### Conversão de Tempo

```javascript
import { hoursMinutesToMinutes, minutesToHoursMinutes } from '../utils/date';

// Converter horas e minutos para minutos totais
hoursMinutesToMinutes(8, 30);  // 510

// Converter minutos totais para {hours, minutes}
minutesToHoursMinutes(510);    // { hours: 8, minutes: 30 }
```

---

## Boas Práticas

### 1. Sempre verificar `isReady`
```javascript
const { isReady } = useHealth();

if (!isReady) {
  return <ActivityIndicator />;
}
```

### 2. Validar inputs antes de submeter
```javascript
const handleSubmit = () => {
  const value = parseFloat(inputValue);
  
  if (isNaN(value) || value <= 0) {
    alert('Valor inválido');
    return;
  }
  
  addCalories(value);
};
```

### 3. Fornecer feedback ao usuário
```javascript
const handleAddWater = () => {
  addWater(300);
  Alert.alert('Sucesso', 'Adicionado 300 mL de água!');
};
```

### 4. Usar formatação consistente
```javascript
// ✅ Bom
<Text>{formatNumber(daily.calories)} kcal</Text>

// ❌ Evitar
<Text>{daily.calories} kcal</Text>  // Sem formatação
```

---

## Troubleshooting

### Problema: Dados não estão salvando
**Solução:** Verifique se o HealthProvider está envolvendo toda a navegação no App.js

### Problema: useHealth retorna undefined
**Solução:** Certifique-se de que o componente está dentro do HealthProvider

### Problema: Reset diário não está funcionando
**Solução:** O reset ocorre automaticamente ao carregar os dados. Simule mudando a data em `getTodayKey()` para testar

---

## Performance

- ✅ Debounce de 300ms ao salvar (evita muitas escritas)
- ✅ AsyncStorage é assíncrono (não bloqueia UI)
- ✅ Estado local com Context API (re-renders otimizados)
- ✅ Validações executam antes de atualizar estado

---

**Documentação completa e pronta para uso! 🚀**
