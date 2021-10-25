import React from 'react';
import style from './index.less';
import { AntdIcon } from '../../utils/utils';

/**
 * 获取分解模式
 * @param {object} props
 * @param {stirng} props.icon antIcon type
 * @param {string} props.title scatter type
 * @param {function} props.func onClick func
 * @param {active} [props.acive = false] 激活状态
 * @param {object} [props.customStyle] 自定义样式
 * @returns {Element}
 */
function Card(props) {
  const {
    // eslint-disable-next-line react/prop-types
    icon, title, func, active = false, customStyle = "", notHover = false
  } = props;

  function handleClick() {
    if (func && typeof func === "function") {
      func();
    }
  }

  return (
    <div
      className={`${style.cardContainer} ${active ? style.active : ""} ${notHover ? style.notHover : ""} `}
      onClick={handleClick}
      role="presentation"
      key={title}
      style={customStyle || {}}
    >
      <div className={style.rectTopLeft} />
      <div className={style.rectTopRight} />
      <div className={style.rectBottomLeft} />
      <div className={style.rectBottomRight} />
      <AntdIcon type={icon} className={style.icon} />
      <span>{title}</span>
    </div>
  );
}

export default Card;
