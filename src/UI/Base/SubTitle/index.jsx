import React from "react";
import PropTypes from 'prop-types';
import { AntdIcon } from "../../utils/utils";
import style from "./index.less";

function SubTitle(props) {
  const {
    title, onChange, unfoldStatus = false, customStyle = '', disabled = false, tipIcon = false, tipContent = ''
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
      <AntdIcon
        className={style.closeIcon}
        type={!unfoldStatus ? "iconicon_arrowup" : "iconicon_arrowdown"}
      />
    </div>
  );
}

SubTitle.propTypes = {
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  unfoldStatus: PropTypes.bool.isRequired,
  customStyle: PropTypes.object,
  disabled: PropTypes.bool,
  tipIcon: PropTypes.bool,
  tipContent: PropTypes.string,
};

SubTitle.defaultProps = {
  customStyle: {},
  disabled: false,
  tipContent: '',
  tipIcon: false
};

export default SubTitle;
