import React from "react";
import { InputBase, Paper } from "@material-ui/core";
import style from "./input.less";

const Input = React.forwardRef((props, ref) => (
  <Paper classes={{ root: style.paper }}>
    <InputBase {...props} ref={ref} classes={{ root: style.input }} />
  </Paper>
));

export default Input;
