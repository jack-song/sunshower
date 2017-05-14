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

    let graphics = this.add.graphics()

    // draw base grid
    graphics.lineStyle(1, 0x090909);
    for (var i = 0; i < this.dimensions.lWidth; i++) {
      graphics.beginFill();
      graphics.moveTo(this.world.centerX, this.world.centerY);
      let end = utils.convertToScreenCoordinates(this.dimensions, {x: i, y: 0});
      graphics.lineTo(end.x, end.y);
      graphics.endFill();
    }
    
    // set a fill and line style
    graphics.moveTo(this.world.centerX, this.world.centerY);
    graphics.beginFill(0xFF3300);
    let tc1 = utils.convertToScreenCoordinates(this.dimensions, {x: 1, y: 0});
    let tc2 = utils.convertToScreenCoordinates(this.dimensions, {x: 6, y: 0});
    let tc3 = utils.convertToScreenCoordinates(this.dimensions, {x: 0, y: 0});
    graphics.drawCircle(tc1.x, tc1.y, 10);
    graphics.drawCircle(tc2.x, tc2.y, 10);
    graphics.drawCircle(tc3.x, tc3.y, 10);
    graphics.endFill();
    
    

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
