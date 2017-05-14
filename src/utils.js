
// dimensions, local coordinates
const convertToScreenCoordinates = (dim, lco) => {
  // radius is distance from top to point

  // toward center is higher, use subtraction to do the inversion
  // leave 1 height as a visual buffer
  // add 1 to y to account for visual buffer
  const sectionNumber = dim.lHeight-lco.y;
  const r = sectionNumber*dim.sectionSize;
  return {
    // add width and height /2 to center for polar drawing
    x: r*Math.cos(lco.x*dim.sectionAngle) + dim.gWidth/2,
    y: r*Math.sin(lco.x*dim.sectionAngle) + dim.gHeight/2
  }
}

export default { convertToScreenCoordinates }
