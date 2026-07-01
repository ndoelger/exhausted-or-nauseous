import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />
    </SafeAreaProvider>
  );
};

export default RootLayout;
