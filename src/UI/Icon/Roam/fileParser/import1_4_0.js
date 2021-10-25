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
  if (len % 17 === 0) {
    for (let i = 0; i < len; i += 17) {
      // 判断是否是漫游录制路径
      if (frames[i + 15] !== "漫游录制") {
        throw new Error(IMPORT_ERR_TYPE.LUJINGMANYOU);
      }
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
        },
        quaternion: {
          x: parseFloat(frames[i + 10]),
          y: parseFloat(frames[i + 11]),
          z: parseFloat(frames[i + 12]),
          w: parseFloat(frames[i + 13]),
        },
        curve: frames[i + 14] === 'null' ? null : JSON.parse(atob(frames[i + 14])),
        editor: "路径漫游",
        name: frames[i + 16],
      });
    }

    return {
      info: _info,
      keyFrameList,
    };
  } else if (len % 15 === 0) { // 兼容4.3之前版本
    for (let i = 0, j = 1; i < len; i += 15, j += 1) {
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
        },
        quaternion: {
          x: parseFloat(frames[i + 10]),
          y: parseFloat(frames[i + 11]),
          z: parseFloat(frames[i + 12]),
          w: parseFloat(frames[i + 13]),
        },
        curve: null,
        editor: null,
        name: `视角${j}`,
      });
    }

    return {
      info: _info,
      keyFrameList,
    };
  } else {
    throw new Error(IMPORT_ERR_TYPE.FORMAT_ERROR);
  }
}
