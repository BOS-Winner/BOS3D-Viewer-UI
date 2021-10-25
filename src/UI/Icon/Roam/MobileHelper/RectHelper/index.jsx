import React from 'react';
import PropTypes from "prop-types";
import _ from "lodash-es";
import { getOffset } from "../../../../utils/dom";
import { AntdIcon } from '../../../../utils/utils';
import style from "./style.less";

const INIT_TOP = 40;
const MAX_DIR = 32;

class RectHelper extends React.Component {
  static propTypes = {
    onStart: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onEnd: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.pointerRef = React.createRef();
    this.initPos = {
      y: 0,
    };
    this.moving = false;
    this.touchIdentifier = -1;
    this.thTouchMove = _.throttle(e => {
      this.onTouchMove(e);
    }, 16);
    this.state = {
      cssPos: {
        top: INIT_TOP,
      }
    };
  }

  componentDidMount() {
    this.initPos.y = getOffset(this.pointerRef.current).y;
  }

  onTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();
    this.moving = true;
    this.touchIdentifier = e.changedTouches[0].identifier;
    this.props.onStart();
  }

  onTouchMove(e) {
    if (this.moving) {
      const _ev = _.find(e.changedTouches, item => item.identifier === this.touchIdentifier);
      if (_ev) {
        const y = _ev.pageY;
        let dy = y - this.initPos.y - 35;
        if (Math.abs(dy) > MAX_DIR) {
          if (dy > 0) {
            dy = MAX_DIR;
          } else {
            dy = -MAX_DIR;
          }
        }
        this.setState({
          cssPos: {
            top: INIT_TOP + dy,
          }
        });
        this.props.onChange(dy);
      }
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    this.moving = false;
    this.touchIdentifier = -1;
    this.setState({
      cssPos: {
        top: INIT_TOP,
      }
    });
    this.props.onEnd();
  }

  render() {
    return (
      <div
        className={style.rect}
        onTouchStart={e => {
          this.onTouchStart(e);
        }}
        onTouchMove={e => {
          e.preventDefault();
          e.stopPropagation();
          e.persist();
          this.thTouchMove(e);
        }}
        onTouchEnd={e => {
          this.onTouchEnd(e);
        }}
      >
        <div
          ref={this.pointerRef}
          className={style.block}
          style={{ top: this.state.cssPos.top }}
        >
          <AntdIcon className={style.icon} type="iconicon_shijueshuipinggaodi-01" />
        </div>
      </div>
    );
  }
}

export default RectHelper;
