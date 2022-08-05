/*
 * 用来存储上下文的内容，仅单例模式
 * host
 * BOS3D
 * BOS2D
 * BOS3DUI
 * BOS2DUI
 * emitter: new EventEmitter()
 * viewer3D
 * viewer2D
 * modelKey
 */
import axios from "../UI/utils/axios";

class MyContext {
  constructor() {
    this.viewer3D = {};
    this.viewer2D = {};
    this.modelKey = undefined;
    // 二维三维构件的对应关系
    this.relationship = {};
    this.token = "";
    this.share = "";
  }

  convert3DKeyTo2D(keys) {
    if (typeof keys === "string") {
      keys = [keys];
    }
    for (let i = 0, Len = keys.length; i < Len; i += 1) {
      keys[i] = keys[i].replace("_", "/");
    }
    return keys;
  }

  convert2DKeyTo3D(keys) {
    if (typeof keys === "string") {
      keys = [keys];
    }
    for (let i = 0, Len = keys.length; i < Len; i += 1) {
      keys[i] = keys[i].replace("/", "_");
    }
    return keys;
  }

  loadComponentRelationship(callback) {
    // const currentDraw = this.viewer2D.getViewerImpl()
    //   .drawManager
    //   .getCurrentDraw();
    const currentDraw = this.viewer2D.getCurrentDraw();
    if (this.relationship[currentDraw.drawKey]) {
      if (callback) {
        callback(this.relationship[currentDraw.drawKey]);
      }
      return;
    }

    const url = `${this.host}/api/${currentDraw.dbName}/relations?drawingKey=${currentDraw.drawKey}&modelKey=${this.modelKey}${this.share ? `&share={this.share}` : ''}`;
    axios({
      headers: {
        Authorization: this.token
      }
    })
      .get(url)
      .then(res => {
        if (res.data && res.data.data) {
          this.relationship[currentDraw.drawKey] = res.data.data;
        }
        if (callback) {
          callback(res.data.data);
        }
      })
      .catch(error => {
        console.log(error);
        if (callback) {
          callback();
        }
      });
  }

  query3DComponentBy2DComponent(key) {
    const spl = key.split("/");
    // const currentDraw = this.viewer2D.getViewerImpl()
    //   .drawManager
    //   .getCurrentDraw();
    const currentDraw = this.viewer2D.getCurrentDraw();
    const reKey = `${spl[1]}_${spl[3]}`;
    if (currentDraw) {
      if (this.relationship[currentDraw.drawKey]) {
        const relation = this.relationship[currentDraw.drawKey]["2Dto3D"];
        if (!relation) {
          return undefined;
        }
        const result = relation[reKey];
        if (result) {
          const rr = [];
          for (let i = 0, len = result.length; i < len; i += 1) {
            rr[i] = `${this.modelKey}_${result[i]}`;
          }
          return rr;
        }
      }
    }
    return undefined;
  }

    query2DComponentBy3DComponent (key) {
        const currentDraw = this.viewer2D.getCurrentDraw();

    const spl = key.split("_");

        //如果没有自定义关联
    if (this.BOS2D.GlobalData.UseWebGL && !this.viewer2D.viewPortPackage.hasRelationship) {
        // const currentLayout = this.viewer2D.viewPortPackage.highlightComponentsByKeys(key);
        return [key];
      }
  
    
    if (currentDraw) {
      if (this.relationship[currentDraw.drawKey]) {
        const relation = this.relationship[currentDraw.drawKey]["3Dto2D"];
        if (!relation) {
          return undefined;
        }
        const result = relation[spl[1]];
        if (result) {
          const rr = [];
          for (let i = 0, len = result.length; i < len; i += 1) {
            const strArray = result[i].split("_");
            // modeKey+ "/" +componentKey + "/" + 图纸key + "/" + json数据中的key
            rr[i] = `${this.modelKey}/${strArray[0]}/${currentDraw.drawKey}/${strArray[1]}${strArray[2] ? (`_${strArray[2]}`) : ""}`;
          }
          return rr;
        }
      }
    }
    return undefined;
  }
}

export default new MyContext();
