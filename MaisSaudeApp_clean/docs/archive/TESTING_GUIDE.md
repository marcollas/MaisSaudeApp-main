# 🧪 Guia de Testes - Funcionalidades de Saúde

## Como testar as funcionalidades implementadas

### 🚀 Iniciar o App

1. Abra um terminal na pasta do projeto:
```bash
cd MaisSaudeApp_clean
npx expo start
```

2. Escaneie o QR code com:
   - **Android**: App Expo Go
   - **iOS**: Câmera nativa

3. Faça login no app (ou crie uma conta se necessário)

---

## ✅ Roteiro de Testes

### Teste 1: Adicionar Calorias 🍎

**Objetivo:** Verificar se é possível adicionar calorias e ver o total atualizado

**Passos:**
1. Na tela Home, localize o card "Calorias"
2. Observe o valor inicial (ex: "0 kcal")
3. Toque no card de Calorias
4. Um modal deve abrir com título "Adicionar Calorias"
5. Toque no botão "+250"
6. O modal deve fechar automaticamente
7. Observe o card: deve mostrar "250 kcal"
8. Toque novamente no card
9. Digite "500" no campo de input
10. Toque em "Adicionar"
11. Observe o card: deve mostrar "750 kcal" (250 + 500)
12. Verifique a barra de progresso no card

**Resultado esperado:**
- ✅ Valores são somados corretamente
- ✅ Progresso visual atualiza
- ✅ Números formatados com ponto (ex: 1.250)

---

### Teste 2: Adicionar Água 💧

**Objetivo:** Verificar adição de água em mL

**Passos:**
1. Toque no card "Água" na tela Home
2. Modal abre com título "Adicionar Água"
3. Toque no botão "+300"
4. Observe: card mostra "300 mL"
5. Abra o modal novamente
6. Toque no botão "+500"
7. Observe: card mostra "800 mL"
8. Verifique a barra de progresso (meta: 2.000 mL)

**Resultado esperado:**
- ✅ Valores acumulam corretamente
- ✅ Progresso visual mostra ~40%
- ✅ Formatação correta

---

### Teste 3: Registrar Sono 😴

**Objetivo:** Verificar registro de horas de sono

**Passos:**
1. Toque no card "Sono" na tela Home
2. Modal abre com título "Registrar Sono"
3. Digite "7" no campo de horas
4. Digite "30" no campo de minutos
5. Toque em "Definir"
6. Observe: card mostra "7h 30m"
7. Abra o modal novamente
8. Digite "8" horas e "0" minutos
9. Toque em "Definir"
10. Observe: card mostra "8h 0m" (valor foi substituído)

**Resultado esperado:**
- ✅ Valor é substituído (não somado)
- ✅ Formato "Xh Ym" exibido corretamente
- ✅ Progresso visual atualiza (8h = 100% da meta)

---

### Teste 4: Validações de Entrada ⚠️

**Objetivo:** Verificar que valores inválidos são rejeitados

**4.1 - Calorias:**
1. Abra modal de Calorias
2. Deixe o campo vazio e toque "Adicionar"
3. **Esperado:** Mensagem de erro "Insira um valor válido"
4. Digite "-100" (negativo)
5. **Esperado:** Erro ou valor não é adicionado
6. Digite "50000" (muito alto)
7. **Esperado:** Mensagem "Valor muito alto"

**4.2 - Água:**
1. Abra modal de Água
2. Digite "0" e toque "Adicionar"
3. **Esperado:** Mensagem "Valor deve ser maior que zero"

**4.3 - Sono:**
1. Abra modal de Sono
2. Digite "30" horas e "0" minutos
3. **Esperado:** Mensagem "Horas devem estar entre 0 e 24"
4. Digite "5" horas e "90" minutos
5. **Esperado:** Mensagem "Minutos devem estar entre 0 e 59"

**Resultado esperado:**
- ✅ Validações funcionam corretamente
- ✅ Mensagens de erro claras
- ✅ Valores inválidos não são salvos

---

### Teste 5: Persistência de Dados 💾

**Objetivo:** Verificar que dados são salvos após fechar o app

**Passos:**
1. Adicione alguns valores:
   - Calorias: 1.500 kcal
   - Água: 1.200 mL
   - Sono: 7h 30m
2. Anote os valores exibidos
3. **Feche o app completamente** (force quit):
   - Android: Recents > Fechar app
   - iOS: Swipe up > Fechar app
4. Aguarde alguns segundos
5. Reabra o app via Expo Go
6. Navegue até a tela Home
7. Observe os cards

**Resultado esperado:**
- ✅ Calorias: 1.500 kcal (mantido)
- ✅ Água: 1.200 mL (mantido)
- ✅ Sono: 7h 30m (mantido)
- ✅ Progresso visual mantido

---

### Teste 6: Botões de Adição Rápida ⚡

**Objetivo:** Verificar botões de ação rápida

**Passos:**
1. Abra modal de Calorias
2. Toque nos botões rápidos em sequência:
   - +100, +250, +500, +1000
3. Observe o total no card: deve ser 1.850 kcal
4. Abra modal de Água
5. Toque nos botões rápidos:
   - +200, +300, +500, +750
6. Observe o total no card: deve ser 1.750 mL

**Resultado esperado:**
- ✅ Cada botão adiciona o valor correto
- ✅ Modal fecha automaticamente após toque
- ✅ UI atualiza instantaneamente

---

### Teste 7: Progresso Visual 📊

**Objetivo:** Verificar se barra de progresso funciona corretamente

**Passos:**
1. Reset valores (ou comece do zero)
2. Adicione 1.610 kcal (50% de 3.220)
3. Observe a barra de progresso no card de Calorias
4. **Esperado:** ~50% preenchido
5. Adicione 1.000 mL (50% de 2.000)
6. Observe a barra de progresso no card de Água
7. **Esperado:** ~50% preenchido
8. Defina 4h de sono (50% de 8h)
9. Observe a barra de progresso no card de Sono
10. **Esperado:** ~50% preenchido

**Resultado esperado:**
- ✅ Barra de progresso reflete percentual correto
- ✅ Cor verde (COLORS.primary)
- ✅ Animação suave (se implementada)

---

### Teste 8: Cancelar Ação ❌

**Objetivo:** Verificar que cancelar não salva dados

**Passos:**
1. Anote o valor atual de Calorias (ex: 500 kcal)
2. Abra o modal de Calorias
3. Digite "1000" no campo
4. **Toque fora do modal** (na área escura) para fechar
5. Observe o card de Calorias
6. **Esperado:** Valor continua 500 kcal (não foi alterado)

**Resultado esperado:**
- ✅ Fechar modal sem "Adicionar" não salva dados
- ✅ Modal fecha ao tocar no backdrop

---

### Teste 9: Formatação de Números 🔢

**Objetivo:** Verificar formatação correta

**Passos:**
1. Adicione exatamente 1.200 kcal
2. Observe o card: deve mostrar "1.200 kcal" (com ponto)
3. Adicione 2.500 mL de água
4. Observe o card: deve mostrar "2.500 mL" (com ponto)

**Resultado esperado:**
- ✅ Números formatados no padrão pt-BR (ponto como separador de milhares)
- ✅ Legível e profissional

---

### Teste 10: Múltiplas Ações Seguidas ⚡⚡⚡

**Objetivo:** Verificar performance com múltiplas ações

**Passos:**
1. Adicione água 10 vezes seguidas (botão +200)
2. Observe se a UI continua responsiva
3. Verifique se o total está correto: 2.000 mL
4. Feche e reabra o app
5. Verifique se o valor foi salvo corretamente

**Resultado esperado:**
- ✅ UI permanece responsiva
- ✅ Sem lags ou travamentos
- ✅ Valores salvos corretamente (debounce funcionando)

---

## 🐛 Problemas Conhecidos (Se Houver)

### AsyncStorage não inicializa
**Sintoma:** Valores não são salvos após fechar o app
**Solução:** Reinstalar dependências
```bash
cd MaisSaudeApp_clean
rm -rf node_modules
npm install
npx expo start -c
```

### Modal não abre
**Sintoma:** Tocar no card não abre o modal
**Solução:** Verificar console para erros, recarregar app (Shake device > Reload)

---

## 📊 Critérios de Sucesso

Para considerar a implementação como sucesso, todos os testes acima devem passar:

- [x] Teste 1: Adicionar Calorias
- [x] Teste 2: Adicionar Água
- [x] Teste 3: Registrar Sono
- [x] Teste 4: Validações de Entrada
- [x] Teste 5: Persistência de Dados
- [x] Teste 6: Botões de Adição Rápida
- [x] Teste 7: Progresso Visual
- [x] Teste 8: Cancelar Ação
- [x] Teste 9: Formatação de Números
- [x] Teste 10: Múltiplas Ações Seguidas

---

## 🎬 Demonstração Completa (5 minutos)

### Cenário Real de Uso:

1. **Manhã** (07:00)
   - Adicionar café da manhã: +400 kcal
   - Beber água: +300 mL
   - Registrar sono da noite: 7h 30m

2. **Meio-dia** (12:00)
   - Adicionar almoço: +800 kcal
   - Beber água: +500 mL

3. **Tarde** (15:00)
   - Lanche: +200 kcal
   - Água: +250 mL

4. **Noite** (19:00)
   - Jantar: +600 kcal
   - Água: +400 mL

5. **Totais Esperados:**
   - Calorias: 2.000 kcal (62% da meta)
   - Água: 1.450 mL (72% da meta)
   - Sono: 7h 30m (94% da meta)

6. **Fechar e Reabrir App:**
   - Todos os valores devem permanecer

---

## ✅ Checklist Final

Após executar todos os testes, confirme:

- [ ] Todos os modais abrem corretamente
- [ ] Todos os valores são salvos
- [ ] Validações funcionam
- [ ] Persistência funciona após fechar app
- [ ] UI é responsiva e rápida
- [ ] Sem crashes ou erros
- [ ] Formatação está correta
- [ ] Progresso visual está preciso

Se todos os itens estão marcados, a implementação está **100% funcional**! 🎉

---

**Boa sorte com os testes! 🚀**
