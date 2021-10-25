import React from "react";
import PropTypes from "prop-types";
import Slider from "Base/Slider";
import style from "./style.less";
import { AntdIcon } from '../../../utils/utils';

const mapIcon = {
  'fit': 'iconfocusing',
  'roam': 'iconroam',
  'undo': 'iconoperationhistory',
  'reset': 'iconreset',
  'pickByRect': 'iconboxselection',
  'hide': 'iconconceal',
  'isolate': 'iconcomponentisolation',
  'section': 'iconmoxingpouqie-01',
  'scatter': 'icongongnengmianban_fenjie-01',
  'wireFrame': 'iconcomponentwireframing',
  'changeColor': 'iconcomponentcoloring',
  'measure': 'iconceliang',
  'cptInfo': 'iconshuxingxinxi',
  'infoTree': 'iconmodeltree',
  'mark': 'iconlabel',
  'snapshot': 'iconkuaizhao',
  'annotation': 'iconcomments',
  'moreMenu': 'iconmore',
  'cptsearch': 'iconcomponentsearch',
  'modelinfo': 'iconmodelinformation',
  'minimap': 'iconminimap',
  'open2d': 'iconersanweiliandong'
}


function ToolSettingItem(props) {
  return (
    <div className={style.toolSettingItem}>
      <div className={style.toolName}>
        <AntdIcon type={mapIcon[props.type]} className={style.icon} />
        <span>{props.name}</span>
      </div>
      <Slider checked={props.checked} onClick={props.onClick} />
    </div>
  );
}

ToolSettingItem.propTypes = {
  type: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default ToolSettingItem;
