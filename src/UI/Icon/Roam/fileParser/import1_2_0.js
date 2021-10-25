import { IMPORT_ERR_MSG, IMPORT_ERR_TYPE, FILE_SEP } from "./constant";

export default function (info, frameList) {
  const sep = FILE_SEP;
  const [version, name, id, roamTime, fps, type] = info.split(sep);
  if (!(version && name && id && roamTime && fps && type)) {
    throw new Error(IMPORT_ERR_MSG[IMPORT_ERR_TYPE.FORMAT_ERROR]);
  }
  const _info = {
    name,
    id,
    type: Number(type),
    roamTime: Number(roamTime),
    fps: Number(fps),
  };
  const keyFrameList = [];
  const frames = frameList.split(sep);
  const len = frames.length;
  if (len % 10 === 0) {
    for (let i = 0; i < len; i += 10) {
      keyFrameList.push({
        id: frames[i],
        position: {
          x: parseFloat(frames[i + 1]),
          y: parseFloat(frames[i + 2]),
          z: parseFloat(frames[i + 3]),
        },
        target: {
          x: parseFloat(frames[i + 4]),
          y: parseFloat(frames[i + 5]),
          z: parseFloat(frames[i + 6]),
        },
        up: {
          x: parseFloat(frames[i + 7]),
          y: parseFloat(frames[i + 8]),
          z: parseFloat(frames[i + 9]),
        }
      });
    }
    return {
      info: _info,
      keyFrameList,
    };
  } else {
    throw new Error(IMPORT_ERR_MSG[IMPORT_ERR_TYPE.FORMAT_ERROR]);
  }
}
