class Roam {
  constructor(props) {
    this.props = props;
  }

  getId() {
    return this.props.id;
  }

  export() {
    return this.props;
  }
}

export default Roam;
