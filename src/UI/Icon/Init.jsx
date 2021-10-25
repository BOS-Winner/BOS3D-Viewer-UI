import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { resetHistory } from "./action";
import Icon from "../Base/Icon";
import initPng from "./img/white/init.png";

/**
 * @class 模型初始化
 */
class Init extends React.PureComponent {
  onClick() {
    this.props.viewer.resetScene();
    this.props.resetHistory();
  }

  render() {
    return (
      <div
        title="初始化"
        role="button"
        tabIndex={0}
        onClick={() => { this.onClick() }}
      >
        <Icon img={initPng} />
      </div>
    );
  }
}

Init.propTypes = {
  resetHistory: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D
});
const mapDispatchToProps = (dispatch) => ({
  resetHistory: () => { dispatch(resetHistory()) }
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Init);

export default WrappedContainer;
