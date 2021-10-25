import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import cptInfoImg from "IconImg/white/cptInfo.png";
import { showCptInfo } from "../../redux/bottomRedux/action";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';


class Setting extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    showCptInfo: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div title="特性">
        <Icon
          selected={this.props.show}
          icon={<AntdIcon type="icontexing2-01" />}
          title="特性"
          className={iconStyle.icon}
          showTitle={!mobileCheck()}
          onClick={() => {
            this.props.showCptInfo(!this.props.show);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  show: state.bottom.showCptInfo,
});
const mapDispatchToProps = (dispatch) => ({
  showCptInfo: state => dispatch(showCptInfo(state)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Setting);
export default WrappedContainer;
