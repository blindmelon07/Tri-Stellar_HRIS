import { Image } from 'expo-image';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppText, Button, Field, Input, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/ctx/session';
import { ApiError } from '@/lib/api';

export default function SignInScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (exception) {
      setError(exception instanceof ApiError ? (exception.field('email') ?? exception.message) : 'Sign-in failed.');
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={require('@/assets/images/logo.jpg')} style={styles.logo} contentFit="contain" accessibilityLabel="TriStellar – Bigas ng Bayan" />
          <AppText variant="title">TriStellar HRIS</AppText>
          <AppText color="textSecondary">Employee Kiosk</AppText>
        </View>

        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Password" error={error ?? undefined}>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={submit}
            returnKeyType="go"
          />
        </Field>
        <Button title="Sign in" onPress={submit} loading={submitting} disabled={!email || !password} />
        <AppText variant="caption" color="textSecondary" style={styles.note}>
          Use the login HR created for you. Forgot your password? Ask HR to reset it.
        </AppText>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', gap: Spacing.three },
  hero: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.three },
  logo: { width: 180, height: 180, borderRadius: 24, backgroundColor: '#FFFFFF' },
  note: { textAlign: 'center' },
});
