import { combineReducers } from "redux";
import system from "./systemRedux/reducer";
import bottom from "./bottomRedux/reducer";

export default combineReducers({
  system,
  bottom,
});
