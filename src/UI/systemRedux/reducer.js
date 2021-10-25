import * as actionType from "./actionType";

export default function (state = {
  model: {}, //  模型信息
}, action) {
  switch (action.type) {
    case actionType.UPDATE_MODEL_DETAIL: {
      return {
        ...state,
        model: action.payload || {},
      };
    }
    default:
      return state;
  }
}
