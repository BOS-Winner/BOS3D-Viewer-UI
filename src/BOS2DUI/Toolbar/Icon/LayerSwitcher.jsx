import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import layerImg from "../img/layer.png";
import { showLayerSwitcher } from "../../redux/bottomRedux/action";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';

class Setting extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    showLayerSwitcher: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div title="显示/隐藏图层选择">
        <Icon
          selected={this.props.show}
          icon={<AntdIcon type="icontuceng2-01" />}
          title="图层"
          className={iconStyle.icon}
          showTitle={!mobileCheck()}
          onClick={() => {
            this.props.showLayerSwitcher(!this.props.show);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  show: state.bottom.showLayerSwitcher,
});
const mapDispatchToProps = (dispatch) => ({
  showLayerSwitcher: state => dispatch(showLayerSwitcher(state)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Setting);
export default WrappedContainer;
