import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { getPosts } from '../../storage/postsStorage';

export default function SocialScreen() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const nav = useNavigation();

    const loadPosts = async () => {
        try {
            const data = await getPosts();
            setPosts(data);
        } catch (e) {
            console.warn('Erro ao carregar posts:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();

        // Recarrega quando voltar para a tela
        const unsub = nav.addListener('focus', loadPosts);
        return unsub;
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays === 0) return 'hoje';
        if (diffDays === 1) return 'ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const renderItem = ({ item }) => (
        <View style={styles.postCard}>
            {/* Cabeçalho do post */}
            <View style={styles.postHeader}>
                {item.authorPhotoUri ? (
                    <Image source={{ uri: item.authorPhotoUri }} style={styles.avatarSmall} />
                ) : (
                    <View style={[styles.avatarSmall, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={20} color="#999" />
                    </View>
                )}
                <View style={styles.postHeaderText}>
                    <Text style={styles.authorName}>{item.authorName || 'Usuário'}</Text>
                    <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>

            {/* Texto do post */}
            {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}

            {/* Imagem do post */}
            {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.postImage} />
            ) : null}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>Nenhuma publicação ainda</Text>
            <Text style={styles.emptySubtitle}>Seja o primeiro a compartilhar algo!</Text>
            <TouchableOpacity 
                style={styles.emptyBtn} 
                onPress={() => nav.navigate('CreatePost')}
            >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.emptyBtnText}>Criar primeira publicação</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Juntos</Text>
                <TouchableOpacity 
                    style={styles.createIconBtn} 
                    onPress={() => nav.navigate('CreatePost')}
                >
                    <Ionicons name="add" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList 
                    data={posts} 
                    keyExtractor={p => p.id} 
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: COLORS.background,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold',
    },
    createIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SIZES.padding,
        paddingTop: 8,
    },
    postCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postHeaderText: {
        marginLeft: 12,
        flex: 1,
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#333',
    },
    postDate: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 240,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        elevation: 2,
    },
    emptyBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
