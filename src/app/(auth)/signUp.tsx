import * as React from 'react'
import { Text, TextInput, Button, View, Platform, KeyboardAvoidingView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const showError = (title: string, msg: string) => {
    setErrorMessage(msg)
    if (Platform.OS !== 'web') {
      Alert.alert(title, msg)
    }
  }

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) {
      showError('Loading', 'Authentication service is still loading. Please wait a moment and try again.')
      return
    }
    setErrorMessage('')

    const trimmedEmail = emailAddress.trim()
    const trimmedUsername = username.trim()

    if (!trimmedEmail) {
      showError('Invalid Email', 'Please enter your email address.')
      return
    }
    if (!password) {
      showError('Missing Password', 'Please enter a password.')
      return
    }

    // Start sign-up process using email and password provided
    setIsSubmitting(true)
    try {
      let signUpAttempt
      try {
        signUpAttempt = await signUp.create({
          emailAddress: trimmedEmail,
          ...(trimmedUsername ? { username: trimmedUsername } : {}),
          password,
        })
      } catch (createErr: any) {
        const paramName = createErr?.errors?.[0]?.meta?.paramName
        const code = createErr?.errors?.[0]?.code
        if (paramName === 'username' || code === 'form_param_unknown') {
          signUpAttempt = await signUp.create({
            emailAddress: trimmedEmail,
            password,
          })
        } else {
          throw createErr
        }
      }

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
        return
      }

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err: any) {
      const errorList = err?.errors
        ?.map((e: any) => e.longMessage || e.message)
        .filter(Boolean)
        .join('\n')
      const errorMsg = errorList || err?.message || 'Sign up failed. Please try again.'
      showError('Sign Up Failed', errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return
    setErrorMessage('')

    const trimmedCode = code.trim()
    if (!trimmedCode) {
      showError('Invalid Code', 'Please enter your verification code.')
      return
    }

    setIsSubmitting(true)
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: trimmedCode,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.log('Verification status:', signUpAttempt.status)
        showError('Verification Incomplete', `Status: ${signUpAttempt.status}`)
      }
    } catch (err: any) {
      const firstError = err?.errors?.[0]
      const errorMsg = firstError?.longMessage || firstError?.message || err?.message || 'Verification failed. Please try again.'
      showError('Verification Failed', errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Verify Your Email</Text>
        {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#aaa"
          onChangeText={setCode}
        />
        <Button title={isSubmitting ? "Verifying..." : "Verify"} onPress={onVerifyPress} disabled={isSubmitting} />
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sign Up</Text>
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
        autoCapitalize="none"
        value={username}
        placeholder="Username (optional)"
        placeholderTextColor="#aaa"
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
      />
      <View
        id="clerk-captcha"
        nativeID="clerk-captcha"
        style={{ width: '100%', minWidth: 300, minHeight: 68, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
      />
      <Button title={isSubmitting ? "Signing Up..." : "Sign Up"} onPress={onSignUpPress} disabled={isSubmitting} />
      <View style={styles.signInContainer}>
        <Text style={styles.text}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/signIn')}>
          <Text style={styles.signInText}> Sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
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
  signInContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: "grey",
  },
  signInText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
});