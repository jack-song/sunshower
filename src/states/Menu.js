/* globals __DEV__ */
import Phaser from 'phaser'

export default class extends Phaser.State {
  create () {
    const titleStyle = { font: '50pt Julius Sans One', fill: 'white'};
    const title = this.add.text(this.world.centerX, this.world.centerY - 100, 'SunShower', titleStyle);
    title.anchor.x = 0.5;
    title.anchor.y = 0.5;

    const optionStyle = { font: '20pt Julius Sans One', fill: 'white'};

    const startBtn = this.add.text(this.world.centerX, this.world.centerY, 'Start', optionStyle);
    startBtn.inputEnabled = true;
    startBtn.anchor.x = 0.5;
    startBtn.anchor.y = 0.5;
    startBtn.events.onInputUp.add(() => { 
      this.state.start('Game');
    });
    startBtn.events.onInputOver.add(function (target) {
            target.fill = "#AAAA00";
    });
    startBtn.events.onInputOut.add(function (target) {
            target.fill = "white";
    });
  }
}
