import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Slider } from 'antd';
import Icon from "Base/Icon";
import Modal from 'Base/Modal';
import Card from 'Base/Card';
import ModelScatter from "./ModelScatter.jsx";
import FloorScatter from "./FloorScatter.jsx";
import style from "./style.less";
import toastr from "../../toastr";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import { DEFAULT_MODAL_PLACE } from "../../constant";

class Scatter extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      // showPopup: false,
      enableModelScatter: false,
      enableFloorScatter: false,
      coefficient: 1,
      showModal: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        // showPopup: false,
        enableModelScatter: false,
        enableFloorScatter: false,
        coefficient: 1,
        showModal: false,
      });
    }
  }

  triggerPopUp = () => {
    // ev.preventDefault();
    // ev.stopPropagation();
    const { enableFloorScatter, enableModelScatter } = this.state;
    // console.log("打开modal");
    if (enableFloorScatter || enableModelScatter) {
      this.setState({
        enableModelScatter: false,
        enableFloorScatter: false,
        coefficient: 1,
        showModal: false
      });
    } else {
      this.setState(state => ({
        showModal: !state.showModal,
      }));
    }
  }

  onRangeChange = (value) => {
    this.setState({
      coefficient: parseFloat(value)
    });
  }

  switchScatter(type) {
    if (type === 'model') {
      this.setState(state => ({
        enableModelScatter: !state.enableModelScatter,
        enableFloorScatter: false,
      }));
    }
    if (type === 'floor') {
      if (this.props.viewer.canFloorExplosion()) {
        this.setState(state => ({
          enableModelScatter: false,
          enableFloorScatter: !state.enableFloorScatter,
        }));
      } else {
        toastr.info("该模型不支持楼层分解", "", {
          target: `#${this.props.viewer.viewport}`,
        });
      }
    }
    this.onRangeChange(1);
  }

  render() {
    const {
      enableFloorScatter, enableModelScatter, coefficient, showModal
    } = this.state;

    // 分解模式
    const scatterList = [
      {
        icon: 'icondecompose',
        title: '模型分解',
        func: () => this.switchScatter('model'),
        active: enableModelScatter
      },
      {
        icon: 'iconloucengfenjie-01',
        title: '楼层分解',
        func: () => this.switchScatter('floor'),
        active: enableFloorScatter
      }
    ];
    // 滑动条属性
    const sliderProps = {
      min: 1,
      max: 3,
      tipFormatter: null,
      defaultValue: 1,
      step: 0.01,
      disabled: !(enableFloorScatter || enableModelScatter)
    };

    return (
      <div>
        <Modal
          visible={showModal}
          onCancel={this.triggerPopUp}
          title="分解"
          width="350px"
          height="245px"
          top={DEFAULT_MODAL_PLACE.scatter.top}
          right={DEFAULT_MODAL_PLACE.scatter.right}
          left={DEFAULT_MODAL_PLACE.scatter.left}
          minWidth={250}
          minHeight={245}
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <div className={style.scatterGroup}>
            {scatterList.map(
              item => (
                <Card
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  func={item.func}
                  active={item.active}
                />
              ))}
          </div>
          <div className={style.sliderContainer}>
            <span>
              离散系数:
              {coefficient}
            </span>
            {/* 调用子组件 */}
            <div>
              <ModelScatter
                enable={enableModelScatter}
                coefficient={coefficient}
              />
              <FloorScatter
                enable={enableFloorScatter}
                coefficient={coefficient}
              />
            </div>
            <div className={style.sliderWrapper}>
              <span>1</span>
              <Slider
                {...sliderProps}
                className={style.range}
                onChange={this.onRangeChange}
                value={coefficient}
              />
              <span>3</span>
            </div>
          </div>
        </Modal>
        <div
          role="button"
          tabIndex={0}
          title="分解"
          onClick={ev => this.triggerPopUp(ev)}
        >
          <Icon
            icon={<AntdIcon type="icongongnengmianban_fenjie-01" className={iconstyle.icon} />}
            selected={showModal}
            title="分解"
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  mode: state.button.mode,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Scatter);
