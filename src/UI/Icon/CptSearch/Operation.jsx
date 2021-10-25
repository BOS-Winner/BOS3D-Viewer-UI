import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import { LocationOn } from "@material-ui/icons";
import style from "./style.less";

class Operation extends React.PureComponent {
  static propTypes = {
    onAdaptive: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className={style.operation}>
        <Button
          classes={{
            containedSecondary: style.button,
          }}
          size="small"
          color="primary"
          variant="contained"
          startIcon={<LocationOn aria-hidden />}
          onClick={() => this.props.onAdaptive()}
        >
          定位
        </Button>
      </div>
    );
  }
}

export default Operation;
