import {DarkTheme, DefaultTheme, ThemeProvider} from 'expo-router';
import {useColorScheme} from 'react-native';
import {AnimatedSplashOverlay} from '@/shared/ui/AnimatedSplashOverlay';
import AppTabs from '@/shared/ui/AppTabs';
import {preventAutoHideAsync} from "expo-splash-screen";

preventAutoHideAsync();

export default function TabLayout() {
    const colorScheme = useColorScheme();
    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay/>
            <AppTabs/>
        </ThemeProvider>
    );
}
