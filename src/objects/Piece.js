import utils from '../utils'

const mod = (n, m) => {
        return ((n % m) + m) % m;
}

const PIECE_PROTOTYPE = {
  // add a point to the piece using coordinates
  add(lco) {
    // correct for x limits
    const real = {x: mod(lco.x, this.MAX_X), y: lco.y};

    if (this.contains(real)) {
      return;
    }

    this.points.push(real);

    // create new column if needed
    if(!this.mask[real.x]) {
      this.mask[real.x] = [];
    }

    this.mask[real.x][real.y] = true;
  },
  contains(lco) {
    if (!this.mask[lco.x]) {
      return false;
    }
    return this.mask[lco.x][lco.y];
  },
  getPoints() {
    return this.points;
  },
  isEmpty() {
    return this.points.length === 0;
  }
};

const dropPiece = (piece) => {
  const genPiece = createPiece(piece.MAX_X, piece.color);

  piece.points.forEach((element, index) => {
    genPiece.add({x: element.x, y: element.y-1});
  });

  return genPiece;
}

const shiftPiece = (piece, distance) => {
  const genPiece = createPiece(piece.MAX_X, piece.color);

  piece.points.forEach((element, index) => {
    genPiece.add({x: element.x+distance, y: element.y});
  });

  return genPiece;
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
    if (element.y < dims.L_HEIGHT && piece.mask[element.x][element.y+1]) {
      graphics.beginFill();
      graphics.moveTo(sco.x, sco.y);
      const end = utils.getScreenCoordinates(dims, {x: element.x, y: element.y+1});
      graphics.lineTo(end.x, end.y);
      graphics.endFill();
    }
    // draw arc to next point
    const r = utils.getScreenRadius(dims, element);
    const a = utils.getScreenAngle(dims, element);
    const testX = mod(element.x+1,piece.MAX_X);
    if (piece.mask[testX] && piece.mask[testX][element.y]) {
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

const createPiece = (max, color) => {
  const p = Object.create(PIECE_PROTOTYPE);

  p.mask = [];
  p.points = [];
  p.color = color || 0xFFFFDD;
  p.MAX_X = max;

  return p;
}

const mergePieces = (first, second) => {
  const genPiece = createPiece(first.MAX_X, first.color);

  first.points.forEach((element) => {
    genPiece.add({x: element.x, y: element.y});
  });

  second.points.forEach((element) => {
    genPiece.add({x: element.x, y: element.y});
  });

  return genPiece;
}

export { createPiece, drawPiece, dropPiece, mergePieces, shiftPiece }
