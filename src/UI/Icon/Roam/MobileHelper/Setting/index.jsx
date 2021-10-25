import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Modal from "../../../../Base/Modal";
import { AntdIcon } from '../../../../utils/utils';
import Slider from "../../../../Base/Slider";
import style from "./style.less";

class Setting extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    onChangeRate: PropTypes.func,
    initRate: PropTypes.number,
  };

  static defaultProps = {
    onChangeRate: () => { },
    initRate: 1,
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      speedRate: props.initRate,
    };
  }

  showModal(show) {
    this.setState({
      show,
    });
  }

  changeGlobalConfig(checked, mode) {
    const globalData = this.props.BIMWINNER.BOS3D.GlobalData;
    if (mode === 'hit') {
      globalData.EnableHitDetection = checked;
    } else {
      globalData.WalkingWithGravity = checked;
    }
  }

  changeRate(event, opt) {
    event.preventDefault();
    event.stopPropagation();
    this.setState(state => {
      let rate = 0;
      if (opt === '+') {
        rate = parseFloat((state.speedRate + 0.1).toFixed(1));
      } else {
        rate = Math.max(parseFloat((state.speedRate - 0.1).toFixed(1)), 0.1);
      }
      this.props.onChangeRate(rate);
      return { speedRate: rate };
    });
  }

  render() {
    return ReactDOM.createPortal((
      <div className={style.roamSetting}>
        <div
          role="presentation"
          className={`${style.iconContainer} ${this.state.show ? style.iconContainerActive : ''}`}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            this.showModal(!this.state.show);
          }}
        >
          <AntdIcon className={style.icon} type="iconfreeroam" />
        </div>
        <Modal
          visible={this.state.show}
          onCancel={() => { this.showModal(false) }}
          title="自由漫游设置"
          top="16px"
          left="92px"
          minWidth={130}
          minHeight={130}
          width="182px"
          height="156px"
          viewportDiv={this.props.viewer.viewportDiv}
          className={style.customModal}
          headerClassName={style.customModalHeader}
        >
          <div className={style.option}>
            <div>
              <span>碰撞：</span>
              <Slider onClick={checked => { this.changeGlobalConfig(checked, 'hit') }} />
            </div>
            <div>
              <span>重力：</span>
              <Slider onClick={checked => { this.changeGlobalConfig(checked, 'gravity') }} />
            </div>
          </div>
        </Modal>
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

export default Setting;
