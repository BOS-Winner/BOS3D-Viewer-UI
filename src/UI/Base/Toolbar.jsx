import React from "react";
import PropTypes from "prop-types";
import style from "./toolbar.less";

class Toolbar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.props.getRef(this.ref);
  }

  render() {
    return (
      <div
        className={`${style.toolbar} ${this.props.className}`}
        style={this.props.style}
        ref={this.ref}
      >
        {this.props.children}
      </div>
    );
  }
}

Toolbar.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  getRef: PropTypes.func,
};

Toolbar.defaultProps = {
  className: "",
  style: {},
  getRef: () => {},
};

export default Toolbar;
