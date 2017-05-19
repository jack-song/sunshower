/* globals __DEV__ */
import Phaser from 'phaser'
import { createPiece, drawPiece, dropPiece, mergePieces, shiftPiece }  from '../objects/Piece'
import utils from '../utils'

const LWIDTH = 20;
const LHEIGHT = 10;

const generateBaseTexture = (dims, graphics) => {
  // bars
  graphics.lineStyle(1, 0x202000);
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
  for (let i = 1; i <= dims.L_HEIGHT; i++) {
    const radius = i * dims.SEC_SIZE;
    graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, radius*2)
  }
  graphics.endFill();
  // "sun"
  graphics.beginFill(0xFFFFDD);
  graphics.drawCircle(dims.CENTER_X, dims.CENTER_Y, 4);

  const tex = graphics.generateTexture()
  graphics.destroy();
  return tex;
}

const spawnTetromino = (max, lco) => {
  const r = utils.rand(255);
  const g = utils.rand(255);
  let b;
  if (r < 100 || g < 100) {
    b = utils.rand(155) + 100;
  } else {
    b = utils.rand(50);
  }

  const piece = createPiece(max, Phaser.Color.getColor(r, g, b));
  // place the root point
  piece.add(lco);

  switch (utils.rand(7)) {
    case 0: // I
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x+2, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      break;
    case 1: // J
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y+1});
      break;
    case 2: // L
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x+1, y: lco.y+1});
      break;
    case 3: // O
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      piece.add({x: lco.x+1, y: lco.y+1});
      break;
    case 4: // S 
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      piece.add({x: lco.x+1, y: lco.y+1});
      break;
    case 5: // T
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x-1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      break;
    default: // Z
      piece.add({x: lco.x+1, y: lco.y});
      piece.add({x: lco.x, y: lco.y+1});
      piece.add({x: lco.x-1, y: lco.y+1});
      break;
  }

  return piece;
}

const reDraw = (landPiece, lGraphics, pieces, pGraphics, dims) => {
  pGraphics.clear();
  pieces.forEach((piece, index, array) => {
    drawPiece(piece, dims, pGraphics);
  });

  lGraphics.clear();
  drawPiece(landPiece, dims, lGraphics);
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

const breakLand = (landPiece, dims) => {
  let drop = 0;
  const newLand = createPiece(dims.L_WIDTH);

  for (let y = 0; y < dims.L_HEIGHT; y++) {
    let foundGap = false;
    let empty = true;
    for (let x = 0; x < dims.L_WIDTH; x++) {
      if (landPiece.contains({x: x, y: y})) {
        empty = false;
      } else {
        foundGap = true;
      }
    }

    if (empty) {
      break;
    }

    if (!foundGap) {
      drop += 1;
    } else { // paste row into the new landPiece
      for (let x = 0; x < dims.L_WIDTH; x++) {
        if (landPiece.contains({x: x, y: y})) {
          newLand.add({x: x, y: y-drop});
        }
      }
    }
  }

  return newLand;
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
    this.landPiece = createPiece(this.dimensions.L_WIDTH);
    this.released = true;

    const background = this.game.add.sprite(this.world.centerX, this.world.centerY, generateBaseTexture(this.dimensions, this.game.add.graphics()));
    background.anchor.set(0.5);
    this.pGraphics = this.game.add.graphics();
    this.lGraphics = this.game.add.graphics();
    this.generateCooldown = -1;
  }

  tick () {
    if (this.generateCooldown < 0 && utils.rand(2) === 0)  {
      this.pieces.push(spawnTetromino(this.dimensions.L_WIDTH, {x: utils.rand(this.dimensions.L_WIDTH), y: this.dimensions.L_HEIGHT+1}));
      this.generateCooldown = 3;
    } else {
      this.generateCooldown -= 1;
    }

    const newPieces = [];
    this.pieces.forEach((piece, index, array) => {
      // get the dropped piece
      let np = dropPiece(piece);

      if (isLanded(np, this.landPiece)) {
        this.landPiece = mergePieces(this.landPiece, piece);
      } else {
        // replace the old dropped piece if new one is valid
        newPieces.push(np);
      }
    });
    // update to new piece state
    this.pieces = newPieces;

    this.landPiece = breakLand(this.landPiece, this.dimensions);
    reDraw(this.landPiece, this.lGraphics, this.pieces, this.pGraphics, this.dimensions);
  }

  create () {
    this.tickEvent = this.game.time.events.loop(1000, this.tick, this);
  }

  update () {
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
          let pieceCollides = false;
          const points = piece.getPoints();

          // check if piece collides with the landPiece
          for (let i = 0; i < points.length; i++) {
            if (newLand.contains(points[i])) {
              pieceCollides = true;
              break;
            }
          }

          // either merge or keep the piece as is
          if (pieceCollides) {
            foundCollision = true;
            this.landPiece = mergePieces(this.landPiece, piece);
          } else {
            newPieces.push(piece);
          }
        });

        this.pieces = newPieces;
      }

      this.landPiece = newLand;
      this.landPiece = breakLand(this.landPiece, this.dimensions);
      reDraw(this.landPiece, this.lGraphics, this.pieces, this.pGraphics, this.dimensions);
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
    } else {
      this.released = true;
    }
  }
}
