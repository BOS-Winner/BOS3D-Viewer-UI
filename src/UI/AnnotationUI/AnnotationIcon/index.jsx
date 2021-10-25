import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import annotationPng from "../../Icon/img/white/annotation.png";
import AnnotationList from "../AnnotationList/AnnotationList";
import fuckIE from "../../theme/fuckIE.less";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

class Annotation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowAnnotationList: false
    };
    this.hideAnnotationList = this.hideAnnotationList.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isShowAnnotationList: false,
      });
    }
  }

  onClick() {
    this.setState(state => ({
      isShowAnnotationList: !state.isShowAnnotationList,
    }));
  }

  hideAnnotationList() {
    this.setState({
      isShowAnnotationList: false
    });
  }

  render() {
    return (
      <div
        title="批注"
        role="button"
        tabIndex={0}
        onClick={() => {
          this.onClick();
        }}
      >
        {/* <Icon
          className={this.state.isShowAnnotationList ? fuckIE.select : ''}
          img={annotationPng}
        /> */}
        <Icon
          selected={this.state.isShowAnnotationList}
          icon={<AntdIcon type="iconcomments" className={iconstyle.icon} />}
          title="批注"
        />
        {this.state.isShowAnnotationList
          ? (
            <AnnotationList
              close={this.hideAnnotationList}
              editAnnotation={this.props.openAnnotationUI}
            />
          )
          : null}
      </div>
    );
  }
}

Annotation.propTypes = {
  openAnnotationUI: PropTypes.func,
  mode: PropTypes.string.isRequired,
};

Annotation.defaultProps = {
  openAnnotationUI: () => {},
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Annotation);
export default WrappedContainer;
