/**
 * @Author: 岳晨飞
 * @Date:   2021-11-27 13:59:35
 * @Last Modified by:   岳晨飞
 * @Last Modified time: 2021-11-29 10:10:35
 */
/* eslint-disable compat/compat */
import _ from "lodash-es";

class Server {
  constructor({ viewer }) {
    this.viewer = viewer;
    this.allModelKeys = viewer.getViewerImpl().getAllBimModelsKey();
    this.models = this.allModelKeys.map(_key => viewer.getViewerImpl().getModel(_key));
    this.model = this.models && Object.values(this.models)[0];
    this.modelKey = this.model.modelKey;
    this.url = _.get(this.model, "dataUrl.serverUrl") || viewer.host;
    this.projectKey = this.model.projectKey;
    this.auth = this.model.accessToken || "";
    this.share = this.model?.shareKey || "";
  }

  /**
   * 获取最佳视角的相机信息
   * @param {string} modelKey 模型Key 默认为当前场景中第一个模型的 key
   * @param {boolean} [redo=false] 是否重新计算
   * @param {number} [scheme=1] 选择最佳视角方案，默认为1
   * @returns {object} 最佳视角的相机信息
   */
  async getBestView(modelKey, redo = false, scheme = 1) {
    return fetch(
      `${this.url}/api/${this.projectKey}/models/viewport?${this.share ? `&share=${this.share}` : ``}`,
      {
        headers: {
          Authorization: this.auth,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          modelKey: modelKey || this.modelKey,
          redo,
          scheme,
        })
      }
    ).then(res => res.json());
  }

  /**
   * 获取当前模型的最佳视角的状态
   * @param {string} modelKey 模型key 默认为当前场景中第一个模型的 key
   * @returns {boolean} 获取当前模型是否开启了最佳视角
   */
  async getBestViewStatus(modelKey) {
    return fetch(
      `${this.url}/api/${this.projectKey}/models/viewport/status?modelKey=${modelKey || this.modelKey}${this.share ? `&share=${this.share}` : ``}`,
      {
        headers: {
          Authorization: this.auth,
          'Content-Type': 'application/json'
        },
        method: "GET",
      }
    ).then(res => res.json());
  }

  /**
   * 设置当前模型的最佳视角的开启关闭状态
   * @param {string} modelKey 模型key 默认
   * @param {boolean} status 最佳视角开启状态
   * @returns {object}
   */
  async setBestViewStatus(modelKey, status = false) {
    return fetch(`${this.url}/api/${this.projectKey}/models/viewport/status${this.share ? `?share=${this.share}` : ``}`,
      {
        headers: {
          Authorization: this.auth,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          modelKey: modelKey || this.modelKey,
          switch: status,
        })
      }
    ).then(res => res.json());
  }
}

export { Server };
