/* globals __DEV__ */
import Phaser from 'phaser'
import utils from '../utils'
import config from '../config'

export default class extends Phaser.State {
  create () {
    this.stage.backgroundColor = config.BACKGROUND_COLOR;
    utils.addMenuItem(30, "SunShower", -100, this);

    utils.addMenuItem(20, "Start", 0, this, () => {
      this.state.start('Game');
    });

    utils.addMenuItem(10, "Fill a circle of dots to clear them.\nUP to turn falling pieces.\nDOWN to speed them up.", 100, this);
  }
}
