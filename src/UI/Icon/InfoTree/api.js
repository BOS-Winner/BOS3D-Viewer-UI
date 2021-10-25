import _ from "lodash-es";
import axios from "../../utils/axios";

/**
 * 获取树列表
 * @param {object} viewer3D - viewer3D对象
 * @param {string} modelKey - 要获取树的模型key
 * @param {string} [apiVersion = "api"] - 保留参数
 * @param {boolean} [offline = false] - 是否是离线模式
 * @return {AxiosPromise<any>}
 */
export function getTreeList(viewer3D, modelKey, apiVersion = 'api', offline = false) {
  if (offline) {
    return axios().get(`./${modelKey}/resource/tree/list.json`);
  } else {
    const model = viewer3D.getViewerImpl().getModel(modelKey);
    const url = _.get(model, 'loader.url.serverUrl') || viewer3D.host;
    const projectKey = model.projectKey;
    const auth = model.accessToken;
    const share = model.shareKey;
    return axios({
      headers: {
        Authorization: auth
      }
    })
      .get(
        `${url}/${apiVersion}/${projectKey}/trees/list?modelKey=${modelKey}${share ? (`&share=${share}`) : ""}`
      );
  }
}

/**
 * 获取三维信息数据
 * @param {string} url - 数据存储的url
 * @param {string} fileKey - 文件key
 * @param {string} [modelKey = ''] - 要获取树的模型key
 * @param {boolean} [offline = false] - 是否是离线模式
 * @return {AxiosPromise<any>}
 */
export function getData(url, fileKey, modelKey = '', offline = false) {
  if (offline) {
    return axios().get(`./${modelKey}/resource/data/${fileKey}`);
  } else {
    return axios()
      .get(`${url}/data?fileKey=${fileKey}`);
  }
}
