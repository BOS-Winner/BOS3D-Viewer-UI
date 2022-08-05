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
    this.timer = 0;
    this.init(this.viewer);
  }

  init(viewer) {
    this.allModelKeys = viewer.getViewerImpl().getAllBimModelsKey();
    if (this.allModelKeys.length) {
      this.models = this.allModelKeys.map(_key => viewer.getViewerImpl().getModel(_key));
      this.model = this.models && Object.values(this.models)[0];
      this.modelKey = this.model.modelKey;
      this.url = _.get(this.model, "dataUrl.serverUrl") || viewer.host;
      this.projectKey = this.model.projectKey;
      this.auth = this.model.accessToken || "";
      this.share = this.model?.shareKey || "";
      clearInterval(this.timer);
    } else {
      this.timer = setInterval(() => {
        this.init(this.viewer);
      }, 1000);
    }
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

  /**
   * 创建场景烘焙任务
   * @param {object} param0 param
   * @returns {object}
   */
  async createBakeTask({
    sceneKey = this.modelKey,
    preview = false,
    options,
  }) {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking${this.share ? `?share=${this.share}` : ``}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        sceneKey,
        preview,
        options
      })
    }).then(res => res.json());
  }

  /**
   * 获取场景烘焙任务列表
   * @param {string} modelKey 模型key
   * @param {bool} preview 是否是预览
   * @returns {object}
   */
  async getBakeTaskList(modelKey, preview = false) {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking/list?sceneKey=${modelKey}${this.share ? `&share=${this.share}` : ``}${preview ? `&preview=${true}` : ``}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "GET",
    }).then(res => res.json());
  }

  /**
   * 获取场景烘焙任务详情
   * @param {string} bakeKey 烘焙任务key
   * @returns {object}
   */
  async getBakeTaskInfo(bakeKey) {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking?bakingKey=${bakeKey}${this.share ? `&share=${this.share}` : ``}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "GET",
    }).then(res => res.json());
  }

  /**
   * 删除场景烘焙任务
   * @param {string} bakeKey 烘焙任务Key
   * @returns {object}
   */
  async deleteBakeTask(bakeKey) {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking?bakingKey=${bakeKey}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "DELETE",
    }).then(res => res.json());
  }

  /**
   * 重新执行场景烘焙任务
   * @param {string} bakeKey 烘焙任务Key
   * @returns {object}
   */
  async reStartBakeTask(bakeKey) {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking?bakingKey=${bakeKey}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "PUT",
    }).then(res => res.json());
  }

  /**
   * 更新任务
   * @param {string} bakeKey - 烘焙任务key
   * @param {string} [action="retry"] - 更新任务执行的操作，retry：重新执行， cancel：取消任务
   * @returns {object}
   */
  async updateBakeTask(bakeKey, action = "retry") {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking?bakingKey=${bakeKey}&action=${action}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "PUT",
    }).then(res => res.json());
  }

  /**
   * 设置场景烘焙效果
   * @param {string} bakeKey 烘焙任务Key
   * @param {string} action 操作类型["enable", "disable"]
   * @returns {object}
   */
  async handleBakeEffect(bakeKey, action) {
    return fetch(`${this.url}/api/${this.projectKey}/scenes/baking/setting?bakingKey=${bakeKey}&action=${action}`, {
      headers: {
        Authorization: this.auth,
        'Content-Type': 'application/json'
      },
      method: "PUT",
    }).then(res => res.json());
  }
}

export { Server };
