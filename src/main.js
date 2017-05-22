import 'pixi'
import 'p2'
import Phaser from 'phaser'

import MenuState from './states/Menu'
import GameState from './states/Game'

class Game extends Phaser.Game {
  constructor () {
    const docElement = document.documentElement
    // 20 is a fudge factor to prevent weird scroll stuff
    const size = Math.min(docElement.clientWidth, docElement.clientHeight-20);

    super(size, size, Phaser.CANVAS, 'content', null)

    this.state.add('Menu', MenuState, false)
    this.state.add('Game', GameState, false)

    this.state.start('Menu')
  }
}

window.game = new Game()
