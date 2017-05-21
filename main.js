import Expo from 'expo';
import React, { Component } from 'react';

import Grid from './src/grid';

class App extends Component {
  render() {
    return (
      <Grid />
    );
  }
}

Expo.registerRootComponent(App);
