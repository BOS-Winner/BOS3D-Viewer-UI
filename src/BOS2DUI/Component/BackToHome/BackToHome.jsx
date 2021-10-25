import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import style from "./style.less";
import { mobileCheck } from '../../../UI/utils/utils';

function BackToHome(props) {
  // 移动端不显示
  return (
    <div
      className={style.initTopRight}
      role="button"
      tabIndex={0}
      style={mobileCheck() ? { right: '70px' } : {}}
      onClick={() => props.viewer.restoreCameraStatus()}
    />
  );
}

BackToHome.propTypes = {
  viewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BackToHome);
export default WrappedContainer;
