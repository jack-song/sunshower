/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, drawPiece }  from '../objects/Piece'
import utils from '../utils'

const LWIDTH = 24;
const LHEIGHT = 8;

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
  }

  create () {
    const dims = this.dimensions;
    const graphics = game.add.graphics()

    const drawBaseGrid = () => {
      // bars
      graphics.lineStyle(1, 0x202000);
      for (let i = 0; i < dims.L_WIDTH; i++) {
        graphics.beginFill();
        graphics.moveTo(this.world.centerX, this.world.centerY);
        const end = utils.getScreenCoordinates(dims, {x: i, y: 0});
        graphics.lineTo(end.x, end.y);
        graphics.endFill();
      }
      // concentric circles, empty
      graphics.moveTo(0, 0);
      graphics.beginFill(0, 0);
      for (let i = 1; i < dims.L_HEIGHT; i++) {
        const radius = i * dims.SEC_SIZE;
        graphics.drawCircle(game.world.centerX, game.world.centerY, radius*2);
      }
      graphics.endFill();
      // "sun"
      graphics.beginFill(0xEEEE00);
      graphics.drawCircle(game.world.centerX, game.world.centerY, 8);
    }

    const tick = () => {
      // move or lock pieces
      // for each piece, tick
    }

    drawBaseGrid();

    const p = createPiece(dims.L_WIDTH);
    p.add({x: 4, y: 5});
    p.add({x: 4, y: 6});
    p.add({x: 4, y: 4});
    p.add({x: 3, y: 4});
    drawPiece(p, dims, graphics);

    this.tickEvent = this.game.time.events.loop(1000, tick, this)
  }

  render () {
    
  }

  update () {

  }
}
