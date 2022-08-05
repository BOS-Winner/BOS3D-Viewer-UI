import * as actionType from "./actionType";

export default function (state = {
  mode: '',
  showSetting: false,
  showCptInfo: false,
  showLayerSwitcher: false,
  showAnnotationList: false,
  mouseIcon: '', // 鼠标图标，一个模式下有不同小模式用这个调（直接传入模式名）
  annotationEditor: {
    show: false,
    data: undefined,
  },
  layerList: [],
  drawList: [],
  drawKey: '',
  viewKey: '',
}, action) {
  switch (action.type) {
    case actionType.CHANGE_MODE:
      return {
        ...state,
        mode: action.mode,
      };
    case actionType.CHANGE_MOUSE_ICON: {
      return {
        ...state,
        mouseIcon: action.mouseIcon,
      };
    }
    case actionType.SHOW_SETTING:
      return {
        ...state,
        showSetting: action.show,
      };
    case actionType.SHOW_CPTINFO:
      return {
        ...state,
        showCptInfo: action.show
      };
    case actionType.SHOW_LAYER_SWITCHER:
      return {
        ...state,
        showLayerSwitcher: action.show,
      };
    case actionType.UPDATE_LAYER_LIST:
      return {
        ...state,
        layerList: action.layers,
      };
    case actionType.SHOW_ANNOTATION_LIST:
      return {
        ...state,
        showAnnotationList: action.show,
      };
    case actionType.SHOW_ANNOTATION_EDITOR:
      return {
        ...state,
        annotationEditor: {
          show: action.show,
          data: action.data,
        }
      };
    case actionType.UPDATE_DRAW_LIST:
      return {
        ...state,
        drawList: action.data
      };
    case actionType.UPDATA_DRAW_KEY:
      return {
        ...state,
        drawKey: action.key,
      };
    case actionType.UPDATE_VIEW_KEY:
      return {
        ...state,
        viewKey: action.key,
      };
    default:
      return state;
  }
}
