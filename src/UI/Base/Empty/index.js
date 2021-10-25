import React from "react";
import style from "./style.less";

import notFoundImg from "../img/people/tip-primary.png"

export default function Empty (props) {

  let image = props.image ? props.image : notFoundImg

  return <div className={style.empty}>
    <div>
      <div>
        <img className={style.notFoundImg} style={props.imageStyle} src={image} />
      </div>
      {props.children}
    </div>
  </div>
}