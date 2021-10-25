import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Checkbox } from 'antd';
import { resetHistory } from "../action";
import Modal from "../../Base/Modal";
import style from "./style.less";
import { DEFAULT_MODAL_PLACE } from "../../constant";

const OPTIONS_LIST = [
  { value: 'visible', label: '构件可见' },
  { value: 'highlight', label: '构件高亮' },
  { value: 'perspective', label: '模型视角' },
  { value: 'wireframe', label: '构件线框' },
  { value: 'colorful', label: '构件颜色' },
];

class Reset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      isCheckALL: false
    };
  }

  onChange = (checkedValues) => {
    const isCheckALL = checkedValues.length === OPTIONS_LIST.length;
    this.setState({
      checkedList: checkedValues,
      isCheckALL
    });
  }

  onCheckAll = (e) => {
    const checked = e.target.checked;
    let checkedList = [];
    if (checked) {
      checkedList = OPTIONS_LIST.map(item => item.value);
    }
    this.setState({
      isCheckALL: checked,
      checkedList
    });
  }

  onReset(e) {
    e.preventDefault();
    e.stopPropagation();
    const { checkedList } = this.state;
    const visible = checkedList.some(item => item === 'visible');
    const highlight = checkedList.some(item => item === 'highlight');
    const wireframe = checkedList.some(item => item === 'wireframe');
    const colorful = checkedList.some(item => item === 'colorful');
    const perspective = checkedList.some(item => item === 'perspective');
    this.props.viewer.resetScene({
      visible,
      selected: highlight,
      wireframed: wireframe,
      colorfully: colorful,
      view: perspective
    });
  }

  render() {
    const { isCheckALL, checkedList } = this.state;
    return (
      <Modal
        title="复位设置"
        visible={this.props.visible}
        onCancel={() => this.props.onHide()}
        viewportDiv={this.props.viewer.viewportDiv}
        top={DEFAULT_MODAL_PLACE.reset.top}
        right={DEFAULT_MODAL_PLACE.reset.right}
        left={DEFAULT_MODAL_PLACE.reset.left}
        width="350px"
        height="auto"
        minWidth={163}
        minHeight={216}
      >
        <div className={style.reset}>
          <Checkbox.Group style={{ width: '100%' }} value={checkedList} onChange={this.onChange}>
            {OPTIONS_LIST.map(item => (
              <div key={item.value} className={style.item}>
                <Checkbox value={item.value}>{item.label}</Checkbox>
              </div>
            ))}
          </Checkbox.Group>
          <div className={style.item}>
            <Checkbox checked={isCheckALL} onChange={this.onCheckAll}>全选</Checkbox>
          </div>
          <div className={style.line} />
          <button
            className="bos-btn bos-btn-primary bos-btn-block"
            type="submit"
            disabled={checkedList.length === 0}
            onClick={e => { this.onReset(e) }}
          >
            复位选中项目
          </button>
        </div>
      </Modal>
    );
  }
}

Reset.propTypes = {
  clearUndoList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = (dispatch) => ({
  clearUndoList: () => { dispatch(resetHistory()) }
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Reset);

export default WrappedContainer;
