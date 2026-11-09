import {TabList, TabListProps, Tabs, TabSlot, TabTrigger, TabTriggerSlotProps,} from 'expo-router/ui';
import {Pressable, StyleSheet, useColorScheme, View} from 'react-native';

import {Colors, MaxContentWidth, Spacing} from '@/constants/theme';

import {ThemedText} from './themed-text';
import {ThemedView} from './themed-view';

export default function AppTabs() {
    return (
        <Tabs>
            <TabSlot style={{height: '100%'}}/>
            <TabList asChild>
                <CustomTabList>
                    <TabTrigger name="index" href="/" asChild>
                        <TabButton>Folders</TabButton>
                    </TabTrigger>
                    <TabTrigger name="timeline" href={'/timeline' as any} asChild>
                        <TabButton>Photos</TabButton>
                    </TabTrigger>
                    <TabTrigger name="videos" href={'/videos' as any} asChild>
                        <TabButton>Videos</TabButton>
                    </TabTrigger>
                </CustomTabList>
            </TabList>
        </Tabs>
    );
}

export function TabButton({children, isFocused, ...props}: TabTriggerSlotProps) {
    const {ref: _ref, ...rest} = props as any;
    return (
        <Pressable {...rest} style={({pressed}) => pressed ? styles.pressed : undefined}>
            <ThemedView
                type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.tabButtonView}>
                <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
                    {children}
                </ThemedText>
            </ThemedView>
        </Pressable>
    );
}

export function CustomTabList(props: TabListProps) {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

    return (
        <View {...props} style={styles.tabListContainer}>
            <ThemedView type="backgroundElement" style={styles.innerContainer}>
                <ThemedText type="smallBold" style={styles.brandText}>
                    Mani Gallery
                </ThemedText>

                {props.children}
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    tabListContainer: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        padding: Spacing.three,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    innerContainer: {
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.five,
        borderRadius: Spacing.five,
        flexDirection: 'row',
        alignItems: 'center',
        flexGrow: 1,
        gap: Spacing.two,
        maxWidth: MaxContentWidth,
    },
    brandText: {
        marginRight: 'auto',
    },
    pressed: {
        opacity: 0.7,
    },
    tabButtonView: {
        paddingVertical: Spacing.one,
        paddingHorizontal: Spacing.three,
        borderRadius: Spacing.three,
    },
});
