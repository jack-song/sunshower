import config from './config'

const getStyle = (size) => {
  return { font: '' + size + 'pt Courier New', fill: config.MENU_ITEM_COLOR, backgroundColor: "#f9f6f2"};
}

const mod = (n, m) => {
  return ((n % m) + m) % m;
}

// dimensions, local coordinates
const getScreenCoordinates = (dims, lco) => {
  const r = dims.SEC_RADII[lco.y];
  const a = dims.SEC_ANGLES[mod(lco.x, dims.L_WIDTH)];
  return {
    x: r*Math.cos(a),
    y: r*Math.sin(a)
  }
}

const rand = (upper) => {
  return Math.floor(Math.random()*upper);
}

const addMenuItem = (size, content, relativePosition, state, clickFunction) => {
    const style = getStyle(size);
    const item = state.add.text(state.world.centerX, state.world.centerY + relativePosition, content, style);
    item.anchor.x = 0.5;
    item.anchor.y = 0.5
    item.lineSpacing = -7;

    if (clickFunction) {
      item.inputEnabled = true;
      item.events.onInputUp.add(clickFunction);
      item.events.onInputOver.add(function (target) {
              target.fill = config.MENU_ITEM_HOVER_COLOR;
      });
      item.events.onInputOut.add(function (target) {
              target.fill = config.MENU_ITEM_COLOR;
      });
    }
}

export default { getScreenCoordinates, rand, addMenuItem, mod, getStyle }
