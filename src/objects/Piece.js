import utils from '../utils'

const PIECE_PROTOTYPE = {
  // add a point to the piece using coordinates
  add: function (lco) {
    this.points.push(lco);
    this.mask[lco.x][lco.y] = true;
  },
  isTaken: (lco) => {
    // implement warp around
    let x  = lco.x;
    if (x === MAX_X) {
      x = 0;
    }

    return this.mask[x][lco.y];
  }
};

const drawPiece = (piece, dims, graphics) => {
  // draw conections
  piece.points.forEach((element, index) => {
    // get screen positions
    const sco = utils.getScreenCoordinates(dims, element);

    graphics.lineStyle(2, piece.color);

    // draw radial line to next point
    if (piece.mask[element.x][element.y+1]) {
      graphics.beginFill();
      graphics.moveTo(sco.x, sco.y);
      const end = utils.getScreenCoordinates(dims, {x: element.x, y: element.y+1});
      graphics.lineTo(end.x, end.y);
      graphics.endFill();
    }
    // draw arc to next point
    const r = utils.getScreenRadius(dims, element);
    const a = utils.getScreenAngle(dims, element);
    if (piece.mask[element.x+1][element.y]) {
      graphics.arc(dims.CENTER_X, dims.CENTER_Y, r, a, a+dims.SEC_ANGLE, false);
    }

    // draw point
    graphics.lineStyle(0);
    // get size of circle, higher is smaller
    const size = 30 - element.y*3;

    graphics.beginFill(piece.color);
    graphics.drawCircle(sco.x, sco.y, size);
    graphics.endFill();
  });
}

const createPiece = (MAX_X) => {
  const p = Object.create(PIECE_PROTOTYPE);

  // for quick existance checks
  p.mask = [];
  for (let i=0;i<MAX_X;i++) {
     p.mask[i] = [];
  }

  p.points = [];

  // color is generated randomly in bounds
  p.color = 0xAAAAAA;
  p.MAX_X = MAX_X;

  return p;
}

export { createPiece, drawPiece }
