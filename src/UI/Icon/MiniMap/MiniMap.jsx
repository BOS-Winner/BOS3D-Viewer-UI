import React from "react";
import PropTypes from "prop-types";
import Icon from "Base/Icon";
import { connect } from "react-redux";
// import { Tooltip } from "@material-ui/core";
import { Select, Switch } from 'antd';
// import Item from "antd/lib/list/Item";
import Modal from "../../Base/Modal";
import style from "./style.less";
// import image from "../img/white/minimap.png";
// import flow from "../img/white/minimap_flow.png";
// import dropDownIcon from "../img/white/dropdown.png";
import CameraMark from "./CameraMark.jsx";
// import CheckBox from "../../Base/CheckBox";
import toastr from "../../toastr";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

class MiniMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      mapListVisible: false,
      viewAreaVisible: true, // 小人视角
      cameraPositionInScene: {
        x: 0,
        y: 0,
        z: 0,
        angle: 0
      },
      currentMap: undefined,
      currentMapIndex: 0,
    };
    this.maps = undefined; // 所有楼层小地图，从viewer获取到
    this.cameraDiv = React.createRef();
    this.autoChangeMap = false;
    this.onViewerCameraChange = this.onViewerCameraChange.bind(this);
  }

  /**
   * 加载小地图函数
   */
  toggleVisible() {
    const scope = this;
    if (this.state.visible === false) { // 如果小地图的modal框没有显示
      if (this.props.viewer) {
        if (!this.maps) {
          // 提示小地图正在加载
          toastr.info("小地图数据正在获取，请稍后~", '', {
            target: `#${scope.props.viewer.viewport}`,
            "timeOut": "180000",
            "progressBar": false,
          });
          const keys = this.props.viewer.viewerImpl.modelManager.getBIMModelKeys();
          this.props.viewer.getModelFloorMapsByKey(keys[0], (maps) => {
            if (maps) {
              if (maps.data) {
                scope.maps = maps.data;
              } else if (maps.msg) {
                // 发生错误后取消提示
                toastr.remove();
                // 提示错误
                toastr.error(maps.msg, '', {
                  target: `#${scope.props.viewer.viewport}`,
                });
                return;
              }
              if (scope.maps) {
                setTimeout(() => {
                  toastr.remove();
                }, 1000);
                scope.props.viewer.registerCameraEventListener(
                  scope.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
                  scope.onViewerCameraChange);
                scope.onViewerCameraChange();
                scope.setState({
                  visible: true
                });
              }
            }
          });
        }
        if (this.maps) {
          this.props.viewer.registerCameraEventListener(
            this.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
            this.onViewerCameraChange);
          this.onViewerCameraChange();
          this.setState({
            visible: true
          });
        }
      }
    } else {
      this.setState({
        visible: false
      });
      this.props.viewer.unregisterCameraEventListener(
        this.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
        this.onViewerCameraChange
      );
    }
  }

  componentDidMount() {
    this.props.viewer.unregisterCameraEventListener(
      this.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
      this.onViewerCameraChange
    );
    const scope = this;
    this.props.viewer.registerModelEventListener(
      this.props.BIMWINNER.BOS3D.EVENTS.ON_UNLOAD_COMPLETE,
      () => {
        // 卸载模型后小地图置空
        scope.maps = undefined;
        // 如果小地图开启，则关闭小地图
        scope.close();
        // 重置其他参数
        this.setState({
          mapListVisible: false,
          viewAreaVisible: true, // 小人视角
          cameraPositionInScene: {
            x: 0,
            y: 0,
            z: 0,
            angle: 0
          },
          currentMap: undefined,
          currentMapIndex: 0,
        });
      }
    );
  }

  close() {
    this.setState({
      visible: false
    });
    this.props.viewer.unregisterCameraEventListener(
      this.props.BIMWINNER.BOS3D.EVENTS.ON_CAMERA_CHANGE,
      this.onViewerCameraChange
    );
  }

  toggleMapListVisible() {
    this.setState((pre) => ({
      mapListVisible: !pre.mapListVisible
    }));
  }

  onOptionSelect(index) {
    this.setState({
      currentMap: this.maps[index],
      currentMapIndex: index
    });
  }

  lookupCurrentMap() {
    if (this.maps) {
      let zMatchedMap;
      let closestMap;
      if (!this.state.currentMap || this.autoChangeMap) {
        // 如果还未选择地图 或者自动切换地图
        let minZDistance = Infinity;
        for (let i = 0, iLen = this.maps.length; i < iLen; i += 1) {
          const map = this.maps[i];
          if (this.state.cameraPositionInScene.z > map.box.z1
            && this.state.cameraPositionInScene.z < map.box.z2) {
            zMatchedMap = map;

            if (this.state.cameraPositionInScene.x > map.box.x1
              && this.state.cameraPositionInScene.x < map.box.x2
              && this.state.cameraPositionInScene.y > map.box.y1
              && this.state.cameraPositionInScene.y < map.box.y2
            ) {
              // 求最为匹配的小地图，距离小地图包围盒底部+人的高度最近的
              const dis = Math.abs(this.state.cameraPositionInScene.z - (map.box.z1 + 1650));
              if (dis < minZDistance) {
                minZDistance = dis;
                closestMap = map;
              }
            }
          }
        }
        const map = closestMap || zMatchedMap || this.state.currentMap || this.maps[0];
        const mapFindAt = this.maps.findIndex(item => item.name === map.name);
        if (map !== this.state.currentMap) {
          this.setState({
            currentMap: map,
            currentMapIndex: mapFindAt
          });
        }
      }
    }
  }

  onViewerCameraChange() {
    const camera = this.props.viewer.viewerImpl.cameraControl.getCamera();
    // const direction = camera.getWorldDirection();
    const dir = camera.target.clone();
    dir.sub(camera.position);
    dir.z = 0;
    const length = dir.length();
    let resultAngle = 0;
    if (dir.y !== 0 || dir.x !== 0) {
      let angle = Math.atan2(-dir.y, dir.x);
      const doublePi = 2 * Math.PI;
      if (angle < 0) {
        angle += doublePi;
      }
      if (angle >= doublePi) {
        angle -= doublePi;
      }
      resultAngle = angle * 180 / Math.PI;
    } else {
      resultAngle = undefined;
    }

    const visb = !this.equalToZero(length);
    this.setState(() => ({
      cameraPositionInScene: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        angle: resultAngle
      },
      viewAreaVisible: visb
    }), () => {
      this.lookupCurrentMap();
    });
  }

  equalToZero(length) {
    if (length < 0.000000001 && length > -0.000000001) {
      return true;
    }
    return false;
  }

  onMapClick(coord) {
    const camera = this.props.viewer.viewerImpl.cameraControl.getCamera();
    const p = camera.position.clone().set(
      coord.x,
      coord.y,
      coord.z);
    const dir = camera.target.clone();
    dir.sub(camera.position);
    if ((this.equalToZero(dir.x) && this.equalToZero(dir.y)) === false) {
      dir.z = 0;
    }
    const t = dir.add(p);
    this.props.viewer.viewerImpl.lookAt(p, t, camera.up);
    if (this.state.mapListVisible === true) {
      this.toggleMapListVisible();
    }
  }

  onCameraRotate(angle) {
    console.log(angle);
    const radian = angle * Math.PI / 180;
    // 小地图上向上是对应3D世界里的y正半轴，向右对应3D世界里的x正半轴
    const camera = this.props.viewer.viewerImpl.cameraControl.getCamera();
    const dir = camera.target.clone();
    dir.sub(camera.position);
    const z = dir.z;
    dir.z = 0;
    const length = dir.length();
    if (this.equalToZero(length)) {
      // 此时无法映射为xy平面上的一条向量，映射出来是一个点
      // 要旋转方向，得改变相机的up值
      this.setState({
        viewAreaVisible: false
      });
    } else {
      const currentDir = dir.clone()
        .set(Math.cos(radian), -Math.sin(radian), 0).multiplyScalar(length);
      currentDir.z = z;
      const target = currentDir.add(camera.position);
      this.props.viewer.viewerImpl.lookAt(camera.position, target, camera.up);
      this.setState({
        viewAreaVisible: true
      });
    }
  }

  render() {
    const { isMobile } = this.props;
    const { currentMapIndex } = this.state;
    const { Option } = Select;
    const modalInfo = {
      width: isMobile ? '327px' : '344px',
      height: isMobile ? 'calc(338px - 32px)' : '344px',
      top: isMobile ? '16px' : 'initial',
      left: isMobile ? '16px' : '16px',
      right: isMobile ? 'initial' : 'initial',
      bottom: isMobile ? '16px' : '16px',
    };

    return (
      <div
        title="小地图"
        role="button"
        tabIndex={0}
        onClick={() => { this.toggleVisible() }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <Modal
          visible={this.state.visible}
          onCancel={() => {
            this.close();
          }}
          title="小地图"
          width={modalInfo.width}
          height={modalInfo.height}
          minWidth={200}
          minHeight={200}
          top={modalInfo.top}
          bottom={modalInfo.bottom}
          left="16px"
          right="initial"
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <div className={style.container}>
            <div className={style.toolContainer} id="minMapToolContainer">
              <Select
                style={{ width: "200px" }}
                onChange={(value) => {
                  this.toggleMapListVisible();
                  this.onOptionSelect(value);
                }}
                dropdownClassName={style.customDrop}
                getPopupContainer={() => document.querySelector("#minMapToolContainer")}
                listHeight={250}
                value={currentMapIndex}
              >
                {this.maps && this.maps.map((map, index) => (
                  <Option
                    className={`${style.customDropItem} ${currentMapIndex === index ? style.customDropItemActive : ""}`}
                    value={index}
                    title={map.name}
                    key={map.name}
                  >
                    {map.name}
                  </Option>
                ))}
              </Select>
              <div className={style.flowContainer}>
                <AntdIcon type="iconperspectivefollowing" title="开启后，小地图会根据相机位置自动切换到对应的楼层地图" className={style.icon} />
                <span>跟随</span>
                <Switch
                  onChange={(checked) => {
                    this.autoChangeMap = checked;
                  }}
                />
              </div>
            </div>
            <div
              role="presentation"
              className={style.mapContainer}
            >
              <CameraMark
                cameraPositionInScene={this.state.cameraPositionInScene}
                currentMap={this.state.currentMap}
                onCameraRotate={(angle) => this.onCameraRotate(angle)}
                onMapClick={(coord) => this.onMapClick(coord)}
                viewAreaVisible={this.state.viewAreaVisible}
                isMobile={isMobile}
              />
            </div>
          </div>
        </Modal>
        <Icon
          icon={<AntdIcon type="iconminimap" className={iconstyle.icon} />}
          title=""
          selected={this.state.visible}
          showTitle={false}
        />
      </div>
    );
  }
}

MiniMap.propTypes = {
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
};

MiniMap.defaultProps = {
  isMobile: false
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  isMobile: state.system.isMobile,
});

const WrappedContainer = connect(
  mapStateToProps
)(MiniMap);

export default WrappedContainer;
