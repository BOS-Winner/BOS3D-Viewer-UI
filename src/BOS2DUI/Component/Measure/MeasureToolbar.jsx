import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import style from "MeasureTool/style.less";
import * as MODE from "../../redux/bottomRedux/mode";
// import * as icons from "MeasureTool/Resource/resource";
import { changeMode } from "../../redux/bottomRedux/action";
import fuckIE from "../../../UI/theme/fuckIE.less";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';
import customStyle from './index.less';

class MeasureToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0
    };
  }

  render() {
    const isMobile = mobileCheck();
    console.log(isMobile);
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

    const content = (
      <div>
        <Modal
          visible
          onCancel={() => {
            this.props.changeMode(this.props.mode === MODE.pickByMeasure ? '' : MODE.pickByMeasure);
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
            <div
              className={this.state.selectedIndex === 0 ? fuckIE.select : ''}
            >
              <Icon
                className={customStyle.customIcon}
                icon={<AntdIcon type="iconceliang" className={iconStyle.icon} />}
                title="测量距离"
                showTitle={!isMobile}
                onClick={() => {
                  this.setState({
                    selectedIndex: 0
                  });
                  this.props.buttonAction(0);
                }}
                selected={this.state.selectedIndex === 0}
              />
            </div>

            <div
              className={this.state.selectedIndex === 1 ? fuckIE.select : ''}
            >
              <Icon
                className={customStyle.customIcon}
                icon={<AntdIcon type="iconanglemeasurement" className={iconStyle.icon} />}
                title="测量角度"
                showTitle={!isMobile}
                onClick={() => {
                  this.setState({
                    selectedIndex: 1
                  });
                  this.props.buttonAction(1);
                }}
                selected={this.state.selectedIndex === 1}
              />
            </div>

            <div
              className={this.state.selectedIndex === 2 ? fuckIE.select : ''}
            >
              <Icon
                className={customStyle.customIcon}
                icon={<AntdIcon type="iconareameasurement" className={iconStyle.icon} />}
                title="测量面积"
                showTitle={!isMobile}
                onClick={() => {
                  this.setState({
                    selectedIndex: 2
                  });
                  this.props.buttonAction(2);
                }}
                selected={this.state.selectedIndex === 2}
              />
            </div>
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
});
// const WrappedContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(MeasureToolbar);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeasureToolbar);
