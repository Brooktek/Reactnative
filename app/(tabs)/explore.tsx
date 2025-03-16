import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const explore = () => {
  return (
    <View style={style.container}>
      <Text style={style.Text}>EXP</Text>
    </View>
  )
}


const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  Text: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
});

export default explore
