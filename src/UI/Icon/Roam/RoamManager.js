import { EXT } from "./fileParser/constant";
import { json2yjbos3dRecord } from "./fileParser";

/**
 * @class RoamManager
 * @desc 漫游录制数据管理器
 */
class RoamManager {
  /**
   * @constructor
   * @param {object} props
   * @param {constructor} props.Roam - Roam对象构造器
   * @param {constructor} props.RoamPlayer - RoamPlayer对象构造器
   * @param {object} props.viewer - viewer实例
   */
  constructor(props) {
    this.Roam = props.Roam;
    this.RoamPlayer = props.RoamPlayer;
    this.viewer = props.viewer;
    this.routeObjList = [];
    this.roamPlayerList = [];
    this.initSpeedList = [];
    this.roamPlayingId = null;
    this.roamPauseId = null;
  }

  /**
   * 获取所有路径数据
   */
  getAllRoutes() {
    return this.routeObjList;
  }

  /**
   * 获取route对象，包含index
   * @desc index为-1说明没有找到
   * @param {string} id - 路径id
   * @return {{route: T, index: number}}
   * @private
   */
  _getRoute(id) {
    let index = -1;
    const route = this.routeObjList.find((_r, i) => {
      if (_r.getId() === id) {
        index = i;
        return true;
      } else {
        return false;
      }
    });
    return {
      index,
      route,
    };
  }

  /**
   * 获取player对象
   * @description index为-1说明没有找到
   * @param  {string} id - 路径id
   * @return {{index: number, player: T}}
   * @private
   */
  _getRoamPlayer(id) {
    let index = -1;
    const player = this.roamPlayerList.find((_v, i) => {
      if (_v.roam.getId() === id) {
        index = i;
        return true;
      } else {
        return false;
      }
    });
    return {
      index,
      player,
    };
  }

  /**
   * 添加路径
   * @description fps和roamTime由Roam对象内部处理
   * @param {object} route
   * @param {string} route.name - name
   * @param {string} route.id - id
   * @param {object} route.keyFrameList - keyFrameList
   * @param {number} route.roamTime - roamTime
   * @param {number} [route.fps] - fps
   */
  addRoute(route) {
    const roam = new this.Roam(route);
    this.routeObjList.push(roam);
    const player = new this.RoamPlayer({
      roamData: roam,
      viewer: this.viewer.getViewerImpl(),
    });
    player.addStopPlayCallback(() => {
      this.roamPlayingId = null;
    });
    this.roamPlayerList.push(player);
    this.initSpeedList.push(route.roamTime);
  }

  /**
   * 移除漫游路线
   * @param {string} id - 路径id
   * @param {boolean} [force=false] - 是否强制移除
   * @return {boolean} - 是否移除成功
   */
  rmRoam(id, force) {
    const { index } = this._getRoute(id);
    if (index >= 0) {
      // 正在播放的路线，非强制模式禁止移除
      if (this.roamPlayingId === id || this.roamPauseId === id) {
        if (!force) {
          return false;
        }
        this.stopRoam(id);
      }
      this.routeObjList.splice(index, 1);
      this.roamPlayerList.splice(index, 1);
      this.initSpeedList.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 设置速率
   * @param {string} id - 路径id
   * @param {number} speed - 速率（1为基准速率）
   * @return {boolean} - 是否设置成功
   */
  setSpeed(id, speed) {
    const { route, index } = this._getRoute(id);
    if (route) {
      route.setRoamTime(this.initSpeedList[index] / speed);
      return true;
    } else {
      return false;
    }
  }

  /**
   * 获取路径对象
   * @param {string} id - 路径id
   * @return {T} - 路径对象。未查找到返回undefined
   */
  getRoute(id) {
    return this._getRoute(id).route;
  }

  /**
   * 获取player对象
   * @param {string} id - 路径id
   * @return {T} - player对象。未查找到返回undefined
   */
  getRoamPlayer(id) {
    return this._getRoamPlayer(id).player;
  }

  /**
   * 获取漫游数据
   * @param {string} id - 路径id
   * @return {{fileName: string, blob: Blob}} - 数据（已转换为Blob对象）
   */
  getBlobData(id) {
    const route = this.getRoute(id);
    const data = route.export();
    const fileName = `${data.name}${EXT}`;
    const blob = new Blob([json2yjbos3dRecord(data)]);
    return {
      fileName,
      blob,
    };
  }

  /**
   * 开始漫游
   * @param {string} id - 路径id
   * @param {boolean} [force=false] - 是否强制开始
   * @return {boolean} - 是否成功播放
   */
  startRoam(id, force) {
    if (this.roamPlayingId || this.roamPauseId) {
      // 有正在播放的漫游，非强制模式禁止播放新的
      if (!force) {
        return false;
      }
      // 强制模式需要停掉其他的
      if (this.roamPlayingId) {
        const player = this.getRoamPlayer(this.roamPlayingId);
        player.stop();
      }
      if (this.roamPauseId && this.roamPauseId !== id) {
        const player = this.getRoamPlayer(this.roamPauseId);
        player.stop();
        this.roamPauseId = null;
      }
    }
    const player = this.getRoamPlayer(id);
    if (this.roamPauseId === id) {
      player.continue();
    } else {
      player.play();
    }
    this.roamPauseId = null;
    this.roamPlayingId = id;
    return true;
  }

  /**
   * 暂停漫游
   * @param {string} id - 路径id
   * @return {boolean} - 是否成功暂停
   */
  pauseRoam(id) {
    if (id === this.roamPlayingId) {
      const player = this.getRoamPlayer(id);
      player.pause();
      this.roamPlayingId = null;
      this.roamPauseId = id;
      return true;
    } else {
      return false;
    }
  }

  /**
   * 停止漫游
   * @param {string} id - 路径id
   * @return {boolean} - 是否成功停止
   */
  stopRoam(id) {
    if (id === (this.roamPauseId || this.roamPlayingId)) {
      const player = this.getRoamPlayer(id);
      player.stop();
      this.roamPlayingId = null;
      this.roamPauseId = null;
      return true;
    } else {
      return false;
    }
  }

  /**
   * 将当前画面设置到指定时间点对应的视角
   * @param {string} id - 路径id
   * @param {number} idx - 第idx帧
   */
  setFrame(id, idx) {
    const { route, index } = this._getRoute(id);
    if (index >= 0) {
      this.roamPlayerList[index].startFrom(route.keyFrameList[idx].id);
      this.viewer.linearFlyTo(route.keyFrameList[idx]);
    }
  }
}

export default RoamManager;
