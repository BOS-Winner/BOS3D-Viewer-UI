import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Modal from "Base/Modal";
import { showSetting } from "../../redux/bottomRedux/action";
import style from "./style.less";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import white from './img/white.png';
import black from './img/black.png';
import blackWhite from './img/blackWhite.png';

class Setting extends React.PureComponent {
  static propTypes = {
    hideSetting: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    viewer2D: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: "普通模式",
    };
    this.isMobile = mobileCheck();
  }

  onChange(name) {
    const viewer2D = this.props.viewer2D;
    switch (name) {
      case "普通模式":
        viewer2D.closeBlackWhiteMode();
        viewer2D.setBackGroundColor("#4a4a4a");
        break;
      case "白底模式":
        viewer2D.closeBlackWhiteMode();
        viewer2D.setBackGroundColor("#ffffff");
        break;
      case "黑白模式":
        viewer2D.openBlackWhiteMode();
        break;
      default:
        break;
    }
    this.setState(state => ({
      ...state,
      selected: name
    }));
  }

  ImageItem = (props) => {
    const { selected, name, img } = props;
    return (
      <div
        onClick={() => this.onChange(name)}
        role="presentation"
        className={selected ? `${style.imageItemContainer} ${style.imageItemContainerActive}` : `${style.imageItemContainer}`}
        key={name}
      >
        <div className={style.nameGroup}>
          <AntdIcon
            type={selected ? "iconicon_radioactive" : "iconicon_radioinactive"}
            style={{ color: selected ? "#2C95FF" : "#ccc" }}
            className={style.icon}
          />
          <span className={style.name}>{name}</span>
        </div>
        <div className={style.imageContainer}>
          <img src={img} alt="图片" />
        </div>
      </div>
    );
  }

  render() {
    const { selected } = this.state;
    const itemList = [
      {
        name: "普通模式",
        select: selected === "普通模式",
        img: black,
      },
      {
        name: "白底模式",
        select: selected === "白底模式",
        img: white
      },
      {
        name: "黑白模式",
        select: selected === "黑白模式",
        img: blackWhite
      },
    ];
    return (
      <Modal
        title="设置"
        width="330px"
        height={this.isMobile ? "70%" : "360"}
        minWidth={330}
        minHeight={120}
        top={this.isMobile ? "10px" : "calc(50% - 180px)"}
        right="calc(50% - 165px)"
        visible={this.props.visible}
        viewportDiv={this.props.viewer2D.getViewerImpl().domElement}
        onCancel={() => this.props.hideSetting()}
      >
        <div className={style.settingContainer}>
          <span>图纸背景</span>
          <div className={style.itemGroup}>
            {itemList.map(item => this.ImageItem({
              name: item.name,
              selected: item.select,
              img: item.img
            }))}
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  visible: state.bottom.showSetting,
  viewer2D: state.system.viewer2D,
});
const mapDispatchToProps = (dispatch) => ({
  hideSetting: () => dispatch(showSetting(false)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Setting);
export default WrappedContainer;
