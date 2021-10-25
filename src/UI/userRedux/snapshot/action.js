import * as actionType from "./actionType";

export function add(snapshot) {
  return {
    type: actionType.ADD,
    snapshot
  };
}

export function remove(code) {
  return {
    type: actionType.REMOVE,
    code
  };
}

export function update(code, snapshot) {
  return {
    type: actionType.UPDATE,
    snapshot,
    code
  };
}

export function clear() {
  return {
    type: actionType.CLEAR
  };
}
