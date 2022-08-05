import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Select, Switch, Input, Slider, Table, ConfigProvider, Progress
} from "antd";
import Modal from "Base/Modal";
import SubTitle from "Base/SubTitle";
import { saveAs } from 'file-saver';
import { changeDisplaySetting } from "../../userRedux/userSetting/action";
import toastr from "../../toastr";
import generateUUID from "../../utils/generateUUID";
import { angleToRadian, AntdIcon, getModelKey } from "../../utils/utils";
import SelectColor from "./components/SelectColor";
import style from "./cloudBakery.less";
import { DEFAULT_MODAL_PLACE } from "../../constant.js";
import GlobalInfo from "../GlobalInfo/GlobalInfo";
import Illustration from "./components/Illustration/Illustration";
import { Server } from "../../server/server";
import CustomConfirm from "../../Base/CustomConfirm";

const ruler = [64, 128, 256, 512, 1024, 2048, 4096, 8192];
const activeBlue = "#2e7cff";

function CloudBakeryManager(props) {
  const {
    isMobile, onClose, viewer, changeDisplaySetting: handleDisplaySetting, BOS3D, modelLoad
  } = props;
  const defaultParam = {
    mappingWidth: 1024,
    mappingHeight: 1024,
    lightOpen: true,
    lightColor: {
      color: [255, 255, 255],
      hex: "#ffffff",
      alpha: 1,
    },
    ligthIntensity: 1, // 太阳光强度
    reflectionTimes: 1, // 暂时不用了
    indirectLightIntensity: 1, // 间接光强度
    envOpen: true,
    envLightIntensity: 1, // 环境遮蔽强度
    azimuth: 45,
    heightAngle: 45,
    lightDir: new BOS3D.THREE.Vector3(-0.5, 0.5, -0.7), // 太阳光方向
    skyOpen: true,
    skyColor: { // 环境光颜色
      color: [255, 255, 255],
      hex: "#ffffff",
      alpha: 1,
    },
    defaultHeight: "840px",
    // 新增
    samplingRatio: 1.0, // 清晰度/采样率
    skyColorLightIntensity: 1.0, // 环境光强度
  };
  const globalTip = useRef(null);
  const server = useRef(new Server({ viewer }));
  const delay = 10;
  const timer = useRef(0);
  // 贴图尺寸
  const [mappingWidth, setMappingWidth] = useState(defaultParam.mappingWidth);
  const [mappingHeight, setMappingHeight] = useState(defaultParam.mappingHeight);
  const mappingRuler = [
    {
      title: "输出贴图宽度/高度",
      value: mappingWidth,
      onChange: value => setMappingWidth(value),
    },
  // {
  //   title: "输出贴图高度",
  //   value: mappingHeight,
  //   onChange: value => setMappingHeight(value),
  // }
  ];

  // 平行太阳光
  const [lightOpen, setLightOpen] = useState(defaultParam.lightOpen);
  const [azimuth, setAzimuth] = useState(defaultParam.azimuth);
  const [heightAngle, setHeightAngle] = useState(defaultParam.heightAngle);
  const [lightDir, setLightDir] = useState(defaultParam.lightDir);
  const [lightColor, setLightColor] = useState(defaultParam.lightColor);
  const [ligthIntensity, setLightIntensity] = useState(defaultParam.ligthIntensity); // 太阳光强度
  // const [reflectionTimes, setReflectionTimes] = useState(defaultParam.reflectionTimes); // 光线反射次数
  const [
    indirectLightIntensity,
    setIndirectLightIntensity
  ] = useState(defaultParam.indirectLightIntensity); // 间接光强度

  // 处理太阳光方向
  function handleLigthDir() {
    const altitudeRadian = angleToRadian(heightAngle);
    const azimuthRadian = angleToRadian(azimuth);
    const dir = viewer.getLightDirFromAltitudeAndAzimuth(altitudeRadian, azimuthRadian)
      .clone().normalize();
    setLightDir(dir);
    viewer.getRootScene().lightManager.lightDir = dir;
    if (lightOpen) {
      viewer.getRootScene().lightManager.shadowLightDir = dir.clone();
      viewer.updateShadowLight();
    }
    viewer.render();
  }

  /**
   * 设置平行太阳光颜色
   * @param {object} color THREE.Color 颜色
   */
  function handleLightColor(color) {
    // 设置光照颜色
    const tempColor = new BOS3D.THREE.Color(parseInt(color.substring(1), 16));
    viewer.scene.lightManager.setLightCastShadowColor(tempColor);
    viewer.render();
  }

  // 平行太阳光Dom
  const directionList = [{
    name: "方位角",
    value: azimuth,
    onChange: angle => {
      setAzimuth(angle);
      handleLigthDir();
    },
    min: 0,
    max: 360,
  }, {
    name: "高度角",
    value: heightAngle,
    onChange: angle => {
      setHeightAngle(angle);
      handleLigthDir();
    },
    min: 0,
    max: 90,
  }];

  function initLightSetting(check) {
    if (check) {
      handleDisplaySetting('enableExtraLight', false);
    }
    handleDisplaySetting('enableShadow', check);
  }

  // 天空盒颜色
  const [skyOpen, setSkyOpen] = useState(defaultParam.skyOpen);
  const [skyColor, setSkyColor] = useState(defaultParam.skyColor);
  const [skyColorLightIntensity,
    setSkyColorLightIntensity] = useState(defaultParam.skyColorLightIntensity);
  /**
   * 设置天空盒颜色
   * @param {string} color hex 颜色
   */
  function handleSkyColor(color) {
    if (color) {
      viewer.viewportDiv.style.background = color;
    } else {
      viewer.viewerImpl.resetBackgroundColor();
    }
  }

  // 环境遮蔽模式
  const [envOpen, setEnvOpen] = useState(defaultParam.envOpen);
  const [envLightIntensity, setEnvLightIntensity] = useState(defaultParam.envLightIntensity);
  const [samplingRatio, setSamplingRatio] = useState(defaultParam.samplingRatio);
  const customizeRenderEmpty = () => (
    <div className="empty-tip">
      <p>您还未开始烘焙过</p>
      <p>
        点击上方的“
        <span>开始烘焙</span>
        ”按钮试试吧( ^‿^ )
      </p>
    </div>
  );

  // 烘焙预览任务
  const [previewBakingInfo, setPreviewBakingInfo] = useState(null);
  // 当前的预览的任务
  const [currentPreviewBakeInfo, setCurrentPreviewBakeInfo] = useState(null); // 当前烘焙预览的信息

  /**
   * 重置参数
   */
  function handleReset() {
    // 重置贴图尺寸
    setMappingWidth(defaultParam.mappingWidth);
    setMappingHeight(defaultParam.mappingHeight);
    // 重置太阳光参数
    setLightOpen(defaultParam.lightOpen);
    // 打开打开太阳光
    handleDisplaySetting('enableShadow', true);
    setAzimuth(defaultParam.azimuth);
    setHeightAngle(defaultParam.heightAngle);
    setLightDir(defaultParam.lightDir);
    setLightColor(defaultParam.lightColor);
    setLightIntensity(defaultParam.ligthIntensity);
    // setReflectionTimes(defaultParam.reflectionTimes);
    setIndirectLightIntensity(defaultParam.indirectLightIntensity);
    handleLightColor(defaultParam.lightColor.hex);
    // 重置天空盒参数
    setSkyOpen(defaultParam.skyOpen);
    setSkyColor(defaultParam.skyColor);
    setSkyColorLightIntensity(defaultParam.skyColorLightIntensity);
    handleSkyColor();
    // 重置环境遮蔽模式参数
    setEnvOpen(defaultParam.envOpen);
    setEnvLightIntensity(defaultParam.envLightIntensity);
    setSamplingRatio(defaultParam.samplingRatio);
    // 设置默认高度
    // eslint-disable-next-line no-use-before-define
    setModalHeight(defaultParam.defaultHeight);
  }

  // 烘焙任务列表
  const [TaskList, setTaskList] = useState([]);
  const [rowId, setRowId] = useState("");

  /**
   * 获取云烘焙参数
   * @param {bool} isPreview 是否是预览模式
   * @returns {object} 烘焙参数
   */
  function handleBakingParam(isPreview = false) {
    return {
      preview: isPreview,
      options: {
        atlasResolution: isPreview ? 256 : Math.max(mappingHeight, mappingWidth),
        // atlasWidth: isPreview ? 256 : mappingWidth,
        // atlasHeight: isPreview ? 256 : mappingHeight,
        atlasSize: isPreview ? 256 : mappingWidth,
        // bouncesTimes: Number(reflectionTimes),
        indirectIntensity: indirectLightIntensity, // 间接光强度
        // ambientOcclusion: envOpen,
        aoIntensity: envLightIntensity, // 环境遮蔽光强度
        // skybox: {
        //   color: skyColor.color.map(item => item / 255),
        //   alpha: skyColor.alpha,
        // },
        ambientLightColor: skyColor.color.map(item => item / 255),
        ambientLightIntensity: skyColorLightIntensity,
        samplingRatio, // 清晰度
        mainLight: {
          enabled: lightOpen,
          direction: lightDir.negate().toArray(),
          color: lightColor.color.map(item => item / 255),
          alpha: lightColor.alpha,
          intensity: ligthIntensity
        }
      }
    };
  }

  /**
   * 查询烘焙任务详情
   * @param {string} bakeKey 烘焙任务key
   * @param {function} callback 回调函数
   * @param {function} errCallBack 异常回调函数
   */
  async function queryBakingProgress(bakeKey, callback, errCallBack) {
    const result = await server.current.getBakeTaskInfo(bakeKey);
    if (result.code === "SUCCESS") {
      if (callback && typeof callback === "function") {
        callback(result.data);
      }
    } else if (errCallBack && typeof errCallBack === "function") {
      errCallBack();
    }
  }

  // /**
  //  * 重新执行该烘焙任务
  //  * @param {string} bakeKey 烘焙任务key
  //  * @param {function} callback 回调函数
  //  * @param {function} errCallBack 异常回调函数
  //  */
  // async function reStartBakingTask(bakeKey, callback, errCallBack) {
  //   const result = await server.current.reStartBakeTask(bakeKey);
  //   if (result.code === "SUCCESS") {
  //     if (callback && typeof callback === "function") {
  //       callback(result.data);
  //     }
  //   } else if (errCallBack && typeof errCallBack === "function") {
  //     errCallBack();
  //   }
  // }

  /**
   * 删除烘焙任务
   * @param {string} bakeKey 烘焙任务key
   * @param {function} callback 回调函数
   * @param {function} errCallBack 异常回调函数
  */
  async function deleteBakeTask(bakeKey, callback, errCallBack) {
    const result = await server.current.deleteBakeTask(bakeKey);
    if (result.code === "SUCCESS") {
      if (callback && typeof callback === "function") {
        callback(result.data);
      }
    } else if (errCallBack && typeof errCallBack === "function") {
      errCallBack();
    }
  }

  /**
   * 更新任务
   * @param {string} bakeKey -bakeKey
   * @param {string} action - taskTyps: cancel, retry
   * @param {function} callback - callback
   * @param {function} errCallBack - err callback
   */
  async function updateBakeTask(bakeKey, action = "retry", callback, errCallBack) {
    const result = await server.current.updateBakeTask(bakeKey, action);
    if (result.code === "SUCCESS") {
      clearInterval(timer.current);
      if (callback && typeof callback === "function") {
        callback(result);
      }
    } else if (errCallBack && typeof errCallBack === "function") {
      errCallBack();
    }
  }

  /**
   * 获取烘焙任务列表
   * @param {string} modelKey 模型key
   * @param {bool} preview 是否是预览
   * @param {function} callback 成功后的回调函数
   * @param {function} errCallBack 异常回调函数
   */
  async function getBakeTaskList(modelKey, preview = false, callback, errCallBack) {
    const result = await server.current.getBakeTaskList(modelKey, preview);
    if (result.code === "SUCCESS") {
      if (callback && typeof callback === "function") {
        callback(result.data);
      }
    } else if (errCallBack && typeof errCallBack === "function") {
      errCallBack();
    }
  }

  /**
   * 应用烘焙效果
   * @param {string} bakeKey 烘焙任务的key
   * @param {string} action 操作类型["enable", "disable"]
   * @param {function} callback 成功后的回调函数
   * @param {function} errCallBack 异常回调函数
   */
  async function setBakeEffect(bakeKey, action = "disable", callback, errCallBack) {
    const result = await server.current.handleBakeEffect(bakeKey, action);
    if (result.code === "SUCCESS") {
      if (callback && typeof callback === "function") {
        callback(result.data);
      }
    } else if (errCallBack && typeof errCallBack === "function") {
      errCallBack();
    }
  }

  /**
   * 处理烘焙任务列表
   * @param {array} data 烘焙任务列表
   */
  function handleBakeTaskListData(data) {
    setTaskList(data.map((item, index) => ({
      ...item,
      id: data.length - index,
      task: `bake-${item.requestTime.slice(0, -3)}`,
      state: parseFloat(item.percentage) || 0,
    })));
  }

  /**
   * 创建烘焙预览任务
   * @param {bool} isPreview 是否是烘焙预览
   * @returns {}
   */
  async function handleBake(isPreview = false) {
    // 如果正在烘焙预览就跳过
    if (currentPreviewBakeInfo && currentPreviewBakeInfo.status === "0") return;
    const result = await server.current.createBakeTask(handleBakingParam(isPreview));
    if (result.code === "SUCCESS") {
      // tip
      toastr.warning("烘焙正在准备中，请稍后...");
      const { key: bakeKey, sceneKey } = result.data;
      if (isPreview) {
        const scope = this;
        queryBakingProgress(bakeKey, data => {
          setPreviewBakingInfo(data);
        });
        // 显示进度组件
        timer.current = setInterval(() => {
          queryBakingProgress(bakeKey, data => {
            const { status } = data;
            // 保存烘焙预览任务
            setPreviewBakingInfo.call(scope, data);
            if (status === "1") {
              toastr.success("烘焙任务执行成功");
              clearInterval(timer.current);
            } else if (status === "-1") {
              toastr.error("烘焙任务执行失败");
              clearInterval(timer.current);
            }
          });
        }, 1000 * delay);
      } else {
        getBakeTaskList(sceneKey, false, data => {
          handleBakeTaskListData(data);
          setRowId(data.length); // 设置高亮
        });
        timer.current = setInterval(() => {
          getBakeTaskList(sceneKey, false, data => {
            handleBakeTaskListData(data);
            if (data.every(item => item.status === "-1" || item.status === "1")) {
              // 烘焙完成后，自动预览
              // eslint-disable-next-line no-use-before-define
              // setCurrentPreviewBakeInfo({
              //   ...data[0],
              //   preview: true,
              // });
              clearInterval(timer.current);
              if (data[0].status === "1") {
                // eslint-disable-next-line no-use-before-define
                handlePrewBakeMap(data[0], true);
                toastr.success("烘焙任务执行完成");
              } else if (data[0].status === "-1") {
                toastr.error("烘焙任务执行失败");
              }
            }
          });
        }, 1000 * delay);
      }
    } else {
      if (result.message === "场景正在烘焙中") {
        toastr.warning("当前已有烘焙任务在执行，请结束后再进行烘焙！");
        return;
      }
      toastr.error("烘焙任务执行失败");
    }
  }

  /**
   * 重新执行该烘焙任务
   * @param {string} bakeKey 烘焙任务key
   */
  function handleReStarBakingTask(bakeKey) {
    updateBakeTask(bakeKey, "retry", ({ data: { sceneKey } }) => {
      timer.current = setInterval(() => {
        getBakeTaskList(sceneKey, false, data => {
          handleBakeTaskListData(data);
          if (data.every(item => item.status === "-1" || item.status === "1")) {
            clearInterval(timer.current);
          }
        });
      }, 1000 * delay);
    });
  }

  /**
   * 应用烘焙效果
   * @param {object} record 烘焙任务key
   * @param {string} action 设置烘焙操作 enable, disable
   */
  function settingBakeEffect(record, action = "disable") {
    setBakeEffect(record.key, action, () => {
      getBakeTaskList(record.sceneKey, false, data => {
        handleBakeTaskListData(data);
      });
      if (action === "enable") {
        // tip
        toastr.success(`${record.task} 烘焙效果应用成功`);
        // preview
        // eslint-disable-next-line no-use-before-define
        const lightManager = viewer.scene.lightManager;
        // 如果开启就关闭平行光，
        // eslint-disable-next-line no-use-before-define
        handleLightOpen(false);
        // 关闭辅助光
        lightManager.lightDir = lightManager.defaultLightDir;
        lightManager.shadowLightDir = lightManager.defaultShadowLightDir;
        lightManager.disableLights();
        viewer.render();
        if (
          currentPreviewBakeInfo
            && currentPreviewBakeInfo.key !== record.key
            && currentPreviewBakeInfo.preview
        ) {
          // 如果当前有烘焙在预览，则关闭
          viewer.enableBakeEffect(currentPreviewBakeInfo.sceneKey, false);
        }

        setCurrentPreviewBakeInfo({
          ...record,
          preview: false,
        });

        const { lm, sceneKey } = record;
        const model = viewer.viewerImpl.getModel(sceneKey);
        model.enCloudBaking = true;
        viewer.setBakeMap(sceneKey, model.dataUrl.mpkUrl(lm), () => {
          const _model = viewer.viewerImpl.getModel(sceneKey);
          if (_model.enCloudBaking) {
            viewer.enableBakeEffect(record.sceneKey, true);
          }
          delete _model.enCloudBaking;
        }, error => {
          toastr.error("设置贴图链接发生错误");
          console.error("贴图链接错误:", error);
        });
        // 关闭上面独立的预览
        // eslint-disable-next-line no-use-before-define
        // handelCancelPreviewBake();
      } else {
        // console.log("取消烘焙应用后，应该恢复初始状态");
        // eslint-disable-next-line no-use-before-define
        viewer.enableBakeEffect(record.sceneKey, false);
        const tempTaskList = TaskList.map(_task => ({ ..._task, preview: false }));
        setTaskList(tempTaskList);
        setCurrentPreviewBakeInfo(null);
      }
    });
  }
  const delModalShow = useRef(false);
  /**
   * 删除一条烘焙任务
   * @function removeBakeTask
   * @description 删除和取消的区别是取消不会恢复默认场景， 默认是删除任务
   * @param {object} record 烘焙任务对象
   * @param {bool} cancel 是否是取消一项任务
   */
  function removeBakeTask(record, cancel = false) {
    if (!delModalShow.current) {
      delModalShow.current = true;
    } else {
      return;
    }
    CustomConfirm({
      title: cancel ? '确定取消进行中的烘焙吗？' : '确定删除此烘焙烘焙记录及对应的烘焙效果吗？',
      message: cancel ? '该任务正在烘焙中，点击确定将直接删除该任务' : `删除后将还原至模型最初场景`,
      viewportDiv: document.getElementById('CloudBaking'),
      mode: "delete",
      okFunc: async () => {
        clearInterval(timer.current);
        // eslint-disable-next-line no-use-before-define
        await closeBakeMode(false);
        viewer.enableBakeEffect(record.sceneKey, false);
        deleteBakeTask(record.key, () => {
          toastr.success("烘焙任务删除成功！");
          getBakeTaskList(record.sceneKey, false, data => {
            handleBakeTaskListData(data);
          });
          // 恢复原来的场景
          // eslint-disable-next-line no-use-before-define
          // handlePrewBakeMap(record.sceneKey, false, false);
          setCurrentPreviewBakeInfo(null);
          handleReset();
        });
        delModalShow.current = false;
      },
      cancelFunc: () => {
        delModalShow.current = false;
      },
      closeIconFunc: () => {
        delModalShow.current = false;
      }
    });
    // 如果不是取消的话，就恢复初始场景
    // if (!cancel) {
    //   console.log("取消烘焙模式");
    // }
  }

  function cancelBakeTask(record) {
    CustomConfirm({
      title: '确定取消进行中的烘焙吗？',
      message: '该任务正在烘焙中，点击确定将直接删除该任务',
      viewportDiv: document.getElementById('CloudBaking'),
      mode: "delete",
      okFunc: () => {
        clearInterval(timer.current);
        updateBakeTask(record.key, "cancel", () => {
          deleteBakeTask(record.key, () => {
            getBakeTaskList(record.sceneKey, false, data => {
              handleBakeTaskListData(data);
            });
          });
        });
      },
    });
  }

  useEffect(() => {
    // 加载全局说明组件
    globalTip.current = new GlobalInfo({
      viewer,
      children: <Illustration />,
      parentNode: viewer.viewportDiv.parentNode,
      title: "云烘焙说明"
    });
    if (modelLoad) {
      // 默认开启平行太阳光
      initLightSetting(true);
      //  设置太阳光方向
      handleLigthDir();

      // 获取烘焙任务列表
      const modelKeys = getModelKey(viewer);

      if (modelKeys && modelKeys.length === 1) {
        getBakeTaskList(modelKeys[0], false, data => {
          handleBakeTaskListData(data);
          // 初始化的时候，如果应用的模型，就是预览烘焙的模型
          const activeTask = data.filter(_task => _task.used === true);
          if (activeTask.length) {
            // eslint-disable-next-line no-use-before-define
            handlePrewBakeMap(activeTask[0], true);
          }
        });
      }
    } else {
      viewer.registerModelEventListener(window.BOS3D.EVENTS.ON_LOAD_COMPLETE, () => {
        // 默认开启平行太阳光
        initLightSetting(true);
        //  设置太阳光方向
        handleLigthDir();

        // 获取烘焙任务列表
        const modelKeys = getModelKey(viewer);
        setTimeout(() => {
          if (modelKeys && modelKeys.length === 1) {
            getBakeTaskList(modelKeys[0], false, data => {
              // 如果没有烘焙数据，则初始化跑一个
              // if (!data.length) {
              //   // 模型加载好后先执行一下
              //   initBake();
              // }
              handleBakeTaskListData(data);
              // 初始化的时候，如果应用的模型，就是预览烘焙的模型
              const activeTask = data.filter(_task => _task.used === true);
              if (activeTask.length) {
              // eslint-disable-next-line no-use-before-define
                handlePrewBakeMap(activeTask[0], true);
              }
            });
          }
        }, 1000);
      });
    }

    return () => {
      globalTip.current.destroy();
      // 卸载后关闭平行太阳光
      initLightSetting(false);
      // 清除烘焙进度请求
      clearInterval(timer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modalHeight, setModalHeight] = useState(isMobile ? "calc(100% - 32px)" : "840px");
  const modalInfo = {
    width: isMobile ? "302px" : "350px",
    height: isMobile ? "calc(100% - 32px)" : "840px",
    top: isMobile ? "16px" : "145px",
    left: isMobile ? "16px" : DEFAULT_MODAL_PLACE.cloudBakery.left,
    right: isMobile ? "initial" : "20px",
    bottom: isMobile ? "16px" : DEFAULT_MODAL_PLACE.cloudBakery.bottom,
  };

  /**
   * 是否开启平行光
   * @param {bool} check 是否开启平行光
   * @param {bool} [showConfirm = false] 是否显示提示框
   */
  function handleLightOpen(check, showConfirm = false) {
    function handleOpen(_check) {
      setLightOpen(_check);
      if (_check) {
        setModalHeight(modalInfo.height);
        handleDisplaySetting('enableExtraLight', false);
      } else {
        setModalHeight("650px");
        // const lightManager = viewer.scene.lightManager;
        // lightManager.lightDir = lightManager.defaultLightDir;
        // lightManager.shadowLightDir = lightManager.defaultShadowLightDir;
        // lightManager.disableLights();
        // viewer.render();

        // eslint-disable-next-line no-use-before-define
        checkBakeApplied();
      }
      handleDisplaySetting('enableShadow', _check);
    }
    if (
      currentPreviewBakeInfo && currentPreviewBakeInfo.preview && showConfirm
      || (TaskList.filter(_task => _task.used === true).length > 0 && check)
    ) {
      CustomConfirm({
        title: "开启平行太阳光将暂时关闭烘焙效果，恢复至初始场景",
        message: "确定后将继续进行更改操作",
        viewportDiv: document.getElementById('CloudBaking'),
        mode: "normal",
        okFunc: () => {
          clearInterval(timer.current);
          // eslint-disable-next-line no-use-before-define
          handelCancelPreviewBake();
          // cancel bake
          // if (currentPreviewBakeInfo) {
          //   // eslint-disable-next-line no-use-before-define
          //   handlePrewBakeMap(currentPreviewBakeInfo, false);
          // }
          // eslint-disable-next-line no-use-before-define
          handlePrewBakeMap(currentPreviewBakeInfo, false, false);

          handleOpen(check);
          handleReset();
        },
      });
      return;
    }
    handleOpen(check);
  }

  /**
   * 检查应用烘焙效果
   */
  function checkBakeApplied() {
    // 如果当前有应用的烘焙，则恢复到应用的烘焙效果
    const appliedBakeTask = TaskList.filter(
      _task => _task.used === true);
    if (appliedBakeTask.length) {
      const { lm, sceneKey } = appliedBakeTask[0];
      const model = viewer.viewerImpl.getModel(sceneKey);
      viewer.setBakeMap(sceneKey, model.dataUrl.mpkUrl(lm), () => {
        viewer.enableBakeEffect(sceneKey, true);
      }, error => {
        toastr("设置贴图链接发生错误");
        console.error("贴图链接错误:", error);
      });
    }
  }

  /**
   * 预览烘焙效果
   * @param {string} sceneKey 模型key
   * @param {bool} isEnable 是否开启预览
   * @param {bool} [enableApplied = true] 是否应用烘焙效果
   */
  function handlePrewBakeMap(task, isEnable, enableApplied = true) {
    const lightManager = viewer.scene.lightManager;
    if (isEnable) {
      // 如果开启就关闭平行光，
      handleLightOpen(false);
      // 关闭辅助光
      lightManager.lightDir = lightManager.defaultLightDir;
      lightManager.shadowLightDir = lightManager.defaultShadowLightDir;
      lightManager.disableLights();
      viewer.render();
      if (
        currentPreviewBakeInfo
        && currentPreviewBakeInfo.key !== task.key
        && currentPreviewBakeInfo.preview
      ) {
        // 如果当前有烘焙在预览，则关闭
        viewer.enableBakeEffect(currentPreviewBakeInfo.sceneKey, false);
      }
      // 同步当前的任务
      setCurrentPreviewBakeInfo({
        ...task,
        preview: true,
      });
    } else {
      lightManager.enableLights();
      if (currentPreviewBakeInfo && currentPreviewBakeInfo.preview) {
        // 如果是关闭当前的烘焙预览
        setCurrentPreviewBakeInfo({
          ...currentPreviewBakeInfo,
          preview: false,
        });
      }
      if (enableApplied) {
        checkBakeApplied();
      }
    }
    if (isEnable) {
      const { lm, sceneKey } = task;
      const model = viewer.viewerImpl.getModel(sceneKey);
      model.enCloudBaking = true;
      viewer.setBakeMap(sceneKey, model.dataUrl.mpkUrl(lm), () => {
        const _model = viewer.viewerImpl.getModel(sceneKey);
        if (_model.enCloudBaking) {
          viewer.enableBakeEffect(task.sceneKey, true);
        }
        delete _model.enCloudBaking;
      }, error => {
        toastr.error("设置贴图链接发生错误");
        console.error("贴图链接错误:", error);
      });
    } else {
      viewer.enableBakeEffect(task.sceneKey, isEnable);
      const _model = viewer.viewerImpl.getModel(task.sceneKey);
      if (_model?.enCloudBaking) {
        delete _model.enCloudBaking;
      }
    }
    viewer.render();
  }

  const downloading = useRef(false);
  /**
   * 下载当前烘焙文件
   * @param {string} sceneKey 模型key
   * @param {string} lm 贴图文件key
   * @param {string} [taskName="烘焙文件"] 下载啊文件名称
   */
  function downloadBakeFile(sceneKey, lm, taskName = "烘焙文件") {
    if (downloading.current) {
      toastr.info("烘焙文件下载中，请稍后!");
      return;
    }
    toastr.info("烘焙文件下载中，请稍后！");
    downloading.current = true;
    const model = viewer.viewerImpl.getModel(sceneKey);
    const token = server.current.auth;
    // eslint-disable-next-line compat/compat
    fetch(`${model.dataUrl.serverUrl}/api/${model.dataUrl.dbName}/files?fileKey=${sceneKey}&includeBaking=true&access_token=${token}`).then(
      res => res.blob())
      .then(blob => {
        downloading.current = false;
        const fileName = `${taskName}.zip`;
        saveAs(blob, fileName);
      });
  }

  /**
   * 下载当前应用的烘焙文件
   */
  function handleDownloadCurrentBakeFile() {
    if (!TaskList.length || !TaskList.some(task => task.used === true)) {
      toastr.warning("当前没有应用烘焙文件");
      return;
    }
    const task = TaskList.filter(_task => _task.used === true)[0];
    downloadBakeFile(task.sceneKey, task.lm, task.task);
  }

  /**
   * 取消烘焙模式
   * @param {Boolean} [showTip = true] 是否显示提示
   * @param {String} [tipContent = ""] 提示内容
   */
  function closeBakeMode(showTip = true, tipContent = "") {
    // 取消烘焙模式只指取消烘焙的应用，
    const appliedBake = TaskList.filter(_task => _task.used === true);
    if (previewBakingInfo) {
      // eslint-disable-next-line no-use-before-define
      // handelCancelPreviewBake();
      handleReset();
      return;
    }
    if (appliedBake.length) {
      const record = appliedBake[0];
      // 取消烘焙应用
      setBakeEffect(record.key, "disable", () => {
        getBakeTaskList(record.sceneKey, false, data => {
          handleBakeTaskListData(data);
        });
        if (!currentPreviewBakeInfo || currentPreviewBakeInfo.key === record.key) {
          viewer.enableBakeEffect(record.sceneKey, false);
          setCurrentPreviewBakeInfo(null);
        }
        // console.log(TaskList, record);
        // const tempTaskList = TaskList.map(_task => {
        //   if (record.key === _task.key) {
        //     return {
        //       ..._task,
        //       preview: false,
        //     };
        //   }
        //   return _task;
        // });
        // setTaskList(tempTaskList);
        // setCurrentPreviewBakeInfo(null);
        if (showTip) toastr.success(tipContent || "关闭烘焙模式成功");
      }, () => {
        if (showTip) toastr.error(tipContent || "关闭烘焙模式失败");
      });
    }
  }

  /**
   * 烘焙预览取消操作
   */
  function handelCancelPreviewBake() {
    if (previewBakingInfo) {
      handlePrewBakeMap(previewBakingInfo.sceneKey, false);
      updateBakeTask(previewBakingInfo.key, "cancel", () => {
        deleteBakeTask(previewBakingInfo.key, () => {
          setPreviewBakingInfo(null);
        });
      });
    }
  }

  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
      width: "15%",
      align: "center",
    }, {
      title: "任务",
      dataIndex: "task",
      key: "task",
      width: "25%",
      ellipsis: true,
    }, {
      title: "状态",
      dataIndex: "state",
      key: "state",
      align: "center",
      width: "30%",
      render: (text, record) => <Progress percent={record.state} success={{ percent: record.state, strokeColor: "#4BB988" }} size="small" status={record.status === "0" ? "normal" : record.status === "-1" ? "exception" : "success"} />
    }, {
      title: "操作",
      dataIndex: "option",
      key: "option",
      width: "30%",
      align: "center",
      render: (text, record) => (
        <div className={style.tableOptionContainer}>
          {
            record.status === "-1" && <AntdIcon onClick={() => handleReStarBakingTask(record.key)} type="iconswitch" title="重新执行烘焙任务" />
          }
          {
            record.status === "1" && (
              <AntdIcon
                type="iconicon_hongbeiyulan"
                title="烘焙预览"
                style={{
                  cursor: record.used ? "no-drop" : "pointer",
                  color: record.used ? "rgba(204,204,204, .4)" : (currentPreviewBakeInfo && currentPreviewBakeInfo.key === record.key && currentPreviewBakeInfo.preview) ? activeBlue : "#fff",
                }}
                onClick={() => {
                  if (record.used) return;
                  handlePrewBakeMap(
                    record,
                    currentPreviewBakeInfo && currentPreviewBakeInfo.key === record.key
                      ? !currentPreviewBakeInfo.preview : true);
                }}
              />
            )
          }
          {
            record.status === "1"
              && (
                <AntdIcon
                  type="iconicon_yingyonghongbei"
                  title="应用烘焙"
                  onClick={() => settingBakeEffect(record, record.used ? "disable" : "enable")}
                  style={record.used ? { color: activeBlue } : {}}
                />
              )
          }
          {
            record.status === "0" && <AntdIcon onClick={() => cancelBakeTask(record, true)} type="iconicon_quxiao" title="取消烘焙" />
          }
          {
            (record.status === "1" || record.status === "-1") && <AntdIcon onClick={() => removeBakeTask(record)} type="iconicon_delete" title="删除烘焙任务" />
          }
        </div>
      )
    }
  ];

  return (
    <Modal
      onCancel={onClose}
      visible
      title="云烘焙"
      top={modalInfo.top}
      bottom={modalInfo.bottom}
      left={modalInfo.left}
      right={modalInfo.right}
      width={modalInfo.width}
      height={modalHeight}
      minWidth={251}
      minHeight={300}
      viewportDiv={viewer.viewportDiv}
      overflowX="visible"
      overflowY="auto"
      tip
      tipCallback={() => globalTip.current.show()}
    >
      <div className={`${style.container} boss3d-theme-one-form-form-antd`} id="CloudBaking">
        <SubTitle title="烘焙设置" showCloseIcon={false} />
        <div className={style.ruler}>
          <span>贴图尺寸</span>
          <div className={`${style.rulerContainer}`}>
            {mappingRuler.map((item) => (
              <div className={style.rulerItem} key={item.title}>
                <span>{item.title}</span>
                <Select
                  defaultValue={1024}
                  value={item.value}
                  size="small"
                  onChange={item.onChange}
                  style={{ width: "72px" }}
                  dropdownClassName="boss3d-theme-one-form-form-antd-dropdown"
                >
                  {ruler.map(_ruler => (
                    <Select.Option
                      key={generateUUID()}
                      value={_ruler}
                    >
                      {_ruler}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div className={style.hr} />

        <div className={style.light}>
          <div className={style.lightTitle}>
            <span>太阳光</span>
            <Switch
              checked={lightOpen}
              onChange={check => handleLightOpen(check, true)}
            />
          </div>
          {
            lightOpen && (
              <div className={style.lightContainer}>
                <div className={style.direction}>
                  <div className={style.title}>
                    <span>太阳光方向</span>
                  </div>
                  <div className={style.sliderContainer}>
                    <div className={style.sliderItem}>
                      {Object.keys(lightDir).map(key => (
                        <span key={key}>
                          {key}
                          <span>:</span>
                          {parseFloat(lightDir[key]).toFixed(2)}
                        </span>
                      ))}
                    </div>
                    {
                      directionList.map(item => (
                        <div className={style.sliderItem} key={item.name}>
                          <span>
                            {item.name}
                            :
                            {item.value}
                            °
                          </span>
                          <div className={style.slider}>
                            <span>
                              {item.min}
                              °
                            </span>
                            <Slider
                              value={item.value}
                              min={item.min}
                              max={item.max}
                              step={1}
                              onChange={item.onChange}
                              style={{ width: "100px" }}
                            />
                            <span>
                              {item.max}
                              °
                            </span>
                          </div>
                        </div>
                      ))
                    }

                  </div>
                </div>
                <div className={style.lightRow}>
                  <div className={style.lightCol}>
                    <span>太阳光颜色</span>
                    <SelectColor
                      viewer={viewer}
                      setColor={_color => {
                        const tempColor = Object.values(_color.rgb);
                        tempColor.pop();
                        setLightColor({
                          ..._color,
                          color: tempColor,
                        });
                        // 设置光照颜色
                        handleLightColor(_color.hex);
                      }}
                      domColor={parseInt(lightColor.hex.substring(1), 16)}
                      domOpacity={lightColor.alpha * 255}
                    />
                  </div>
                  <div className={style.lightCol}>
                    <span>太阳光强度</span>
                    <Input
                      size="small"
                      value={ligthIntensity}
                      min={1}
                      max={2}
                      step={0.1}
                      controls
                      type="number"
                      onChange={e => {
                        const _lightIntensity = e.target.value;
                        if (Number(_lightIntensity) < 1 || Number(_lightIntensity) > 2) return;
                        setLightIntensity(_lightIntensity);
                        viewer.scene.lightManager.setIntensityFactor(_lightIntensity);
                        viewer.render();
                      }}
                      onBlur={e => {
                        if (e.target.value === "") {
                          setLightIntensity(defaultParam.ligthIntensity);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className={style.lightRow}>
                  {/* <div className={style.lightCol}>
                    <span>光线反射次数</span>
                    <Input
                      size="small"
                      type="number"
                      value={reflectionTimes}
                      onChange={e => {
                        setReflectionTimes(e.target.value);
                      }}
                    />
                  </div> */}
                  <div className={style.lightCol}>
                    <span>间接光强度</span>
                    <Input
                      size="small"
                      type="number"
                      max={100}
                      min={0}
                      value={indirectLightIntensity}
                      onChange={e => {
                        if (
                          e.target.value % 1 === 0
                          && Number(e.target.value) <= 100
                          && Number(e.target.value) >= 0
                          && e.target.value !== "-0"
                        ) {
                          setIndirectLightIntensity(e.target.value);
                        }
                      }}
                      onBlur={
                        e => {
                          if (e.target.value === "") {
                            setIndirectLightIntensity(defaultParam.indirectLightIntensity);
                          }
                        }
                      }
                    />
                  </div>
                </div>
              </div>
            )
          }

        </div>

        <div className={style.hr} />

        <div className={style.skyColor}>
          <div className={style.title}>
            <span>环境光</span>
            <Switch
              checked={skyOpen}
              onChange={check => {
                setSkyOpen(check);
                if (!check) {
                  viewer.viewerImpl.resetBackgroundColor();
                  setSkyColor(defaultParam.skyColor);
                }
              }}
            />
          </div>
          {
            skyOpen && (
              <div className={style.ambientLightContainer}>
                <div className={style.selectSkyColorContainer}>
                  <span>环境光颜色</span>
                  <SelectColor
                    viewer={viewer}
                    setColor={_color => {
                      const tempColor = Object.values(_color.rgb);
                      tempColor.pop();
                      setSkyColor({
                        ..._color,
                        color: tempColor
                      });
                      // viewer.viewportDiv.style.background = color;
                    }}
                    domColor={parseInt(skyColor.hex.substring(1), 16)}
                    domOpacity={skyColor.alpha * 255}
                  />
                </div>
                <div className={style.ambientLightIntensityContainer}>
                  <span>环境光强度</span>
                  <Input
                    size="small"
                    type="number"
                    width="40px"
                    min={0}
                    value={skyColorLightIntensity}
                    onChange={e => {
                      const value = e.target.value;
                      // eslint-disable-next-line no-restricted-globals
                      if (
                        value % 1 === 0
                        && Number(e.target.value >= 0)
                        && value !== "-0"
                      ) {
                        setSkyColorLightIntensity(value);
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === "") {
                        setSkyColorLightIntensity(defaultParam.skyColorLightIntensity);
                      }
                    }}
                  />
                </div>
              </div>
            )
          }
        </div>

        <div className={style.hr} />

        <div className={style.envMode}>
          <div className={style.title}>
            <div className={style.titleCol}>
              <span className={style.customTitle}>其他</span>
              {/* <Switch checked={envOpen} onChange={check => setEnvOpen(check)} /> */}
            </div>
          </div>
          <div className={style.container}>
            <div className={style.titleCol} style={{ display: envOpen ? "flex" : "none" }}>
              <span>环境遮蔽强度</span>
              <Input
                value={envLightIntensity}
                type="number"
                min={0}
                style={{ marginRight: "7px" }}
                onChange={e => {
                  if (Number(e.target.value) < 0 || e.target.value === "-0") return;
                  setEnvLightIntensity(e.target.value);
                }}
                onBlur={e => {
                  if (e.target.value === "") {
                    setEnvLightIntensity(defaultParam.envLightIntensity);
                  }
                }}
              />
            </div>
            <div className={style.titleCol} style={{ display: envOpen ? "flex" : "none" }}>
              <span>贴图清晰度</span>
              <Input
                value={samplingRatio}
                type="number"
                min={0}
                max={1}
                step={0.1}
                onChange={e => {
                  if (Number(e.target.value) < 0 || e.target.value === "-0") return;
                  setSamplingRatio(e.target.value);
                }}
                onBlur={e => {
                  if (e.target.value === "") {
                    setSamplingRatio(defaultParam.samplingRatio);
                  }
                }}
              />
            </div>
          </div>
          <div className={style.btnGroup}>
            <div role="button" onClick={handleReset} tabIndex={0}>重置参数</div>
            <div role="button" onClick={() => handleBake(true)} tabIndex={0}>烘焙预览</div>
            <div role="button" style={(previewBakingInfo && previewBakingInfo.status === "0") ? { cursor: "not-allowed" } : {}} onClick={() => handleBake()} tabIndex={0}>开始烘焙</div>
          </div>

          {
            previewBakingInfo && (
              <div className={style.progress}>
                <span>烘焙进度</span>
                <div className={style.progressContainer}>
                  <Progress
                    percent={parseFloat(previewBakingInfo.percentage)}
                    size="small"
                    success={{ percent: parseFloat(previewBakingInfo.percentage), strokeColor: "#4BB988" }}
                    status={previewBakingInfo.status === "1" ? "success" : previewBakingInfo.status === "-1" ? "exception" : "normal"}
                  />
                  <div className={style.optionContainer}>
                    {
                      previewBakingInfo.status === "1" && (
                        <AntdIcon
                          type="iconicon_hongbeiyulan"
                          style={{ color: currentPreviewBakeInfo && currentPreviewBakeInfo.key === previewBakingInfo.key && currentPreviewBakeInfo.preview ? activeBlue : "#ccc" }}
                          onClick={() => handlePrewBakeMap(
                            previewBakingInfo,
                            currentPreviewBakeInfo
                            && currentPreviewBakeInfo.key === previewBakingInfo.key
                              ? !currentPreviewBakeInfo.preview : true
                          )}
                          title="烘焙预览"
                        />
                      )
                    }
                    {
                      previewBakingInfo.status === "-1"
                      && <AntdIcon type="iconswitch" title="切换预览" onClick={() => handleReStarBakingTask(previewBakingInfo.key)} />
                    }
                    <AntdIcon title="取消烘焙" type="iconicon_quxiao" onClick={handelCancelPreviewBake} />
                  </div>
                </div>
              </div>
            )
          }

          <div className={style.linkGroup}>
            <div role="button" title="关闭烘焙模式" tabIndex={0} onClick={closeBakeMode}>关闭烘焙模式</div>
            <span>|</span>
            <div role="button" title="下载当前所应用的烘焙模型" tabIndex={0} onClick={handleDownloadCurrentBakeFile}>下载当前烘焙文件</div>
          </div>
        </div>

        <SubTitle title="烘焙管理" showCloseIcon={false} />

        <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <Table
            columns={columns}
            dataSource={TaskList}
            size="small"
            pagination={{
              pageSize: 3,
            }}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => setRowId(record.id)
            })}
            rowClassName={record => (record.id === rowId ? "bos3d-table-row-active" : "")}
          />
        </ConfigProvider>

      </div>
    </Modal>
  );
}

CloudBakeryManager.propTypes = {
  onClose: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  BOS3D: PropTypes.object.isRequired,
  modelLoad: PropTypes.bool.isRequired,
  // apiVersion: PropTypes.string.isRequired,
  // isOffline: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  changeDisplaySetting: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  isOffline: state.system.offline,
  isMobile: state.system.isMobile,
  BOS3D: state.system.BIMWINNER.BOS3D,
});
const mapDispatchToProps = (dispatch) => ({
  changeDisplaySetting: (name, value) => {
    dispatch(changeDisplaySetting(name, value));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CloudBakeryManager);
