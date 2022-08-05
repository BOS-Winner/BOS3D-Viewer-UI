import autumn from "./thumbnail/autumn.png";
import beach from "./thumbnail/beach.png";
import starSky from "./thumbnail/starSky.png";
import vacantLand from "./thumbnail/vacantLand.png";
import vernalEquinox from "./thumbnail/vernalEquinox.png";

// eslint-disable-next-line compat/compat
const src = document.currentScript ? document.currentScript.src : "";
let base = src.replace(/\/[\w.~]+\.js/, '');
// 如果base因为意外没有值、值为空字符串或者没匹配到导致base没变化
if (!base || base === src) {
  base = '.';
}

const config = {
  none: {
    name: "无",
    path: '',
    thumbnail: '',
  },
  autumn: {
    name: '秋意',
    path: `${base}/skybox/autumn`,
    thumbnail: `url(${autumn})`,
    src: `${autumn}`
  },
  starSky: {
    name: '星空',
    path: `${base}/skybox/starSky`,
    thumbnail: `url(${starSky})`,
    src: `${starSky}`
  },
  vernalEquinox: {
    name: '春分',
    path: `${base}/skybox/vernalEquinox`,
    thumbnail: `url(${vernalEquinox})`,
    src: `${vernalEquinox}`
  },
  vacantLand: {
    name: '空地',
    path: `${base}/skybox/vacantLand`,
    thumbnail: `url(${vacantLand})`,
    src: `${vacantLand}`
  },
  beach: {
    name: '海滩',
    path: `${base}/skybox/beach`,
    thumbnail: `url(${beach})`,
    src: `${beach}`
  },
};

export default config;
