import React from 'react'; // eslint-disable-line no-unused-vars
import { Dimensions, PixelRatio, Platform } from 'react-native';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const color = {
  GREY: '#4b4b4b',
  BLACK: '#000000',
  WHITE: '#ffffff',
};

const size = {
  ratio: PixelRatio.get(),
  pixel: 1 / PixelRatio.get(),
  height,
  width,
  gutter: 30,
  statusBar: 53,
};

const raised = {
  ...Platform.select({
    ios: {
      shadowColor: 'rgba(0, 0, 0, .4)',
      shadowOffset: { height: 1, width: 1 },
      shadowOpacity: 1,
      shadowRadius: 1,
    },
    android: {
      elevation: 2,
    },
  }),
};

export {
  color,
  raised,
  size,
};
