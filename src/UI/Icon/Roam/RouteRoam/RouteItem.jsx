import React from 'react';
import PropTypes from 'prop-types';
import NumberControler from "Base/Number";
import Ranger from "Base/Ranger";
import downloadFile from "UIutils/download";
import _ from "lodash-es";
// import Rename from './rename';
// import Modal from '../../../Base/Modal';
// import ViewManager from './ViewManager.tsx';
// import confirm from '../../../Base/confirm';
import style from "./style.less";
import { AntdIcon } from '../../../utils/utils';

const DISABLED_COLOR = '#ccc';
class RouteItem extends React.Component {
  constructor(props) {
    super(props);
    this.nameRef = React.createRef();
    this.state = {
      time: 0,
      perspIndex: 0,
      reNameVisible: false,
    };
  }

  componentDidMount() {
    this.props.roamPlayer.addKeyFrameCallback(index => {
      this.setState({
        perspIndex: index,
        time: index * this.props.recTimeLen / (this.props.routeLen - 1)
      });
    });
    this.props.roamPlayer.addStopPlayCallback(() => {
      this.props.onPlay('stop');
      this.setState({
        time: 0,
        perspIndex: 0,
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.recTimeLen !== this.props.recTimeLen) {
      this.setState({
        time: nextState.perspIndex * nextProps.recTimeLen / (nextProps.routeLen - 1)
      });
    }
    if (!this.props.roamPlayer.keyFrameCallback.length) {
      this.props.roamPlayer.addKeyFrameCallback(index => {
        this.setState({
          perspIndex: index,
          time: index * this.props.recTimeLen / (this.props.routeLen - 1)
        });
      });
    }
    if (!this.props.roamPlayer.stopPlayCallback.length) {
      this.props.roamPlayer.addStopPlayCallback(() => {
        this.props.onPlay('stop');
        this.setState({
          time: 0,
          perspIndex: 0,
        });
      });
    }
    return true;
  }

  onChangeTime(time) {
    this.props.onChangeFrame(Math.round(time * (this.props.routeLen - 1) / this.props.recTimeLen));
    this.setState({
      time,
    });
  }

  // rename
  handleReName = () => {
    const { reNameVisible } = this.state;
    this.setState({
      reNameVisible: !reNameVisible,
    });
  }

  render() {
    const {
      time,
      // tempRomaTimeLen,
    } = this.state;
    const {
      playingState,
      name,
      index,
      isEditing, // editing route
      // isSaveRoute, // whether to save the route（function）
      editRoute, // edit route (function)
      selectedId,
      route
    } = this.props;

    // eslint-disable-next-line compat/compat
    // 解决时间格式化后现实多位小数，精度不准确问题。
    const timefmt = `${_.floor(Math.trunc(time / 3600), 0).toString().padStart(2, '0')}:${_.floor(Math.trunc(time % 3600 / 60), 0).toString().padStart(2, '0')}:${_.floor((time % 60), 0).toString().padStart(2, '0')}`;

    return (
      <div
        className={[isEditing !== index ? `${style.routeItem}` : `${style.routeItem} ${style.routeItemActive}`, `${selectedId === index ? style.routeItemActive : ''}`].join(' ')}
      >
        <div className={style.row1}>
          <div
            role="presentation"
            title={name}
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <p title={name} className={style.nameText}>{name}</p>
          </div>
          <div>
            <AntdIcon
              type="iconicon_edit"
              title="编辑"
              className={isEditing === index ? style.antdIconActive : style.antdIcon}
              onClick={() => editRoute(index)}
            />
            <AntdIcon
              type="iconicon_export"
              title="导出"
              className={isEditing === index ? style.antdIconForbiden : style.antdIcon}
              style={{ color: isEditing === index ? DISABLED_COLOR : '' }}
              onClick={ev => {
                ev.preventDefault();
                ev.stopPropagation();
                if (isEditing !== index) {
                  const { fileName, blob } = route.exportRoute();
                  downloadFile(blob, fileName);
                }
              }}
            />
            <AntdIcon
              type="icondelete"
              title="删除"
              className={isEditing === index ? style.antdIconForbiden : style.antdIcon}
              style={{ color: isEditing === index ? DISABLED_COLOR : '' }}
              onClick={ev => {
                ev.preventDefault();
                ev.stopPropagation();
                if (isEditing !== index) {
                  this.props.onDelete();
                }
              }}
            />
          </div>
        </div>
        <div className={style.row2}>
          <AntdIcon
            type={playingState === "play" ? "iconsuspend" : "iconplay"}
            title="播放"
            className={isEditing ? style.antdIconForbiden : style.antdIcon}
            style={{ color: isEditing ? DISABLED_COLOR : '' }}
            onClick={ev => {
              ev.preventDefault();
              ev.stopPropagation();
              if (isEditing === "") { // if there is no path being edited
                this.props.onPlay(playingState === "play" ? "pause" : "play");
              }
            }}
          />
          <span>{timefmt}</span>
          <Ranger
            min={0}
            max={route.roamTime}
            step={route.roamTime / (this.props.routeLen - 1)}
            value={time}
            onChange={v => { this.onChangeTime(v) }}
          />
          <NumberControler
            initNum={1}
            step={0.1}
            min={0.1}
            max={10}
            onChange={speed => {
              this.props.onChangeSpeed(speed);
            }}
          />
        </div>
      </div>
    );
  }
}

RouteItem.propTypes = {
  name: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onChangeSpeed: PropTypes.func.isRequired,
  onChangeFrame: PropTypes.func.isRequired,
  playingState: PropTypes.oneOf(['play', 'stop', 'pause']).isRequired,
  recTimeLen: PropTypes.number.isRequired,
  routeLen: PropTypes.number.isRequired,
  roamPlayer: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
  editRoute: PropTypes.func.isRequired,
  isEditing: PropTypes.string.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  route: PropTypes.object.isRequired,
};

export default RouteItem;
