import React, {useState} from 'react';
import {Dimensions, FlatList, Modal, Platform, Pressable, Share, StyleSheet, View,} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from 'expo-image';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';

import {ThemedText} from '@/components/themed-text';
import {Spacing} from '@/constants/theme';
import {formatDuration, formatMediaDate} from '@/services/media-service';

type Props = {
    visible: boolean;
    assets: MediaLibrary.Asset[];
    initialIndex: number;
    onClose: () => void;
    onDeleteAsset: (asset: MediaLibrary.Asset) => void;
    folderTitle?: string;
};

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export function MediaViewerModal({
                                     visible,
                                     assets,
                                     initialIndex,
                                     onClose,
                                     onDeleteAsset,
                                     folderTitle,
                                 }: Props) {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showControls, setShowControls] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    // Sync index when initialIndex changes
    React.useEffect(() => {
        if (visible && initialIndex >= 0 && initialIndex < assets.length) {
            setCurrentIndex(initialIndex);
        }
    }, [visible, initialIndex, assets.length]);

    const currentAsset = assets[currentIndex] || assets[0];

    if (!visible || !currentAsset) {
        return null;
    }

    const handleShare = async () => {
        try {
            await Share.share({
                title: currentAsset.filename,
                url: currentAsset.uri,
                message: Platform.OS === 'android' ? currentAsset.uri : undefined,
            });
        } catch (err) {
            console.warn('Share error', err);
        }
    };

    const isVideo = currentAsset.mediaType === 'video';
    const megaPixels = currentAsset.width && currentAsset.height
        ? ((currentAsset.width * currentAsset.height) / 1000000).toFixed(1)
        : null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}>
            <StatusBar style="light"/>
            <View style={styles.container}>
                {/* Swipable Media Carousel */}
                <FlatList
                    data={assets}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialIndex >= 0 && initialIndex < assets.length ? initialIndex : 0}
                    getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                        if (index >= 0 && index < assets.length) {
                            setCurrentIndex(index);
                        }
                    }}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <Pressable
                            style={styles.slide}
                            onPress={() => setShowControls((prev) => !prev)}>
                            <Image
                                source={{uri: item.uri}}
                                style={styles.fullImage}
                                contentFit="contain"
                                transition={200}
                            />
                            {item.mediaType === 'video' && (
                                <View style={styles.videoIndicatorBox}>
                                    <View style={styles.playCircle}>
                                        <SymbolView
                                            name={{ios: 'play.fill', android: 'play_arrow', web: 'play_arrow'}}
                                            size={36}
                                            tintColor="#ffffff"
                                        />
                                    </View>
                                    <ThemedText style={styles.videoDurationPill}>
                                        Video • {formatDuration(item.duration)}
                                    </ThemedText>
                                </View>
                            )}
                        </Pressable>
                    )}
                />

                {/* Top App Bar Overlay */}
                {showControls && (
                    <View style={[styles.topBar, {paddingTop: insets.top + Spacing.two}]}>
                        <Pressable
                            onPress={onClose}
                            android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                            style={styles.iconButton}>
                            <SymbolView
                                name={{ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back'}}
                                size={24}
                                tintColor="#ffffff"
                            />
                        </Pressable>

                        <View style={styles.topInfo}>
                            <ThemedText style={styles.headerTitle} numberOfLines={1}>
                                {currentAsset.filename}
                            </ThemedText>
                            <ThemedText style={styles.headerSubtitle}>
                                {currentIndex + 1} of {assets.length} • {formatMediaDate(currentAsset.creationTime)}
                            </ThemedText>
                        </View>

                        <View style={styles.topActions}>
                            <Pressable
                                onPress={handleShare}
                                android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                                style={styles.iconButton}>
                                <SymbolView
                                    name={{ios: 'square.and.arrow.up', android: 'share', web: 'share'}}
                                    size={22}
                                    tintColor="#ffffff"
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => setShowDetails((prev) => !prev)}
                                android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                                style={[styles.iconButton, showDetails && styles.activeIconButton]}>
                                <SymbolView
                                    name={{ios: 'info.circle', android: 'info', web: 'info'}}
                                    size={22}
                                    tintColor="#ffffff"
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => onDeleteAsset(currentAsset)}
                                android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                                style={styles.iconButton}>
                                <SymbolView
                                    name={{ios: 'trash', android: 'delete', web: 'delete'}}
                                    size={22}
                                    tintColor="#ff5555"
                                />
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Bottom Details Drawer */}
                {showControls && showDetails && (
                    <View style={[styles.bottomSheet, {paddingBottom: insets.bottom + Spacing.three}]}>
                        <ThemedText type="subtitle" style={styles.sheetTitle}>
                            Media Details
                        </ThemedText>

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Folder:</ThemedText>
                            <ThemedText style={styles.detailValue}>{folderTitle || 'All Media'}</ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Type:</ThemedText>
                            <ThemedText style={styles.detailValue}>
                                {isVideo ? `Video (${formatDuration(currentAsset.duration)})` : 'Photo'}
                            </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Date Taken:</ThemedText>
                            <ThemedText style={styles.detailValue}>
                                {new Date(currentAsset.creationTime).toLocaleString()}
                            </ThemedText>
                        </View>

                        {currentAsset.width > 0 && currentAsset.height > 0 && (
                            <View style={styles.detailRow}>
                                <ThemedText style={styles.detailLabel}>Resolution:</ThemedText>
                                <ThemedText style={styles.detailValue}>
                                    {currentAsset.width} × {currentAsset.height}
                                    {megaPixels ? ` (${megaPixels} MP)` : ''}
                                </ThemedText>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>URI:</ThemedText>
                            <ThemedText style={styles.detailValueSmall} numberOfLines={2}>
                                {currentAsset.uri}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    videoIndicatorBox: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.two,
    },
    playCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    videoDurationPill: {
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.half,
        borderRadius: 16,
        fontSize: 13,
        fontWeight: '600',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.two,
        paddingBottom: Spacing.three,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        gap: Spacing.two,
    },
    topInfo: {
        flex: 1,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    topActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(20, 20, 22, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.three,
        gap: Spacing.two,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    sheetTitle: {
        color: '#ffffff',
        fontSize: 17,
        marginBottom: Spacing.one,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.two,
    },
    detailLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        width: 90,
        fontSize: 13,
    },
    detailValue: {
        color: '#ffffff',
        flex: 1,
        fontSize: 13,
    },
    detailValueSmall: {
        color: 'rgba(255, 255, 255, 0.8)',
        flex: 1,
        fontSize: 11,
    },
});
