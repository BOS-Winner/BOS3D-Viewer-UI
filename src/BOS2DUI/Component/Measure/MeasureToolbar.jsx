import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import style from "MeasureTool/style.less";
// import * as MODE from "../../redux/bottomRedux/mode";
// import * as icons from "MeasureTool/Resource/resource";
import { changeMode, changeMouseIcon } from "../../redux/bottomRedux/action";
import fuckIE from "../../../UI/theme/fuckIE.less";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';
import customStyle from './index.less';

// MeasureType
const MeasureType = {
  "Distance": 0,
  "Angle": 1,
  "Area": 2
};
class MeasureToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: MeasureType.Distance,
    };
  }

  render() {
    const isMobile = mobileCheck();
    console.log(isMobile);
    // const { selectedIndex } = this.state;
    const bottomJSX = (
      <section className={isMobile ? `${style.settingWrap} ${customStyle.modelSeting}` : `${style.settingWrap}`}>
        <div className={`${style.left}`}>
          <div
            role="presentation"
            className={`${style.setItem} ${this.state.selectedIndex === 5 ? style.on : ''}`}
            title="测量校准"
            onClick={() => {
              this.props.buttonAction(5);
              this.setState({
                selectedIndex: 5
              });
            }}
          >
            <AntdIcon type="iconradianmeasurement" className={customStyle.icon} />
            <div className={`${style.title}`}>测量校准</div>
          </div>
          {!isMobile && <div className={`${style.line}`} />}
          <div
            role="presentation"
            className={`${style.setItem}`}
            title="测量设置"
            onClick={() => {
              this.props.buttonAction(6);
            }}
          >
            <AntdIcon type="iconmeasurementsetup" className={customStyle.icon} />
            <div className={`${style.title}`}>测量设置</div>
          </div>
        </div>
        <div className={`${style.right}`}>
          <div
            role="presentation"
            className={`${style.setItem}`}
            title="删除测量"
            onClick={() => {
              this.props.buttonAction(7);
            }}
          >
            <AntdIcon type="icondelete" className={customStyle.icon} />
          </div>
        </div>
      </section>
    );

    // selected function
    const seletedFunc = (index) => {
      const { selectedIndex } = this.state;
      const tempIndex = index === selectedIndex ? 999 : index;
      this.setState({
        selectedIndex: tempIndex,
      });
      this.props.buttonAction(tempIndex);
    };

    const measureTypeList = [{
      name: "测量距离",
      iconType: "iconceliang",
      type: MeasureType.Distance,
    }, {
      name: "测量角度",
      iconType: "iconanglemeasurement",
      type: MeasureType.Angle,
    }, {
      name: "测量面积",
      iconType: "iconareameasurement",
      type: MeasureType.Area,
    }];

    const content = (
      <div>
        <Modal
          visible
          onCancel={() => {
            this.props.changeMouseIcon("");
            this.props.changeMode("");
          }}
          title="测量"
          width={isMobile ? "87px" : "96px"}
          height="250px"
          top="calc(30% - 50px)"
          right="30px"
          minWidth={87}
          minHeight={250}
          viewportDiv={this.props.parentNode}
          closable
        >
          <div className={customStyle.tools}>
            {measureTypeList.map(item => (
              <div
                className={this.state.selectedIndex === item.type ? fuckIE.select : ''}
                key={item.type}
              >
                <Icon
                  className={customStyle.customIcon}
                  icon={<AntdIcon type={item.iconType} className={iconStyle.icon} />}
                  title={item.name}
                  showTitle={!isMobile}
                  onClick={() => {
                    seletedFunc(item.type);
                  }}
                  selected={this.state.selectedIndex === item.type}
                />
              </div>
            ))}
          </div>
        </Modal>
        {bottomJSX}
      </div>

    );

    if (this.props.parentNode) {
      return ReactDOM.createPortal(
        content,
        this.props.parentNode
      );
    } else {
      return content;
    }
  }
}

MeasureToolbar.propTypes = {
  buttonAction: PropTypes.func,
  parentNode: PropTypes.object,
  changeMode: PropTypes.func.isRequired,
  changeMouseIcon: PropTypes.func.isRequired,
  // mode: PropTypes.string.isRequired,
};

MeasureToolbar.defaultProps = {
  buttonAction: () => {},
  parentNode: undefined
};

const mapStateToProps = (state) => ({
  mode: state.bottom.mode,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode) => dispatch(changeMode(mode)),
  changeMouseIcon: mode => {
    dispatch(changeMouseIcon(mode));
  },
});
// const WrappedContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(MeasureToolbar);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeasureToolbar);
