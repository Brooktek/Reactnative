import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/firebaseUtils'; 
import { ActivityIndicator, View, StyleSheet } from 'react-native'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    
    const subscriber = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); 
      if (firebaseUser) {
          console.log("Auth state changed: User is logged in", firebaseUser.uid);
      } else {
           console.log("Auth state changed: User is logged out");
      }
    });

    return subscriber;
  }, []);

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});