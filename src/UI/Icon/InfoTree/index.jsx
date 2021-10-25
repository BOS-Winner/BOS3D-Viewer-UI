import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import TreeManager from "./TreeManager";
// import treePng from "../img/white/infoTree.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

class Tree extends React.Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    BOS3D: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        show: false,
      });
    }
  }

  onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => ({
      show: !state.show,
    }));
  }

  onCloseTree() {
    this.setState({
      show: false,
    });
  }

  render() {
    const { BOS3D } = this.props;
    return (
      <div
        title="模型树"
        role="presentation"
        onClick={(e) => { this.onClick(e) }}
      >
        {/* <Icon
          img={treePng}
          selected={this.state.show}
        /> */}
        <Icon
          icon={<AntdIcon type="iconmodeltree" className={iconstyle.icon} />}
          title="模型树"
          selected={this.state.show}
        />
        {this.state.show
          && <TreeManager BOS3D={BOS3D} onClose={() => { this.onCloseTree() }} />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BOS3D: state.system.BIMWINNER.BOS3D,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tree);
export default WrappedContainer;
