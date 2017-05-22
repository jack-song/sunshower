import utils from '../utils'
import config from '../config'

const mod = (n, m) => {
  return ((n % m) + m) % m;
}

const PIECE_PROTOTYPE = {
  contains(lco) {
    if (!this.mask[lco.y]) {
      return false;
    }
    return this.mask[lco.y][lco.x];
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

const drawPiece = (piece, dims, graphics) => {
  if (piece.isEmpty()) {
    return;
  }

  // draw conections
  piece.points.forEach((element, index) => {
    if (element.y > dims.L_HEIGHT) {
      return;
    }
    // get screen positions
    const sco = utils.getScreenCoordinates(dims, element);

    graphics.lineStyle(1, piece.color);
    
    // draw radial line to next point
    if (element.y < dims.L_HEIGHT && piece.contains({x: element.x, y: element.y+1})) {
      graphics.beginFill();
      graphics.moveTo(sco.x, sco.y);
      const end = utils.getScreenCoordinates(dims, {x: element.x, y: element.y+1});
      graphics.lineTo(end.x, end.y);
      graphics.endFill();
    }
    // draw arc to next point
    const r = dims.SEC_RADII[element.y];
    const a = dims.SEC_ANGLES[element.x];
    const testX = mod(element.x+1,piece.MAX_X);
    if (piece.contains({x: testX, y: element.y})) {
      graphics.arc(dims.CENTER_X, dims.CENTER_Y, r, a, dims.SEC_ANGLES[testX], false);
    }

    // draw point
    graphics.lineStyle(0);

    graphics.beginFill(piece.color);
    // dot radius should fill 1/3 of the inner section it takes...
    graphics.drawCircle(sco.x, sco.y, (dims.SEC_SIZES[element.y]/3)*2);
    graphics.endFill();
  });
}

const createPiece = (points, max, color, root) => {
  const p = Object.create(PIECE_PROTOTYPE);

  p.points = [];

  // MASK IS Y:X CAUSE THAT WAY IS BETTER
  p.mask = {};
  p.root = root;

  points.forEach((point) => {
    // correct for x limits
    const real = {x: mod(point.x, max), y: point.y};

    p.points.push(real);

    // create new column if needed
    if(!p.mask[real.y]) {
      p.mask[real.y] = {};
    }
    p.mask[real.y][real.x] = true;
  });
  
  p.color = color || config.DEFAULT_PIECE_COLOR;
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

export { createPiece, drawPiece, dropPiece, mergePieces, shiftPiece, rotatePiece }
