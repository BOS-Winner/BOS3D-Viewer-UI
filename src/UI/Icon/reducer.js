import * as actionType from "./actionType";
import { modeMap } from "../constant";

const UNDO_MAX_LEN = 10;

export default function (state = {
  mode: "", // 当前模式，用来做模式切换（主要是用户提醒用）
  pointer: 0, // 操作历史指针
  history: [], // 操作历史队列
  mouseIcon: '', // 鼠标图标，一个模式下有不同小模式用这个调（直接传入模式名）
  componentInfoVisible: false,
  familyKey: '',
  modeStack: [],
}, action) {
  switch (action.type) {
    case actionType.CHANGE_MODE: {
      let currentMode = "";
      let currentModeStack = state.modeStack;
      switch (action.mode) {
        case modeMap.roamMode:
          // clear modeStack
          currentModeStack.length = 0;
          currentModeStack.push(modeMap.roamMode);
          currentMode = modeMap.roamMode;
          break;
        case modeMap.measureMode:
          if (!currentModeStack.includes(modeMap.sectionMode)) {
            currentModeStack.length = 0;
          }
          currentModeStack.push(modeMap.measureMode);
          currentModeStack = Array.from(new Set(currentModeStack));
          currentMode = modeMap.measureMode;
          break;
        case modeMap.sectionMode:
          if (
            !currentModeStack.includes(modeMap.measureMode)
            && !currentModeStack.includes(modeMap.pickByRectMode)
          ) {
            currentModeStack.length = 0;
          }
          currentModeStack.push(modeMap.sectionMode);
          currentModeStack = Array.from(new Set(currentModeStack));
          currentMode = modeMap.sectionMode;
          break;
        case modeMap.pickByRectMode:
          if (!currentModeStack.includes(modeMap.sectionMode)) {
            currentModeStack.length = 0;
          }
          currentModeStack.push(modeMap.pickByRectMode);
          currentModeStack = Array.from(new Set(currentModeStack));
          currentMode = modeMap.pickByRectMode;
          break;
        case "": // pop
          currentModeStack.pop();
          if (currentModeStack.length) {
            currentMode = currentModeStack[currentModeStack.length - 1];
          } else {
            currentMode = "";
          }
          break;
        case modeMap.exit:
          if (action.exitMode !== "") {
            currentModeStack = currentModeStack.filter(_mode => _mode !== action.exitMode);
            if (currentModeStack.length) {
              currentMode = currentModeStack[currentModeStack.length - 1];
            } else {
              currentMode = "";
            }
          } else {
            currentModeStack = currentModeStack.filter(_mode => _mode !== state.mode);
            if (currentModeStack.length) {
              currentMode = currentModeStack[currentModeStack.length - 1];
            } else {
              currentMode = "";
            }
          }
          break;
        default: // clear
          // clear mode
          currentModeStack.length = 0;
          currentMode = "";
          break;
      }
      return {
        ...state,
        mode: currentMode,
        mouseIcon: state.mouseIcon === "" ? currentMode : state.mouseIcon,
        modeStack: currentModeStack,
        // 切换到漫游模式要关闭构件信息
        componentInfoVisible: !(action.mode === "漫游模式") && state.componentInfoVisible,
      };
    }
    case actionType.UPDATE_LIST: {
      let pointer = state.pointer;
      const history = state.history.slice(state.history.length < UNDO_MAX_LEN ? 0 : 1, pointer);
      if (state.history.length === UNDO_MAX_LEN) {
        pointer -= 1;
      }
      history[pointer] = action.item;
      return {
        ...state,
        pointer: pointer + 1,
        history
      };
    }
    case actionType.MOVE_POINTER: {
      return {
        ...state,
        pointer: action.pointer
      };
    }
    case actionType.RESET_HISTORY: {
      return {
        ...state,
        pointer: 0,
        history: []
      };
    }
    case actionType.CHANGE_MOUSE_ICON: {
      return {
        ...state,
        mouseIcon: action.mouseIcon,
      };
    }
    case actionType.COMPONENT_INFO_VISIBLE: {
      return {
        ...state,
        componentInfoVisible: action.visible,
        familyKey: '', // 显示构件信息的时候取消显示部件族数据
      };
    }
    case actionType.FAMILY_INFO_VISIBLE: {
      return {
        ...state,
        familyKey: action.payload.cptKey,
        componentInfoVisible: false, // 显示部件族的时候，取消显示构件信息
      };
    }
    default:
      return state;
  }
}
