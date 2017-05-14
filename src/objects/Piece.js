export function Piece (board, p = {}) {
  // keep reference to board mask so we don't have to check all other pieces
  p.board = board;

  // set of logical coordinates to define points
  p.points = {};

  return p;
}

Piece.prototype = {
  // merge 2 pieces into 1
  merge: function (other) {

  },
  // cause the piece to drop
  drop: function () {

  },
  // add a point to the piece using coordinates
  add: function (lco) {
    
  },
  // draw onto phaser graphics object
  draw: function (pGraphics) {

  }

};
