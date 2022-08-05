import * as actionType from "./actionType";
import { DEFAULT_DISPLAY, DEFAULT_CAMERA, DEFAULT_TOOL } from "../../constant";

export default function (state = {
  customToolState: {},
  toolState: DEFAULT_TOOL,
  displaySetting: DEFAULT_DISPLAY,
  cameraSetting: DEFAULT_CAMERA,
  modelSetting: {}, // {[modelKey]: {basePoint: []}}
  bestView: false,
}, action) {
  switch (action.type) {
    case actionType.CHANGE_TOOLBAR_STATE:
      return {
        ...state,
        toolState: {
          ...state.toolState,
          [action.name]: action.enable,
        }
      };
    case actionType.SET_CUSTOMTOOLSTATE:
      return {
        ...state,
        customToolState: action.customToolState
      };
    case actionType.SET_TOOLBAR_STATE:
      return {
        ...state,
        toolState: action.toolState,
      };
    case actionType.CHANGE_DISPLAY_SETTING:
      if (typeof action.value !== "undefined") {
        return {
          ...state,
          displaySetting: {
            ...state.displaySetting,
            [action.name]: action.value,
          }
        };
      } else {
        return state;
      }
    case actionType.CHANGE_CAMERA_SETTING:
      if (typeof action.value !== "undefined") {
        return {
          ...state,
          cameraSetting: {
            ...state.cameraSetting,
            [action.name]: action.value,
          }
        };
      } else {
        return state;
      }
    case actionType.CHANGE_MODEL_SETTING:
      return {
        ...state,
        modelSetting: {
          ...state.modelSetting,
          [action.modelKey]: {
            ...state.modelSetting[action.modelKey],
            [action.name]: action.value,
          },
        }
      };
    case actionType.CHANGE_BEST_VIEW:
      return {
        ...state,
        bestView: action.visible
      };
    case actionType.RESTORE_SETTING:
      // 暂不支持恢复模型设置
      switch (action.settingType) {
        case 'display':
          return {
            ...state,
            displaySetting: DEFAULT_DISPLAY,
          };
        case 'camera':
          return {
            ...state,
            cameraSetting: DEFAULT_CAMERA,
          };
        case 'toolbar':
          return {
            ...state,
            toolState: Object.keys(state.customToolState).length
              ? state.customToolState : DEFAULT_TOOL,
          };
        default:
          return state;
      }
    case actionType.SET_SETTING: {
      const newState = {};
      // eslint-disable-next-line compat/compat
      Object.assign(newState, state, action.setting);
      return newState;
    }
    default:
      return state;
  }
}
