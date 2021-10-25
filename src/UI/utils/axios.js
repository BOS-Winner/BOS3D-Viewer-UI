/*
axios预封装模块
 */
import axios from "axios";

const config = {
  headers: {
    "content-type": "application/json"
  },
  responseType: 'json',
  // `validateStatus` defines whether to resolve or reject the promise for a given
  // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
  // or `undefined`), the promise will be resolved; otherwise, the promise will be
  // rejected.
  /*
  validateStatus: (status) => {
    if (status === 401) {
      notification.error({
        message: '登录失效，请重新登录',
        description: '',
        duration: 3,
      });
      redirect('/login');
    }
    return status >= 200 && status < 300;
  }
  */
};

/**
 * 初始化axios
 * @desc 预先配置一些必要参数，可以增加权限验证
 * @desc header获取不完整参照 https://stackoverflow.com/questions/37897523/axios-get-access-to-response-header-fields
 * @param {object} [cfg = {}] - 配置项
 * @returns {AxiosInstance}
 */
export default function myAxios(cfg = {}) {
  /*
  if (cfg.authMethod === 'Token') {
    config.headers.Authorization = `AccessToken ${sessionStorage.access_token}`;
  }
   */
  const instance = axios.create({ ...config, ...cfg });
  /*
  instance.interceptors.response.use(
    rsp => (rsp.data.code === 0 ? rsp : Promise.reject(rsp)),
    error => Promise.reject(error)
  );
  */
  return instance;
}
