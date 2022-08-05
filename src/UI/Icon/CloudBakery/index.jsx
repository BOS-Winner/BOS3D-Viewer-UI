import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import iconstyle from '../../Toolbar/bottom.less';
import { AntdIcon } from '../../utils/utils';
import CloudBakeryManager from "./cloudBakery";

function CloudBakery(props) {
  const { mode, cloudBaking } = props;
  const currentMode = useRef(mode);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (currentMode !== mode && mode === "漫游模式") {
      setShow(false);
      currentMode.current = mode;
    }
  }, [mode]);

  /**
   * 控制云烘焙弹窗
   */
  function handleShow() {
    setShow(!show);
  }

  useEffect(() => {
    setShow(cloudBaking);
  }, [cloudBaking]);

  return (
    <div
      title="云烘焙"
      role="presentation"
      onClick={handleShow}
    >
      <Icon
        icon={<AntdIcon type="iconmodeltree" className={iconstyle.icon} />}
        title="云烘焙"
        selected={show}
      />
      {show
      && (
        <CloudBakeryManager
          onClose={() => setShow(false)}
          modelLoad={props.modelLoad}
        />
      )}
    </div>
  );
}

CloudBakery.propTypes = {
  mode: PropTypes.string.isRequired,
  cloudBaking: PropTypes.bool.isRequired,
  modelLoad: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BOS3D: state.system.BIMWINNER.BOS3D,
  cloudBaking: state.userSetting.cloudBaking,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CloudBakery);

export default WrappedContainer;
