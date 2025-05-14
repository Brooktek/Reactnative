// firebaseUtils.js
import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import { getAuth, GoogleAuthProvider, AppleAuthProvider } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 
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
export const db = firestore(); 

GoogleSignin.configure({
  webClientId: 'AIzaSyD-29bFX3O_-c6g2SqrF8ZJf-Z4kmc1LSw', 
});


const saveUserProfile = async (user) => {
    if (!user) return;

    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: firestore.FieldValue.serverTimestamp(),
    };

    if (userDoc.exists) {
        await userRef.set(profileData, { merge: true });
        console.log("User profile updated in Firestore:", user.uid);
    } else {
        await userRef.set({
            ...profileData,
            createdAt: firestore.FieldValue.serverTimestamp(), 
        });
        console.log("New user profile created in Firestore:", user.uid);
    }
};



export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken, accessToken } = await GoogleSignin.signIn();
    const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);

    const userCredential = await auth.signInWithCredential(googleCredential);

    await saveUserProfile(userCredential.user);

    return userCredential;

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

    const userCredential = await auth.signInWithCredential(firebaseCredential);


    await saveUserProfile(userCredential.user);


    return userCredential;

  } catch (error) {
    console.error("Apple Sign-In Error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    console.log("User signed out");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

