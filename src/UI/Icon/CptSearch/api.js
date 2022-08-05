import _ from "lodash-es";
import axios from "../../utils/axios";

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
 * 根据关键字获取构件结果列表
 * @param {object} viewer3D - viewer3D对象
 * @param {string} modelKey - 要获取树的模型key
 * @param {number} pageNumber - 页码
 * @param {number} [pageSize = 10] - 是否是离线模式
 * @param {string} keywords - 关键词
 * @param {Array} attributes - 返回的属性，不设置则返回全部
 * @return {AxiosPromise<any>}
 */
export function getComponentsList(
  viewer3D,
  modelKey,
  pageNumber,
  pageSize = 10,
  keywords,
  attributes
) {
  let model = null;
  if (Array.isArray(modelKey) && modelKey.length) {
    model = viewer3D.getViewerImpl().getModel(modelKey[0]);
  }
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
      `${url}/api/${projectKey}/queries/keywords?modelKey=${modelKey}&pageNumber=${pageNumber}&pageSize=${pageSize}&keywords=${keywords}${attributes ? `&attributes=${attributes}` : ''}${share ? `&share=${share}` : ''}`
    );
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

/**
 * 获取功能位置指定属性的子属性列表
 * @method getSubAttributesNames
 * @param {Object}
 * @return {Promise}
 */
export const getSubAttributesNames = (viewer3D, params) => {
  const prama = getPrama(viewer3D, params.modelKeys[0]);
  const url = `${prama.url}/api/${prama.projectKey}/components/subAttributeNames${prama.shareKey ? `?share=${prama.shareKey}` : ""}`;
  delete params.viewer3D;
  return axios({
    headers: {
      Authorization: prama.auth,
    },
  }).post(url, params);
};

/**
 * 根据属性获取详细的构件列表
 * @method getComponentsDetailsByAttribute
 * @param {object} viewer3D viewer
 * @param {array} models modelKey列表
 * @param {object} condition 查询属性条件
 * @param {number} pageNumber 当前当前页
 * @param {number} pageSize 一页多少条数据
 * @param {string} attributes 返回的数据中具有什么属性
 * @param {string} share 分享的sharekey
 */
export const getComponentsDetailsByAttribute = (
  viewer3D,
  models,
  condition,
  pageNumber,
  pageSize,
  attributes,
) => {
  const prama = getPrama(viewer3D, models[0]);
  const url = `${prama.url}/api/${prama.projectKey}/queries/attributes/details?pageNumber=${pageNumber}&pageSize=${pageSize}${attributes ? `&attributes=${attributes}` : ''}${prama.shareKey ? `&share=${prama.shareKey}` : ''}`;
  const params = {
    models,
    condition
  };
  return axios({
    headers: {
      Authorization: prama.auth,
    },
  }).post(url, params);
};

/**
 * 根据组合条件查询构件信息
 * @method getComponentsDetailsByAttribute
 * @param {object} viewer3D viewer
 * @param {array} models modelKey列表
 * @param {object} condition 查询属性条件
 * @param {number} pageNumber 当前当前页
 * @param {number} pageSize 一页多少条数据
 * @param {string} attributes 返回的数据中具有什么属性
 * @param {string} share 分享的sharekey
 */
export const getComponentsByAttribute = (
  viewer3D,
  models,
  condition,
  pageNumber,
  pageSize,
  attributes,
) => {
  const prama = getPrama(viewer3D, models[0]);
  const url = `${prama.url}/api/${prama.projectKey}/queries/combination?pageNumber=${pageNumber}&pageSize=${pageSize}&modelKey=${models[0]}${attributes ? `&attributes=${attributes}` : ''}${prama.shareKey ? `&share=${prama.shareKey}` : ''}`;
  const params = condition;
  return axios({
    headers: {
      Authorization: prama.auth,
    },
  }).post(url, params);
};
