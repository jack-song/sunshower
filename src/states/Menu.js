/* globals __DEV__ */
import Phaser from 'phaser'
import utils from '../utils'
import config from '../config'

export default class extends Phaser.State {
  create () {
    this.stage.backgroundColor = config.BACKGROUND_COLOR;
    utils.addMenuItem(30, "SunShower v0.1", -100, this);

    utils.addMenuItem(20, "Start", 0, this, () => {
      this.state.start('Game');
    });

    utils.addMenuItem(10, `Fill a circle of dots to clear them.\n
UP to turn falling pieces.\n
DOWN to speed them up.\n
LEFT RIGHT to move settled pieces.`, 100, this);
  }
}
