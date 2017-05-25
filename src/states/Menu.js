/* globals __DEV__ */
import Phaser from 'phaser'
import utils from '../utils'
import config from '../config'

export default class extends Phaser.State {
  create () {
    game.forceSingleUpdate = true;
    game.renderer.renderSession.roundPixels = true;
    this.stage.backgroundColor = config.BACKGROUND_COLOR;
    utils.addMenuItem(30, "\"It's Like Tetris\"", -100, this);

    utils.addMenuItem(20, "Start newschool", 0, this, () => {
      this.state.start('Game', true, false, 0);
    });
    utils.addMenuItem(20, "Start oldschool", 40, this, () => {
      this.state.start('Game', true, false, 1);
    });

    utils.addMenuItem(10, `Fill a circle of dots to clear them.\n
UP to turn falling pieces.\n
DOWN to speed them up.\n
LEFT RIGHT to move locked pieces.\n
R to restart.\n
v0.5`, 170, this);
  }
}
