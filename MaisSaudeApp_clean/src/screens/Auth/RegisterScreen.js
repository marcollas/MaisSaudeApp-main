import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import * as VectorIcons from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/services/firestore';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleRegister = async () => {
        setError('');
        if (!email || !password) {
            setError('Preencha email e senha');
            return;
        }
        setLoading(true);
        try {
            const userCred = await signUp(email, password);
            const uid = userCred.user.uid;
            await createUserProfile(uid, { email, name: '', });
            navigation.replace('MainApp');
        } catch (e) {
            setError(e?.message || 'Erro ao cadastrar. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <VectorIcons.Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.welcomeBox}>
                    <Text style={styles.welcomeTitle}>Olá, seja Bem-vindo!</Text>
                    <Text style={styles.welcomeSub}>Para continuar seu registro insira seus dados abaixo:</Text>
                </View>

                <View style={styles.form}>
                    <TextInput placeholder="Nome completo:" style={styles.input} />
                    <TextInput placeholder="Data nascimento:" style={styles.input} />
                    <TextInput placeholder="Número de telefone:" keyboardType="phone-pad" style={styles.input} />
                    <TextInput placeholder="Cpf:" keyboardType="numeric" style={styles.input} />
                    <TextInput placeholder="Email:" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />
                    <TextInput placeholder="Senha:" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />

                    {error ? <Text style={{color: 'red', marginBottom: 8}}>{error}</Text> : null}

                    <TouchableOpacity style={[styles.button, loading ? { opacity: 0.7 } : null]} onPress={handleRegister} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Aguarde...' : 'Cadastre-se'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { padding: SIZES.padding },
    scrollContent: { paddingHorizontal: SIZES.padding },
    welcomeBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: SIZES.radius, padding: 20, marginBottom: 30, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
    welcomeTitle: { fontSize: 18, color: COLORS.primary, fontWeight: 'bold', marginBottom: 5 },
    welcomeSub: { textAlign: 'center', color: COLORS.textSecondary },
    input: { backgroundColor: '#E0E0E0', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 }
});