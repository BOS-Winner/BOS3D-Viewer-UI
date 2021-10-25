import * as actionType from "./actionType";

const UNDO_MAX_LEN = 10;

export default function (state = {
  mode: "", // 当前模式，用来做模式切换（主要是用户提醒用）
  pointer: 0, // 操作历史指针
  history: [], // 操作历史队列
  mouseIcon: '', // 鼠标图标，一个模式下有不同小模式用这个调（直接传入模式名）
  componentInfoVisible: false,
  familyKey: '',
}, action) {
  switch (action.type) {
    case actionType.CHANGE_MODE: {
      return {
        ...state,
        mode: action.mode,
        mouseIcon: action.mode,
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
