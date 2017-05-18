const getScreenAngle = (dims, lco) => {
  return lco.x*dims.SEC_ANGLE;
}

const getScreenRadius = (dims, lco) => {
  // radius is distance from top to point
  // toward center is higher, use subtraction to do the inversion
  const sectionNumber = dims.L_HEIGHT-lco.y;
  return sectionNumber*dims.SEC_SIZE;
}

// dimensions, local coordinates
const getScreenCoordinates = (dims, lco) => {
  const r = getScreenRadius(dims, lco);
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

export default { getScreenCoordinates, getScreenRadius, getScreenAngle, rand }
