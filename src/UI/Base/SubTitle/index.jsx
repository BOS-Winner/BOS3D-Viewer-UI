import React from "react";
import PropTypes from 'prop-types';
import { AntdIcon } from "../../utils/utils";
import style from "./index.less";

/**
 * 小标题
 * @param {object} props 参数
 * @param {string} title 题目
 * @param {function} [onChange=()=>{}] 回调函数
 * @param {boolean} [unflodStatus = false] 是否折叠
 * @param {string} [customStyle=""] 自定义样式
 * @param {boolean} [disable=false] 禁止触发回调函数
 * @param {boolean} [tipIcon=false] 是否显示提示Icon
 * @param {string} [tipContent=""] 提示内容
 * @param {boolean} [showCloseIcon=true] 是否显示下拉关闭按钮
 * @returns {ReactElement}
 */
function SubTitle(props) {
  const {
    title, onChange = () => {}, unfoldStatus = false, customStyle = '', disabled = false, tipIcon = false, tipContent = '', showCloseIcon = true,
  } = props;
  function handleChange(e) {
    e.preventDefault();
    if (!disabled) {
      onChange();
    }
  }
  const extendStyle = {
    ...customStyle,
    cursor: disabled ? "not-allowed" : "pointer",
  };
  return (
    <div
      role="presentation"
      className={style.container}
      style={extendStyle || {}}
      onClick={handleChange}
    >
      <div className={style.customIcon} />
      <span className={style.title}>{title}</span>
      {tipIcon && (
        <AntdIcon className={style.tipIcon} type="icontips_kehover" title={tipContent} />
      )}
      {
        showCloseIcon && (
          <AntdIcon
            className={style.closeIcon}
            type={!unfoldStatus ? "iconicon_arrowup" : "iconicon_arrowdown"}
          />
        )
      }
    </div>
  );
}

SubTitle.propTypes = {
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  unfoldStatus: PropTypes.bool,
  customStyle: PropTypes.object,
  disabled: PropTypes.bool,
  tipIcon: PropTypes.bool,
  tipContent: PropTypes.string,
  showCloseIcon: PropTypes.bool,
};

SubTitle.defaultProps = {
  customStyle: {},
  disabled: false,
  tipContent: '',
  tipIcon: false,
  showCloseIcon: true,
  unfoldStatus: false,
  onChange: () => {},
};

export default SubTitle;
