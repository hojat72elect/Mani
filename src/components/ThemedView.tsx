import {View, type ViewProps} from 'react-native';
import {useTheme} from '@/hooks/use-theme';
import {ThemeColor} from "@/constants/ThemeColor";

export function ThemedView({style, lightColor, darkColor, type, ...otherProps}: ViewProps & {
    lightColor?: string;
    darkColor?: string;
    type?: ThemeColor;
}) {
    const theme = useTheme();

    return <View style={[{backgroundColor: theme[type ?? 'background']}, style]} {...otherProps} />;
}
