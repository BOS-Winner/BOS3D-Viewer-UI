import axios from "UIutils/axios";

export function getCptInfo(url, key, token, share) {
  let cfg;
  if (token) {
    cfg = {
      headers: {
        Authorization: token
      }
    };
  }
  return axios(cfg).get(`${url}/drawings/elements?elementKey=${key}${share ? (`&share=${share}`) : ""}`);
}
