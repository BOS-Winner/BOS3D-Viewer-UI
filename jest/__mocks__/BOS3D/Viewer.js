/* eslint-disable lines-between-class-members */
import * as THREE from 'Libs/THREE';
import { Matrix4 } from 'three/src/math/Matrix4';
import { Vector4 } from 'three/src/math/Vector4';

class Viewer {
  constructor() {
    this.viewport = 'id';
    this.viewportDiv = document.createElement('div');
    this.viewportDiv.style = "width: 1920px; height: 1080px";
    this.viewportDiv.id = this.viewport;
    document.body.appendChild(this.viewportDiv);
    const svgParent = document.createElement('div');
    this.viewportDiv.appendChild(svgParent);

    this.viewerImpl = {
      modelManager: {
        models: {
          'M1145141919810': {
            modelConfig: {
              modelName: '佛祖保佑',
            },
            getConfig: () => ({
              modelName: '佛祖保佑',
            }),
            hasLights: () => false,
          },
          'M1145141919811': {
            modelConfig: {
              modelName: '永无bug',
            },
            getConfig: () => ({
              modelName: '永无bug',
            }),
            hasLights: () => true,
            enableLights: () => {},
            disableLights: () => {},
          },
        },
        getStatisticsInfo: () => ({
          componentCount: 114514,
          trianglesCount: 1919810,
        }),
        getModelKeys: () => [
          'M1145141919810',
          'M1145141919811',
        ],
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      camera: {
        position: new THREE.Vector3(1000, 2000, 3000),
        target: new THREE.Vector3(3000, 2000, 1000),
        up: new THREE.Vector3(0, 0, 1),
        quaternion: new Vector4(-0.028, 0.536, 0.843, -0.044),
      },
      cameraControl: {
        projectPositionToBottom: pos => [pos.x, pos.y],
        getCamera: () => this.viewerImpl.camera,
      },
      controlManager: {
        setFocus: () => {},
      },
      renderer: {
        domElement: svgParent,
      },
      getRenderer: () => this.viewerImpl.renderer,
      getModelMatrix: key => (
        this.viewerImpl.modelManager.getModelKeys().includes(key) ? new Matrix4() : undefined
      ),
      setPointRotateMode() {},
      lockAxisZ() {},
      setOrbitButton() {},
      setReverseWheelDirection() {},
      enableShadow() {},
    };
  }

  getViewerImpl() {
    return this.viewerImpl;
  }

  resize(x, y) {
    return { x, y };
  }

  addView(modelKey, projKey) {
    this.getViewerImpl().modelManager.models[modelKey] = {
      configLoader: {
        config: {
          hasDrawing: true,
        }
      }
    };
    return { modelKey, projKey };
  }

  removeView(modelKey) {
    this.getViewerImpl().modelManager.models[modelKey] = undefined;
    return { modelKey };
  }

  getScreenCoordFromSceneCoord(pos) {
    return [pos[0], pos[1]];
  }

  canFloorExplosion() {
    return true;
  }

  getAnimatorDuration() {
    return 800;
  }

  getRootScene() {
    return {
      lightManager: {
        enableLights: () => {},
        disableLights: () => {},
      }
    };
  }

  registerModelEventListener() {}
  unregisterModelEventListener() {}
  registerCameraEventListener() {}
  unregisterCameraEventListener() {}
  registerControlEventListener() {}
  unregisterControlEventListener() {}
  enableSectionBox() {}
  disableSectionBox() {}
  setSectionBoxMode() {}
  hideSectionBox() {}
  showSectionBox() {}
  resetSectionBox() {}
  resetScene() {}
  showComponentsByKey() {}
  hideComponentsByKey() {}
  isolateComponentsByKey() {}
  closeIsolateComponentsByKey() {}
  colorfulComponentsByKey() {}
  closeColorfulComponentsByKey() {}
  wireFrameComponentsByKey() {}
  closeWireFrameComponentsByKey() {}
  modelsExplosion() {}
  closeModelsExplosion() {}
  floorExplosion() {}
  closeFloorExplosion() {}
  render() {}
}

export default Viewer;
