/* globals __DEV__ */
import Phaser from 'phaser'
import { Piece }  from '../objects/Piece'
import utils from '../utils'

const LWIDTH = 24;
const LHEIGHT = 8;

export default class extends Phaser.State {
  init () {
    const that = this;
    this.dimensions = {
      gHeight: that.game.height,
      gWidth: that.game.width,
      lHeight: LHEIGHT,
      lWidth: LWIDTH,
      sectionAngle: 2*Math.PI/LWIDTH,
      // piece of radius, add one as visual buffer
      sectionSize: (that.game.height/2)/(LHEIGHT+1)
    };
    this.peices = [];
  }

  create () {
    const dims = this.dimensions;
    const graphics = game.add.graphics()

    const drawBaseGrid = () => {
      // bars
      graphics.lineStyle(1, 0x100900);
      for (let i = 0; i < dims.lWidth; i++) {
        graphics.beginFill();
        graphics.moveTo(this.world.centerX, this.world.centerY);
        const end = utils.convertToScreenCoordinates(dims, {x: i, y: 0});
        graphics.lineTo(end.x, end.y);
        graphics.endFill();
      }
      // concentric circles, empty
      graphics.moveTo(0, 0);
      graphics.beginFill(0, 0);
      for (let i = 1; i < dims.lHeight; i++) {
        const radius = i * dims.sectionSize;
        graphics.drawCircle(game.world.centerX, game.world.centerY, radius*2);
      }
      graphics.endFill();
      // "sun"
      graphics.beginFill(0xAAAA00);
      graphics.drawCircle(game.world.centerX, game.world.centerY, 6);
    }

    const tick = () => {
      // move or lock pieces
      // for each piece, tick
    }

    drawBaseGrid();

    this.tickEvent = this.game.time.events.loop(1000, tick, this)
  }

  render () {
    
  }

  update () {

  }
}
