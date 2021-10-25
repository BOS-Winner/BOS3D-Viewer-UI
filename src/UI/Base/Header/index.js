import React from "react";
import style from "./style.less";


export default function Header (props) {

  return <div className={style.header}>
    <div className={style.headerBg} ></div>
    <div className={style.title} >{props.title || '未设置'}</div>
  </div>
}