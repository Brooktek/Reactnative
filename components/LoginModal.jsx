import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithGoogle, signInWithApple } from './firebaseUtils'; 

const LoginModal = () => {

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      console.log('Google Sign-In Successful:', userCredential.user);
      Alert.alert('Success', `Signed in as ${userCredential.user.displayName || 'Google User'}`);
    } catch (error) {
      console.error('Google Sign-In Failed:', error);
      let errorMessage = 'Google Sign-In failed.';
      if (error.code === 'CANCELED') {
         errorMessage = 'Google Sign-In cancelled.';
      } else if (error.message) {
         errorMessage = `Sign-In failed: ${error.message}`;
      }
      Alert.alert('Sign-In Failed', errorMessage);
    }
  };

  const handleAppleSignIn = async () => {
     try {
       const userCredential = await signInWithApple();
       if (userCredential) { 
         console.log('Apple Sign-In Successful:', userCredential.user);
         Alert.alert('Success', `Signed in as ${userCredential.user.displayName || 'Apple User'}`);
       }
     } catch (error) {
       console.error('Apple Sign-In Failed:', error);
       let errorMessage = 'Apple Sign-In failed.';
       if (error.message && error.message.includes('not supported')) {
           errorMessage = 'Apple Sign-In is not supported on this device.';
       } else if (error.message) {
          errorMessage = `Sign-In failed: ${error.message}`;
       }
       Alert.alert('Sign-In Failed', errorMessage);
     }
   };


  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Sign In or Sign Up</Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleSignIn}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Apple Sign-In button - only show if supported */}
      {appleAuth.isSupported && (
         <TouchableOpacity
           style={[styles.button, styles.appleButton]}
           onPress={handleAppleSignIn}
         >
           <Text style={styles.buttonText}>Continue with Apple</Text>
         </TouchableOpacity>
      )}
       {!appleAuth.isSupported && (
         <Text style={styles.appleNotSupportedText}>Apple Sign-In only available on iOS devices running iOS 13+.</Text>
       )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff', 
    padding: 20,
    borderRadius: 10,
    width: '85%', 
    maxWidth: 350, 
    alignSelf: 'center', 

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: '#4285F4', 
  },
  appleButton: {
    backgroundColor: '#000', 
  },
  buttonText: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
  },
  appleNotSupportedText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  }
});

export default LoginModal;