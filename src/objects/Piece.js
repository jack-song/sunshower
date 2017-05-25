import utils from '../utils'
import config from '../config'

const PIECE_PROTOTYPE = {
  contains(lco) {
    if (!this.mask[lco.y]) {
      return false;
    }
    return this.mask[lco.y][utils.mod(lco.x, this.MAX_X)];
  },
  getPoints() {
    return this.points;
  },
  isEmpty() {
    return this.points.length === 0;
  },
  rowIsEmpty(row) {
    if (!this.mask[row]) {
      return true;
    }
    return Object.keys(this.mask[row]).length === 0;
  },
  rowHasEnough(row, length) {
    if (!this.mask[row]) {
      return false;
    }
    return Object.keys(this.mask[row]).length >= length;
  }
};

const dropPiece = (piece) => {
  const points = [];

  piece.points.forEach((element, index) => {
    points.push({x: element.x, y: element.y-1});
  });

  let root = null;
  if (piece.root) {
    root = {x: piece.root.x, y: piece.root.y-1};
  }

  return createPiece(points, piece.MAX_X, piece.color, root);
}

const shiftPiece = (piece, distance) => {
  const points = [];

  piece.points.forEach((element, index) => {
    points.push({x: element.x+distance, y: element.y});
  });

  let root = null;
  if (piece.root) {
    root = {x: piece.root.x+distance, y: piece.root.y};
  }

  return createPiece(points, piece.MAX_X, piece.color, root);
}

// assume we always go clockwise
const rotatePiece = (piece) => {
  if (!piece.root) {
    return piece;
  }

  const points = [];
  piece.getPoints().forEach((point) => {
    const dx = point.x - piece.root.x;
    const dy = point.y - piece.root.y;
    points.push({x: piece.root.x + dy, y: piece.root.y - dx});
  });

  return createPiece(points, piece.MAX_X, piece.color, piece.root);
}

const createPiece = (points, max, color, root) => {
  const p = Object.create(PIECE_PROTOTYPE);

  p.points = [];

  // MASK IS Y:X CAUSE THAT WAY IS BETTER
  p.mask = {};
  p.root = root;

  points.forEach((point) => {
    p.points.push(point);

    // create new column if needed
    if(!p.mask[point.y]) {
      p.mask[point.y] = {};
    }
    // mask must be correct for x limits
    p.mask[point.y][utils.mod(point.x, max)] = true;
  });
  
  p.color = color || null;
  p.MAX_X = max;

  return p;
}

const mergePieces = (first, second) => {
  const points = [];

  first.points.forEach((element) => {
    points.push({x: element.x, y: element.y});
  });

  second.points.forEach((element) => {
    points.push({x: element.x, y: element.y});
  });

  return createPiece(points, first.MAX_X, first.color, first.root);
}

export { createPiece, dropPiece, mergePieces, shiftPiece, rotatePiece }