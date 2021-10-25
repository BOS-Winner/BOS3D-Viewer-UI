/**
 * @class CptSearcher
 * @desc 构件搜索器，负责管理数据
 */
class CptSearcher {
  /**
   * @constructor
   * @param {object} props
   * @param {object} props.viewer3D - viewer3D实例
   */
  constructor(props) {
    this.viewer = props.viewer3D;
    this.cache = [];
    this.cacheAllCpts();
  }

  cacheAllCpts() {
    this.cache = [];
    const all = this.viewer.getComponentsByKey(this.viewer.getAllComponentsKey());
    all.forEach(obj => {
      const data = Object.values(obj)[0][0];
      const info = {
        name: `${data.name}[${data.originalId === 0 ? 0 : (data.originalId || '')}]`,
        type: data.type,
        componentKey: data.componentKey,
        allData: data,
      };
      this.cache.push(info);
    });
  }

  query(cond) {
    if (this.cache.length === 0) {
      this.cacheAllCpts();
    }
    const result = [];
    this.cache.forEach(obj => {
      if (
        // TODO 处理离线状态下条件的逻辑关系
        obj.name.toLowerCase().includes(cond.name)
        && obj.type.toLowerCase().includes(cond.type)
        && obj.componentKey.includes(cond.componentKey)
      ) {
        result.push(obj);
      }
    });
    return result;
  }
}

export default CptSearcher;
