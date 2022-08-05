import * as actionType from "./actionType";

/**
 * 改变当前UI模式
 * @param {string} mode - 模式名称
 * @return {{mode: string, type: string}}
 */
export function changeMode(mode, exitMode = "") {
  return {
    type: actionType.CHANGE_MODE,
    mode,
    exitMode,
  };
}

/**
 * 更新操作列表
 * @param {object} obj - 操作数据，包括key和操作名称，其他必需数据
 * @param {string} obj.type - 操作类型（方法）: hide, wireframe, isolate, colorful
 * @param {string} obj.name - 名称
 * @param {string[]} obj.keys - 操作的构件key数组
 * @param {number} [obj.color] - 构件改变的颜色
 * @return {{item: object, type: string}}
 */
export function updateList(obj) {
  return {
    type: actionType.UPDATE_LIST,
    item: obj
  };
}

/**
 * 移动操作列表尾指针
 * @param {number} pointer - 新的指针位置
 * @return {{pointer: number, type: string}}
 */
export function movePointer(pointer) {
  return {
    type: actionType.MOVE_POINTER,
    pointer
  };
}

/**
 * 重设操作历史
 * @return {{type: string}}
 */
export function resetHistory() {
  return {
    type: actionType.RESET_HISTORY
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

/**
 * 构件信息是否显示
 * @param visible
 * @return {{visible: boolean, type: string}}
 */
export function setComponentInfoVisible(visible) {
  return {
    type: actionType.COMPONENT_INFO_VISIBLE,
    visible
  };
}

/**
 * 部件族信息是否显示
 * @param {object} payload 部件族信息显示的参数
 */
export function setFamilyInfoVisible(payload) {
  return {
    type: actionType.FAMILY_INFO_VISIBLE,
    payload
  };
}
