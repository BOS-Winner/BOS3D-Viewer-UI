import * as actionType from "./actionType";

export function changeMode(mode) {
  return {
    type: actionType.CHANGE_MODE,
    mode,
  };
}

/**
 * 修改鼠标图标
 * @param mouseIcon
 * @return {{mouseIcon: *, type: string}}
 */
export function changeMouseIcon(mouseIcon) {
  return {
    type: actionType.CHANGE_MOUSE_ICON,
    mouseIcon,
  };
}

export function showSetting(show) {
  return {
    type: actionType.SHOW_SETTING,
    show,
  };
}

export function showCptInfo(show) {
  return {
    type: actionType.SHOW_CPTINFO,
    show,
  };
}

export function showLayerSwitcher(show) {
  return {
    type: actionType.SHOW_LAYER_SWITCHER,
    show,
  };
}

export function updateLayerList(layers) {
  return {
    type: actionType.UPDATE_LAYER_LIST,
    layers,
  };
}

/**
 * 打开或隐藏批注面板
 * @param {boolean} show - 是否显示
 * @return {{show: boolean, type: string}}
 */
export function showAnnotationList(show) {
  return {
    type: actionType.SHOW_ANNOTATION_LIST,
    show,
  };
}

/**
 * 打开或隐藏批注编辑器
 * @param {boolean} show - 是否显示
 * @param {object} [data] - 是否使用指定预设数据
 * @return {{show: boolean, type: string, data:object}}
 */
export function showAnnotationEditor(show, data) {
  return {
    type: actionType.SHOW_ANNOTATION_EDITOR,
    show,
    data,
  };
}

export function updateDrawlist(data) {
  return {
    type: actionType.UPDATE_LAYER_LIST,
    data,
  };
}

export function updateDrawKey(key) {
  return {
    type: actionType.UPDATA_DRAW_KEY,
    key,
  };
}

export function updateViewKey(key) {
  return {
    type: actionType.UPDATE_VIEW_KEY,
    key,
  };
}
