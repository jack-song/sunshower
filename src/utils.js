const MENU_ITEM_COLOR = '#000000';
const MENU_ITEM_HOVER_COLOR = '#073642';

const getScreenAngle = (dims, lco) => {
  return lco.x*dims.SEC_ANGLE;
}

const getScreenRadius = (dims, y) => {
  if (y === dims.L_HEIGHT) {
    return 0;
  }
  // radius is distance from top to point
  // toward center is higher, use subtraction to do the inversion
  const sectionNumber = dims.L_HEIGHT-y;
  // smaller towards the center
  return sectionNumber*(dims.SEC_SIZE - y*2);
}

// dimensions, local coordinates
const getScreenCoordinates = (dims, lco) => {
  const r = getScreenRadius(dims, lco.y);
  const a = getScreenAngle(dims, lco);
  return {
    // add width and height /2 to center for polar drawing
    x: r*Math.cos(a) + dims.G_WIDTH/2,
    y: r*Math.sin(a) + dims.G_HEIGHT/2
  }
}

const rand = (upper) => {
  return Math.floor(Math.random()*upper);
}

const addMenuItem = (size, content, relativePosition, state, clickFunction) => {
    const style = { font: '' + size + 'pt Courier New', fill: MENU_ITEM_COLOR};
    const item = state.add.text(state.world.centerX, state.world.centerY + relativePosition, content, style);
    item.anchor.x = 0.5;
    item.anchor.y = 0.5;

    if (clickFunction) {
      item.inputEnabled = true;
      item.events.onInputUp.add(clickFunction);
      item.events.onInputOver.add(function (target) {
              target.fill = MENU_ITEM_HOVER_COLOR;
      });
      item.events.onInputOut.add(function (target) {
              target.fill = MENU_ITEM_COLOR;
      });
    }
}

export default { getScreenCoordinates, getScreenRadius, getScreenAngle, rand, addMenuItem }
