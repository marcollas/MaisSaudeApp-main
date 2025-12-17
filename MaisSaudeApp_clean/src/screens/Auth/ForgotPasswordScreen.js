import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();

  const handleReset = async () => {
    try {
      await resetPassword(email);
      setMessage('Email de recuperação enviado. Verifique sua caixa de entrada.');
    } catch (e) {
      setMessage('Erro ao enviar email. Verifique o email e tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Enviar email de recuperação</Text>
      </TouchableOpacity>
      {message ? <Text style={{marginTop: 12}}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SIZES.padding, justifyContent: 'center', backgroundColor: COLORS.white },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: COLORS.inputBg, padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: COLORS.white, fontWeight: 'bold' },
});
