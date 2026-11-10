import {useColorScheme} from 'react-native';
import {Colors} from "@/constants/Colors";

export function useTheme() {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';

    return Colors[theme];
}
