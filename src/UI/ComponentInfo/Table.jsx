import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import style from "./index.less";

class Table extends React.Component {
  constructor(props) {
    super(props);
    const expand = {};
    _.keys(props.data).forEach(k => {
      if (typeof props.data[k] === 'object') {
        expand[k] = true;
      }
    });
    this.state = {
      expand,
    };
  }

  toggleExpand (e, key) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => ({
      expand: {
        ...state.expand,
        [key]: !state.expand[key],
      },
    }));
  }

  render () {
    const { data, indent } = this.props;
    const content = [];


    _.keys(data).forEach(k => {
      if (typeof data[k] !== 'object') {
        content.push(
          <div
            className={style.item}
            key={k}
          >
            <div className={style.lable} title={k}>{k}</div>
            <div className={style.value} title={data[k].toString()}>{data[k]}</div>
          </div>
        );
      } else {
        content.push(
          <div
            key={k}
            className={style[`indent-level-${indent}`]}
          >
            <div
              className={`${style.title} ${this.state.expand[k] ? style.collapse : ''}`}
              role="tree"
              tabIndex={0}
              onClick={e => { this.toggleExpand(e, k) }}
            >
              {k}
            </div>
            <div
              className={`${style.expand}`}
              style={{ display: this.state.expand[k] ? 'block' : 'none' }}
            >
              <Table data={data[k]} indent={this.props.indent + 1} />
            </div>
          </div>
        );
      }
    });
    return content;
  }
}

Table.propTypes = {
  data: PropTypes.object.isRequired,
  indent: PropTypes.number,
};

Table.defaultProps = {
  indent: 0,
};

export default Table;
