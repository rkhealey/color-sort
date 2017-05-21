import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { color } from '../utils/constants';

const Button = ({ onPress, text }) =>
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>;

const styles = StyleSheet.create({
  button: {
    borderColor: color.BLACK,
    borderRadius: 4,
    borderWidth: 2,
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  text: {
    color: color.BLACK,
    fontSize: 24,
  },
});

Button.PropTypes = {
  onPress: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default Button;
