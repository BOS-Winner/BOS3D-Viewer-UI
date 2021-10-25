/**
 * 判断是否是竖屏
 * @return {boolean}
 */
export function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches;
  /*
  let angle = 0;
  if (screen.orientation) {
    angle = screen.orientation.angle;
  } else {
    angle = window.orientation;
  }
  return (angle === 90 || angle === -90);
   */
}
