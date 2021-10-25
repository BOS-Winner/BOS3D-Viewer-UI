import _ from "lodash-es";
import * as actionType from "./actionType";

/*
 * TODO:
 * 原本是用来与外部用户进行交互的redux状态转换
 * 改为eventEmitter传递后这个其实已经用不上了，可以去掉
 * 为了方便，这个暂时留着，以后可以去掉
 */
export default function (state = {
  shotList: []
}, action) {
  switch (action.type) {
    case actionType.ADD:
      return {
        ...state,
        shotList: [...state.shotList, action.snapshot]
      };
    case actionType.REMOVE: {
      const list = [...state.shotList];
      list.splice(_.findIndex(list, { code: action.code }), 1);
      return {
        ...state,
        shotList: list
      };
    }
    case actionType.UPDATE: {
      const list = [...state.shotList];
      list.some((l, index) => {
        if (l.code === action.code) {
          list[index] = {
            ...list[index],
            ...action.snapshot,
          };
          return true;
        }
        return false;
      });
      return {
        ...state,
        shotList: list
      };
    }
    case actionType.CLEAR: {
      return {
        ...state,
        shotList: []
      };
    }
    default:
      return state;
  }
}
