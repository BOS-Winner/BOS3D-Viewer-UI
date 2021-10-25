import React from "react";
import { Button } from 'antd';
import PropTypes from "prop-types";
import toastr from "toastr";
import { yjbos3dRecord2json } from "../fileParser";
import { EXT } from "../fileParser/constant.js";
import generateUUID from "../../../utils/generateUUID";
import { AntdIcon } from "../../../utils/utils";
import style from "./style.less";

const INTERVAL_TIMEOUT = 250;

class Recorder extends React.Component {
  constructor(props) {
    super(props);
    this.data = [];
    this.time = 0;
    this.timerId = 0;
    this.state = {
      recordStatus: 'stop',
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.disabled && this.props.disabled) {
      clearInterval(this.timerId);
      this.data = [];
      this.time = 0;
      this.timerId = 0;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        recordStatus: 'stop',
      });
    }
  }

  getFrame() {
    const frame = JSON.parse(this.props.viewer.getViewerImpl().getCamera());
    frame.id = generateUUID();
    return frame;
  }

  onStart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.recordStatus !== "recording") {
      // this.time = performance.now();
      this.record();
      this.timerId = setInterval(() => {
        this.record();
      }, INTERVAL_TIMEOUT);
      this.setState({
        recordStatus: 'recording',
      });
    }
  }

  onStop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.recordStatus !== "stop") {
      clearInterval(this.timerId);
      // const time = (performance.now() - this.time) / 1000;
      const time = this.time / 1000;
      this.props.onOk(this.data, time);
      this.data = [];
      this.time = 0;
      this.timerId = 0;
      this.setState({
        recordStatus: 'stop',
      });
    }
  }

  record() {
    this.data.push(this.getFrame());
    this.time += INTERVAL_TIMEOUT;
  }

  onPause(e) {
    e.preventDefault();
    e.stopPropagation();
    clearInterval(this.timerId);
    this.setState({
      recordStatus: 'pause',
    });
  }

  onImport(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = EXT;
    input.addEventListener('input', e => {
      if (e.target.value) {
        const reader = new FileReader();
        reader.onload = () => {
          this.importRecord(reader.result);
        };
        reader.readAsText(e.target.files[0]);
      }
    });
    input.click();
  }

  importRecord(rst) {
    const result = yjbos3dRecord2json(rst);
    if (result === 2) {
      toastr.error("导入失败，该文件不是漫游录制文件！");
      return;
    }
    this.props.onImport(yjbos3dRecord2json(rst));
  }

  render() {
    let PauseButton;
    if (this.state.recordStatus === "recording") {
      PauseButton = (
        <Button className={style.recordBtn} onClick={e => { this.onPause(e) }}>
          <AntdIcon type="iconsuspend" style={{ color: 'rgba(66, 255, 171, 1)' }} />
          暂停录制
        </Button>
      );
    } else {
      PauseButton = (
        <Button className={style.recordBtn} onClick={e => { this.onStart(e) }}>
          {this.state.recordStatus === 'pause' ? <AntdIcon type="iconplay" style={{ color: 'rgba(66, 255, 171, 1)' }} /> : <AntdIcon type="iconplay" style={{ color: 'rgba(66, 255, 171, 1)' }} />}
          {this.state.recordStatus === 'pause' ? '继续录制' : '开始录制'}
        </Button>
      );
    }
    return (
      <div className={style.recorder}>
        {PauseButton}
        <Button className={style.recordBtn} onClick={e => { this.onStop(e) }}>
          <AntdIcon type="iconbeforerecording" style={{ color: 'rgba(255, 40, 69, 1)' }} />
          停止录制
        </Button>
        <Button className={style.recordBtn} onClick={e => { this.onImport(e) }}>
          <AntdIcon type="iconicon_export" style={{ color: '#fff' }} />
          导入录制
        </Button>
      </div>
    );
  }
}

Recorder.propTypes = {
  onOk: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  onImport: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Recorder.defaultProps = {
  disabled: false,
};

export default Recorder;
