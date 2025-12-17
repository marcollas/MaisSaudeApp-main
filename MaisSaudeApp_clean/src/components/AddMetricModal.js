import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as VectorIcons from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

/**
 * Modal reutilizável para adicionar métricas de saúde
 * 
 * @param {boolean} visible - Controla se o modal está visível
 * @param {function} onClose - Callback ao fechar o modal
 * @param {string} title - Título do modal (ex: "Adicionar Calorias")
 * @param {string} icon - Nome do ícone MaterialCommunityIcons
 * @param {string} unitLabel - Unidade da métrica (ex: "kcal", "mL", "minutos")
 * @param {number} currentValue - Valor atual da métrica
 * @param {number} goalValue - Meta da métrica
 * @param {string} metricType - Tipo de métrica: "calories", "water", "sleep"
 * @param {function} onSubmit - Callback ao submeter (recebe o valor a adicionar/definir)
 * @param {function} onEditGoal - Callback ao editar meta (recebe o novo valor da meta)
 * @param {array} quickAddButtons - Array de valores para botões rápidos (ex: [100, 250, 500])
 */
export default function AddMetricModal({
  visible,
  onClose,
  title,
  icon,
  unitLabel,
  currentValue,
  goalValue,
  metricType,
  onSubmit,
  onEditGoal,
  quickAddButtons = [],
}) {
  const [inputValue, setInputValue] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepMinutes, setSleepMinutes] = useState('');
  const [error, setError] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [goalSleepHours, setGoalSleepHours] = useState('');
  const [goalSleepMinutes, setGoalSleepMinutes] = useState('');

  const resetForm = () => {
    setInputValue('');
    setSleepHours('');
    setSleepMinutes('');
    setError('');
    setIsEditingGoal(false);
    setGoalDraft('');
    setGoalSleepHours('');
    setGoalSleepMinutes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEditGoal = () => {
    setIsEditingGoal(true);
    setError('');
    if (metricType === 'sleep') {
      const hours = Math.floor(goalValue / 60);
      const minutes = goalValue % 60;
      setGoalSleepHours(hours.toString());
      setGoalSleepMinutes(minutes.toString());
    } else {
      setGoalDraft(goalValue.toString());
    }
  };

  const handleCancelEditGoal = () => {
    setIsEditingGoal(false);
    setGoalDraft('');
    setGoalSleepHours('');
    setGoalSleepMinutes('');
    setError('');
  };

  const handleSaveGoal = () => {
    setError('');

    if (metricType === 'sleep') {
      const hours = parseInt(goalSleepHours) || 0;
      const minutes = parseInt(goalSleepMinutes) || 0;
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes < 60 || totalMinutes > 720) {
        setError('Meta deve estar entre 1 e 12 horas');
        return;
      }

      onEditGoal(totalMinutes);
      setIsEditingGoal(false);
      setGoalSleepHours('');
      setGoalSleepMinutes('');
    } else {
      const value = parseFloat(goalDraft);

      if (isNaN(value) || goalDraft.trim() === '') {
        setError('Insira um valor válido');
        return;
      }

      if (metricType === 'calories') {
        if (value < 800 || value > 8000) {
          setError('Meta deve estar entre 800 e 8000 kcal');
          return;
        }
      } else if (metricType === 'water') {
        if (value < 500 || value > 10000) {
          setError('Meta deve estar entre 500 e 10000 mL');
          return;
        }
      }

      onEditGoal(value);
      setIsEditingGoal(false);
      setGoalDraft('');
    }
  };

  const validateAndSubmit = () => {
    setError('');

    if (metricType === 'sleep') {
      // Validação para sono
      const hours = parseInt(sleepHours) || 0;
      const minutes = parseInt(sleepMinutes) || 0;

      if (hours < 0 || hours > 24) {
        setError('Horas devem estar entre 0 e 24');
        return;
      }

      if (minutes < 0 || minutes > 59) {
        setError('Minutos devem estar entre 0 e 59');
        return;
      }

      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes === 0) {
        setError('Insira pelo menos algum valor');
        return;
      }

      if (totalMinutes > 1440) {
        setError('Sono não pode ultrapassar 24 horas');
        return;
      }

      onSubmit(totalMinutes);
      handleClose();
    } else {
      // Validação para calorias e água
      const value = parseFloat(inputValue);

      if (isNaN(value) || inputValue.trim() === '') {
        setError('Insira um valor válido');
        return;
      }

      if (value <= 0) {
        setError('Valor deve ser maior que zero');
        return;
      }

      if (value > 20000) {
        setError('Valor muito alto');
        return;
      }

      onSubmit(value);
      handleClose();
    }
  };

  const handleQuickAdd = (value) => {
    onSubmit(value);
    handleClose();
  };

  const progress = Math.min((currentValue / goalValue) * 100, 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <VectorIcons.MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color={COLORS.primary}
                  />
                  <Text style={styles.modalTitle}>{title}</Text>
                </View>
                <TouchableOpacity onPress={handleClose}>
                  <VectorIcons.Ionicons name="close" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Progresso atual */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progresso de hoje</Text>
                    {!isEditingGoal && onEditGoal && (
                      <TouchableOpacity onPress={handleEditGoal} style={styles.editGoalButton}>
                        <VectorIcons.MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
                        <Text style={styles.editGoalText}>Editar meta</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.progressValue}>
                    {currentValue.toLocaleString('pt-BR')} / {goalValue.toLocaleString('pt-BR')} {unitLabel}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressPercent}>{Math.round(progress)}% da meta</Text>
                </View>

                {/* Edição de meta */}
                {isEditingGoal && (
                  <View style={styles.editGoalContainer}>
                    <Text style={styles.editGoalTitle}>Editar Meta Diária</Text>
                    {metricType === 'sleep' ? (
                      <View style={styles.sleepInputRow}>
                        <View style={styles.sleepInputWrapper}>
                          <TextInput
                            style={styles.sleepInput}
                            placeholder="0"
                            keyboardType="numeric"
                            value={goalSleepHours}
                            onChangeText={setGoalSleepHours}
                            maxLength={2}
                          />
                          <Text style={styles.sleepInputUnit}>horas</Text>
                        </View>
                        <Text style={styles.sleepInputSeparator}>:</Text>
                        <View style={styles.sleepInputWrapper}>
                          <TextInput
                            style={styles.sleepInput}
                            placeholder="0"
                            keyboardType="numeric"
                            value={goalSleepMinutes}
                            onChangeText={setGoalSleepMinutes}
                            maxLength={2}
                          />
                          <Text style={styles.sleepInputUnit}>min</Text>
                        </View>
                      </View>
                    ) : (
                      <TextInput
                        style={styles.input}
                        placeholder={`Meta em ${unitLabel}`}
                        keyboardType="numeric"
                        value={goalDraft}
                        onChangeText={setGoalDraft}
                        autoFocus
                      />
                    )}
                    <View style={styles.editGoalButtons}>
                      <TouchableOpacity
                        style={[styles.editGoalActionButton, styles.cancelButton]}
                        onPress={handleCancelEditGoal}
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editGoalActionButton, styles.saveButton]}
                        onPress={handleSaveGoal}
                      >
                        <Text style={styles.saveButtonText}>Salvar meta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Input de valor (escondido quando está editando meta) */}
                {!isEditingGoal && metricType === 'sleep' ? (
                  // Input especial para sono (horas e minutos)
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Defina o total de sono de hoje</Text>
                    <View style={styles.sleepInputRow}>
                      <View style={styles.sleepInputWrapper}>
                        <TextInput
                          style={styles.sleepInput}
                          placeholder="0"
                          keyboardType="numeric"
                          value={sleepHours}
                          onChangeText={setSleepHours}
                          maxLength={2}
                        />
                        <Text style={styles.sleepInputUnit}>horas</Text>
                      </View>
                      <Text style={styles.sleepInputSeparator}>:</Text>
                      <View style={styles.sleepInputWrapper}>
                        <TextInput
                          style={styles.sleepInput}
                          placeholder="0"
                          keyboardType="numeric"
                          value={sleepMinutes}
                          onChangeText={setSleepMinutes}
                          maxLength={2}
                        />
                        <Text style={styles.sleepInputUnit}>min</Text>
                      </View>
                    </View>
                  </View>
                ) : !isEditingGoal ? (
                  // Input normal para calorias e água
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Adicionar {unitLabel}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={`0 ${unitLabel}`}
                      keyboardType="numeric"
                      value={inputValue}
                      onChangeText={setInputValue}
                      autoFocus
                    />
                  </View>
                ) : null}

                {/* Mensagem de erro */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Botões de adição rápida (apenas para calorias e água, escondido quando editando meta) */}
                {!isEditingGoal && quickAddButtons.length > 0 && metricType !== 'sleep' && (
                  <View style={styles.quickAddContainer}>
                    <Text style={styles.quickAddLabel}>Adição rápida</Text>
                    <View style={styles.quickAddButtons}>
                      {quickAddButtons.map((value) => (
                        <TouchableOpacity
                          key={value}
                          style={styles.quickAddButton}
                          onPress={() => handleQuickAdd(value)}
                        >
                          <Text style={styles.quickAddButtonText}>+{value}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Botão de confirmar (escondido quando editando meta) */}
                {!isEditingGoal && (
                  <TouchableOpacity style={styles.submitButton} onPress={validateAndSubmit}>
                    <Text style={styles.submitButtonText}>
                      {metricType === 'sleep' ? 'Definir' : 'Adicionar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: COLORS.textPrimary,
  },
  progressContainer: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  editGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editGoalText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 15,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  sleepInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepInputWrapper: {
    alignItems: 'center',
  },
  sleepInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 15,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    width: 100,
    textAlign: 'center',
  },
  sleepInputUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  sleepInputSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginHorizontal: 10,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: SIZES.radius,
    marginBottom: 15,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  quickAddContainer: {
    marginBottom: 20,
  },
  quickAddLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: SIZES.radius,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  editGoalContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 20,
  },
  editGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  editGoalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  editGoalActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
