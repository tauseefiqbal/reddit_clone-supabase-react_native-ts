import { useSignIn } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import {
  Text,
  TextInput,
  Button,
  View,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native'
import React from 'react'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const showError = (title: string, msg: string) => {
    setErrorMessage(msg)
    if (Platform.OS !== 'web') {
      Alert.alert(title, msg)
    }
  }

  // Handle the submission of the sign-in form
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) {
      showError('Loading', 'Authentication service is still loading. Please wait a moment and try again.')
      return
    }
    setErrorMessage('')

    const trimmedEmail = emailAddress.trim()
    if (!trimmedEmail) {
      showError('Invalid Email', 'Please enter your email address.')
      return
    }
    if (!password) {
      showError('Missing Password', 'Please enter your password.')
      return
    }

    // Start the sign-in process using the email and password provided
    setIsSubmitting(true)
    try {
      const signInAttempt = await signIn.create({
        identifier: trimmedEmail,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.log('Sign in status:', signInAttempt.status)
        showError('Sign In Incomplete', `Additional verification required (${signInAttempt.status}).`)
      }
    } catch (err: any) {
      const firstError = err?.errors?.[0]
      const errorMsg = firstError?.longMessage || firstError?.message || err?.message || 'Sign in failed. Please try again.'
      showError('Sign In Failed', errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }, [isLoaded, emailAddress, password])

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sign In</Text>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#aaa"
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title={isSubmitting ? "Signing In..." : "Sign In"} onPress={onSignInPress} disabled={isSubmitting} />
      <View style={styles.signUpContainer}>
        <Text style={styles.text}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/signUp')}>
          <Text style={styles.signUpText}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
  },
  errorText: {
    color: "#d9534f",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: "grey",
  },
  signUpText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
});