# Funcionalidades de Métricas de Saúde - Implementação

## 🎯 Funcionalidades Implementadas

Este documento descreve as funcionalidades de **Adicionar Calorias**, **Registrar Sono** e **Adicionar Água** implementadas no app +Saúde (Expo/React Native), mantendo total compatibilidade com **Expo Go**.

---

## ✅ O que foi implementado

### 1. **Persistência de Dados (AsyncStorage)**
- Armazenamento local dos dados de saúde do usuário
- Dados persistem mesmo após fechar/abrir o app
- Reset automático diário (quando o dia muda, os valores zeram automaticamente)
- Histórico opcional (dias anteriores são salvos)

### 2. **Gerenciamento de Estado (HealthContext)**
- Context API para compartilhar dados de saúde em todo o app
- Reducer para gerenciar ações (adicionar calorias, água, definir sono)
- Debounce automático (300ms) ao salvar para evitar múltiplas escritas
- Estado reativo: UI atualiza instantaneamente

### 3. **Métricas Rastreadas**
- ✅ **Calorias**: adiciona valores em kcal (ex: +500 kcal)
- ✅ **Água**: adiciona valores em mL (ex: +300 mL)
- ✅ **Sono**: define total de horas e minutos do dia (ex: 7h 30m)

### 4. **Interface do Usuário**
- Cards clicáveis na HomeScreen
- Modais bottom-sheet para adicionar valores
- Botões de adição rápida (calorias e água)
- Input customizado para sono (horas + minutos)
- Barra de progresso visual para cada métrica
- Validação de inputs com mensagens de erro claras

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
```
src/
├── storage/
│   └── healthStorage.js          # Camada de persistência (AsyncStorage)
├── utils/
│   └── date.js                   # Funções de formatação e data
├── models/
│   └── healthModels.js           # Tipos de dados e validações
├── contexts/
│   └── HealthContext.js          # Context API + Reducer
└── components/
    └── AddMetricModal.js         # Modal reutilizável para adicionar métricas
```

### Arquivos Modificados:
```
App.js                            # Adicionado HealthProvider
src/screens/App/HomeScreen.js     # Integrado com HealthContext + Modais
```

---

## 🚀 Como Usar

### 1. **Adicionar Calorias**
1. Na tela Home, toque no card "Calorias"
2. Use os botões rápidos (+100, +250, +500, +1000) ou digite um valor
3. Toque em "Adicionar"
4. O valor é somado ao total do dia

### 2. **Adicionar Água**
1. Na tela Home, toque no card "Água"
2. Use os botões rápidos (+200, +300, +500, +750) ou digite um valor em mL
3. Toque em "Adicionar"
4. O valor é somado ao total do dia

### 3. **Registrar Sono**
1. Na tela Home, toque no card "Sono"
2. Digite as horas e minutos totais de sono (ex: 8h 0m)
3. Toque em "Definir"
4. O valor substitui o total de sono do dia

---

## 🔧 Validações Implementadas

### Calorias:
- Valor deve ser numérico e positivo
- Máximo: 20.000 kcal

### Água:
- Valor deve ser numérico e positivo
- Máximo: 20.000 mL

### Sono:
- Horas: 0 a 24
- Minutos: 0 a 59
- Total máximo: 24 horas (1440 minutos)

---

## 💾 Persistência de Dados

### Estrutura de Dados:

#### DailySummary (dados do dia):
```javascript
{
  date: "2025-12-16",    // YYYY-MM-DD
  calories: 1200,         // kcal
  waterMl: 1500,          // mL
  sleepMin: 480           // minutos (8h = 480min)
}
```

#### Goals (metas do usuário):
```javascript
{
  caloriesGoal: 3220,     // kcal
  waterGoalMl: 2000,      // mL
  sleepGoalMin: 480       // minutos (8h)
}
```

### Chaves do AsyncStorage:
- `@maisSaude:daily:v1` - Dados do dia atual
- `@maisSaude:goals:v1` - Metas do usuário
- `@maisSaude:history:v1` - Histórico de dias anteriores

---

## 🔄 Reset Diário Automático

O sistema verifica automaticamente se a data mudou ao carregar os dados:
1. Se `daily.date !== hoje`:
   - Salva o dia anterior no histórico
   - Cria um novo resumo diário com valores zerados
   - Mantém as metas inalteradas

---

## 🎨 Componentes Principais

### HealthProvider (Context)
```javascript
import { useHealth } from './src/contexts/HealthContext';

const { daily, goals, addCalories, addWater, setSleep } = useHealth();
```

### AddMetricModal (Componente)
```javascript
<AddMetricModal
  visible={true}
  onClose={() => {}}
  title="Adicionar Calorias"
  icon="food-apple"
  unitLabel="kcal"
  currentValue={1200}
  goalValue={3220}
  metricType="calories"
  onSubmit={(value) => addCalories(value)}
  quickAddButtons={[100, 250, 500]}
/>
```

---

## 📱 Compatibilidade

✅ **100% compatível com Expo Go**
- Nenhuma biblioteca nativa foi adicionada
- Apenas módulos puros JS e do Expo SDK
- Funciona imediatamente sem prebuild

### Dependências Usadas:
- `@react-native-async-storage/async-storage` (já estava no projeto)
- React Native APIs nativas: Modal, TextInput, TouchableOpacity
- Expo Vector Icons (já estava no projeto)

---

## 🧪 Testes Realizados

### Cenários Testados:
- ✅ Adicionar calorias múltiplas vezes
- ✅ Adicionar água múltiplas vezes
- ✅ Definir sono
- ✅ Fechar e reabrir app (persistência)
- ✅ Validações de entrada (valores inválidos)
- ✅ Progresso visual atualiza corretamente
- ✅ Reset diário automático

---

## 🛠️ Manutenção e Extensões Futuras

### Possíveis Melhorias:
1. **Editar Metas**: permitir usuário customizar suas metas diárias
2. **Histórico Visual**: gráficos com dados dos últimos 7/30 dias
3. **Notificações**: lembrar usuário de beber água ou registrar sono
4. **Sincronização**: integrar com Firebase para backup na nuvem
5. **Exportar Dados**: gerar relatórios CSV/PDF

### Como Adicionar Nova Métrica:
1. Adicionar campo no `DailySummary` (healthModels.js)
2. Adicionar action no reducer (HealthContext.js)
3. Criar função de ação (ex: `addSteps`)
4. Adicionar card na HomeScreen
5. Criar modal ou reutilizar AddMetricModal

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se o Expo está atualizado: `npx expo-doctor`
2. Limpe o cache: `npx expo start -c`
3. Reinstale dependências: `rm -rf node_modules && npm install`

---

## ✨ Resultado Final

O app agora possui um sistema completo e funcional de rastreamento de saúde diária:
- Interface intuitiva e moderna
- Dados persistentes e confiáveis
- Reset automático diário
- Validações robustas
- 100% compatível com Expo Go

**Aproveite o app +Saúde! 💪🏃‍♂️💧**
