import React from 'react';
import PropTypes from "prop-types";
import Icon from "Base/Icon";
// import icon2D from "../img/white/2D.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

function Open2D(props) {
  return (
    <div
      role="button"
      tabIndex={0}
      title="2D"
      onClick={e => {
        e.stopPropagation();
        if (props.selected) {
          props.linkage.emitter.emit(props.linkage.EVENTS.ON_SWITCH_ONLY3D);
        } else {
          props.linkage.emitter.emit(props.linkage.EVENTS.ON_SWITCH_MAIN3D);
        }
      }}
    >
      {/* <Icon
        img={icon2D}
        selected={props.selected}
      /> */}
      <Icon
        icon={<AntdIcon type="iconersanweiliandong" className={iconstyle.icon} />}
        title="2D"
        selected={props.selected}
      />
    </div>
  );
}

Open2D.propTypes = {
  linkage: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
};

export default Open2D;
