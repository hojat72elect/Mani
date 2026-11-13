import {Image} from 'expo-image';
import {hideAsync} from 'expo-splash-screen';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {Easing, Keyframe} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

export function AnimatedSplashOverlay() {
    const DURATION = 600;
    const [animate, setAnimate] = useState(false);
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const splashKeyframe = new Keyframe({
        0: {
            transform: [{scale: 1}],
            opacity: 1,
        },
        20: {
            opacity: 1,
        },
        70: {
            opacity: 0,
            easing: Easing.elastic(0.7),
        },
        100: {
            opacity: 0,
            transform: [{scale: 1}],
            easing: Easing.elastic(0.7),
        },
    });

    const image = <Image style={{
        width: 76,
        height: 71
    }} source={require('@/assets/images/expo-logo.png')}/>;

    return animate ? (
        <Animated.View
            entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
                'worklet';
                if (finished) {
                    scheduleOnRN(setVisible, false);
                }
            })}
            style={{
                ...StyleSheet.absoluteFill,
                backgroundColor: '#208AEF',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
            {image}
        </Animated.View>
    ) : (
        <View
            onLayout={() => {
                hideAsync().finally(() => {
                    setAnimate(true);
                });
            }}
            style={{
                ...StyleSheet.absoluteFill,
                backgroundColor: '#208AEF',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
            {image}
        </View>
    );
}