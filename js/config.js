'use strict';

const CFG = {
  TILE_W: 64,
  TILE_H: 32,
  TILE_DEPTH: 14,

  MOVE_MS: 180,
  CAMERA_LERP: 0.10,

  // Tile type IDs
  T: {
    GRASS:  0,
    PATH:   1,
    WATER:  2,
    TREE:   3,
    FLOWER: 4,
    EVENT:  5,
    SAND:   6,
    BRIDGE: 7,
  },

  // [topColor, leftColor, rightColor]
  TILE_COLORS: [
    ['#7bc94e', '#5a9e30', '#4a8e22'],  // 0 GRASS
    ['#c9b87a', '#a89858', '#907040'],  // 1 PATH
    ['#4a90d8', '#2a70b8', '#1a6098'],  // 2 WATER
    ['#3d6b22', '#2a4d18', '#1e3d10'],  // 3 TREE
    ['#f5e040', '#d0c030', '#c0b020'],  // 4 FLOWER
    ['#d4956a', '#b47548', '#a46538'],  // 5 EVENT (golden stone)
    ['#e8d4a0', '#c8b480', '#b8a468'],  // 6 SAND
    ['#c0a870', '#a08850', '#907840'],  // 7 BRIDGE
  ],

  // true = player can walk here
  TILE_WALKABLE: [true, true, false, false, true, true, true, true],

  MAP_ROWS: 22,
  MAP_COLS: 22,
};
