import utils from '../utils'

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
    return this.mask[row].length === 0;
  },
  rowHasEnough(row, length) {
    if (!this.mask[row]) {
      return false;
    }
    return this.mask[row].length >= length;
  }
};

const dropPiece = (piece) => {
  const points = [];

  piece.points.forEach((element, index) => {
    points.push({x: element.x, y: element.y-1});
  });

  return createPiece(points, piece.MAX_X, piece.color);
}

const shiftPiece = (piece, distance) => {
  const points = [];

  piece.points.forEach((element, index) => {
    points.push({x: element.x+distance, y: element.y});
  });

  return createPiece(points, piece.MAX_X, piece.color);
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
    const r = utils.getScreenRadius(dims, element.y);
    const a = utils.getScreenAngle(dims, element);
    const testX = mod(element.x+1,piece.MAX_X);
    if (piece.contains({x: testX, y: element.y})) {
      graphics.arc(dims.CENTER_X, dims.CENTER_Y, r, a, a+dims.SEC_ANGLE, false);
    }

    // draw point
    graphics.lineStyle(0);
    // get size of circle, higher is smaller
    const size = 22 - element.y*2;

    graphics.beginFill(piece.color);
    graphics.drawCircle(sco.x, sco.y, size);
    graphics.endFill();
  });
}

const createPiece = (points, max, color) => {
  const p = Object.create(PIECE_PROTOTYPE);

  p.points = [];

  // MASK IS Y:X CAUSE THAT WAY IS BETTER
  p.mask = {};

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
  
  p.color = color || 0xFFFFDD;
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

  return createPiece(points, first.MAX_X, first.color);
}

export { createPiece, drawPiece, dropPiece, mergePieces, shiftPiece }
