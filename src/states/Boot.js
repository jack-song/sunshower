import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = 'black'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Julius Sans One']
      },
      active: this.fontsLoaded
    })

    const text = this.add.text(this.world.centerX, this.world.centerY, 'loading', { font: '16px courier', fill: 'white', align: 'center' })
    text.anchor.setTo(0.5, 0.5)
  }

  render () {
    if (this.fontsReady) {
      this.state.start('Splash')
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
