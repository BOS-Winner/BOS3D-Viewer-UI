import React from "react";
import PropTypes from "prop-types";
import toastr from "../../../toastr";
import RouteItem from "./RouteItem";
import PerspectiveManager from "./PerspectiveManager";
import CustomConfirm from '../../../Base/CustomConfirm';
import { AntdIcon } from '../../../utils/utils';
import style from "./style.less";

class RouteManager extends React.Component {
  constructor(props) {
    super(props);
    // 路由整合实例化
    this.roamManager = new props.BIMWINNER.BOS3D.Plugins.Roam.RouteRoam({
      viewer: props.viewer,
    });
    // 实例化路径列表
    this.routeList = new props.BIMWINNER.BOS3D.Plugins.Roam.RouteList({ viewer: props.viewer });
    this.state = {
      /**
       * @param {object[]} route
       * @param {string} route[].name - name
       * @param {string} route[].key - key
       * @param {{ position: THREE.Vector3, target: THREE.Vector3, up: THREE.Vector3}}[]} route[].route - keyFrameList
       */
      route: [],
      playingId: '',
      pausingId: '',
      selectedId: '',
      editRouteKey: '', // editing route key，
      tipStatus: false, // tip state
    };
  }

  // 编辑路径 (默认空字符串是关闭编辑)
  editRoute = (index = "") => {
    this.setState({
      editRouteKey: index,
    });
  }

  // 保存路径
  saveRoute(routeItem) {
    const { id } = routeItem;
    this.roamManager.addRoute(routeItem);

    // 判断是否存在该条路径，如果存在就删除然后添加
    let index = -1;
    for (let i = 0; i < this.state.route.length; i++) {
      if (this.state.route[i].id === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      const { route: Route } = this.state;
      const tempRouteList = [].concat(Route);
      tempRouteList.splice(index, 1, routeItem);
      this.setState({
        route: tempRouteList,
      });
    } else {
      // 更新路径列表
      const tempRouteList = this.state.route;
      this.updateRouteList([...tempRouteList, routeItem]);
      this.setState({
        playingId: "",
        pausingId: "",
      });
    }
  }

  // 导入路径
  importRecord(record) {
    const tempRoute = this.routeList.importRoute(record);
    // 更新路径列表
    this.updateRouteList(() => {
      toastr.success(`${tempRoute.info.name} 导入成功`);
    });
  }

  // 导入路径
  onImportRoute(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    // 获取文件后缀
    const { EXT } = this.props.BIMWINNER.BOS3D.Plugins.Roam.fileParser;
    input.accept = EXT;
    input.addEventListener('input', e => {
      if (e.target.value) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            this.importRecord(reader.result);
          } catch (error) {
            toastr.error('导入失败');
          }
        };
        reader.readAsText(e.target.files[0]);
      }
    });
    // determine if the path is in the editing state.
    const { editRouteKey } = this.state;
    const isEditing = !!editRouteKey; // Is it being edited
    if (isEditing) {
      this.isSaveRoute(() => input.click()); // 如果有路径正在编辑，弹框提示是否保存
    } else {
      input.click();
    }
  }

  isSaveRoute(callback) {
    CustomConfirm({
      title: '退出前是否需要保存路径？',
      message: `退出则您修改的路径不会被保存`,
      viewportDiv: document.getElementById('roam'),
      okFunc: () => {
        this.childFunc.saveRoute(); // 子组件中的保存路径函数
        if (callback && typeof callback === 'function') { // 保持导入动作的连续性, (弃用，取消连贯性)
          callback();
        }
      },
      cancelFunc: () => {
        this.childFunc.reset();
        if (callback && typeof callback === 'function') { // 保持导入动作的连续性, (弃用，取消连贯性)
          callback();
        }
      },
      okText: "保存",
      cancelText: "退出"
    });
  }

  rmRoute(key, index, name) {
    this.setState({
      selectedId: key,
    });
    CustomConfirm({
      title: '请确认',
      message: `是否要删除名称为${name}的路径`,
      viewportDiv: document.getElementById('roam'),
      okFunc: () => {
        this.setState({
          selectedId: '',
        });
        this.routeList.removeRoute(index);
        this.updateRouteList();
      },
    });
  }

  roam(index, i = 0, len = this.state.route[index].route.length) {
    if (i < len) {
      this.props.viewer.linearFlyTo(this.state.route[index].route[i], () => {
        this.roam(index, i + 1, len);
      });
    }
  }

  renameRoute(key, index, name) {
    this.setState(state => {
      const routes = state.route;
      routes[index].name = name;
      this.roamManager.getRoute(key)
        .setName(name);
      return {
        route: routes,
      };
    });
  }

  // 路径播放
  onPlay(id, state) {
    const currentPlayer = this.routeList.getRouteById(id).player;
    const { playingId, pausingId } = this.state;
    // 暂停播放
    if (state === 'pause' && id === playingId) {
      currentPlayer.pause();
      this.setState({
        playingId: '',
        pausingId: id
      });
    } else if (state === 'play') {
      // 如果有其他路径正在播放，先暂停其他路径的播放
      if (playingId && playingId !== id) {
        const tempPlayer = this.routeList.getRouteById(playingId);
        if (tempPlayer) {
          tempPlayer.stop();
        }
      }

      // 如果当前路径是暂停状态，就继续播放
      if (pausingId === id) {
        currentPlayer.continue();
        this.setState({
          playingId: id,
          pausingId: "",
        });
        return;
      }

      // 播放当前路径
      currentPlayer.play(id);
      this.setState({
        playingId: id,
        pausingId: id === pausingId ? '' : pausingId,
        selectedId: id,
      });
    } else if (state === 'stop') {
      this.setState({
        playingId: '',
        pausingId: ''
      });
    }
  }

  onChangeSpeed(id, speed) {
    const currentRoute = this.routeList.getRouteById(id);
    currentRoute.setRoamTime(currentRoute.initRoamTime / speed);
    currentRoute.player.roam = currentRoute;
  }

  onChangeFrame(id, frame) {
    const currentRoute = this.routeList.getRouteById(id);
    const frameIndex = currentRoute.keyFrameList.length - 1
      ? currentRoute.keyFrameList.length - 1 : frame;
    currentRoute.player.startFrom(id, frame);
    this.props.viewer.linearFlyTo(currentRoute.keyFrameList[frameIndex]);
  }

  onClickCard(ev, id) {
    ev.stopPropagation();
    // const currentPlayer = this.routeList.getRouteById(id).player;
    this.setState(() => ({
      selectedId: id,
      // pausingId: state.playingId,
    })
    );
  }

  // 视角重命名保存
  saveName = (name, index) => {
    const { route } = this.state;
    const tempData = route;
    for (let i = 0; i < tempData.length; i++) {
      if (tempData[i].key === index) {
        tempData[i].name = name;
      }
    }
    this.setState({
      route: tempData,
    });
  }

  // child save route func
  childSaveRoute = (ref) => {
    this.childFunc = ref;
  }

  // save succuss tip
  Tip = (props) => {
    switch (props.type) {
      case 'success':
        return (
          <div className={style.successTip}>
            <AntdIcon type="icondetermine" />
            <span>{props.message}</span>
          </div>
        );
      default:
        break;
    }
    return null;
  }

  // handle tip show or hide
  handleTip = () => {
    this.setState({
      tipStatus: true
    });
    // 1.5s close tip
    setTimeout(() => {
      this.setState({ tipStatus: false });
    }, 1500);
  }

  /**
   * 路径编辑
   */
  handleEditRoute = key => {
    // 如果正在编辑则不能点击
    if (this.state.editRouteKey === key) return;

    // 判断是否可以编辑，是否要弹出提示保存的弹框
    if (this.state.editRouteKey !== "") {
      this.isSaveRoute();
    } else {
      this.editRoute(key);
    }
  }

  /**
   * 更新路径列表
   * @param {function} callback 更新完路径列表后的回调函数
   */
  updateRouteList = (callback) => {
    this.setState(state => ({
      ...state,
      route: this.routeList.getRouteList()
    }), () => {
      if (callback && typeof callback === "function") {
        callback();
      }
    });
  }

  render() {
    const routeList = [];
    const { editRouteKey, tipStatus } = this.state;
    // init path list
    this.state.route.forEach((item, index) => {
      const playState = this.state.playingId === item.id ? 'play'
        : this.state.pausingId === item.id ? 'pause'
          : 'stop';
      const routeLen = item.keyFrameList?.length;
      routeList.push(
        <div
          key={item.id}
          className={this.state.selectedId === item.id ? style.selectedItem : ''}
          role="dialog"
          onClick={ev => {
            this.onClickCard(ev, item.id);
          }}
        >
          <RouteItem
            name={item.name}
            onDelete={() => {
              this.rmRoute(item.id, index, item.name);
            }}
            viewer={this.props.viewer}
            roamPlayer={item.player}
            recTimeLen={item.roamTime}
            routeLen={routeLen} // 帧的多少，包含了插入帧
            onRename={name => {
              this.renameRoute(item.id, index, name);
            }}
            route={item}
            onPlay={state => this.onPlay(item.id, state)}
            onChangeSpeed={speed => this.onChangeSpeed(item.id, speed)}
            onChangeFrame={frame => this.onChangeFrame(item.id, frame)}
            playingState={playState}
            index={item.id}
            saveName={(name, idx) => this.saveName(name, idx)}
            // 编辑路径
            editRoute={(key) => this.handleEditRoute(key)}
            isEditing={editRouteKey} // 当前正在编辑的路径id，用于判断是否
            isSaveRoute={callback => this.isSaveRoute(callback)}
            selectedId={this.state.selectedId}
          />
        </div>
      );
    });
    // tip
    const successTip = this.Tip({
      type: 'success',
      message: '保存成功'
    });

    return (
      <div className={style.routeRoam} id="roam">
        <PerspectiveManager
          onSaveRoute={route => this.saveRoute(route)}
          roamManager={this.roamManager} // 把漫游管理器给到视角管理器，方便后期的路径编辑
          editRouteKey={this.state.editRouteKey} // 正在编辑的路径key
          route={this.state.route}
          closeEdit={this.editRoute}
          onRef={this.childSaveRoute}
          handleTip={this.handleTip}
          BOS3D={this.props.BIMWINNER.BOS3D}
          active={this.props.active}
          routeList={this.routeList}
          updateRouteList={this.updateRouteList}
        />
        <div className={style.routeListTitle}>
          <div>路径列表：</div>
          <div
            className={style.importBtn}
            role="button"
            tabIndex={0}
            onClick={ev => {
              this.onImportRoute(ev);
            }}
          >
            <AntdIcon type="iconicondaoruImport" className={style.antdIcon} />
            导入
          </div>
        </div>
        <div className={style.routeList}>
          {routeList.reverse()}
        </div>
        {/* tip */}
        {tipStatus && successTip}
      </div>
    );
  }
}

RouteManager.propTypes = {
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
};

export default RouteManager;
