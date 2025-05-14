import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HamburgerMenu = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
        <Icon name="menu" size={30} color="#333" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Analytics')}>
            <Text>Analytics</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  menuButton: {
    padding: 10,
  },
  menu: {
    position: 'absolute',
    top: 50,
    left: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    padding: 10,
  },
});

export default HamburgerMenu;