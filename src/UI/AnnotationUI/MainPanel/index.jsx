import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Toolbar from '../Toolbar/Toolbar';
import style from "./style.less";
import { DEF_COLOR } from '../resource';

class MainPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { isMobile } = this.props;
    return (
      <div className={style.container}>
        <Toolbar
          disableActions={this.props.disableActions}
          buttonAction={this.props.buttonAction}
          selectedButton={this.props.selectedButton}
          fillColor={(this.props.fillColor === "none" && this.props.isTextAttri === true) ? DEF_COLOR : this.props.fillColor}
          setFillColor={this.props.setFillColor}
          strokeColor={this.props.strokeColor}
          strokeWidth={this.props.strokeWidth}
          setStrokeColor={this.props.setStrokeColor}
          setStrokeWidth={this.props.setStrokeWidth}
          fontSize={this.props.fontSize}
          text={this.props.text}
          setFontSize={this.props.setFontSize}
          setText={this.props.setText}
          isTextAttri={this.props.isTextAttri}
          drawableInSelectAction={this.props.drawableInSelectAction}
          isMobile={isMobile}
        />
      </div>
    );
  }
}

MainPanel.propTypes = {
  // snapshot: PropTypes.object,
  // editorData: PropTypes.object,
  // onClose: PropTypes.func,
  // onSave: PropTypes.func,
  // viewer: PropTypes.object.isRequired,
  setText: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  text: PropTypes.string,
  fontSize: PropTypes.number.isRequired,
  strokeColor: PropTypes.string.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  setStrokeColor: PropTypes.func.isRequired,
  setStrokeWidth: PropTypes.func.isRequired,
  setFillColor: PropTypes.func.isRequired,
  fillColor: PropTypes.string.isRequired,
  isTextAttri: PropTypes.bool.isRequired,
  selectedButton: PropTypes.string,
  isMobile: PropTypes.bool,
  disableActions: PropTypes.array.isRequired,
  buttonAction: PropTypes.func.isRequired,
  drawableInSelectAction: PropTypes.object.isRequired,

};

MainPanel.defaultProps = {
  // snapshot: undefined,
  // editorData: undefined,
  // onClose: () => { },
  // onSave: () => { }
  text: "",
  selectedButton: "",
  isMobile: false,

};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D || state.system.viewer2D,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPanel);
