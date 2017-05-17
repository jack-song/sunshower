/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, drawPiece, dropPiece }  from '../objects/Piece'
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

export default class extends Phaser.State {
  init () {
    const that = this;
    this.dimensions = {
      G_HEIGHT: that.game.height,
      G_WIDTH: that.game.width,
      L_HEIGHT: LHEIGHT,
      L_WIDTH: LWIDTH,
      SEC_ANGLE: 2*Math.PI/LWIDTH,
      // piece of radius, add one as visual buffer
      SEC_SIZE: (that.game.height/2)/(LHEIGHT+1),
      CENTER_X: this.world.centerX,
      CENTER_Y: this.world.centerY
    };
    this.pieces = [];
    this.basePiece = createPiece();
  }

  create () {
    const dims = this.dimensions;
    const background = this.game.add.sprite(this.world.centerX, this.world.centerY, generateBaseTexture(dims, game.add.graphics()));
    background.anchor.set(0.5);
    const pGraphics = game.add.graphics();

    const tick = () => {
      // move or lock pieces
      // for each piece, tick
      console.log("tick");
      pGraphics.clear();

      const newPieces = [];
      this.pieces.forEach((piece, index, array) => {
        // get the dropped piece
        let newPiece = dropPiece(piece);

        // replace the old dropped piece if new one is valid
        newPieces.push(newPiece);
        // draw the new piece
        drawPiece(newPiece, dims, pGraphics);
      });

      // update to new piece state
      this.pieces = newPieces;
    }

    const p = createPiece();
    p.add({x: 4, y: 7});
    p.add({x: 4, y: 8});
    p.add({x: 4, y: 6});
    p.add({x: 3, y: 6});
    this.pieces.push(p);

    this.tickEvent = this.game.time.events.loop(1000, tick, this);
  }

  render () {
    
  }

  update () {

  }
}
