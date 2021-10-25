import React from 'react';
import PropTypes from "prop-types";
import _ from "lodash-es";
import { getOffset } from "../../../../utils/dom";
import { AntdIcon } from '../../../../utils/utils';
import style from "./style.less";

const INIT_TOP = 40;
const INIT_LEFT = 40;
const RADIUS = 60;

class CircleHelper extends React.Component {
  static propTypes = {
    onStart: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onEnd: PropTypes.func.isRequired,
    backgroundImage: PropTypes.string.isRequired,
    centerImage: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.pointerRef = React.createRef();
    this.initPos = {
      x: 0,
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
        left: INIT_LEFT,
      }
    };
  }

  componentDidMount() {
    this.initPos = getOffset(this.pointerRef.current);
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
        const x = _ev.pageX;
        const y = _ev.pageY;
        let dx = x - this.initPos.x;
        let dy = y - this.initPos.y;
        const R2 = dx * dx + dy * dy;
        if (R2 > RADIUS * RADIUS) {
          dx = RADIUS * dx / Math.sqrt(R2);
          dy = RADIUS * dy / Math.sqrt(R2);
        }
        this.setState({
          cssPos: {
            top: INIT_TOP + dy,
            left: INIT_LEFT + dx
          }
        });
        this.props.onChange(dx, dy);
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
        left: INIT_LEFT,
      }
    });
    this.props.onEnd();
  }

  render() {
    return (
      <div
        className={style.circle}
        style={{
          backgroundImage: `url(${this.props.backgroundImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: "100%",
          backgroundPosition: 'center'
        }}
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
          className={style.pointer}
          style={{
            top: this.state.cssPos.top,
            left: this.state.cssPos.left,
          }}
        >
          <AntdIcon className={style.icon} type={this.props.centerImage} />
        </div>
      </div>
    );
  }
}

export default CircleHelper;
