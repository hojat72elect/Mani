import {NativeTabs} from 'expo-router/native-tabs';
import {useColorScheme} from 'react-native';
import {Colors} from "@/shared/ui/Colors";

export default function AppTabs() {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

    return (
        <NativeTabs
            backgroundColor={colors.background}
            indicatorColor={colors.backgroundElement}
            labelStyle={{selected: {color: colors.text}}}>

            <NativeTabs.Trigger name="photos">
                <NativeTabs.Trigger.Label>Pictures</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/Photos.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Albums</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/Albums.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="videos">
                <NativeTabs.Trigger.Label>Videos</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/Videos.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="settings">
                <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/Settings.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

        </NativeTabs>
    );
}
