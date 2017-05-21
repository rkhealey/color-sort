import _ from 'lodash';
import React, { Component } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  View,
  StyleSheet,
} from 'react-native';

import Button from './components/button';
import Header from './components/header';
import Tile from './components/tile';

import { color, size } from './utils/constants';
import colors from './utils/colors';

class Grid extends Component {
  constructor(props) {
    super(props);

    this.dragPosition = null;
    this.activeTileOffset = null;
    this.panCapture = false;
    this.initialLayoutDone = false;
    this.initialDragDone = false;
    this.fixedPositions = [0, 5, 30, 35];
    this.solveOrder = [];
    this.tileWidth = size.width / 6;

    const panResponder = PanResponder.create({
      onPanResponderTerminate: (evt, gestureState) => {},
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => this.panCapture,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => this.panCapture,
      onShouldBlockNativeResponder: (evt, gestureState) => false,
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderGrant: this.onActiveTileIsSet(this.onStartDrag),
      onPanResponderMove: this.onActiveTileIsSet(this.onMoveTile),
      onPanResponderRelease: this.onActiveTileIsSet(this.onReleaseTile),
    });

    this.state = {
      activeTile: null,
      gridLayout: null,
      isLoading: true,
      isPlaying: false,
      movingTiles: [],
      panResponder,
      solved: false,
      tilePositions: [],
      tilePositionsSetCount: 0,
    };
  }

  onActiveTileIsSet = fn => (evt, gestureState) => {
    if (this.state.activeTile != null) fn(evt, gestureState);
  }

  onStartDrag = (evt, gestureState) => {
    if (this.state.activeTile != null) {
      const activeTilePosition = this.getActiveTile().origin;
      const x = activeTilePosition.x - gestureState.x0;
      const y = activeTilePosition.y - gestureState.y0;
      this.activeTileOffset = { x, y };
      this.getActiveTile().currentPosition.setOffset({ x, y });
      this.getActiveTile().currentPosition.setValue({ x: gestureState.moveX, y: gestureState.moveY });
    }
  }

  onMoveTile = (evt, { moveX, moveY, dx, dy }) => {
    if (dx !== 0 || dy !== 0) this.initialDragDone = true;
    if (this.state.activeTile !== null && this.tilePositionsSet()) {
      const yChokeAmount = Math.max(
        0, (this.activeTileOffset.y + moveY) - (this.state.gridLayout.height - this.tileWidth));
      const xChokeAmount = Math.max(
        0, (this.activeTileOffset.x + moveX) - (this.state.gridLayout.width - this.tileWidth));
      const yMinChokeAmount = Math.min(0, this.activeTileOffset.y + moveY);
      const xMinChokeAmount = Math.min(0, this.activeTileOffset.x + moveX);

      const dragPosition = { x: moveX - xChokeAmount - xMinChokeAmount, y: moveY - yChokeAmount - yMinChokeAmount };
      this.dragPosition = dragPosition;
      this.getActiveTile().currentPosition.setValue(dragPosition);
    }
  }

  onReleaseTile = (evt, gestureState) => {
    const originalPosition = this.getActiveTile().origin;
    const closestTile = this.getClosestTile();
    const id = _.get(closestTile.tile, 'id');
    Animated.timing(
      this.getMovingTile(id).currentPosition,
      {
        toValue: originalPosition,
        duration: 500,
      },
    ).start();
    const movingTiles = this.state.movingTiles;
    this.getActiveTile().origin = _.find(movingTiles, { id }).origin;
    _.find(movingTiles, { id }).origin = originalPosition;
    this.setState({ movingTiles });

    const activeTileCurrentPosition = this.getActiveTile().currentPosition;
    activeTileCurrentPosition.flattenOffset();
    Animated.timing(
      activeTileCurrentPosition,
      {
        toValue: this.getActiveTile().origin,
        duration: 500,
      },
    ).start();
    this.panCapture = false;
    this.setState({ activeTile: null }, () => {
      this.check();
    });
  }

  getActiveTile = () => _.find(this.state.movingTiles, { id: this.state.activeTile });

  getClosestTile = () => {
    const distances = [];
    _.forEach(this.state.movingTiles, (tile) => {
      if (tile.id !== this.state.activeTile && tile.origin) {
        const tilePosition = tile.origin;
        const distance = this.getDistanceTo(tilePosition);
        const obj = {
          distance,
          tile,
        };
        distances.push(obj);
      }
    });
    const closest = _.sortBy(distances, d => d.distance);
    return closest[0];
  }

  getDistanceTo = (point) => {
    const xDistance = (this.dragPosition.x + this.activeTileOffset.x) - point.x;
    const yDistance = (this.dragPosition.y + this.activeTileOffset.y) - point.y;
    return Math.sqrt((xDistance ** 2) + (yDistance ** 2));
  }

  getMovingTile = id => _.find(this.state.movingTiles, { id });

  getTile = key => this.state.tilePositions[key];

  getTileStyle = (key) => {
    let style;
    if (this.tilePositionsSet()) {
      style = {
        position: 'absolute',
        ...this.getTile(key).currentPosition.getLayout(),
      };
    }
    return style;
  }

  tilePositionsSet = () => this.state.tilePositionsSetCount === colors.length;

  saveTilePositions = (key, isFixed) => ({ nativeEvent }) => {
    const tilePositions = this.state.tilePositions;
    if (!tilePositions[key]) {
      const tilePositionsSetCount = ++this.state.tilePositionsSetCount;
      const thisPosition = {
        x: nativeEvent.layout.x,
        y: nativeEvent.layout.y,
      };

      tilePositions[key] = {
        id: key,
        isFixed,
        currentPosition: new Animated.ValueXY(thisPosition),
        origin: thisPosition,
      };

      if (!isFixed) {
        this.solveOrder.push({ origin: thisPosition });
      }

      this.setState({
        tilePositions,
        tilePositionsSetCount,
        movingTiles: _.filter(tilePositions, { isFixed: false }),
      });

      if (this.tilePositionsSet()) {
        this.initialLayoutDone = true;
        this.setState({ isLoading: false });
      }
    }
  }

  shuffleTiles = () => {
    const movingTiles = this.state.movingTiles;
    const shuffled = _(movingTiles)
      .map(pos => pos.id)
      .shuffle()
      .value();

    const animations = [];
    const newOrder = {};
    _.forEach(movingTiles, (tile, index) => {
      const newOrigin = this.getMovingTile(shuffled[index]).origin;
      const animation = Animated.spring(
        this.getMovingTile(tile.id).currentPosition,
        {
          toValue: newOrigin,
        },
      );
      newOrder[tile.id] = {
        origin: newOrigin,
      };
      animations.push(animation);
    });

    Animated.parallel(animations).start(() => {
      _.forEach(movingTiles, (tile) => {
        _.assign(tile, { origin: newOrder[tile.id].origin });
      });
      this.setState({ isLoading: false, isPlaying: true, movingTiles });
    });
  }

  play = () => {
    this.setState({ isLoading: true, solved: false });
    this.shuffleTiles();
  }

  check = () => {
    const solved = _(this.state.movingTiles).map((tile, index) => {
      return tile.origin !== this.solveOrder[index].origin;
    }).compact().value().length === 0;

    this.setState({ solved, isPlaying: !solved });
  }

  solve = () => {
    const movingTiles = this.state.movingTiles;
    const animations = [];
    _.forEach(movingTiles, (tile, index) => {
      const newOrigin = this.solveOrder[index].origin;
      const animation = Animated.spring(
        this.getMovingTile(tile.id).currentPosition,
        {
          toValue: newOrigin,
        },
      );
      animations.push(animation);
    });

    Animated.parallel(animations).start(() => {
      this.setState({ isPlaying: false, movingTiles });
    });
  }

  activateDrag = (key) => {
    this.panCapture = true;
    this.setState({ activeTile: key });
  }

  layoutGrid = ({ nativeEvent }) => {
    if (this.state.gridLayout !== nativeEvent.layout) {
      this.setState({
        gridLayout: nativeEvent.layout,
      });
    }
  }

  renderTiles() {
    const { panResponder } = this.state;
    return _.map(colors, (col, key) => {
      const isFixed = _.includes(this.fixedPositions, key);
      return (
        <Tile
          color={col}
          isActive={key === this.state.activeTile}
          isFixed={isFixed}
          key={col}
          onLayout={this.saveTilePositions(key, isFixed)}
          onLongPress={() => { return !isFixed ? this.activateDrag(key) : _.noop; }}
          panHandlers={!isFixed ? panResponder.panHandlers : undefined}
          style={this.getTileStyle(key)}
        />
      );
    });
  }

  render() {
    const { gridLayout, isPlaying, isLoading, solved } = this.state;
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.grid} onLayout={this.layoutGrid}>
          {gridLayout && this.renderTiles()}
        </View>
        {!isPlaying && !isLoading && <Button onPress={this.play} text="Play" />}
        {isPlaying && !isLoading && <Button onPress={this.solve} text="Solve" />}
        {isLoading &&
          <View style={styles.isLoading}>
            <Text style={styles.statusText}>Loading...</Text>
          </View>
        }
        {solved &&
          <View style={styles.solved}>
            <Text style={styles.statusText}>You did it!</Text>
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    flex: 1,
    paddingTop: size.statusBar,
    position: 'relative',
  },
  grid: {
    height: size.height * 0.6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
  },
  isLoading: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusText: {
    color: 'white',
    fontSize: 24,
  },
  solved: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    left: 0,
    paddingVertical: 15,
    position: 'absolute',
    right: 0,
    top: 200,
  },
});

export default Grid;
