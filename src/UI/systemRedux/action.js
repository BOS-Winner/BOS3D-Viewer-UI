import * as actionType from "./actionType";

/**
 * 保存模型信息到reducer
 */
export function updateModelDetail(payload) {
  return {
    type: actionType.UPDATE_MODEL_DETAIL,
    payload
  };
}
