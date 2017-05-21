/* globals __DEV__ */
import Phaser from 'phaser'
import utils from '../utils'

const BACKGROUND_COLOR = '#f9f6f2';

export default class extends Phaser.State {
  create () {
    this.stage.backgroundColor = BACKGROUND_COLOR;
    utils.addMenuItem(30, "SunShower", -100, this);

    utils.addMenuItem(20, "Start", 0, this, () => {
      this.state.start('Game');
    });
  }
}
