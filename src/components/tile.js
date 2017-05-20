import React from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { size } from '../utils/constants';

const Tile = ({
  color,
  isFixed,
  isActive,
  onLayout,
  onLongPress,
  panHandlers,
  style }) =>
    <Animated.View
      onLayout={onLayout}
      {...panHandlers}
      style={[
        { backgroundColor: color },
        styles.tile,
        style,
        isActive ? styles.isActive : null,
      ]}
    >
      <TouchableWithoutFeedback onLongPress={onLongPress} delayLongPress={0}>
        <View style={[styles.inner, isFixed ? styles.isFixed : null]} />
      </TouchableWithoutFeedback>
    </Animated.View>;

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    height: size.width / 6,
    width: size.width / 6,
  },
  isActive: {
    zIndex: 1,
  },
});

Tile.PropTypes = {
  color: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  isFixed: PropTypes.bool,
  onLayout: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
  panHandlers: PropTypes.shape({}),
  style: PropTypes.shape({}),
};

Tile.defaultProps = {
  isActive: false,
  isFixed: false,
  panHandlers: undefined,
  style: null,
};

export default Tile;
