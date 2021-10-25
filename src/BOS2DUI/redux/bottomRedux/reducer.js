import * as actionType from "./actionType";

export default function (state = {
  mode: '',
  showSetting: false,
  showCptInfo: false,
  showLayerSwitcher: false,
  showAnnotationList: false,
  annotationEditor: {
    show: false,
    data: undefined,
  },
  layerList: [],
}, action) {
  switch (action.type) {
    case actionType.CHANGE_MODE:
      return {
        ...state,
        mode: action.mode,
      };
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
    default:
      return state;
  }
}
