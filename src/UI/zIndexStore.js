/**
 * @class ZIndexStore
 * @description 全局z-index协调器，用与协调模态框的覆盖次序
 */
class ZIndexStore {
  constructor() {
    this.max = 0;
    this.zIndex = {};
  }

  addZIndex(k) {
    if (this.zIndex[k] !== this.max) {
      this.max += 1;
      this.zIndex[k] = this.max;
    }
    return this.max;
  }
}

export default new ZIndexStore();
