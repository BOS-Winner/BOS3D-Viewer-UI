import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Reset from "./Reset";
// import resetPng from "../img/white/reset.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

class ResetContainer extends React.Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
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
      show: !state.show
    }));
  }

  render() {
    return (
      <div
        title="复位"
        role="button"
        tabIndex={0}
        onClick={e => { this.onClick(e) }}
      >
        <Reset
          visible={this.state.show}
          onHide={() => this.setState({ show: false })}
        />
        <Icon
          icon={<AntdIcon type="iconreset" className={iconstyle.icon} />}
          title=""
          selected={this.state.show}
          showTitle={false}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mode: state.button.mode,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResetContainer);
export default WrappedContainer;
