import React from "react";
import PropTypes from "prop-types";
import Modal from "Base/Modal";
import { Checkbox } from 'antd';
import style from "./style.less";
import toastr from "../../../toastr";

const OPTIONS_LIST = [
  { value: 'modelSetting', label: '模型设置' },
  { value: 'cameraSetting', label: '相机设置' },
  { value: 'displaySetting', label: '显示与效果' },
  { value: 'toolState', label: '工具栏配置' },
];

class ExportMenu extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    viewportDiv: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    isMobile: false
  }

  constructor(props) {
    super(props);
    this.state = {
      checkedList: ['cameraSetting', 'displaySetting', 'toolState']
    };
    this.menuRef = React.createRef();
  }

  onOk() {
    const { checkedList } = this.state;
    if (checkedList.length > 0) {
      this.props.onConfirm(checkedList);
    } else {
      toastr.error('请勾选设置项后再导出哦！', '', {
        target: this.props.viewportDiv
      });
    }
  }

  onChange = (checkedValues) => {
    this.setState({
      checkedList: checkedValues
    });
  }

  render() {
    const { isMobile } = this.props;
    const modalInfo = {
      width: isMobile ? '280px' : '350px',
      height: isMobile ? 'calc(100% - 32px)' : '70%',
      top: isMobile ? '16px' : "calc(50% + 77px)",
      left: isMobile ? '16px' : undefined,
      right: isMobile ? 'calc(50% - 140px)' : 'calc(50% - 175px)',
    };

    return (
      <Modal
        title="导出设置"
        visible={this.props.visible}
        viewportDiv={this.props.viewportDiv}
        onCancel={() => this.props.onConfirm(false)}
        top={modalInfo.top}
        right={modalInfo.right}
        width={modalInfo.width}
        height="auto"
        minWidth={185}
        minHeight={155}
      >
        <section className={style.menuWrap}>
          <div className={style.menu} ref={this.menuRef}>
            <Checkbox.Group style={{ width: '100%' }} value={this.state.checkedList} onChange={this.onChange}>
              {OPTIONS_LIST.map(item => (
                <div key={item.value} className={style.menuItem}>
                  <Checkbox value={item.value}>{item.label}</Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </div>
          <div className={style.btnWrap}>
            <button className={`bos-btn bos-btn-primary bos-btn-block `} type="button" onClick={() => this.onOk()}>
              确定
            </button>
          </div>
        </section>

      </Modal>
    );
  }
}

export default ExportMenu;
