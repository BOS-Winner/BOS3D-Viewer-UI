import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";
import StrokeAttributePanel from "./StrokeAttributePanel";
import FillAttributePanel from "./FillAttributePanel";
import TextAttributePanel from "./TextAttributePanel";

class AttributePanel extends React.PureComponent {
  render() {
    return (
      <div className={style["panel-container"]}>

        { this.props.isTextAttri === false
          && (
            <>
              <StrokeAttributePanel
                strokeColor={this.props.strokeColor}
                strokeWidth={this.props.strokeWidth}
                setStrokeColor={this.props.setStrokeColor}
                setStrokeWidth={this.props.setStrokeWidth}
              />
              <div className={style.line} />
            </>
          )}

        <FillAttributePanel
          fillColor={(this.props.fillColor === "none" && this.props.isTextAttri === true) ? "#000000" : this.props.fillColor}
          setFillColor={this.props.setFillColor}
        />
        {this.props.isTextAttri === true
        && (
          <>
            <div className={style.line} />
            <TextAttributePanel
              fontSize={this.props.fontSize}
              text={this.props.text}
              setFontSize={this.props.setFontSize}
              setText={this.props.setText}
            />
          </>
        )}

      </div>
    );
  }
}

AttributePanel.propTypes = {
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  fillColor: PropTypes.string,
  fontSize: PropTypes.number,
  text: PropTypes.string,
  setStrokeWidth: PropTypes.func,
  setStrokeColor: PropTypes.func,
  setFillColor: PropTypes.func,
  setFontSize: PropTypes.func,
  setText: PropTypes.func,
  isTextAttri: PropTypes.bool
};

AttributePanel.defaultProps = {
  strokeColor: "#0000FF",
  fillColor: "none",
  strokeWidth: 5,
  fontSize: 16,
  text: "",
  setStrokeWidth: () => {},
  setStrokeColor: () => {},
  setFillColor: () => {},
  setFontSize: () => {},
  setText: () => {},
  isTextAttri: false
};

export default AttributePanel;
