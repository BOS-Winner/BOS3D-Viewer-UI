import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import measureImg from "IconImg/white/measure.png";
import { changeMode, changeMouseIcon } from "../../redux/bottomRedux/action";
import * as MODE from "../../redux/bottomRedux/mode";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';

class PickByRect extends React.PureComponent {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    changeMode: PropTypes.func.isRequired,
    changeMouseIcon: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div title="测量">
        <Icon
          selected={this.props.mode === MODE.pickByMeasure}
          icon={<AntdIcon type="iconceliang" />}
          title="测量"
          className={iconStyle.icon}
          showTitle={!mobileCheck()}
          onClick={() => {
            this.props.changeMode(this.props.mode === MODE.pickByMeasure ? '' : MODE.pickByMeasure);
            this.props.changeMouseIcon(this.props.mode === MODE.pickByMeasure ? '' : MODE.pickByMeasure);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mode: state.bottom.mode,
});
const mapDispatchToProps = (dispatch) => ({
  changeMode: (mode) => dispatch(changeMode(mode)),
  changeMouseIcon: (mode) => dispatch(changeMouseIcon(mode)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PickByRect);

export default WrappedContainer;
