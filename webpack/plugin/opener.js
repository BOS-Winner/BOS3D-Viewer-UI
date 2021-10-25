const opener = require('opener');

class Opener {
  constructor(props) {
    this.done = false;
    this.props = props;
  }

  apply(compiler) {
    compiler.hooks.done.tap('Opener', stats => {
      if (!(this.done || stats.hasErrors())) {
        opener(`${this.props.https ? 'https' : 'http'}://localhost:${this.props.port}`);
        this.done = true;
      }
    });
  }
}

module.exports = props => new Opener(props);
