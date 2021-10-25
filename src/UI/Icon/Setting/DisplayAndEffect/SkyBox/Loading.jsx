import React from "react";
import PropTypes from "prop-types";
import { Backdrop, CircularProgress, Paper } from "@material-ui/core";
import style from "./style.less";

function Loading(props) {
  return (
    <Backdrop open={props.open} style={{ zIndex: props.open ? 999 : -999 }}>
      <Paper classes={{ root: style.loading }}>
        <CircularProgress color="primary" size={16} />
        <span>正在加载天空盒背景，请稍后</span>
      </Paper>
    </Backdrop>
  );
}

Loading.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default Loading;
