import React from "react";
import PropTypes from "prop-types";
import ComponentInfo from "../../ComponentInfo";

function FamilyProperty(props) {
  return (
    props.visible
      ? (
        <ComponentInfo type="family" cptKey={props.familyKey} modelKey={props.modelKey} onClose={props.onClose} />
      )
      : <></>
  );
}

FamilyProperty.propTypes = {
  visible: PropTypes.bool.isRequired,
  familyKey: PropTypes.string,
  modelKey: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

FamilyProperty.defaultProps = {
  modelKey: '',
  familyKey: '',
};

export default FamilyProperty;
