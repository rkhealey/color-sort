import _ from 'lodash';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { color, size } from '../utils/constants';

const Header = ({ onPress, text }) =>
  <View style={styles.header}>
    <Text style={styles.text}>{_.toUpper('Sort the colors')}</Text>
  </View>;

const styles = StyleSheet.create({
  header: {
    backgroundColor: color.WHITE,
    marginTop: size.statusBar,
    alignItems: 'center',
    paddingVertical: 15,
  },
  text: {
    color: color.BLACK,
    fontSize: 20,
    textAlign: 'center',
  },
});

export default Header;
