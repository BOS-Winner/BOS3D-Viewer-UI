import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Move from "./Move";
import Perspective from "./Perspective";
import UpDown from "./UpDown";
import Setting from "./Setting";

const INIT_RATE = 1;

class MobileHelper extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    modelDetail: PropTypes.object,
  };

  static defaultProps = {
    modelDetail: {}
  }

  constructor(props) {
    super(props);
    this.state = {
      rate: INIT_RATE,
    };
  }

  onChangeRate(rate) {
    this.setState({ rate });
  }

  render() {
    const { modelDetail } = this.props;
    const isPicker = false; // 是否是新数据，是就隐藏
    return (
      <div role="presentation" onClick={e => { e.stopPropagation() }}>
        <Move
          viewer={this.props.viewer}
          BIMWINNER={this.props.BIMWINNER}
          speedRate={this.state.rate}
        />
        <Perspective viewer={this.props.viewer} />
        {!isPicker && <UpDown viewer={this.props.viewer} BIMWINNER={this.props.BIMWINNER} />}
        {
          !isPicker && (
            <Setting
              initRate={INIT_RATE}
              viewer={this.props.viewer}
              BIMWINNER={this.props.BIMWINNER}
              onChangeRate={rate => { this.onChangeRate(rate) }}
            />
          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  modelDetail: state.system.model,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MobileHelper);
