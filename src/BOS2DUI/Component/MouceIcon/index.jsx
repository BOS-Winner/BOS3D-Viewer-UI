import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import icon from "./icon";

class MouseIcon extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    mouseIcon: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.icon = "url('')";
  }

  // componentDidMount() {
  //   const BOS3D = this.props.BIMWINNER.BOS3D;
  //   // 平移、旋转更改图标
  //   this.props.viewer.registerModelEventListener(
  //     BOS3D.EVENTS.ON_CONTROL_BEGIN,
  //     e => {
  //       let _icon = "url('')";
  //       switch (e.name) {
  //         case BOS3D.ControlMode.PAN:
  //           _icon = `url(${icon.pan})`;
  //           break;
  //         case BOS3D.ControlMode.ORBIT:
  //           _icon = `url(${icon.orbit})`;
  //           break;
  //         case BOS3D.ControlMode.ZOOM:
  //           _icon = `url(${icon.zoom})`;
  //           break;
  //         default:
  //           break;
  //       }
  //       this.props.viewer.viewportDiv.style.cursor = `${_icon}, auto`;
  //     }
  //   );
  //   this.props.viewer.registerModelEventListener(
  //     BOS3D.EVENTS.ON_CONTROL_END,
  //     () => {
  //       this.props.viewer.viewportDiv.style.cursor = `${this.icon}, auto`;
  //     }
  //   );
  //   // 缩放更改图标
  //   const _resetIcon = _.debounce(
  //     () => {
  //       console.log('zoom end');
  //       this.props.viewer.viewportDiv.style.cursor = `${this.icon}, auto`;
  //     },
  //     200
  //   );
  //   this.props.viewer.registerModelEventListener(
  //     BOS3D.EVENTS.ON_CONTROL_ZOOM,
  //     () => {
  //       this.props.viewer.viewportDiv.style.cursor = `url(${icon.zoom}), auto`;
  //       _resetIcon();
  //     }
  //   );
  // }

  shouldComponentUpdate(nextProps) {
    let _icon = "url('')";
    console.log(nextProps);
    if (nextProps.mode === "测量模式") {
      switch (nextProps.mouseIcon) {
        case "测量模式":
        case "测量距离模式":
          _icon = `url(${icon.distanceMeasure})`;
          break;
        case "测量角度模式":
          _icon = `url(${icon.angleMeasure})`;
          break;
        case "测量面积模式":
          _icon = `url(${icon.area})`;
          break;
        case "测量校准模式":
          _icon = `url(${icon.adjustMeasure})`;
          break;
        /*
      case "漫游模式":
        _icon = `url(${icon.roam}) 16 16`;
        break;
      case "路径漫游模式":
        _icon = `url(${icon.routeRoam}) 16 16`;
        break;
      case "剖切模式":
        _icon = `url(${icon.section})`;
        break;
      case "自由剖切模式":
        _icon = `url(${icon.freeSection})`;
        break;
         */
        case "框选模式":
          _icon = `url(${icon.pickByRect})`;
          break;
        case "路径漫游添加帧":
          _icon = `url(${icon.plus})`;
          break;
        default:
          break;
      }
    }
    this.icon = _icon;
    this.props.viewer.viewportDiv.style.cursor = `${_icon}, auto`;
    return true;
  }

  render() {
    return (
      <></>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
  mouseIcon: state.bottom.mouseIcon,
  mode: state.bottom.mode,
  // BIMWINNER: state.system.BIMWINNER,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MouseIcon);
