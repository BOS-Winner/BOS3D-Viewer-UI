import React from "react";
import PropTypes from "prop-types";
import downloadFile from "UIutils/download";
// import RoamPlayer from "./RoamPlayer";
import NumberControler from "Base/Number";
import _ from "lodash-es";
import Ranger from "Base/Ranger";
// import * as Icon from "./Icon";
import Modal from 'Base/Modal';
import Rename from "../RouteRoam/rename";
import { json2yjbos3dRecord } from "../fileParser";
import toastr from "../../../toastr";
import { EXT } from "../fileParser/constant.js";
import { AntdIcon } from "../../../utils/utils";
import { EVENT } from "../../../constant";
import style from "./style.less";

class RecorderItem extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.roamPlayer = props.player;
    this.roamPlayer.addStopPlayCallback(() => {
      this.stopCB();
    });
    this.initTime = props.roam.initRoamTimeLen;
    this.state = {
      playState: 'stop',
      editName: false,
      time: 0,
      tempRoamTimeLen: props.roam.roamTime
    };
  }

  componentDidMount() {
    this.roamPlayer.addKeyFrameCallback(index => {
      this.setState({
        time: index * this.props.roam.roamTime / (this.props.roam.keyFrameList?.length - 1)
      });
    });
    this.roamPlayer.addStopPlayCallback(() => {
      this.props.onStop();
      this.setState({
        time: 0,
      });
    });

    // 监听录制播放
    this.props.eventEmitter.on(EVENT.handleRoamRecordPlay, (id) => {
      if (id === this.props.roam.getId()) {
        this.play(new Event('build'));
      }
    });
    // 监听录制暂停
    this.props.eventEmitter.on(EVENT.handleRoamRecordPause, (id) => {
      if (id === this.props.roam.getId()) {
        this.pause(new Event('build'));
      }
    });
    // 监听导出漫游录制
    this.props.eventEmitter.on(EVENT.handleExportRecord, (id) => {
      if (id === this.props.roam.getId()) {
        this.export(new Event('build'));
      }
    });

    // 监听导出漫游录制的字符串数据
    this.props.eventEmitter.on(EVENT.handleExportRecordString, (id, callback) => {
      if (id === this.props.roam.getId() && callback && typeof callback === 'function') {
        callback({
          fileName: `${this.props.roam.name}${EXT}`,
          data: json2yjbos3dRecord(this.props.roam.export())
        });
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.roam.roamTime !== this.state.tempRoamTimeLen
      && (nextState.playState !== this.state.playState
      )
    ) {
      this.setState({
        tempRoamTimeLen: nextProps.roam.roamTime,
        // time: this.stata.time * nextProps.roam.roamItem / (this.props.roam.keyFrameList.length - 1)
      });
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.forceStop && this.props.forceStop) {
      this.roamPlayer.stop();
    }
  }

  play(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.onPlay()) {
      if (this.state.time !== 0 && this.state.playState !== "pause") {
        this.onChangeTime(0);
      }
      this.roamPlayer.play();
      this.setState({
        playState: 'play',
      });
      this.props.handleActiveKey();
    }
  }

  pause(e) {
    e.preventDefault();
    e.stopPropagation();
    this.roamPlayer.pause();
    this.setState({
      playState: 'pause',
    });
    this.props.onPause();
  }

  stop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.roamPlayer.stop();
  }

  stopCB() {
    this.setState({
      playState: 'stop',
    });
    this.props.onStop();
  }

  export(e) {
    e.preventDefault();
    e.stopPropagation();
    const fileName = `${this.props.roam.name}${EXT}`;
    const blob = new Blob([json2yjbos3dRecord(this.props.roam.export())]);
    downloadFile(blob, fileName);
  }

  onRename(name) {
    if (!name) {
      toastr.error('名称不能为空', '');
      return;
    }
    this.setState({
      editName: false,
    });
    this.props.onRename(name);
  }

  onRemove(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onRemove();
  }

  onChangeTime(time) {
    const idx = Math.round(
      time * (this.props.roam.keyFrameList?.length - 1) / this.props.roam.roamTime);
    this.roamPlayer.startFromByIndex(idx);
    const tempIndex = idx > this.props.roam.keyFrameList.length - 1
      ? this.props.roam.keyFrameList.length - 1 : idx;
    this.props.viewer.linearFlyTo(this.props.roam.keyFrameList[tempIndex]);
    this.setState({
      time,
    });
  }

  render() {
    const { time, editName, tempRoamTimeLen } = this.state;
    const { roam } = this.props;
    const Name = (
      <span
        className={style.nameDisplay}
        role="document"
        // onClick={() => { this.setState({ editName: true }) }}
        title={this.props.roam.name}
      >
        {this.props.roam.name}
      </span>
    );
    const timefmt = `${_.floor(Math.trunc(time / 3600), 0).toString().padStart(2, '0')}:${_.floor(Math.trunc(time % 3600 / 60), 0).toString().padStart(2, '0')}:${_.floor((time % 60), 0).toString().padStart(2, '0')}`;
    return (
      <div
        className={
          this.props.activeKey === this.props.roam.getId()
            ? `${style.roamItem} ${style.roamItemActive}`
            : style.roamItem
        }
        role="presentation"
        onClick={this.props.handleActiveKey}
      >
        {/* 第一行 */}
        <div className={style.row1}>
          <div className={style.name}>
            <div style={{ display: 'flex', justifyContent: "space-around", alignItems: 'center' }}>
              <span className={style.nameText}>
                {Name}
              </span>
              <AntdIcon
                type="iconedit"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({ editName: !editName });
                }}
              />
            </div>

            <Modal
              visible={editName}
              title="重命名"
              onCancel={() => this.setState({ editName: false })}
              top="30%"
              width="354px"
              height="213px"
              allowDrag
              viewportDiv={document.querySelector('#roamDom')}
              destroyOnClose
            >
              <Rename
                name={this.props.roam.name}
                setData={name => { this.onRename(name) }}
                cancel={() => this.setState({ editName: false })}
                okAfterCancel={() => this.setState({ editName: false })}
              />
            </Modal>
          </div>
          <div className={style.operaContainer}>
            <AntdIcon
              type="iconicon_export"
              title="导出"
              className={style.antdIcon}
              onClick={e => { this.export(e) }}
            />
            <AntdIcon
              type="icondelete"
              title="删除"
              className={style.antdIcon}
              onClick={e => { this.onRemove(e) }}
            />
          </div>
        </div>
        {/* 第二行 */}
        <div className={style.row2}>
          <AntdIcon
            type={this.state.playState === "play" ? "iconsuspend" : "iconplay"}
            title="播放"
            className={style.antdIcon}
            onClick={e => {
              if (this.state.playState === 'play') {
                this.pause(e);
              } else {
                this.play(e);
              }
            }}
          />
          <span>{timefmt}</span>
          <Ranger
            min={0}
            max={tempRoamTimeLen}
            step={tempRoamTimeLen / (roam.keyFrameList?.length - 1)}
            value={time}
            onChange={v => { this.onChangeTime(v) }}
          />
          <NumberControler
            initNum={1}
            step={0.1}
            min={0.1}
            max={10}
            onChange={speed => {
              roam.setRoamTime(_.round(this.initTime / speed, 3));
              if (this.state.playState === 'play') {
                this.pause(new Event('build'));
                // this.onChangeTime(0);
              }
            }}
          />
        </div>
      </div>
    );
  }
}

RecorderItem.propTypes = {
  roam: PropTypes.object.isRequired,
  player: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  // BIMWINNER: PropTypes.object.isRequired,
  onRename: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onPlay: PropTypes.func,
  onStop: PropTypes.func,
  onPause: PropTypes.func,
  forceStop: PropTypes.bool,
  activeKey: PropTypes.string.isRequired,
  handleActiveKey: PropTypes.func.isRequired,
  eventEmitter: PropTypes.object.isRequired,
};

RecorderItem.defaultProps = {
  onPlay: () => true,
  onStop: () => {},
  onPause: () => {},
  forceStop: false,
};

export default RecorderItem;
