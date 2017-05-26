/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, dropPiece, mergePieces, shiftPiece, rotatePiece }  from '../objects/Piece'
import utils from '../utils'
import config from '../config'

const getRowColor = (y) => {
  return y%2 === 0 ? config.GREY_COLOR : config.LIGHT_GREY_COLOR;
}

const generateBaseTexture = (dims, graphics) => {
  // bars
  graphics.lineStyle(1, config.LIGHT_GREY_COLOR);
  for (let i = 0; i < dims.L_WIDTH; i++) {
    graphics.beginFill();
    graphics.moveTo(0, 0);
    const end = utils.getScreenCoordinates(dims, {x: i, y: 0});
    graphics.lineTo(end.x, end.y);
    graphics.endFill();
  }
  // concentric circles, empty
  graphics.moveTo(0, 0);
  graphics.beginFill(0, 0);
  for (let i = 0; i < dims.L_HEIGHT; i++) {
    const radius = dims.SEC_RADII[i];
    graphics.lineStyle(1, getRowColor(i));
    
    graphics.drawCircle(0, 0, radius*2);
  }
  graphics.endFill();

  const tex = graphics.generateTexture()
  graphics.destroy();
  return tex;
}

const drawPiece = (piece, dims, graphics) => {
  if (piece.isEmpty()) {
    return;
  }
  
  graphics.lineStyle(0);

  // draw conections
  piece.points.forEach((element, index) => {
    if (element.y > dims.L_HEIGHT) {
      return;
    }
    // get screen positions
    const sco = utils.getScreenCoordinates(dims, element);
    graphics.lineStyle(2, piece.color);
    
    // draw radial line to next point
    if (element.y < dims.L_HEIGHT && piece.contains(element.x, element.y+1)) {
      graphics.beginFill();
      graphics.moveTo(sco.x, sco.y);
      const end = utils.getScreenCoordinates(dims, {x: element.x, y: element.y+1});
      graphics.lineTo(end.x, end.y);
      graphics.endFill();
    }

    // draw arc to next point
    const r = dims.SEC_RADII[element.y];
    const a = dims.SEC_ANGLES[utils.mod(element.x, dims.L_WIDTH)];
    if (piece.contains(element.x+1, element.y)) {
      graphics.arc(0, 0, r, a, a+dims.SEC_ANGLE, false);
    }
  });

  // draw points
  piece.points.forEach((element, index) => {
    if (element.y > dims.L_HEIGHT) {
      return;
    }
    // get screen positions
    const sco = utils.getScreenCoordinates(dims, element);
    graphics.lineStyle(2, piece.color);
    
    graphics.beginFill(element.color);
    // dot radius should fill 1/3 of the inner section it takes...
    const size = element.y < dims.L_HEIGHT ? (dims.SEC_SIZES[element.y]/3)*2 : (dims.SEC_SIZES[element.y-1]/3)*2;
    graphics.drawCircle(sco.x, sco.y, size);
    graphics.endFill();
  });
}

const spawnTetromino = (max, lco) => {
  let points;
  let canRotate = true;

  lco.color = config.ACCENT_COLORS[utils.rand(config.ACCENT_COLORS.length)];

  switch (utils.rand(7)) {
    case 0: // I
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x+2, y: lco.y, color: lco.color},
                {x: lco.x-1, y: lco.y, color: lco.color}];
      break;
    case 1: // J
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x-1, y: lco.y, color: lco.color},
                {x: lco.x-1, y: lco.y+1, color: lco.color}];
      break;
    case 2: // L
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x-1, y: lco.y, color: lco.color},
                {x: lco.x+1, y: lco.y+1, color: lco.color}];
      break;
    case 3: // O
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color},
                {x: lco.x+1, y: lco.y+1, color: lco.color}];
      canRotate = false;
      break;
    case 4: // S 
      points = [{x: lco.x-1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color},
                {x: lco.x+1, y: lco.y+1, color: lco.color}];
      break;
    case 5: // T
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x-1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color}];
      break;
    default: // Z
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color},
                {x: lco.x-1, y: lco.y+1, color: lco.color}];
      break;
  }

  points.push(lco);

  return createPiece(points, max, lco.color, canRotate ? lco : null);
}

const spawnSomino = (max, lco) => {
  let points;
  let canRotate = true;

  lco.color = config.ACCENT_COLORS[utils.rand(config.ACCENT_COLORS.length)];

  switch (utils.rand(5)) {
    case 0: // I
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x-1, y: lco.y, color: lco.color}];
      break;
    case 1: // J
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color}];
      break;
    case 2: // L
      points = [{x: lco.x-1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color}];
      break;
    case 3: // O
      points = [{x: lco.x+1, y: lco.y, color: lco.color},
                {x: lco.x, y: lco.y+1, color: lco.color},
                {x: lco.x+1, y: lco.y+1, color: lco.color}];
      canRotate = false;
      break;
    default: // :
      points = [{x: lco.x+1, y: lco.y, color: lco.color}];
      break;
  }

  points.push(lco);

  return createPiece(points, max, lco.color, canRotate ? lco : null);
}

const isLanded = (piece, landPiece) => {
  const points = piece.getPoints();
  for(let i = 0; i < points.length; i++) {
    if (points[i].y < 0) {
      return true;
    }

    if (landPiece.contains(points[i].x, points[i].y)) {
      return true;
    }
  }

  return false;
}

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

    const background = this.game.add.sprite(this.world.centerX, this.world.centerY, generateBaseTexture(this.dimensions, this.game.add.graphics()));
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
      drawPiece(piece, this.dimensions, this.graphics);
    });
  }

  reDrawLand() {
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
          this.pieces.push(spawnTetromino(this.dimensions.L_WIDTH, {x: utils.rand(this.dimensions.L_WIDTH), y: this.dimensions.L_HEIGHT+1}));
        }
      break;

      default:
        if (this.cooldown < 0)  {
          this.pieces.push(spawnSomino(this.dimensions.L_WIDTH, {x: utils.rand(this.dimensions.L_WIDTH), y: this.dimensions.L_HEIGHT+1}));
          this.cooldown = this.maxCooldown;
        } else {
          this.cooldown--;
        }
      break;
    }

    let landed = false;

    const newPieces = [];
    this.pieces.forEach((piece, index, array) => {
      // get the dropped piece
      let dp = dropPiece(piece);

      if (isLanded(dp, this.landPiece)) {
        this.landPiece = mergePieces(this.landPiece, piece);
        landed = true;
      } else {
        // replace the old dropped piece if new one is valid
        newPieces.push(dp);
      }
    });
    // update to new piece state
    this.pieces = newPieces;

    const cleared = this.checkClears();
    this.reDrawPieces();

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
            landed = true;
          } else {
            newPieces.push(piece);
          }
        });

        this.pieces = newPieces;
      }

      this.reDrawLand();
      // tween the shift
      // generate new land bitmap, pre-shift
      const tween = this.add.tween(this.lGraphics).to( { rotation: shift*this.dimensions.SEC_ANGLE }, 40, Phaser.Easing.Linear.None, true);
      tween.onComplete.add(() => {
        this.landPiece = newLand;
        this.checkClears();
        this.lGraphics.rotation = 0; // reset the animated rotation
        this.reDrawLand();

        if (this.isLoser()) {
          this.endGame();
        }
      }, this);
      

      if (landed) {
        this.reDrawPieces();
      }      
    }

    const rotatePieces = (clockwise) => {
      const newPieces = [];

      this.pieces.forEach((piece) => {
        const rp = rotatePiece(piece, clockwise);

        if (!isLanded(rp, this.landPiece)) {
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
