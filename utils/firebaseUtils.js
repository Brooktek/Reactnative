import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import { getAuth, GoogleAuthProvider, AppleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication'; 

const firebaseConfig = {
    apiKey: "AIzaSyD-29bFX3O_-c6g2SqrF8ZJf-Z4kmc1LSw",
    authDomain: "valuetracker-ebf1f.firebaseapp.com",
    projectId: "valuetracker-ebf1f",
    storageBucket: "valuetracker-ebf1f.firebasestorage.app",
    messagingSenderId: "731846681901",
    appId: "1:731846681901:web:2c06b7859f3fae54859fa4",
    measurementId: "G-J3B1FWM5JM"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); 
}

export const auth = getAuth(app);


GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE', 
});



export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const { idToken, accessToken } = await GoogleSignin.signIn();

    const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);

    return auth.signInWithCredential(googleCredential);

  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error; 
  }
};


export const signInWithApple = async () => {

    if (!appleAuth.isSupported) {
    console.warn("Apple Sign-In not supported on this device.");

    throw new Error("Apple Sign-In not supported"); 
  }

  try {
    const appleCredential = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });


    if (!appleCredential.identityToken) {
         throw new Error('Apple Sign-In failed: No identity token received.');
     }

    const firebaseCredential = AppleAuthProvider.credential(
      appleCredential.identityToken,
      appleCredential.authorizationCode, 
    );

    return auth.signInWithCredential(firebaseCredential);

  } catch (error) {
    console.error("Apple Sign-In Error:", error);
    throw error;
  }
};

