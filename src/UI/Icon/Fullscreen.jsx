import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "../Base/Icon";
import { isLandscape } from "../utils/device";
import fullscreenPng from "./img/white/fullscreen.png";
import cancelFscPng from "./img/white/cancelfsc.png";

function fuckFSC(dom) {
  if (dom.requestFullscreen) {
    return dom.requestFullscreen();
  } else if (dom.webkitRequestFullscreen) {
    return dom.webkitRequestFullscreen();
  } else if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  } else {
    return dom.msRequestFullscreen();
  }
}

function fuckExitFSC() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else {
    document.msExitFullscreen();
  }
}

class Fullscreen extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.viewerUUId = this.props.viewer.viewerImpl.uuid;
    this.width = 0;
    this.height = 0;
    this.saveCanvasSize();
    this.fscLner = this.fscLner.bind(this);
    this.state = {
      fsc: false
    };
  }

  componentDidMount() {
    document.addEventListener('fullscreenchange', this.fscLner);
    document.addEventListener('webkitfullscreenchange', this.fscLner);
    document.addEventListener('mozfullscreenchange', this.fscLner);
    document.addEventListener('MSFullscreenChange', this.fscLner);
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.fscLner);
    document.removeEventListener('webkitfullscreenchange', this.fscLner);
    document.removeEventListener('mozfullscreenchange', this.fscLner);
    document.removeEventListener('MSFullscreenChange', this.fscLner);
  }

  saveCanvasSize() {
    const canvas = document.querySelector(`[id="${this.viewerUUId}"]>canvas`);
    this.width = parseInt(getComputedStyle(canvas).width, 10);
    this.height = parseInt(getComputedStyle(canvas).height, 10);
  }

  fscLner() {
    const viewer3D = this.props.viewer;
    if (!(document.fullscreenElement
      || document.webkitIsFullScreen
      || document.mozFullScreen
      || document.msFullscreenElement)) {
      viewer3D.resize(this.width, this.height);
      this.setState({
        fsc: false
      });
    } else {
      this.saveCanvasSize();
      /* eslint-disable no-restricted-globals */
      let width = screen.width;
      let height = screen.height;
      /* eslint-enable no-restricted-globals */
      // iOS safari竖屏要交换宽高
      const deviceTest = this.props.BIMWINNER.BOS3D.DeviceTest;
      if (deviceTest.isSafari() && deviceTest.isTouchDevice() && isLandscape()) {
        [width, height] = [height, width];
      }
      viewer3D.resize(width, height);
      this.setState({
        fsc: true
      });
    }
  }

  onClick() {
    if (this.state.fsc) {
      fuckExitFSC();
    } else {
      fuckFSC(this.props.viewer.viewportDiv);
    }
  }

  render() {
    return (
      <div
        title="全屏"
        role="button"
        tabIndex={0}
        onClick={() => {
          this.onClick();
        }}
      >
        <Icon img={this.state.fsc ? cancelFscPng : fullscreenPng} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Fullscreen);
