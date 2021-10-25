import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import settingImg from "IconImg/white/setting.png";
import { showSetting } from "../../redux/bottomRedux/action";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';

class Setting extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    showSetting: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div title="设置">
        <Icon
          selected={this.props.show}
          className={iconStyle.icon}
          icon={<AntdIcon type="iconsetup" />}
          title="设置"
          showTitle={!mobileCheck()}
          onClick={() => {
            this.props.showSetting(!this.props.show);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  show: state.bottom.showSetting,
});
const mapDispatchToProps = (dispatch) => ({
  showSetting: state => dispatch(showSetting(state)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Setting);
export default WrappedContainer;
