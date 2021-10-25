import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Toolbar from "../Base/Toolbar";
import Annotation from "../AnnotationUI/AnnotationIcon";
import Roadnet from "../Icon/Roadnet";
import style from "./topRight.less";
import { EVENT } from "../constant";

// 弃用
class TopRight extends React.PureComponent {
  constructor(props) {
    super(props);
    this.toolbarRef = {};
    this.userJSX = [];
  }

  componentDidMount() {
    this.props.eventEmitter.on(EVENT.addIconToTopRight, dom => {
      if (dom.$$typeof) {
        this.userJSX.push(dom);
        this.forceUpdate();
      } else {
        this.toolbarRef.current.appendChild(dom);
      }
    });
  }

  saveRef(ref) {
    this.toolbarRef = ref;
  }

  render() {
    return (
      <Toolbar
        className={`${style["top-right"]} bos3dui-topRight`}
        getRef={ref => { this.saveRef(ref) }}
      >
        {this.props.funcOption.annotation && (
          <Annotation
            openAnnotationUI={this.props.openAnnotationUI}
          />
        )}
        <Roadnet />
        {this.userJSX}
      </Toolbar>
    );
  }
}

TopRight.propTypes = {
  openAnnotationUI: PropTypes.func,
  funcOption: PropTypes.object.isRequired,
  eventEmitter: PropTypes.object.isRequired,
};

TopRight.defaultProps = {
  openAnnotationUI: () => {},
};

const mapStateToProps = (state) => ({
  eventEmitter: state.system.eventEmitter,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopRight);
