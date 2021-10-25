import { EVENT } from "../constant";

const factory = eventEmitter => ({
  addIconToBottom: (position, dom) => {
    eventEmitter.emit(EVENT.addIconToBottom, dom);
  },
  /**
   * 添加自定义菜单
   * @param {object} option
   * @param {string} option.name - name
   * @param {boolean} option.isMore - 是否把自定义的菜单放到更多里面
   * @param {function} option.onClick - onClick事件
   */
  addContextMenu: option => {
    eventEmitter.emit(EVENT.addContextMenu, option);
  },
});

export default factory;
