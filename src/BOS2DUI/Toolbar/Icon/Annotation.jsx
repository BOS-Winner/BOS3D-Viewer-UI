import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
// import annotationImg from "IconImg/white/annotation.png";
import { showAnnotationList } from "../../redux/bottomRedux/action";
import { AntdIcon, mobileCheck } from '../../../UI/utils/utils';
import iconStyle from '../../Theme/icon.less';

class Annotation extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    showAnnotationList: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div title="批注">
        <Icon
          selected={this.props.show}
          icon={<AntdIcon type="iconcomments" />}
          title="批注"
          className={iconStyle.icon}
          showTitle={!mobileCheck()}
          onClick={() => {
            this.props.showAnnotationList(!this.props.show);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  show: state.bottom.showAnnotationList,
});
const mapDispatchToProps = (dispatch) => ({
  showAnnotationList: state => dispatch(showAnnotationList(state)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Annotation);
export default WrappedContainer;
