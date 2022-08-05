import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import style from "./style.less";
import { AntdIcon } from '../../utils/utils';
import { DEFAULT_MODAL_PLACE } from '../../constant.js';
import Modal from "../../Base/Modal";

class MeasureToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedIndex: 0,
      settingToolBottomDistance: 6,
    };
    this.setToolContainer = React.createRef();
  }

  componentDidMount() {
    this.handleSettingToolBarPosition();
  }

  handleSettingToolBarPosition = () => {
    const bottomToolContainer = document.querySelector("#bottomToolContainer");
    const bottomToolRect = bottomToolContainer.getBoundingClientRect();
    const settingToolRect = this.setToolContainer.current.getBoundingClientRect();
    if (settingToolRect.left - bottomToolRect.right < 10) {
      this.setState({
        settingToolBottomDistance: 80,
      });
    }
  }

  onClickItem = (index) => {
    if (index === this.props.activeMeasureMode) {
      this.props.buttonAction(-1);
      // this.setState({
      //   selectedIndex: -1
      // });
      return;
    }
    // this.setState({
    //   selectedIndex: index
    // });
    this.props.buttonAction(index);
  }

  render() {
    const { isMobile } = this.props;
    const isPicker = false; // 是否是新数据，是就隐藏
    // 右侧工具列表
    const TOOL_DATA_LIST = [
      {
        tip: '测量距离', title: '测量距离', mobileTitle: '距离', icon: 'iconceliang', actionIndex: 0
      },
      {
        tip: '测量角度', title: '测量角度', mobileTitle: '角度', icon: 'iconanglemeasurement', actionIndex: 1
      },
      {
        tip: '测量面积', title: '测量面积', mobileTitle: '面积', icon: 'iconareameasurement', actionIndex: 2
      },
      // 5.0 新数据先隐藏
      ...isPicker ? [] : [{
        tip: '测量体积', title: '测量体积', mobileTitle: '体积', icon: 'iconvolumemeasurement', actionIndex: 3
      },
      {
        tip: '测量最小距离', title: '最小距离', mobileTitle: '最小距离', icon: 'iconminimumdistance', actionIndex: 4
      }]
    ];

    const listJSX = (
      <div className={`${style.list}`}>
        {
          TOOL_DATA_LIST.map(item => (
            <div
              key={item.actionIndex}
              className={`${style.item}  ${this.props.activeMeasureMode === item.actionIndex ? style.on : ''} `}
              title={item.tip}
              role="presentation"
              onClick={this.onClickItem.bind(this, item.actionIndex)}
            >
              <AntdIcon type={item.icon} className={style.icon} />
              <span className={style.title}>{isMobile ? item.mobileTitle : item.title}</span>
            </div>
          ))
        }
      </div>
    );

    const bottomJSX = (
      <section
        className={`${style.settingWrap}`}
        ref={this.setToolContainer}
        style={{
          bottom: `${this.state.settingToolBottomDistance}px`
        }}
      >
        <div className={`${style.left}`}>
          <div
            role="presentation"
            className={`${style.setItem} ${this.state.selectedIndex === 5 ? style.on : ''}`}
            title="测量校准"
            onClick={() => {
              this.props.buttonAction(5);
              // this.setState({
              //   selectedIndex: 5
              // });
            }}
          >
            <AntdIcon type="iconradianmeasurement" className={style.icon} />
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
            <AntdIcon type="iconmeasurementsetup" className={style.icon} />
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
            <AntdIcon type="icondelete" className={style.icon} />
          </div>
        </div>
      </section>
    );

    const mainJSX = (
      <section>
        <Modal
          onCancel={() => {
            this.props.close();
          }}
          visible
          title="测量"
          height="auto"
          width="auto"
          minWidth={90}
          minHeight={340}
          top={DEFAULT_MODAL_PLACE.measure.top}
          right={DEFAULT_MODAL_PLACE.measure.right}
          viewportDiv={this.props.parentNode}
          theme={this.props.isMobile ? "mobile-theme-one" : ''}
        >
          {listJSX}
        </Modal>
        {bottomJSX}
      </section>
    );

    if (this.props.parentNode) {
      return ReactDOM.createPortal(
        mainJSX,
        this.props.parentNode
      );
    } else {
      return mainJSX;
    }
  }
}

MeasureToolbar.propTypes = {
  buttonAction: PropTypes.func,
  close: PropTypes.func,
  parentNode: PropTypes.object,
  isMobile: PropTypes.bool,
  activeMeasureMode: PropTypes.number.isRequired,
};

MeasureToolbar.defaultProps = {
  buttonAction: () => { },
  close: () => { },
  parentNode: undefined,
  isMobile: false,
  // modelDetail: {}
};

export default MeasureToolbar;
