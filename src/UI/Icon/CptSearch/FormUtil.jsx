import React from "react";
import PropTypes from "prop-types";
import { FormControlLabel, InputBase, Paper } from "@material-ui/core";
import style from "./style.less";

const Input = React.forwardRef((props, ref) => (
  <Paper classes={{ root: style.inputPaper }}>
    <InputBase {...props} ref={ref} />
  </Paper>
));

const FormCtl = React.forwardRef((props, ref) => (
  <FormControlLabel
    classes={{ root: style.label }}
    labelPlacement="start"
    control={<Input classes={{ root: style.input }} name={props.name} ref={ref} />}
    label={props.label}
  />
));

FormCtl.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const validateAction = {
  hasData: data => Object.values(data).some(d => !!d),
};

export {
  FormCtl,
  validateAction
};
