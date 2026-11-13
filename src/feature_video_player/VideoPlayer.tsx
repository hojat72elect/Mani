import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import {useVideoPlayer, VideoView} from 'expo-video';
import {useEvent} from 'expo';
import {SymbolView} from 'expo-symbols';
import {ThemedText} from '@/shared/ui/ThemedText';
import {Spacing} from '@/shared/ui/Spacing';

export function VideoPlayer({uri}: {
    uri: string;
    onToggleControls: () => void;
}) {
    const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
    const CONTROL_BG = 'rgba(0,0,0,0.55)';
    const videoViewRef = useRef<VideoView>(null);
    const [showPlayerControls, setShowPlayerControls] = useState(true);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const player = useVideoPlayer(uri, (p) => {
        p.loop = false;
    });

    // Track playback state via event
    const {isPlaying} = useEvent(player, 'playingChange', {isPlaying: player.playing});

    // Track position & duration via interval while playing
    const [position, setPosition] = useState(0);   // seconds
    const [duration, setDuration] = useState(0);   // seconds

    function formatDuration(seconds: number): string {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        const totalSecs = Math.floor(seconds);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        if (h > 0) {
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    useEffect(() => {
        // Grab initial duration once available
        setDuration(player.duration ?? 0);
    }, [player.duration]);

    useEffect(() => {
        if (!isPlaying) {
            setPosition(player.currentTime ?? 0);
            return;
        }
        const id = setInterval(() => {
            setPosition(player.currentTime ?? 0);
            setDuration(player.duration ?? 0);
        }, 500);
        return () => clearInterval(id);
    }, [isPlaying, player]);

    // Auto-hide controls 3 s after playback starts
    const scheduleHide = useCallback(() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowPlayerControls(false), 3000);
    }, []);

    const cancelHide = useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isPlaying) {
            scheduleHide();
        } else {
            cancelHide();
            setShowPlayerControls(true);
        }
        return () => cancelHide();
    }, [isPlaying, scheduleHide, cancelHide]);

    const handleVideoPress = () => {
        const next = !showPlayerControls;
        setShowPlayerControls(next);
        if (next && isPlaying) scheduleHide();
        else cancelHide();
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            player.pause();
        } else {
            // Replay from start if at the end
            if (duration > 0 && position >= duration - 0.5) {
                player.seekBy(-duration);
            }
            player.play();
        }
        scheduleHide();
    };

    const seekBy = (deltaSeconds: number) => {
        player.seekBy(deltaSeconds);
        setPosition(prev => Math.max(0, Math.min(prev + deltaSeconds, duration)));
    };

    const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

    return (
        <Pressable style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center'
        }} onPress={handleVideoPress}>
            <VideoView
                ref={videoViewRef}
                player={player}
                style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT
                }}
                contentFit="contain"
                nativeControls={false}
            />

            {/* Transport overlay */}
            {showPlayerControls && (
                <View style={{
                    ...StyleSheet.absoluteFill,
                    justifyContent: 'center',
                    alignItems: 'center'
                }} pointerEvents="box-none">
                    {/* Centre: rewind / play-pause / forward */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.five
                    }} pointerEvents="box-none">
                        <Pressable
                            onPress={() => seekBy(-10)}
                            android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 26,
                                backgroundColor: CONTROL_BG,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            hitSlop={12}>
                            <SymbolView
                                name={{ios: 'gobackward.10', android: 'replay_10'}}
                                size={30}
                                tintColor="#ffffff"
                            />
                        </Pressable>

                        <Pressable
                            onPress={togglePlayPause}
                            android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundColor: CONTROL_BG,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: 'rgba(255,255,255,0.35)'
                            }}
                            hitSlop={12}>
                            <SymbolView
                                name={isPlaying
                                    ? {ios: 'pause.fill', android: 'pause'}
                                    : {ios: 'play.fill', android: 'play_arrow'}}
                                size={38}
                                tintColor="#ffffff"
                            />
                        </Pressable>

                        <Pressable
                            onPress={() => seekBy(10)}
                            android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 26,
                                backgroundColor: CONTROL_BG,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            hitSlop={12}>
                            <SymbolView
                                name={{ios: 'goforward.10', android: 'forward_10'}}
                                size={30}
                                tintColor="#ffffff"
                            />
                        </Pressable>
                    </View>

                    {/* Bottom: seek bar + timestamps */}
                    <View style={{
                        position: 'absolute',
                        bottom: 60,
                        left: Spacing.four,
                        right: Spacing.four,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.two
                    }} pointerEvents="box-none">
                        <ThemedText style={{
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: '600',
                            minWidth: 42,
                            textAlign: 'center'
                        }}>{formatDuration(position)}</ThemedText>
                        <View style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            overflow: 'hidden'
                        }}>
                            <View style={[{
                                height: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: 2
                            }, {width: `${progress * 100}%`}]}/>
                        </View>
                        <ThemedText style={{
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: '600',
                            minWidth: 42,
                            textAlign: 'center'
                        }}>{formatDuration(duration)}</ThemedText>
                    </View>
                </View>
            )}
        </Pressable>
    );
}




