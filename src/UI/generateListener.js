import _ from "lodash-es";
import { EVENT } from "./constant";

export function snapshotLn(eventEmitter, store) {
  return {
    add: shot => { eventEmitter.emit(EVENT.userAddSnapshot, shot) },
    delete: code => { eventEmitter.emit(EVENT.userDeleteSnapshot, code) },
    update: (code, shot) => { eventEmitter.emit(EVENT.userUpdateSnapshot, code, shot) },
    rename: (code, name) => { eventEmitter.emit(EVENT.userRenameSnapshot, code, name) },
    annotation: (code, desc) => { eventEmitter.emit(EVENT.userAnnotationSnapshot, code, desc) },
    restoreToSnapshot: code => { eventEmitter.emit(EVENT.userRestoreToSnapshot, code) },
    clear: () => { eventEmitter.emit(EVENT.userClearSnapshot) },
    makeSnapshots: () => {
      const viewer = store.getState().system.viewer3D;
      const scene = _.cloneDeep(viewer.viewerImpl.getSceneState());
      const snapshot = viewer.viewerImpl.modelManager.getModelSnapshotPhoto();
      return {
        code: new Date().getTime().toString(),
        name: '快照',
        description: '',
        imageURL: snapshot.imgURL,
        width: snapshot.width,
        height: snapshot.height,
        cameraState: scene.camera,
        componentState: scene.state,
        highlightComponentsKeys: scene.selection,
        highlightModelsKeys: scene.modelSelection,
      };
    },
    getSnapshotByKey: code => _.find(store.getState().snapshot.shotList, { code }),
    getAllSnapshot: () => _.cloneDeep(store.getState().snapshot.shotList),
    load: shots => {
      eventEmitter.emit(EVENT.userClearSnapshot);
      shots.forEach(shot => {
        eventEmitter.emit(EVENT.userAddSnapshot, shot);
      });
    },
    set addListener(func) {
      eventEmitter.on(EVENT.sysAddSnapshot, func);
    },
    set deleteListener(func) {
      eventEmitter.on(EVENT.sysDeleteSnapshot, func);
    },
    set updateListener(func) {
      eventEmitter.on(EVENT.sysUpdateSnapshot, func);
    },
    set restoreToSnapshotListener(func) {
      eventEmitter.on(EVENT.sysRestoreToSnapshot, func);
    },
    set renameListener(func) {
      eventEmitter.on(EVENT.sysRenameSnapshot, func);
    },
    set annotationListener(func) {
      eventEmitter.on(EVENT.sysAnnotationSnapshot, func);
    },
  };
}

export function markLn(eventEmitter) {
  return {
    add: (type, opt) => {
      eventEmitter.emit(EVENT.userAddMark, {
        ...opt,
        type
      });
    },
    addDOMMark: opt => {
      eventEmitter.emit(EVENT.userAddMark, {
        ...opt,
        type: 'dom',
      });
    },
    addSpriteMark: opt => {
      eventEmitter.emit(EVENT.userAddMark, {
        ...opt,
        type: 'sprite'
      });
    },
    delete: (type, id) => {
      eventEmitter.emit(EVENT.userDeleteMark, type, id);
    },
    update: (type, id, obj) => {
      eventEmitter.emit(EVENT.userUpdateMark, type, id, obj);
    },
    updateDOMMark: (id, obj) => {
      eventEmitter.emit(EVENT.userUpdateMark, 'dom', id, obj);
    },
    updateSpriteMark: (id, obj) => {
      eventEmitter.emit(EVENT.userUpdateMark, 'sprite', id, obj);
    },
    set addListener(func) {
      eventEmitter.on(EVENT.sysAddMark, func);
    },
    set deleteListener(func) {
      eventEmitter.on(EVENT.sysDeleteMark, func);
    },
    set updateListener(func) {
      eventEmitter.on(EVENT.sysUpdateMark, func);
    },
  };
}

export function roadnetLn(eventEmitter) {
  return {
    /**
     * 添加路网
     * @param {string} modelKey - 模型key
     * @param {number[]} from - 起点坐标（三维）
     * @param {number[]} to - 终点坐标（三维）
     */
    add: (modelKey, from, to) => { eventEmitter.emit(EVENT.userAddRoadnet, modelKey, from, to) },
    /**
     * 移除路网
     * @param {string} modelKey - 模型key
     * @param {number[]} from - 起点坐标（三维）
     * @param {number[]} to - 终点坐标（三维）
     */
    remove: (modelKey, from, to) => { eventEmitter.emit(EVENT.userRmRoadnet, modelKey, from, to) },
    // eslint-disable-next-line max-len
    // roam: (modelKey, from, to) => { eventEmitter.emit(EVENT.userRoamRoadnet, modelKey, from, to) },
    /**
     * 获取已添加的路网
     * @param {string} [modelKey] - 模型key。不填则获取所有模型的所有已添加路网
     * @param {number[]} [from] - 起点坐标（三维）。不填则获取指定模型的所有已添加路网
     * @param {number[]} [to] - 终点坐标（三维）。如果传入起点则必须传入终点
     * @return {null|object|[number,number,number][]} - 路网数据
     */
    getRoadnet: (modelKey, from, to) => {
      let rst = null;
      eventEmitter.emit(EVENT.userGetRoadnet, modelKey, from, to, roadnet => {
        rst = roadnet;
      });
      return rst;
    },
  };
}

export function roamRecord(eventEmitter) {
  return {
    /**
     * 控制开启关闭漫游模式
     * @param {boolean} [status=false] 漫游开启状态，默认是关闭漫游模式
     */
    handleRoamRecordStatus: (status = false) => {
      eventEmitter.emit(EVENT.handleRoamRecordStatus, status);
    },

    /**
     * 漫游开始录制
     * @param {function} callback 漫游开始录制后的回调函数
     */
    handleStartRecord: (callback) => {
      eventEmitter.emit(EVENT.handleStartRecord, callback);
    },

    /**
     * 漫游录制暂停
     * @param {function} callback 漫游录制暂停的回调函数
     */
    handlePauseRecord: (callback) => {
      eventEmitter.emit(EVENT.handlePauseRecord, callback);
    },

    /**
     * 结束漫游录制
     * @param {function} callback 漫游结束录制的回调函数
     */
    handleStopRecord: (callback) => {
      eventEmitter.emit(EVENT.handleStopRecord, callback);
    },

    /**
     * 通过弹窗导入漫游录制的文件
     * @param {function} callback 导入漫游录制成功后
     */
    handleImportRaomRecord: (callback) => {
      eventEmitter.emit(EVENT.handleImportRoamRecord, callback);
    },

    /**
     * 批量导入漫游录制数据
     * @param {string | string[]} roamRecordData
     */
    handleImportRoamRecordByStringData: (roamRecordData) => {
      const data = !Array.isArray(roamRecordData) ? [roamRecordData] : roamRecordData;
      eventEmitter.emit(EVENT.handleImportRoamRecordByData, data);
    },

    /**
     * 通过id导出漫游录制的数据
     * @param {string} id 需要导出的漫游录制的ID
     */
    handleExportRoamRecordById: (id) => {
      eventEmitter.emit(EVENT.handleExportRecord, id);
    },

    /**
     * 通过id导出漫游录制的字符串数据
     * @param {string} id 需要导出的漫游录制的ID
     * @param {function} callback 用来获取漫游录制字符串数据的回调函数
     */
    handleExportRoamRecordStringDataById: (id, callback) => {
      eventEmitter.emit(EVENT.handleExportRecordString, id, callback);
    },

    /**
     * 获取所有漫游的数据
     * @param {function} 获取漫游数据的回调函数
     */
    getAllRoamRecordData: (callback) => {
      eventEmitter.emit(EVENT.getAllRoamRecordData, callback);
    },

    /**
     * 播放该漫游录制
     * @param {string} id 需要播放的漫游录制的ID
     */
    handleRoamRecordPlayById: (id) => {
      eventEmitter.emit(EVENT.handleRoamRecordPlay, id);
    },

    /**
     * 暂停该漫游录制的播放
     * @param {string} id 需要暂停的漫游录制的ID
     */
    handleRoamRecordPauseById: (id) => {
      eventEmitter.emit(EVENT.handleRoamRecordPause, id);
    },

    /**
     * 删除该漫游录制
     * @param {string} id 需要删除的漫游录制的ID
     */
    deleteRoamRecordById: (id) => {
      eventEmitter.emit(EVENT.deleteRoamRecordById, id);
    },

    /**
     * 删除所有的漫游数据
     */
    deleteAllRoamRecord: () => {
      eventEmitter.emit(EVENT.deleteAllRoamRecord);
    }
  };
}
