import { View, Text, StyleSheet, ImageBackground } from 'react-native'
import React from 'react'

const app = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/icon.png')}
        style={{ width: '100%', height: '100%' }}>
      <Text style={styles.Text}>Hi hello</Text>
      </ImageBackground>
      
          </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  Text: {
    color: 'black',
    textAlign: 'center',
  },
})

export default app