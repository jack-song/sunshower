/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, drawPiece, dropPiece, mergePieces, shiftPiece, rotatePiece }  from '../objects/Piece'
import utils from '../utils'

const LWIDTH = 12;
const LHEIGHT = 14;

const COOLDOWN = 7;
const START_RATE = 1000;

// 0xeee8d5
const LINE_COLOR = 0xe5e3e0;
const PIECE_COLORS = [0xb58900, 0xcb4b16, 0xdc322f, 0xd33682, 0x6c71c4, 0x268bd2, 0x859900];

const generateBaseTexture = (dims, graphics) => {
  // bars
  graphics.lineStyle(1, LINE_COLOR);
  for (let i = 0; i < dims.L_WIDTH; i++) {
    graphics.beginFill();
    graphics.moveTo(dims.CENTER_X, dims.CENTER_Y);
    const end = utils.getScreenCoordinates(dims, {x: i, y: 0});
    graphics.lineTo(end.x, end.y);
    graphics.endFill();
  }
  // concentric circles, empty
  graphics.moveTo(0, 0);
  graphics.beginFill(0, 0);
  for (let i = 0; i < dims.L_HEIGHT; i++) {
    const radius = utils.getScreenRadius(dims, i);
    graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, radius*2)
  }
  graphics.endFill();

  const tex = graphics.generateTexture()
  graphics.destroy();
  return tex;
}

const spawnTetromino = (max, lco) => {
  let points;
  let canRotate = true;

  switch (utils.rand(7)) {
    case 0: // I
      points = [{x: lco.x+1, y: lco.y},
                {x: lco.x+2, y: lco.y},
                {x: lco.x-1, y: lco.y}];
      break;
    case 1: // J
      points = [{x: lco.x+1, y: lco.y},
                {x: lco.x-1, y: lco.y},
                {x: lco.x-1, y: lco.y+1}];
      break;
    case 2: // L
      points = [{x: lco.x+1, y: lco.y},
                {x: lco.x-1, y: lco.y},
                {x: lco.x+1, y: lco.y+1}];
      break;
    case 3: // O
      points = [{x: lco.x+1, y: lco.y},
                {x: lco.x, y: lco.y+1},
                {x: lco.x+1, y: lco.y+1}];
      canRotate = false;
      break;
    case 4: // S 
      points = [{x: lco.x-1, y: lco.y},
                {x: lco.x, y: lco.y+1},
                {x: lco.x+1, y: lco.y+1}];
      break;
    case 5: // T
      points = [{x: lco.x+1, y: lco.y},
                {x: lco.x-1, y: lco.y},
                {x: lco.x, y: lco.y+1}];
      break;
    default: // Z
      points = [{x: lco.x+1, y: lco.y},
                {x: lco.x, y: lco.y+1},
                {x: lco.x-1, y: lco.y+1}];
      break;
  }

  points.push(lco);

  return createPiece(points, max, PIECE_COLORS[utils.rand(PIECE_COLORS.length)], canRotate ? lco : null);
}

const isLanded = (piece, landPiece) => {
  const points = piece.getPoints();
  for(let i = 0; i < points.length; i++) {
    if (points[i].y < 0) {
      return true;
    }

    if (landPiece.contains(points[i])) {
      return true;
    }
  }

  return false;
}

export default class extends Phaser.State {
  init () {
    this.dimensions = {
      G_HEIGHT: this.game.height,
      G_WIDTH: this.game.width,
      L_HEIGHT: LHEIGHT,
      L_WIDTH: LWIDTH,
      SEC_ANGLE: 2*Math.PI/LWIDTH,
      // piece of radius, add one as visual buffer
      SEC_SIZE: (this.game.height/2)/(LHEIGHT+1),
      CENTER_X: this.world.centerX,
      CENTER_Y: this.world.centerY
    };
    this.pieces = [];
    this.landPiece = createPiece([], this.dimensions.L_WIDTH);
    this.released = true;
    this.score = 0;
    this.gameOver = false;

    const background = this.game.add.sprite(this.world.centerX, this.world.centerY, generateBaseTexture(this.dimensions, this.game.add.graphics()));
    background.anchor.set(0.5);
    this.pGraphics = this.game.add.graphics();
    this.lGraphics = this.game.add.graphics();
    this.generateCooldown = -1;
  }

  reDraw () {
    this.pGraphics.clear();
    this.pieces.forEach((piece) => {
      drawPiece(piece, this.dimensions, this.pGraphics);
    });

    this.lGraphics.clear();
    drawPiece(this.landPiece, this.dimensions, this.lGraphics);
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
            if (landPiece.contains({x: x, y: y})) {
              points.push({x: x, y: y-drop});
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
      const newDelay = this.tickEvent.delay * Math.pow(0.8, results.score);
      this.tickEvent.delay = newDelay;
    }
  }

  tick () {
    // never a dull moment
    if ((this.generateCooldown < 0 && utils.rand(2) === 0) 
          || this.pieces.length === 0)  {
      this.pieces.push(spawnTetromino(this.dimensions.L_WIDTH, {x: utils.rand(this.dimensions.L_WIDTH), y: this.dimensions.L_HEIGHT+1}));
      this.generateCooldown = COOLDOWN;
    } else {
      this.generateCooldown -= 1;
    }

    const newPieces = [];
    this.pieces.forEach((piece, index, array) => {
      // get the dropped piece
      let dp = dropPiece(piece);

      if (isLanded(dp, this.landPiece)) {
        this.landPiece = mergePieces(this.landPiece, piece);
      } else {
        // replace the old dropped piece if new one is valid
        newPieces.push(dp);
      }
    });
    // update to new piece state
    this.pieces = newPieces;

    this.checkClears();
    this.reDraw();

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
    this.tickEvent = this.game.time.events.loop(START_RATE, this.tick, this);
  }

  endGame () {
    game.time.events.remove(this.tickEvent);
    this.gameOver = true;

    utils.addMenuItem(30, "Score: " + this.score, -100, this);
    utils.addMenuItem(20, "Restart", 0, this, () => {
      this.state.start('Game');
    });
  }

  update () {
    if (this.gameOver) {
      return;
    }

    const shiftLandPiece = (shift) => {
      // check for any collisions with new land
      let foundCollision = true;
      let newLand;

      // if any collisions, repeat collision detection with new land
      while (foundCollision) {
        const newPieces = [];
        newLand = shiftPiece(this.landPiece, shift);
        foundCollision = false;
        
        this.pieces.forEach((piece) => {
          // either merge or keep the piece as is
          if (isLanded(piece, newLand)) {
            foundCollision = true;
            this.landPiece = mergePieces(this.landPiece, piece);
          } else {
            newPieces.push(piece);
          }
        });

        this.pieces = newPieces;
      }

      this.landPiece = newLand;
      this.checkClears();
      this.reDraw();

      if (this.isLoser()) {
        this.endGame();
      }
    }

    const rotatePieces = () => {
      const newPieces = [];

      this.pieces.forEach((piece) => {
        const rp = rotatePiece(piece);

        if (!isLanded(rp, this.landPiece)) {
          newPieces.push(rp);
        } else {
          newPieces.push(piece);
        }
      });

      this.pieces = newPieces;
      this.reDraw();
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
        rotatePieces();
        this.released = false;
      }
    } else {
      this.released = true;
    }
  }
}
