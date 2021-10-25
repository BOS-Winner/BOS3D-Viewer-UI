import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import style from "./style.less";

class ProgressBar extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      list: {},
      complete: [],
    };
  }

  componentDidMount() {
    const {
      ON_LOAD_PROGRESS,
      ON_LOAD_COMPLETE,
      ON_DEMAND_LOAD_COMPLETE,
    } = this.props.BIMWINNER.BOS3D.EVENTS;

    this.props.viewer.registerModelEventListener(
      ON_LOAD_PROGRESS,
      e => this.onLoadProgress(e)
    );
    this.props.viewer.registerModelEventListener(
      ON_LOAD_COMPLETE,
      e => this.onLoadComplete(e)
    );
    this.props.viewer.registerModelEventListener(
      ON_DEMAND_LOAD_COMPLETE,
      e => this.onLoadComplete(e)
    );
  }

  onLoadProgress(e) {
    this.setState(state => {
      const list = _.cloneDeep(state.list);
      list[e.progress.modelKey] = {
        loaded: e.progress.loaded,
        total: e.progress.total,
      };
      let loaded = 0;
      let total = 0;
      _.values(list).forEach(item => {
        loaded += item.loaded;
        total += item.total;
      });
      return {
        percent: loaded * 100 / total,
        list,
      };
    });
  }

  onLoadComplete(e) {
    const complete = _.cloneDeep(this.state.complete);
    complete.push(e.modelKey);
    if (complete.length === _.keys(this.state.list).length) {
      this.setState({
        percent: 100,
        list: {},
        complete: [],
      });
    } else {
      this.setState({
        complete,
      });
    }
  }

  render() {
    return ReactDOM.createPortal((
      <div
        className={style.progressBar}
        style={{
          display: this.state.percent >= 100 ? 'none' : 'block',
        }}
      >
        <div
          className={style.progressBarStriped}
          style={{
            width: `${this.state.percent}%`
          }}
        />
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProgressBar);
