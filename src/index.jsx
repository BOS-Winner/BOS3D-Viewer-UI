import "formdata-polyfill";
import Viewer3DUI from './UI';

/*
function BOS3DUI(props) {
  return new Viewer3DUI(props);
}
 */

window.BOS3DUI = Viewer3DUI;

const BOS3DUI = Viewer3DUI;

export default BOS3DUI;
