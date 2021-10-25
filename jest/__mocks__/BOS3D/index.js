import Viewer from './Viewer';
import DeviceTest from './DeviceTest';
import SectionPlane from './SectionPlane';
import Roam from './Roam';
import RoamPlayer from './RoamPlayer';

export default {
  Viewer,
  EVENTS: {
    ON_CLICK_PICK: 'ON_CLICK_PICK',
    ON_RECTPICK_ADD: 'ON_RECTPICK_ADD',
    ON_LOAD_COMPLETE: 'ON_LOAD_COMPLETE',
    ON_SELECTION_CHANGED: 'ON_SELECTION_CHANGED',
    ON_POINTERLOCK_EXIST: 'ON_POINTERLOCK_EXIST',
  },
  DeviceTest,
  SectionPlane,
  Roam,
  RoamPlayer,
  RotatePivotMode: {
    MOUSEPOINT: 0, SELECTION: 1, CENTER: 2, CAMERA: 3
  },
  ControlConfig: {
    NoRotate: false,
  },
  GlobalData: {
    EnableSelectionOutline: true,
    EnableSelectionBoundingBox: false,
    EnableSelectionByTranslucent: false,
    WalkingWithViewLock: false,
  },
  DrawingStyle: {
    SHADING: 0,
    BOARDLINE: 1,
    SHADINGWITHLINE: 2,
  }
};
