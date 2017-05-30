/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, dropPiece, mergePieces, shiftPiece, rotatePiece }  from '../objects/Piece'
import utils from '../utils'
import drawUtils from '../drawUtils'
import config from '../config'

export default class extends Phaser.State {
  init (mode) {
    const sectionSizeFudgeFactor = 0.2;
    // calculate section sizes
    // map radius, margin of 5% per side
    const trueRadius = (this.game.width*.9)/2;
    // save another 10% for fudging the center sections to be a bit larger
    const radiusFudge = trueRadius*sectionSizeFudgeFactor;
    const workingRadius = trueRadius-radiusFudge;
    const sectionFudge = radiusFudge/config.LHEIGHT;

    // treat final total radius as area under section curve:
    // (outerSectionSize * # of sections) / 2 = total radius
    const outerSectionSize = (workingRadius*2)/config.LHEIGHT;
    const slope = outerSectionSize/config.LHEIGHT;

    // array from logical y to the contained section size
    const sections = [];
    for (let y = config.LHEIGHT; y > 0; y--) {
      // -0.5 to account for integral approx. error
      sections.push((y-0.5)*slope + sectionFudge);
    }
    sections.push(0);

    // array from the logical y to the real radius
    const radii = [];
    let currRadius = trueRadius;
    for (let y = 0; y < sections.length; y++) {
      radii.push(currRadius);
      currRadius -= sections[y];
    }

    // array from the logical x to the polar angle
    const angles = [];
    const sectionAngle = 2*Math.PI/config.LWIDTH;
    for (let x = 0; x < config.LWIDTH; x++) {
      angles.push(x*sectionAngle);
    }

    this.dimensions = {
      G_HEIGHT: this.game.height,
      G_WIDTH: this.game.width,
      L_HEIGHT: config.LHEIGHT,
      L_WIDTH: config.LWIDTH,
      SEC_SIZES: sections,
      SEC_RADII: radii,
      SEC_ANGLES: angles,
      SEC_ANGLE: sectionAngle
    };
    this.pieces = [];
    this.landPiece = createPiece([], this.dimensions.L_WIDTH, config.DARK_GREY_COLOR);
    this.released = true;
    this.score = 0;
    this.gameOver = false;
    this.mode = mode;
    this.scoreText = this.add.text(40, 40, 0, utils.getStyle(20));

    const background = this.game.add.sprite(this.world.centerX, this.world.centerY, drawUtils.generateBaseTexture(this.dimensions, this.game.add.graphics()));
    background.anchor.set(0.5);
    this.lGraphics = this.game.add.graphics(this.world.centerX, this.world.centerY);
    this.graphics = this.game.add.graphics(this.world.centerX, this.world.centerY);

    this.clearBeforeRender = false;

    this.cooldown = -1;
    this.maxCooldown = config.START_COOLDOWN;
  }

  reDrawPieces () {
    this.graphics.clear();
    this.pieces.forEach((piece) => {
      drawUtils.drawPiece(piece, this.dimensions, this.graphics);
    });
  }

  reDrawLand() {
    this.lGraphics.clear();
    drawUtils.drawPiece(this.landPiece, this.dimensions, this.lGraphics);
  }

  checkClears () {
    const breakLand = (landPiece, dims) => {
      let drop = 0;
      const points = [];

      for (let y = 0; y <= dims.L_HEIGHT; y++) {
        if (landPiece.rowIsEmpty(y)) {
          break;
        }

        if (landPiece.rowHasEnough(y, dims.L_WIDTH)) {
          drop += 1;
        } else { // paste row into the new landPiece
          for (let x = 0; x < dims.L_WIDTH; x++) {
            if (landPiece.contains(x, y)) {
              points.push({x: x, y: y-drop, color: landPiece.getColor(x, y)});
            }
          }
        }
      }

      const newPiece = drop > 0 ? createPiece(points, dims.L_WIDTH) : null;

      return {piece: newPiece, score: drop};
    }

    const results = breakLand(this.landPiece, this.dimensions);

    if (results.score > 0) {
      this.landPiece = results.piece;
      this.score += results.score;
      this.scoreText.setText(this.score);
      const newDelay = this.tickEvent.delay * Math.pow(config.DIFFICULTY_RATE, results.score);
      this.tickEvent.delay = newDelay;

      if (this.mode === 0) {
        if (this.maxCooldown > 1) {
          this.maxCooldown = config.START_COOLDOWN - Math.floor(this.score/10);
        }
      }

      return true;
    }

    return false;
  }

  tick () {
    switch (this.mode) {
      case 1:
        if (this.pieces.length === 0)  {
          this.pieces.push(utils.spawnTetromino(this.dimensions.L_WIDTH, this.dimensions.L_HEIGHT+1));
        }
      break;

      default:
        if (this.cooldown < 0)  {
          this.pieces.push(utils.spawnSomino(this.dimensions.L_WIDTH, this.dimensions.L_HEIGHT+1));
          this.cooldown = this.maxCooldown;
        } else {
          this.cooldown--;
        }
      break;
    }

    let landed = false;

    const newPieces = [];
    this.pieces.forEach((piece) => {
      // get the dropped piece
      let dp = dropPiece(piece);

      if (utils.isLanded(dp, this.landPiece)) {
        console.log("start drop merge");
        this.landPiece = mergePieces(this.landPiece, piece);
        landed = true;
        console.log("finish drop merge");
      } else {
        // replace the old dropped piece if new one is valid
        newPieces.push(dp);
      }
    });
    // update to new piece state
    this.pieces = newPieces;
    this.reDrawPieces();

    const cleared = this.checkClears();
    if (cleared || landed) {
      this.reDrawLand();
    }

    if (this.isLoser()) {
      this.endGame();
    }
  }

  isLoser () {
    if (!this.landPiece.rowIsEmpty(this.dimensions.L_HEIGHT)) {
      return true;
    }
    return false;
  }

  create () {
    const rate = this.mode === 0 ? config.START_RATE-100 : config.START_RATE;
    this.tickEvent = this.game.time.events.loop(rate, this.tick, this);
  }

  endGame () {
    game.time.events.remove(this.tickEvent);
    this.gameOver = true;

    utils.addMenuItem(30, ` Score: ${this.score} `, -100, this);
    utils.addMenuItem(20, " Restart ", 0, this, () => {
      this.state.start('Game', true, false, this.mode);
    });
  }

  update () {
    if (this.gameOver) {
      return;
    }

    const shiftLandPiece = (shift) => {
      // check for any collisions with new land
      let foundCollision = true;
      let landed = false;
      let shiftedLand;

      // if any collisions, repeat collision detection with new land
      while (foundCollision) {
        const newPieces = [];
        shiftedLand = shiftPiece(this.landPiece, shift);
        foundCollision = false;
        
        this.pieces.forEach((piece) => {
          // either merge or keep the piece as is
          if (utils.isLanded(piece, shiftedLand)) {
            console.log("start shift merge");
            foundCollision = true;
            this.landPiece = mergePieces(this.landPiece, piece);
            landed = true;
            console.log("end shift merge");
          } else {
            newPieces.push(piece);
          }
        });

        if(foundCollision) {
          this.pieces = newPieces;
        }
      }

      // redraw the merged land to tween
      this.reDrawLand();
      if (landed) {
        this.reDrawPieces();
      }

      // update state immediately, visual update waits for tween
      this.landPiece = shiftedLand;
      this.checkClears();

      if (this.isLoser()) {
        this.endGame();
      }

      // tween the shift
      const tween = this.add.tween(this.lGraphics).to( { rotation: shift*this.dimensions.SEC_ANGLE }, 40, Phaser.Easing.Linear.None, true);
      tween.onComplete.add(() => {
        this.lGraphics.rotation = 0; // reset the animated rotation
        this.reDrawLand();
      }, this);
    }

    const rotatePieces = (clockwise) => {
      const newPieces = [];

      this.pieces.forEach((piece) => {
        const rp = rotatePiece(piece, clockwise);

        if (!utils.isLanded(rp, this.landPiece)) {
          newPieces.push(rp);
        } else {
          newPieces.push(piece);
        }
      });

      this.pieces = newPieces;
      this.reDrawPieces();
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      if (this.released) {
        shiftLandPiece(1);
        this.released = false;
      }

    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      if (this.released) {
        shiftLandPiece(-1);
        this.released = false;
      }

    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      if (this.released) {
        this.tick();
        this.released = false;
      }
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      if (this.released) {
        rotatePieces(false);
        this.released = false;
      }
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.ONE)) {
      if (this.released) {
        rotatePieces(true);
        this.released = false;
      }
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.R)) {
      if (this.released) {
        this.state.start('Game', true,  false, this.mode);
      }
    } else {
      this.released = true;
    }
  }
}
