import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";
// import checkedImg from "../img/blue/checked.png";
import { AntdIcon } from '../../utils/utils';

function CheckboxIcon(props) {
  if (props.checked) {
    return (
      // <img className={style.checkedIcon} alt="checked" src={checkedImg} />
      <AntdIcon type="icona-icon_checkboxselect2" className={style.checkedIcon} />
    );
  } else {
    return (
      <div className={`${style.uncheckedIcon} ${props.disabled ? style.disabled : ''}`} />
    );
  }
}

CheckboxIcon.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
};
CheckboxIcon.defaultProps = {
  disabled: false,
};

export default CheckboxIcon;
