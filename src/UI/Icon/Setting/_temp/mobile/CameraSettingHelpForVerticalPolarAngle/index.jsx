import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";
import CameraSettingHelpForVerticalPolarAngle from './CameraSettingHelpForVerticalPolarAngle';

// picker 希望后期使用个比较好的组件ui来代替。目前由于时间跟能力原因。先实现此版本。为临时
export default class Picker extends React.Component {
  static propTypes = {
    setMaxCameraRotateAngle: PropTypes.func.isRequired,
    setMinCameraRotateAngle: PropTypes.func.isRequired,
    minCameraRotateAngle: PropTypes.number.isRequired,
    maxCameraRotateAngle: PropTypes.number.isRequired,
  };

  componentDidMount() {

  }

  onChange = (index, type) => {
    // console.log('onChange');
    if (type === 'max') {
      this.props.setMaxCameraRotateAngle(index - 90);
    }
    if (type === 'min') {
      this.props.setMinCameraRotateAngle(index - 90);
    }
  }

  render() {
    const { minCameraRotateAngle, maxCameraRotateAngle } = this.props;
    // console.log(minCameraRotateAngle, 'Pickerx');
    // console.log(maxCameraRotateAngle, 'Pickerx');
    return (
      <div className={style.picker}>
        <CameraSettingHelpForVerticalPolarAngle type="min" value={minCameraRotateAngle} max={maxCameraRotateAngle} onChange={this.onChange} />
        <CameraSettingHelpForVerticalPolarAngle type="max" value={maxCameraRotateAngle} min={minCameraRotateAngle} onChange={this.onChange} />
        <div className={style.coverBorder} />
      </div>
    );
  }
}
