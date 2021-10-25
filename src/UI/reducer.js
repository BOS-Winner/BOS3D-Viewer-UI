import { combineReducers } from "redux";
import button from "./Icon/reducer";
import snapshot from "./userRedux/snapshot/reducer";
import system from "./systemRedux/reducer";
import userSetting from "./userRedux/userSetting/reducer";

export default combineReducers({
  button,
  snapshot,
  system,
  userSetting,
});
