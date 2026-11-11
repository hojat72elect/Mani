import React, {useState} from 'react';
import {Dimensions, FlatList, Modal, Platform, Pressable, Share, View,} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from 'expo-image';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/shared/ui/ThemedText';
import {formatMediaDateUseCase} from '@/shared/usecases/formatMediaDateUseCase';
import {Spacing} from "@/shared/ui/Spacing";
import {formatVideoDurationUseCase} from "@/shared/usecases/formatVideoDurationUseCase";

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export function MediaViewerModal({visible, assets, initialIndex, onClose, onDeleteAsset, folderTitle,}: {
    visible: boolean;
    assets: MediaLibrary.Asset[];
    initialIndex: number;
    onClose: () => void;
    onDeleteAsset: (asset: MediaLibrary.Asset) => void;
    folderTitle?: string;
}) {
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
            <View style={{
                flex: 1,
                backgroundColor: '#000000'
            }}>
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
                            style={{
                                width: SCREEN_WIDTH,
                                height: SCREEN_HEIGHT,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onPress={() => setShowControls((prev) => !prev)}>
                            <Image
                                source={{uri: item.uri}}
                                style={{
                                    width: SCREEN_WIDTH,
                                    height: SCREEN_HEIGHT
                                }}
                                contentFit="contain"
                                transition={200}
                            />
                            {item.mediaType === 'video' && (
                                <View style={{
                                    position: 'absolute',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: Spacing.two
                                }}>
                                    <View style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 36,
                                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 2,
                                        borderColor: 'rgba(255, 255, 255, 0.4)'
                                    }}>
                                        <SymbolView
                                            name={{ios: 'play.fill', android: 'play_arrow'}}
                                            size={36}
                                            tintColor="#ffffff"
                                        />
                                    </View>
                                    <ThemedText style={{
                                        color: '#ffffff',
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        paddingHorizontal: Spacing.three,
                                        paddingVertical: Spacing.half,
                                        borderRadius: 16,
                                        fontSize: 13,
                                        fontWeight: '600'
                                    }}>
                                        Video • {formatVideoDurationUseCase(item.duration)}
                                    </ThemedText>
                                </View>
                            )}
                        </Pressable>
                    )}
                />

                {/* Top App Bar Overlay */}
                {showControls && (
                    <View style={[{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: Spacing.two,
                        paddingBottom: Spacing.three,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        gap: Spacing.two
                    }, {paddingTop: insets.top + Spacing.two}]}>
                        <Pressable
                            onPress={onClose}
                            android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <SymbolView
                                name={{ios: 'arrow.left', android: 'arrow_back'}}
                                size={24}
                                tintColor="#ffffff"
                            />
                        </Pressable>

                        <View style={{flex: 1}}>
                            <ThemedText style={{
                                color: '#ffffff',
                                fontSize: 16,
                                fontWeight: '600'
                            }} numberOfLines={1}>
                                {currentAsset.filename}
                            </ThemedText>
                            <ThemedText style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: 12
                            }}>
                                {currentIndex + 1} of {assets.length} • {formatMediaDateUseCase(currentAsset.creationTime)}
                            </ThemedText>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <Pressable
                                onPress={handleShare}
                                android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                <SymbolView
                                    name={{ios: 'square.and.arrow.up', android: 'share'}}
                                    size={22}
                                    tintColor="#ffffff"
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => setShowDetails((prev) => !prev)}
                                android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                                style={[{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }, showDetails && {backgroundColor: 'rgba(255, 255, 255, 0.25)'}]}>
                                <SymbolView
                                    name={{ios: 'info.circle', android: 'info'}}
                                    size={22}
                                    tintColor="#ffffff"
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => onDeleteAsset(currentAsset)}
                                android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                <SymbolView
                                    name={{ios: 'trash', android: 'delete'}}
                                    size={22}
                                    tintColor="#ff5555"
                                />
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Bottom Details Drawer */}
                {showControls && showDetails && (
                    <View style={[{
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
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }, {paddingBottom: insets.bottom + Spacing.three}]}>
                        <ThemedText type="subtitle" style={{
                            color: '#ffffff',
                            fontSize: 17,
                            marginBottom: Spacing.one
                        }}>
                            Media Details
                        </ThemedText>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: Spacing.two
                        }}>
                            <ThemedText style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                width: 90,
                                fontSize: 13
                            }}>Folder:</ThemedText>
                            <ThemedText style={{
                                color: '#ffffff',
                                flex: 1,
                                fontSize: 13
                            }}>{folderTitle || 'All Media'}</ThemedText>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: Spacing.two
                        }}>
                            <ThemedText style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                width: 90,
                                fontSize: 13
                            }}>Type:</ThemedText>
                            <ThemedText style={{
                                color: '#ffffff',
                                flex: 1,
                                fontSize: 13
                            }}>
                                {isVideo ? `Video (${formatVideoDurationUseCase(currentAsset.duration)})` : 'Photo'}
                            </ThemedText>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: Spacing.two
                        }}>
                            <ThemedText style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                width: 90,
                                fontSize: 13
                            }}>Date Taken:</ThemedText>
                            <ThemedText style={{
                                color: '#ffffff',
                                flex: 1,
                                fontSize: 13
                            }}>
                                {new Date(currentAsset.creationTime).toLocaleString()}
                            </ThemedText>
                        </View>

                        {currentAsset.width > 0 && currentAsset.height > 0 && (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: Spacing.two
                            }}>
                                <ThemedText style={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    width: 90,
                                    fontSize: 13
                                }}>Resolution:</ThemedText>
                                <ThemedText style={{
                                    color: '#ffffff',
                                    flex: 1,
                                    fontSize: 13
                                }}>
                                    {currentAsset.width} × {currentAsset.height}
                                    {megaPixels ? ` (${megaPixels} MP)` : ''}
                                </ThemedText>
                            </View>
                        )}

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: Spacing.two
                        }}>
                            <ThemedText style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                width: 90,
                                fontSize: 13
                            }}>URI:</ThemedText>
                            <ThemedText style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                flex: 1,
                                fontSize: 11
                            }} numberOfLines={2}>
                                {currentAsset.uri}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}
