import React from 'react'; // eslint-disable-line no-unused-vars
import { Dimensions, PixelRatio } from 'react-native';

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

export {
  color,
  size,
};
