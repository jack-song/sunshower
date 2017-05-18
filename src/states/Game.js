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
  for (let i = 1; i < dims.L_HEIGHT; i++) {
    const radius = i * dims.SEC_SIZE;
    graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, radius*2);
  }
  graphics.endFill();
  // "sun"
  graphics.beginFill(0xEEEE00);
  graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, 8);

  const tex = graphics.generateTexture();
  graphics.destroy();
  return tex;
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

    const tick = () => {
      // move or lock pieces
      // for each piece, tick
      console.log("tick");
      pGraphics.clear();

      const newPieces = [];
      state.pieces.forEach((piece, index, array) => {
        // get the dropped piece
        let np = dropPiece(piece);

        if (isLanded(np, state.landPiece)) {
          state.landPiece = mergePieces(piece, state.landPiece);
        } else {
          // replace the old dropped piece if new one is valid
          newPieces.push(np);
          // draw the new piece
          drawPiece(np, dims, pGraphics);
        }
      });

      // draw the land piece
      drawPiece(state.landPiece, dims, pGraphics);

      // update to new piece state
      state.pieces = newPieces;
    }

    const p = createPiece();
    p.add({x: 4, y: 7});
    p.add({x: 4, y: 8});
    p.add({x: 4, y: 6});
    p.add({x: 3, y: 6});
    state.pieces.push(p);

    state.tickEvent = state.game.time.events.loop(1000, tick, state);
  }

  render () {
    
  }

  update () {

  }
}
