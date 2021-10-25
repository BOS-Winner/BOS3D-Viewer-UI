import _ from "lodash-es";
import axios from "../utils/axios";

/**
 * 获取请求参数
 * @param {object} viewer3D bos3d生成的对象
 * @param {*} modelKey 模型key
 */
function getPrama(viewer3D, modelKey) {
  const model = viewer3D.getViewerImpl().getModel(modelKey);
  return {
    shareKey: model?.shareKey,
    url: _.get(model, "loader.url.serverUrl") || viewer3D.host,
    projectKey: model.projectKey,
    auth: model.accessToken,
  };
}

/**
 * 获取模型中所有族及其包含构件
 * @param {object} viewer3D bos3d生成的对象
 * @param {string} modelKey 模型的可以
 */
export function getFamilies(viewer3D, modelKey) {
  const model = viewer3D.getViewerImpl().getModel(modelKey);
  const shareKey = model.shareKey;
  const url = _.get(model, "loader.url.serverUrl") || viewer3D.host;
  const projectKey = model.projectKey;
  const auth = model.accessToken;
  return axios({
    headers: {
      Authorization: auth,
    },
  }).get(`${url}/api/${projectKey}/models/families?modelKey=${modelKey}${shareKey ? `&share=${shareKey}` : ''}`);
}

/**
 * 获取模型中的部件信息
 * @param {object} viewer3D bos3d生成的对象
 * @param {string} modelKey 模型key
 */
export function getAssemblies(viewer3D, modelKey) {
  const model = viewer3D.getViewerImpl().getModel(modelKey);
  const shareKey = model.shareKey;
  const url = _.get(model, "loader.url.serverUrl") || viewer3D.host;
  const projectKey = model.projectKey;
  const auth = model.accessToken;
  return axios({
    headers: {
      Authorization: auth,
    },
  }).get(`${url}/api/${projectKey}/models/assemblies?modelKey=${modelKey}${shareKey ? `&share=${shareKey}` : ''}`);
}

/**
 * 获取单个构件的属性
 * @param {object} viewer3D bos3d生成的对象
 * @param {string} componentKey 构件key
 */
export function getSigleCptInfo(viewer3D, componentKey, modelKey) {
  const prama = getPrama(viewer3D, modelKey);
  return axios({
    headers: {
      Authorization: prama.auth,
    },
  }).get(`${prama.url}/api/${prama.projectKey}/components?componentKey=${componentKey}${prama.shareKey ? `&share=${prama.shareKey}` : ``}`);
}

/**
 * 根据属性查询构件
 * @param {object} viewer3D bos3d生成的对象
 * @param {Array} modelKey 模型key
 * @param {object} condition 查询的条件
 */
export function getSameAttributesCptKey(viewer3D, modelKey, condition) {
  const prama = getPrama(viewer3D, modelKey);
  return axios({
    headers: {
      Authorization: prama.auth,
    },
  }).post(`${prama.url}/api/${prama.projectKey}/queries/attributes?${prama.shareKey ? `&share=${prama.shareKey}` : ``}`, condition);
}
