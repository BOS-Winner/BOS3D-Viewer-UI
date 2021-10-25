import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import { changeMode } from "../action";
import toastr from "../../toastr";
import style from "./style.less";
import fuckIE from "../../theme/fuckIE.less";
import sectionPng from "../img/white/modelSection.png";
import resetPng from "../img/white/reset2.png";
import hidePng from "../img/white/hide@2x.png";
import showPng from "../img/white/show@2x.png";

class Section extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      dialogVisible: false,
      isShowSectionBox: true
    };
  }

  componentDidUpdate(prevProps) {
    // 开启剖切模式
    if (prevProps.mode !== "剖切模式" && this.props.mode === "剖切模式") {
      if (prevProps.mode !== '') {
        toastr.info(`剖切模式下将关闭${prevProps.mode}`, "", {
          target: `#${this.props.viewer.viewport}`
        });
      }
      this.props.viewer.enableSectionBox();
      this.props.viewer.setSectionBoxMode("normal");
      this.props.viewer.render();
      this.props.onEnter();
    }
    // 关闭剖切模式
    if (prevProps.mode === "剖切模式" && this.props.mode !== "剖切模式") {
      this.props.viewer.disableSectionBox();
      this.props.viewer.render();
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
    const selected = (this.props.mode === "剖切模式");
    this.setState(() => {
      this.props.changeMode(selected ? "" : "剖切模式");
      return {
        dialogVisible: !selected,
      };
    });
  }

  toggleSectionBox() {
    const visible = this.state.isShowSectionBox;
    if (visible) {
      this.props.viewer.hideSectionBox();
    } else {
      this.props.viewer.showSectionBox();
    }
    this.setState({
      isShowSectionBox: !visible
    });
  }

  resetSectionBox() {
    this.props.viewer.resetSectionBox();
    this.setState({
      isShowSectionBox: true,
    });
  }

  render() {
    const selected = (this.props.mode === "剖切模式");
    const { isShowSectionBox } = this.state;
    return (
      <div
        className={selected ? fuckIE.select : ''}
        title="模型剖切"
        role="button"
        tabIndex={0}
        onClick={() => { this.onClick() }}
      >
        <Icon img={sectionPng} />
        <Modal
          visible={this.state.dialogVisible && selected}
          onCancel={() => { this.changeDialog(false) }}
          title="模型剖切"
          destroyOnClose
          width="160px"
          height="100px"
          minWidth={155}
          minHeight={90}
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <div className={style.switch}>
            <div
              className={style.reset}
              title={isShowSectionBox ? "隐藏剖切盒" : '显示剖切盒'}
              role="presentation"
              onClick={() => this.toggleSectionBox()}
              style={{
                backgroundImage: `url(${isShowSectionBox ? hidePng : showPng})`
              }}
            />
            <div
              className={style.eye}
              title="重置剖切状态"
              role="presentation"
              onClick={() => this.resetSectionBox()}
              style={{
                backgroundImage: `url(${resetPng})`
              }}
            />
          </div>
        </Modal>
      </div>
    );
  }
}

Section.propTypes = {
  changeMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  onEnter: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: mode => {
    dispatch(changeMode(mode));
  }
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Section);

export default WrappedContainer;
