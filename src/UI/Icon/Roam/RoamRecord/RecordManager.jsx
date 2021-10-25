import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import Recorder from "./Recorder";
import RecorderItem from "./RecorderItem";
import CustomConfirm from '../../../Base/CustomConfirm';
import generateUUID from "../../../utils/generateUUID";
import style from "./style.less";

class RecordManager extends React.Component {
  constructor(props) {
    super(props);
    this.roamData = {};
    this.recordPlayingId = ''; // 记录正在播放的录像id
    this.recordRouteIndex = 0;
    this.state = {
      activeKey: ''
    };
  }

  addRecord(data, info = {}) {
    // debugger;
    // if (info.id) {
    //   const found = Object.keys(this.roamData).some(record => record.id === info.id);
    //   if (found) return;
    // }
    const _info = {
      name: `漫游录制${++this.recordRouteIndex}`,
      id: generateUUID(),
      roamTime: 5,
    };
    _.assign(_info, info);
    _info.id = generateUUID();
    const tempData = new this.props.BIMWINNER.BOS3D.Roam({
      ..._info,
      keyFrameList: data,
    });
    tempData.initRoamTimeLen = tempData.roamTime;
    this.roamData[tempData.getId()] = {
      data: tempData,
      player: new this.props.BIMWINNER.BOS3D.RoamPlayer({
        viewer: this.props.viewer.getViewerImpl(),
        roamData: tempData,
      })
    };
    this.forceUpdate();
  }

  renameRoam(id, name) {
    if (this.roamData[id]) {
      this.roamData[id].data.setName(name);
      this.forceUpdate();
    }
  }

  removeRoam(id) {
    CustomConfirm({
      title: '请确认',
      message: `是否要删除名称为${this.roamData[id].data.name}的录制`,
      viewportDiv: document.getElementById('recordRoam'),
      okFunc: () => {
        if (id === this.recordPlayingId) {
          this.roamData[this.recordPlayingId].player.startFromByIndex(0);
          this.props.viewer.linearFlyTo(this.roamData[this.recordPlayingId].data.keyFrameList[0]);
          this.roamData[this.recordPlayingId].player.stop();
        }
        delete this.roamData[id];
        this.forceUpdate();
      },
    });
  }

  shouldPlay(id) {
    if (this.recordPlayingId === '') {
      this.recordPlayingId = id;
      return true;
    } else {
      // 停止当前播放的路径，开始新的路径播放
      this.roamData[this.recordPlayingId].player.startFromByIndex(0);
      this.roamData[this.recordPlayingId].player.stop();
      this.onStopPlay(this.recordPlayingId);
      this.recordPlayingId = id;
      return true;
    }
  }

  onStopPlay = (id) => {
    if (this.recordPlayingId === id) {
      this.recordPlayingId = '';
    }
  }

  handleActive = (key) => {
    this.setState({
      activeKey: key,
    });
  }

  render() {
    const { BIMWINNER, viewer } = this.props;
    return (
      <div className={style.container} id="recordRoam">
        <Recorder
          viewer={this.props.viewer}
          onOk={(data, time) => { this.addRecord(data, { roamTime: time }) }}
          onImport={json => {
            this.addRecord(json.keyFrameList, json.info);
          }}
          disabled={!this.props.active}
        />
        {
          Object.values(this.roamData).length ? (
            <div className={style.roamList}>
              {Object.values(this.roamData).reverse().map(item => (
                <RecorderItem
                  key={item.data.getId()}
                  roam={item.data}
                  player={item.player}
                  viewer={viewer}
                  BIMWINNER={BIMWINNER}
                  onRename={name => { this.renameRoam(item.data.getId(), name) }}
                  onRemove={() => { this.removeRoam(item.data.getId()) }}
                  onPlay={() => this.shouldPlay(item.data.getId())}
                  onPause={() => this.onStopPlay(item.data.getId())}
                  onStop={() => this.onStopPlay(item.data.getId())}
                  forceStop={!this.props.visible}
                  activeKey={this.state.activeKey}
                  handleActiveKey={() => this.handleActive(item.data.getId())}
                />
              ))}
            </div>
          ) : null
        }
      </div>
    );
  }
}

RecordManager.propTypes = {
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
};

export default RecordManager;
