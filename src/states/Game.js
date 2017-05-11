/* globals __DEV__ */
import Phaser from 'phaser'
import Piece  from '../objects/Piece'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    const bannerText = 'SunShower'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Julius Sans One'
    banner.padding.set(10, 16)
    banner.fontSize = 50
    banner.fill = 'white'
    banner.smoothed = false
    banner.anchor.setTo(0.5)

    this.mushroom = new Piece({
      game: this,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'mushroom'
    })

    this.game.add.existing(this.mushroom)
  }

  render () {
    
  }
}
