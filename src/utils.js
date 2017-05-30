import config from './config'
import { createPiece }  from './objects/Piece'

const getStyle = (size) => {
  return { font: '' + size + 'pt Courier New', fill: config.MENU_ITEM_COLOR, backgroundColor: "#f9f6f2"};
}

const mod = (n, m) => {
  return ((n % m) + m) % m;
}

// dimensions, local coordinates
const getScreenCoordinates = (dims, lco) => {
  const r = dims.SEC_RADII[lco.y];
  const a = dims.SEC_ANGLES[mod(lco.x, dims.L_WIDTH)];
  return {
    x: r*Math.cos(a),
    y: r*Math.sin(a)
  }
}

const rand = (upper) => {
  return Math.floor(Math.random()*upper);
}

const addMenuItem = (size, content, relativePosition, state, clickFunction) => {
    const style = getStyle(size);
    const item = state.add.text(state.world.centerX, state.world.centerY + relativePosition, content, style);
    item.anchor.x = 0.5;
    item.anchor.y = 0.5
    item.lineSpacing = -7;

    if (clickFunction) {
      item.inputEnabled = true;
      item.events.onInputUp.add(clickFunction);
      item.events.onInputOver.add(function (target) {
              target.fill = config.MENU_ITEM_HOVER_COLOR;
      });
      item.events.onInputOut.add(function (target) {
              target.fill = config.MENU_ITEM_COLOR;
      });
    }
}

const spawnTetromino = (max, y) => {
  let points;
  let canRotate = true;
  const x = rand(max);

  const color = config.ACCENT_COLORS[rand(config.ACCENT_COLORS.length)];

  switch (rand(7)) {
    case 0: // I
      points = [{x: x+1, y: y, color: color},
                {x: x+2, y: y, color: color},
                {x: x-1, y: y, color: color}];
      break;
    case 1: // J
      points = [{x: x+1, y: y, color: color},
                {x: x-1, y: y, color: color},
                {x: x-1, y: y+1, color: color}];
      break;
    case 2: // L
      points = [{x: x+1, y: y, color: color},
                {x: x-1, y: y, color: color},
                {x: x+1, y: y+1, color: color}];
      break;
    case 3: // O
      points = [{x: x+1, y: y, color: color},
                {x: x, y: y+1, color: color},
                {x: x+1, y: y+1, color: color}];
      canRotate = false;
      break;
    case 4: // S 
      points = [{x: x-1, y: y, color: color},
                {x: x, y: y+1, color: color},
                {x: x+1, y: y+1, color: color}];
      break;
    case 5: // T
      points = [{x: x+1, y: y, color: color},
                {x: x-1, y: y, color: color},
                {x: x, y: y+1, color: color}];
      break;
    default: // Z
      points = [{x: x+1, y: y, color: color},
                {x: x, y: y+1, color: color},
                {x: x-1, y: y+1, color: color}];
      break;
  }

  const root = {x: x, y: y, color: color};
  points.push(root);

  return createPiece(points, max, color, canRotate ? root : null);
}

const spawnSomino = (max, y) => {
  let points;
  let canRotate = true;
  const x = rand(max);

  const color = config.ACCENT_COLORS[rand(config.ACCENT_COLORS.length)];

  switch (rand(5)) {
    case 0: // I
      points = [{x: x+1, y: y, color: color},
                {x: x-1, y: y, color: color}];
      break;
    case 1: // J
      points = [{x: x+1, y: y, color: color},
                {x: x, y: y+1, color: color}];
      break;
    case 2: // L
      points = [{x: x-1, y: y, color: color},
                {x: x, y: y+1, color: color}];
      break;
    case 3: // O
      points = [{x: x+1, y: y, color: color},
                {x: x, y: y+1, color: color},
                {x: x+1, y: y+1, color: color}];
      canRotate = false;
      break;
    default: // :
      points = [{x: x+1, y: y, color: color}];
      break;
  }

  const root = {x: x, y: y, color: color};
  points.push(root);

  return createPiece(points, max, color, canRotate ? root : null);
}

const isLanded = (piece, landPiece) => {
  const points = piece.getPoints();
  for(let i = 0; i < points.length; i++) {
    if (points[i].y < 0) {
      return true;
    }

    if (landPiece.contains(points[i].x, points[i].y)) {
      return true;
    }
  }

  return false;
}

export default { getScreenCoordinates, rand, addMenuItem, mod, getStyle, spawnSomino, spawnTetromino, isLanded }
