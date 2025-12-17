import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import IMAGES from '../../constants/images';
import * as VectorIcons from '@expo/vector-icons';
import { fetchPosts } from '../../services/firestore';
import { useNavigation } from '@react-navigation/native';

export default function SocialScreen() {
    const [posts, setPosts] = useState([]);
    const nav = useNavigation();

    useEffect(() => {
        let mounted = true;
        fetchPosts().then(items => { if (mounted) setPosts(items); }).catch(() => {});
        return () => { mounted = false; };
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.postCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={IMAGES.avatar} style={styles.avatarSmall} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.userName || 'Usuário'}</Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{new Date((item.createdAt && item.createdAt.seconds ? item.createdAt.seconds * 1000 : Date.now())).toLocaleString()}</Text>
                </View>
            </View>
            <Text style={{ marginTop: 10 }}>{item.text}</Text>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.postImage} /> : null}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Juntos</Text>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={() => nav.navigate('CreatePost')}>
                <Text style={styles.createBtnText}>Criar publicação</Text>
            </TouchableOpacity>

            <FlatList data={posts} keyExtractor={p => p.id} renderItem={renderItem} contentContainerStyle={{ padding: SIZES.padding }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding, paddingTop: 50 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    userInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: 'white', padding: 15, borderRadius: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
    divider: { width: 1, height: 40, backgroundColor: '#ddd' },
    createBtn: { backgroundColor: 'white', padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 30, borderWidth: 1, borderColor: '#eee' },
    createBtnText: { fontWeight: 'bold', fontSize: 16 },
    challengeCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
    challengeTitle: { fontWeight: 'bold', fontSize: 16 },
    challengeSub: { color: COLORS.textSecondary, fontSize: 12, width: 150 },
    partLabel: { fontSize: 12, color: COLORS.textSecondary },
    partCount: { fontWeight: 'bold', fontSize: 20 },
    enterBtn: { marginTop: 15, backgroundColor: '#eee', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
    challengeImg: { width: 100, height: 100, resizeMode: 'contain', backgroundColor: '#e0e0e0', borderRadius: 10 }
});
