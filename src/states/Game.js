/* globals __DEV__ */
import Phaser from 'phaser'
import { Piece }  from '../objects/Piece'
import utils from '../utils'

const LWIDTH = 24;
const LHEIGHT = 8;

export default class extends Phaser.State {
  init () {
    let that = this;
    this.dimensions = {
      gHeight: that.game.height,
      gWidth: that.game.width,
      lHeight: LHEIGHT,
      lWidth: LWIDTH,
      sectionAngle: 2*Math.PI/LWIDTH,
      // piece of radius, add one as visual buffer
      sectionSize: (that.game.height/2)/(LHEIGHT+1)
    }
  }
  preload () {}

  create () {
    // const bannerText = 'SunShower'
    // let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    // banner.font = 'Julius Sans One'
    // banner.padding.set(10, 16)
    // banner.fontSize = 50
    // banner.fill = 'white'
    // banner.anchor.setTo(0.5)
    let dims = this.dimensions;
    let graphics = game.add.graphics()

    let drawBaseGrid = () => {
      // bars
      graphics.lineStyle(1, 0x100900);
      for (let i = 0; i < dims.lWidth; i++) {
        graphics.beginFill();
        graphics.moveTo(this.world.centerX, this.world.centerY);
        let end = utils.convertToScreenCoordinates(dims, {x: i, y: 0});
        graphics.lineTo(end.x, end.y);
        graphics.endFill();
      }
      // concentric circles, empty
      graphics.moveTo(0, 0);
      graphics.beginFill(0, 0);
      for (let i = 1; i < dims.lHeight; i++) {
        let radius = i * dims.sectionSize;
        graphics.drawCircle(game.world.centerX, game.world.centerY, radius*2);
      }
      graphics.endFill();
      // "sun"
      graphics.beginFill(0xAAAA00);
      graphics.drawCircle(game.world.centerX, game.world.centerY, 6);
    }

    drawBaseGrid();   

    var tick = () => {
      // move or lock pieces
      // for each piece, tick
    }

    this.tickEvent = this.game.time.events.loop(1000, tick, this)
  }

  render () {
    
  }

  update () {

  }
}
