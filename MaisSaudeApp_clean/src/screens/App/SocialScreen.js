import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { getPosts } from '../../storage/postsStorage';
import AnimatedFadeInUp from '../../components/AnimatedFadeInUp';

export default function SocialScreen() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all | week | month
    const [page, setPage] = useState(1);
    const pageSize = 6;
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
        const unsub = nav.addListener('focus', loadPosts);
        return unsub;
    }, []);

    // Derived list: filter + paginate
    const filtered = useMemo(() => {
        if (!Array.isArray(posts)) return [];
        const now = Date.now();
        const msDay = 86400000;
        if (filter === 'week') {
            return posts.filter(p => now - (p.createdAt || 0) <= 7 * msDay);
        }
        if (filter === 'month') {
            return posts.filter(p => now - (p.createdAt || 0) <= 30 * msDay);
        }
        return posts;
    }, [posts, filter]);

    const displayed = useMemo(() => {
        return filtered.slice(0, page * pageSize);
    }, [filtered, page]);

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

    const renderItem = ({ item, index }) => (
        <AnimatedFadeInUp delay={Math.min(index, 8) * 60}>
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
        </AnimatedFadeInUp>
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

    const FilterBar = () => (
        <View style={styles.filterBar}>
            {['all','week','month'].map(key => (
                <TouchableOpacity
                    key={key}
                    style={[styles.filterBtn, filter === key && styles.filterBtnActive]}
                    onPress={() => { setFilter(key); setPage(1); }}
                >
                    <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
                        {key === 'all' ? 'Recentes' : key === 'week' ? 'Semana' : 'Mês'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const ListFooter = () => {
        const hasMore = displayed.length < filtered.length;
        if (!hasMore) return <View style={{ height: 16 }} />;
        return (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(p => p + 1)}>
                <Text style={styles.loadMoreText}>Carregar mais</Text>
            </TouchableOpacity>
        );
    };

    const SkeletonList = () => (
        <View style={{ padding: SIZES.padding }}>
            {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={styles.skeletonCard}>
                    <View style={styles.skeletonHeaderRow}>
                        <View style={styles.skeletonAvatar} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <View style={styles.skeletonLine} />
                            <View style={[styles.skeletonLine, { width: '40%', marginTop: 6 }]} />
                        </View>
                    </View>
                    <View style={[styles.skeletonLine, { width: '90%', marginTop: 12 }]} />
                    <View style={[styles.skeletonLine, { width: '70%', marginTop: 8 }]} />
                </View>
            ))}
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

            <FilterBar />

            {loading ? (
                <SkeletonList />
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={p => p.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={ListFooter}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setPage(1); onRefresh(); }}
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
    listContent: {
        padding: SIZES.padding,
        paddingTop: 8,
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.padding,
        gap: 8,
        marginBottom: 8,
    },
    filterBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#eee',
    },
    filterBtnActive: {
        backgroundColor: '#e3f2fd',
        borderColor: '#bbdefb',
    },
    filterText: { color: '#666', fontWeight: '600', fontSize: 12 },
    filterTextActive: { color: COLORS.primary },
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
    loadMoreBtn: {
        alignSelf: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#eee',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    loadMoreText: { fontWeight: '600', color: '#333' },
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
    skeletonCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    skeletonHeaderRow: { flexDirection: 'row', alignItems: 'center' },
    skeletonAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
    skeletonLine: { height: 12, backgroundColor: '#eee', borderRadius: 6 },
});
