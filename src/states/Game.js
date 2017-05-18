/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, drawPiece, dropPiece, mergePieces }  from '../objects/Piece'
import utils from '../utils'

const LWIDTH = 24;
const LHEIGHT = 8;

const generateBaseTexture = (dims, graphics) => {
  // bars
  graphics.lineStyle(1, 0x121200);
  for (let i = 0; i < dims.L_WIDTH; i++) {
    graphics.beginFill();
    graphics.moveTo(dims.CENTER_X, dims.CENTER_Y);
    const end = utils.getScreenCoordinates(dims, {x: i, y: 0});
    graphics.lineTo(end.x, end.y);
    graphics.endFill();
  }
  // concentric circles, empty
  graphics.moveTo(0, 0);
  graphics.beginFill(0, 0);
  for (let i = 1; i <= dims.L_HEIGHT; i++) {
    const radius = i * dims.SEC_SIZE;
    graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, radius*2)
  }
  graphics.endFill();
  // "sun"
  graphics.beginFill(0xFFFFDD);
  graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, 4);

  const tex = graphics.generateTexture()
  graphics.destroy();
  return tex;
}

const spawnTetromino = (lco) => {
  const r = utils.rand(255);
  const g = utils.rand(255);
  let b;
  if (r < 100 || g < 100) {
    b = utils.rand(155) + 100;
  } else {
    b = utils.rand(50);
  }

  const piece = createPiece(Phaser.Color.getColor(r, g, b));
  // place the root point
  piece.add(lco);

  switch (utils.rand(7)) {
    case 0: // I
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x+2, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      break;
    case 1: // J
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y+1});
      break;
    case 2: // L
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x+1, y: lco.y+1});
      break;
    case 3: // O
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      piece.add({x: lco.x+1, y: lco.y+1});
      break;
    case 4: // S 
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      piece.add({x: lco.x+1, y: lco.y+1});
      break;
    case 5: // T
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      break;
    default: // Z
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      piece.add({x: lco.x-1, y: lco.y+1});
      break;
  }

  return piece;
}

const isLanded = (piece, landPiece) => {
  const points = piece.getPoints();
  for(let i = 0; i < points.length; i++) {
    if (points[i].y < 0) {
      return true;
    }

    if (landPiece.contains(points[i])) {
      return true;
    }
  }

  return false;
}

export default class extends Phaser.State {
  init () {
    this.dimensions = {
      G_HEIGHT: this.game.height,
      G_WIDTH: this.game.width,
      L_HEIGHT: LHEIGHT,
      L_WIDTH: LWIDTH,
      SEC_ANGLE: 2*Math.PI/LWIDTH,
      // piece of radius, add one as visual buffer
      SEC_SIZE: (this.game.height/2)/(LHEIGHT+1),
      CENTER_X: this.world.centerX,
      CENTER_Y: this.world.centerY
    };
    this.pieces = [];
    this.landPiece = createPiece();
  }

  create () {
    const state = this;
    const dims = state.dimensions;
    const background = state.game.add.sprite(state.world.centerX, state.world.centerY, generateBaseTexture(dims, game.add.graphics()));
    background.anchor.set(0.5);
    const pGraphics = game.add.graphics();
    let canGenerate = true;

    const tick = () => {
      // 1/5 chance of generating a new piece every tick
      if (canGenerate && utils.rand(2) === 0)  {
        state.pieces.push(spawnTetromino({x: utils.rand(dims.L_WIDTH), y: dims.L_HEIGHT+1}));
        canGenerate = false;
      } else {
        canGenerate = true;
      }

      // clear pieces
      pGraphics.clear();

      const newPieces = [];
      state.pieces.forEach((piece, index, array) => {
        // get the dropped piece
        let np = dropPiece(piece);

        if (isLanded(np, state.landPiece)) {
          state.landPiece = mergePieces(state.landPiece, piece);
          state.landPiece.correct(dims.L_WIDTH)
        } else {
          // replace the old dropped piece if new one is valid
          newPieces.push(np);
          np.correct(dims.L_WIDTH);
          // draw the new piece
          drawPiece(np, dims, pGraphics);
        }
      });

      // draw the land piece
      drawPiece(state.landPiece, dims, pGraphics);

      // update to new piece state
      state.pieces = newPieces;
    }

    state.tickEvent = state.game.time.events.loop(1000, tick, state);
  }

  render () {
    
  }

  update () {

  }
}
