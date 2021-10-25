import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Popover } from 'antd';
import _ from "lodash-es";
import toastr from 'customToastr';
import style from "./markform.less";
import { AntdIcon } from '../../../utils/utils';
import spriteImg from "../spriteImg";
import ColorPicker from "../../../ColorPicker";
import SelectIcon from "./SelectIcon";
import { DOM_COLOR } from '../constant';

// const MAX_LENGTH = 10;

class MarkForm extends PureComponent {
  // static propTypes = {
  //   viewer: PropTypes.object.isRequired,
  //   confirmUpdateBaseInfo: PropTypes.func.isRequired,
  //   startAddingMark: PropTypes.func.isRequired,
  //   isEdit: PropTypes.bool.isRequired,
  //   setColor: PropTypes.func.isRequired,
  //   domOpacity: PropTypes.number.isRequired,
  //   eventEmitter: PropTypes.object.isRequired,
  //   mode: PropTypes.string.isRequired,

  // };

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      comment: '',
      scale: '1',
      url: spriteImg.position,
      isPopoverVisible: false
    };
  }

  onSubmit = () => {
    const { isEdit, confirmUpdateBaseInfo, startAddingMark } = this.props;
    const { scale } = this.state;

    // eslint-disable-next-line no-restricted-globals
    if (scale && isNaN(scale)) {
      toastr.error("标签大小填写错误", "", {
        target: `#${this.props.viewer.viewport}`
      });
      return;
    }
    if (scale !== '' && scale <= 0) {
      toastr.error("标签大小必须大于0", "", {
        target: `#${this.props.viewer.viewport}`
      });
      return;
    }
    if (isEdit) {
      if (typeof confirmUpdateBaseInfo === "function") {
        confirmUpdateBaseInfo();
      }
    } else if (typeof startAddingMark === "function") {
      startAddingMark();
    }
  }

  onChangeTitle = (e) => {
    this.setState({
      title: e.target.value
    });
  }

  onChangeComment = (e) => {
    this.setState({
      comment: e.target.value
    });
  }

  onChangeScale = (e) => {
    const value = e.target.value;
    this.setState({
      scale: value
    });
  }

  onPopoverVisibleChange = visible => {
    this.setState({ isPopoverVisible: visible });
  };

  onUrlChange = (v) => {
    this.setState({
      url: v
    });
  }

  reset() {
    this.setState({
      title: '',
      comment: '',
      // scale: '1',
      // url: spriteImg.position,
      isPopoverVisible: false
    });
  }

  render() {
    const {
      title, comment, scale, isPopoverVisible, url
    } = this.state;
    const {
      curMarkType, color, isEdit, exitEdit
    } = this.props;
    // console.log(this.props.domColor, '-- domColor --')
    // console.log(_.padStart(this.props.domColor.toString(16), 6, '0'), '---')
    const popoverContentJSX = (
      <div>
        <ColorPicker
          isModal={false}
          onConfirm={(customColor) => {
            this.setState({
              isPopoverVisible: false,
            });
            this.props.setColor(customColor);
          }}
          onRestore={() => {
            let initColor = DOM_COLOR;
            initColor = `#${_.padStart(initColor.toString(16), 6, '0')}`;
            this.setState({
              isPopoverVisible: false,
            });
            this.props.setColor({ hex: initColor, alpha: 1 });
          }}
          hexColor={`#${_.padStart(this.props.domColor.toString(16), 6, '0')}`}
          alpha={this.props.domOpacity / 255}
        />
        {' '}

      </div>
    );

    let middleAreaDom = null;
    // curMarkType   dom 文字标签     sprite 精灵图
    if (curMarkType === "dom") {
      middleAreaDom = (
        <div className={style.formItem}>
          <label className={style.itemLabel}>背景色</label>
          <div className={style.itemControl} style={{ flex: 0 }}>
            <Popover
              content={popoverContentJSX}
              destroyTooltipOnHide
              visible={isPopoverVisible}
              onVisibleChange={this.onPopoverVisibleChange}
              title={null}
              overlayClassName="annotation-ui-module-popver-wrap"
              trigger="click"
              placement="top"
              getPopupContainer={() => this.props.viewer.viewportDiv}
            >
              <div role="presentation" className={style.colorInputWrap} style={{ padding: 0 }} onClick={this.toggleColorPicker}>
                <div
                  className={`${color === 'none' ? style.disabledDiv : ''}`}
                  style={{
                    width: 36,
                    backgroundColor: `#${_.padStart(this.props.domColor.toString(16), 6, '0')}`,
                    opacity: this.props.domOpacity / 255
                  }}
                />
                <div className={style.dropdown}><AntdIcon type="iconicon_arrowdown" /></div>
              </div>
            </Popover>
          </div>
        </div>
      );
    } else if (curMarkType === "sprite") {
      middleAreaDom = (
        <>
          <div className={style.formItem}>
            <label className={style.itemLabel}>图标选择</label>
            <div className={style.itemControl}>
              <SelectIcon selectCb={this.onUrlChange} value={url} />
            </div>
          </div>
          <div className={style.formItem}>
            <label className={style.itemLabel}>标签大小</label>
            <div className={style.itemControl}>
              <input min={0} step={0.5} type="number" className={style.input} placeholder="请输入标签大小" onChange={this.onChangeScale} value={scale} />
            </div>
          </div>
        </>
      );
    }

    return (
      <section className={`${style.form} ${isEdit ? style.border : ''}  `}>
        <div className={style.formItem}>
          <label className={style.itemLabel}>标签名称</label>
          <div className={style.itemControl}>
            <input type="text" className={style.input} maxLength={10} value={title} placeholder="请输入标签名称" onChange={this.onChangeTitle} />
          </div>
        </div>
        {middleAreaDom}
        <div className={style.formItem} style={{ alignItems: 'start' }}>
          <label className={style.itemLabel}>标签备注</label>
          <div className={style.itemControl}>
            <textarea className={style.textarea} maxLength={100} value={comment} placeholder="请输入标签备注" onChange={this.onChangeComment} />
          </div>
        </div>

        <div className={style.addMarkWrap}>
          <button type="button" className="bos-btn bos-btn-primary" onClick={this.onSubmit}>{isEdit ? '完成编辑' : '添加标签'}</button>
          {
            isEdit && (
              <button
                type="button"
                className="bos-btn bos-btn-primary"
                onClick={exitEdit}
                style={{ marginLeft: '10px', color: "#fff", background: "#ccc" }}
              >
                退出编辑
              </button>
            )
          }
        </div>
      </section>
    );
  }
}

MarkForm.propTypes = {
  viewer: PropTypes.object.isRequired,
  curMarkType: PropTypes.string.isRequired,
  isEdit: PropTypes.bool.isRequired,
  color: PropTypes.string,
  setColor: PropTypes.func.isRequired,
  confirmUpdateBaseInfo: PropTypes.func.isRequired,
  exitEdit: PropTypes.func.isRequired,
  startAddingMark: PropTypes.func.isRequired,
  domColor: PropTypes.number,
  domOpacity: PropTypes.number.isRequired,
};

MarkForm.defaultProps = {
  color: "",
  domColor: "",
};

export default MarkForm;
