// 录像文件处理器
// 拼接顺序：name,id,roamTime,fps,type,keyFrameList
import toastr from "../../../toastr";
import {
  FILE_SEP, VERSION, IMPORT_ERR_MSG, OLD_VERSIONS, IMPORT_ERR_TYPE
} from "./constant";
import importLatest from "./import1_4_0";
/* eslint-disable camelcase */
import import1_0 from "./import1_0";
import import1_2_0 from "./import1_2_0";
import import1_3_0 from "./import1_3_0";
/* eslint-enable camelcase */

export function json2yjbos3dRecord(json) {
  const sep = FILE_SEP;
  let rst = `${VERSION}${sep}${json.name}${sep}${json.id}${sep}${json.roamTime}${sep}${json.fps}${sep}${json.type}${sep}`;
  json.keyFrameList.forEach(frame => {
    rst += `${sep}${frame.id}${sep}${frame.position.x}${sep}${frame.position.y}${sep}${frame.position.z}${sep}${frame.target.x}${sep}${frame.target.y}${sep}${frame.target.z}${sep}${frame.up.x}${sep}${frame.up.y}${sep}${frame.up.z}${sep}${frame.quaternion.x}${sep}${frame.quaternion.y}${sep}${frame.quaternion.z}${sep}${frame.quaternion.w}`;
    if (frame.curve) {
      const curve = {
        curveType: frame.curve.curveType,
        points: frame.curve.points.map(p => p.toArray()),
      };
      rst += `${sep}${btoa(JSON.stringify(curve))}`;
    } else {
      rst += `${sep}null`;
    }
    // 添加帧编辑器数据
    rst += `${sep}漫游录制`;
    // 添加视角名称
    rst += `${sep}${frame.name}`;
  });
  return rst;
}

export function yjbos3dRecord2json(record) {
  try {
    const sep = FILE_SEP;
    const [info, frameList] = record.split(sep + sep);
    const version = info.split(sep)[0];
    if (version === VERSION) {
      return importLatest(info, frameList);
    } else {
      switch (version) {
        case OLD_VERSIONS[0]:
          return import1_0(info, frameList);
        case OLD_VERSIONS[1]:
          return import1_2_0(info, frameList);
        case OLD_VERSIONS[2]:
          return import1_3_0(info, frameList);
        default:
          throw new Error(IMPORT_ERR_MSG[IMPORT_ERR_TYPE.FORMAT_ERROR]);
      }
    }
  } catch (e) {
    const msg = e.message;
    if (msg === IMPORT_ERR_TYPE.FORMAT_ERROR) {
      toastr.error("导入失败，导入格式错误！");
    } else if (msg === IMPORT_ERR_TYPE.LUJINGMANYOU) {
      toastr.error('导入失败，该文件不是漫游录制文件！');
    }
    throw e;
  }
}
