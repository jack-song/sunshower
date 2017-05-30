import config from './config'
import utils from './utils'

const getRowColor = (y) => {
  return y%2 === 0 ? config.GREY_COLOR : config.LIGHT_GREY_COLOR;
}

const generateBaseTexture = (dims, graphics) => {
  // bars
  graphics.lineStyle(1, config.LIGHT_GREY_COLOR);
  for (let i = 0; i < dims.L_WIDTH; i++) {
    graphics.beginFill();
    graphics.moveTo(0, 0);
    const end = utils.getScreenCoordinates(dims, {x: i, y: 0});
    graphics.lineTo(end.x, end.y);
    graphics.endFill();
  }
  // concentric circles, empty
  graphics.moveTo(0, 0);
  graphics.beginFill(0, 0);
  for (let i = 0; i < dims.L_HEIGHT; i++) {
    const radius = dims.SEC_RADII[i];
    graphics.lineStyle(1, getRowColor(i));
    
    graphics.drawCircle(0, 0, radius*2);
  }
  graphics.endFill();

  const tex = graphics.generateTexture()
  graphics.destroy();
  return tex;
}

const drawPiece = (piece, dims, graphics) => {
  if (piece.isEmpty()) {
    return;
  }
  
  graphics.lineStyle(0);

  // draw conections
  piece.points.forEach((element, index) => {
    if (element.y > dims.L_HEIGHT) {
      return;
    }
    // get screen positions
    const sco = utils.getScreenCoordinates(dims, element);
    graphics.lineStyle(2, piece.color);
    
    // draw radial line to next point
    if (element.y < dims.L_HEIGHT && piece.contains(element.x, element.y+1)) {
      graphics.beginFill();
      graphics.moveTo(sco.x, sco.y);
      const end = utils.getScreenCoordinates(dims, {x: element.x, y: element.y+1});
      graphics.lineTo(end.x, end.y);
      graphics.endFill();
    }

    // draw arc to next point
    const r = dims.SEC_RADII[element.y];
    const a = dims.SEC_ANGLES[utils.mod(element.x, dims.L_WIDTH)];
    if (piece.contains(element.x+1, element.y)) {
      graphics.arc(0, 0, r, a, a+dims.SEC_ANGLE, false);
    }
  });

  // draw points
  piece.points.forEach((element, index) => {
    if (element.y > dims.L_HEIGHT) {
      return;
    }
    // get screen positions
    const sco = utils.getScreenCoordinates(dims, element);
    graphics.lineStyle(2, piece.color);
    
    graphics.beginFill(element.color);
    // dot radius should fill 1/3 of the inner section it takes...
    const size = element.y < dims.L_HEIGHT ? (dims.SEC_SIZES[element.y]/3)*2 : (dims.SEC_SIZES[element.y-1]/3)*2;
    graphics.drawCircle(sco.x, sco.y, size);
    graphics.endFill();
  });
}

export default { generateBaseTexture, drawPiece }
