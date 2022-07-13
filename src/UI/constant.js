export const EVENT = {
  // 标签
  sysAddMark: 'sysAddMark',
  sysDeleteMark: 'sysDeleteMark',
  sysUpdateMark: 'sysUpdateMark',
  userAddMark: 'userAddMark',
  userDeleteMark: 'userDeleteMark',
  userUpdateMark: 'userUpdateMark',
  // 快照
  userAddSnapshot: 'userAddSnapshot',
  sysAddSnapshot: 'sysAddSnapshot',
  userDeleteSnapshot: 'userDeleteSnapshot',
  sysDeleteSnapshot: 'sysDeleteSnapshot',
  userUpdateSnapshot: 'userUpdateSnapshot',
  sysUpdateSnapshot: 'sysUpdateSnapshot',
  userRestoreToSnapshot: 'userRestoreToSnapshot',
  sysRestoreToSnapshot: 'sysRestoreToSnapshot',
  userRenameSnapshot: 'userRenameSnapshot',
  sysRenameSnapshot: 'sysRenameSnapshot',
  userAnnotationSnapshot: 'userAnnotationSnapshot',
  sysAnnotationSnapshot: 'sysAnnotationSnapshot',
  userClearSnapshot: 'userClearSnapshot',
  // 路网
  userAddRoadnet: 'userAddRoadnet',
  userRmRoadnet: 'userRmRoadnet',
  userRoamRoadnet: 'userRoamRoadnet',
  userGetRoadnet: 'userGetRoadnet',
  // 自定义图标
  addIconToBottom: 'addIconToBottom',
  addContextMenu: 'addContextMenu',
  // 漫游
  handleRoamRecordStatus: "handleRoamRecordStatus",
  handleStartRecord: "handleStartRecord",
  handleStopRecord: "handleStopRecord",
  handlePauseRecord: "handlePauseRecord",
  handleExportRecord: "handleExportRecord",
  handleExportRecordString: "hadnleExportRoamRecordString",
  handleImportRoamRecord: "handleImportRoamRecord",
  handleImportRoamRecordByData: "handleImportRoamRecordByData",
  handleRoamRecordPlay: "handleRoamRecordPlay",
  handleRoamRecordPause: "handleRoamRecordPause",
  getAllRoamRecordData: "getAllRoamRecordData",
  deleteRoamRecordById: "deleteRoamRecordById",
  deleteAllRoamRecord: "deleteAllRoamRecord",
};

export const DEFAULT_CAMERA = {
  // originalView: undefined, // {position, target, up}
  rotateMode: "SELECTION",
  lockRotate: false,
  lockAxisZ: false,
  orbitButton: "left",
  reverseWheelDirection: false,
  zoomSpeed: 1,
  // verticalPolarAngle: undefined,
  enableVerticalPolarAngle: false,
  rotateOfVerticalPolarAngle: [0, 0],
  animatorDuration: 800,
};

export const DEFAULT_DISPLAY = {
  enableSelectionOutline: true,
  enableSelectionBoundingBox: false,
  enableSelectionByTranslucent: false,
  showCptLines: false,
  bgColor: {}, // {hex, alpha}
  enableShadow: false, // 启用阴影效果
  enableExtraLight: false, // 启用fbx光
  lightEffect: {
    enable: false, // 启用光照效果
    city: 'beijing',
    time: 600,
    // 初始为当前年份的7月1日上午10点
    date: `${new Date().getFullYear()}/7/1`,
  },
  enableLogarithmicDepthBuffer: false,
  lightIntensityFactor: 0,
  skybox: 'none',
};

// 默认的工具栏模块
export const DEFAULT_TOOL = {
  fit: true,
  roam: true,
  undo: true,
  reset: true,
  pickByRect: true,
  hide: true,
  isolate: true,
  section: true,
  scatter: true,
  wireFrame: true,
  changeCptColor: true,
  measure: true,
  cptInfo: true,
  infoTree: true,
  mark: true,
  snapshot: true,
  annotation: true,
  moreMenu: true,
  cptsearch: true,
  modelinfo: true,
  minimap: true,
  open2d: true
};

// 弹窗初始位置
const getModalPlaceByIndex = (index, place = 'right') => {
  if (place === 'right') {
    const tStep = (index - 1) * 0;
    const rStep = (index - 1) * 30;
    const initHeigth = 160;
    const initRight = 20;
    return {
      top: `${initHeigth + tStep}px`,
      left: undefined,
      right: `${initRight + rStep}px`,
      bottom: undefined,
    };
  }
  if (place === 'left') {
    const tStep = (index - 1) * 0;
    const lStep = (index - 1) * 30;
    const initHeigth = 140;
    const initLeft = 20;
    return {
      top: `${initHeigth + tStep}px`,
      left: `${initLeft + lStep}px`,
      right: 'initial',
      bottom: undefined,
    };
  }

  return {};
};

export const DEFAULT_MODAL_PLACE = {
  cptInfo: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(1, 'right')
  },
  mark: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(2, 'right')
  },
  annotation: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(3, 'right')
  },
  snapshot: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(4, 'right')
  },
  changeCptColor: {
    ...getModalPlaceByIndex(5, 'right'),
    ...{
      width: '',
      height: '',
      left: 'initial',
      bottom: 'initial'
    },
  },
  roam: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(1, 'right')
  },
  measure: {
    ...getModalPlaceByIndex(2, 'right'),
    ...{
      width: '',
      height: '',
      // top: '10px',
      left: undefined,
      // right: '10px',
      bottom: undefined,
    },
  },
  cptsearch: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(1, 'right')
  },

  section: {
    ...getModalPlaceByIndex(2, 'right'),
    ...{
      width: '',
      height: '',
      top: '200px'
    },
  },
  scatter: {
    ...getModalPlaceByIndex(2, 'right'),
    ...{
      width: '',
      height: '',
      top: '240px'
    },
  },
  // ====== 右边 end ========

  fit: true,
  infoTree: {
    ...getModalPlaceByIndex(1, 'left'),
    ...{
      width: '',
      height: ''
    },
  },

  undo: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(2, 'left')
  },
  reset: {
    ...{
      width: '',
      height: '',
    },
    ...getModalPlaceByIndex(3, 'left')
  },
  pickByRect: true,
  hide: true,
  isolate: true,

  modelinfo: {
    ...{
      width: '',
      height: '',
    },
    ...{
      right: "calc(50% - 175px)",
      top: "calc(50% - 70px)"
    },
  },

  minimap: true,
  open2d: true,
  wireFrame: true,

  moreMenu: true,
};
