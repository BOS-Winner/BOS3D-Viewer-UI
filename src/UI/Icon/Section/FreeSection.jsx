import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import { changeMode } from "../action";
import toastr from "../../toastr";
import style from "./style.less";
import fuckIE from "../../theme/fuckIE.less";
import showPng from "../img/white/show@2x.png";
import hidePng from "../img/white/hide@2x.png";
import FreeSectionPng from "../img/white/freeSection.png";

class FreeSection extends React.Component {
  constructor(props) {
    super(props);
    this.sectionPlane = {};
    this.minWidth = props.viewer.viewportDiv.clientWidth < 760 ? 120 : 170;
    this.isTouchDevice = props.BIMWINNER.BOS3D.DeviceTest.isTouchDevice();
    this.touchProgress = 50;
    this.state = {
      dialogVisible: false,
      showPlane: true,
    };
  }

  componentDidUpdate(prevProps) {
    // 开启自由剖切
    if (prevProps.mode !== "自由剖切模式" && this.props.mode === "自由剖切模式") {
      if (prevProps.mode !== '') {
        toastr.info(`自由剖切模式下将关闭${prevProps.mode}`, "", {
          target: `#${this.props.viewer.viewport}`
        });
      }
      this.startFreeSection();
      this.props.onEnter();
    }
    // 关闭自由剖切
    if (prevProps.mode === "自由剖切模式" && this.props.mode !== "自由剖切模式") {
      this.sectionPlane.exit();
    }
  }

  changeDialog(visible) {
    if (!visible) {
      this.props.changeMode('');
    }
    this.setState({
      dialogVisible: visible
    });
  }

  onClick() {
    const selected = (this.props.mode === "自由剖切模式");
    this.setState(() => {
      this.props.changeMode(selected ? "" : "自由剖切模式");
      return {
        dialogVisible: !selected,
      };
    });
  }

  startFreeSection() {
    const BIMWINNER = this.props.BIMWINNER;
    this.sectionPlane = new BIMWINNER.BOS3D.SectionPlane({
      direction: "Forward",
      id: "SectionPlane",
      plane: "X",
      progress: 50,
      viewer: this.props.viewer
    });
    if (this.isTouchDevice) {
      this.sectionPlane.coordinateSystem.hide(true);
    }
    this.props.viewer.render();
  }

  setSectionPlane(e) {
    e.stopPropagation();
    const type = e.target.value;
    if (type[0] === '-') {
      this.sectionPlane.setDirection("Reverse");
      this.sectionPlane.setPlane(type[1]);
    } else {
      this.sectionPlane.setDirection("Forward");
      this.sectionPlane.setPlane(type);
    }
    if (this.isTouchDevice) {
      this.sectionPlane.setProgress(this.touchProgress);
    }
    this.props.viewer.render();
  }

  switchShowPlane(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => {
      if (state.showPlane) {
        this.sectionPlane.hidePlane();
      } else {
        this.sectionPlane.showPlane();
      }
      return {
        showPlane: !state.showPlane,
      };
    });
  }

  setProgress(e) {
    e.stopPropagation();
    this.touchProgress = Number(e.target.value);
    this.sectionPlane.setProgress(this.touchProgress);
    this.props.viewer.render();
  }

  render() {
    const selected = (this.props.mode === "自由剖切模式");
    const imgTitle = this.state.showPlane ? "点击隐藏剖切面" : "点击显示剖切面";

    const selectDirection = (
      <select
        title="改变轴向"
        defaultValue="X"
        onChange={e => {
          this.setSectionPlane(e);
        }}
      >
        <option value="X">X</option>
        <option value="Y">Y</option>
        <option value="Z">Z</option>
        <option value="-X">-X</option>
        <option value="-Y">-Y</option>
        <option value="-Z">-Z</option>
      </select>
    );
    const showPlane = (
      <img
        className={style.eye}
        src={this.state.showPlane ? showPng : hidePng}
        alt={imgTitle}
        title={imgTitle}
        onClick={e => {
          this.switchShowPlane(e);
        }}
      />
    );

    let content = <></>;
    if (this.isTouchDevice) {
      content = ReactDOM.createPortal((
        <div
          role="presentation"
          className={style.touchBar}
          style={{
            display: this.state.dialogVisible && selected ? "flex" : "none"
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {selectDirection}
          {showPlane}
          <span>0</span>
          <div className={style.range}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              defaultValue={this.touchProgress}
              onChange={e => { this.setProgress(e) }}
            />
          </div>
          <span>100</span>
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              this.changeDialog(false);
            }}
          >
            退出
          </button>
        </div>
      ), this.props.viewer.viewportDiv);
    } else {
      content = (
        <Modal
          visible={this.state.dialogVisible && selected}
          onCancel={() => {
            this.changeDialog(false);
          }}
          title="自由剖切选项"
          width={`${this.minWidth}px`}
          height="110px"
          destroyOnClose
          minWidth={this.minWidth}
          minHeight={100}
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <div className={style.freeSection}>
            {selectDirection}
            {showPlane}
          </div>
        </Modal>
      );
    }
    return (
      <div
        className={selected ? fuckIE.select : ''}
        title="自由剖切"
        role="button"
        tabIndex={0}
        onClick={() => {
          this.onClick();
        }}
      >
        <Icon img={FreeSectionPng} />
        {content}
      </div>
    );
  }
}

FreeSection.propTypes = {
  changeMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  onEnter: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: mode => {
    dispatch(changeMode(mode));
  }
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FreeSection);

export default WrappedContainer;
