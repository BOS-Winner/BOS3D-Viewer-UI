import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import _ from "lodash-es";
import { ON_SEARCH_CPT } from "../eventType";
import style from "./style.less";

class SVGRect extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    ee: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      init: false,
    };
    this.throttleGenRect = _.throttle(this.genRect.bind(this), 16);
  }

  componentDidMount() {
    const EVENTS = this.props.BIMWINNER.BOS3D.EVENTS;
    this.props.viewer.viewerImpl.modelManager.addEventListener(
      EVENTS.ON_CONTROL_UPDATEUI,
      this.throttleGenRect
    );
  }

  componentWillUnmount() {
    const EVENTS = this.props.BIMWINNER.BOS3D.EVENTS;
    this.props.viewer.viewerImpl.modelManager.removeEventListener(
      EVENTS.ON_CONTROL_UPDATEUI,
      this.throttleGenRect
    );
  }

  genRect(event) {
    // x 属性定义矩形的左侧位置（例如，x="0" 定义矩形到浏览器窗口左侧的距离是 0px）
    const x = event.data.left;
    // y 属性定义矩形的顶端位置（例如，y="0" 定义矩形到浏览器窗口顶端的距离是 0px）
    const y = event.data.top;
    const width = event.data.width; // 矩形框的宽
    const height = event.data.height; // 矩形框的高
    const visible = event.data.visible; // 框选结束的判断
    if (visible) {
      this.setState({
        x,
        y,
        width,
        height,
        init: true,
      });
    } else {
      this.setState({
        init: false
      });
    }
    setTimeout(() => {
      this.props.ee.emit(ON_SEARCH_CPT, this.props.viewer.getHighlightComponentsKey());
    }, 1000);
  }

  render() {
    const viewerUUID = this.props.viewer.viewerImpl.uuid;
    return ReactDOM.createPortal((
      <svg
        className={style['svg-rect']}
        xmlns="http://www.w3.org/2000/svg"
        onClick={e => { e.stopPropagation() }}
      >
        {this.state.init && (
          <rect
            xmlns="http://www.w3.org/2000/svg"
            x={this.state.x}
            y={this.state.y}
            width={this.state.width}
            height={this.state.height}
          />
        )}
      </svg>
    ), document.querySelector(`[id="${viewerUUID}"]`));
  }
}

export default SVGRect;
