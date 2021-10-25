import React from "react";
import PropTypes from "prop-types";
import Modal from "Base/Modal";
import { connect } from "react-redux";
import ModalContent from "./ModalContent";
import { showLayerSwitcher } from "../../redux/bottomRedux/action";
import { mobileCheck } from '../../../UI/utils/utils';

function LayerSwitcher(props) {
  const isMobile = mobileCheck();
  return (
    <Modal
      onCancel={() => {
        props.hideLayerSwitcher();
      }}
      title="图层"
      width="260px"
      height={isMobile ? "250px" : "500px"}
      top="10px"
      bottom="initial"
      left="10px"
      right="initial"
      minWidth={260}
      minHeight={300}
      viewportDiv={props.viewer.getViewerImpl().domElement}
      visible={props.visible}
      destroyOnClose
    >
      <ModalContent />
    </Modal>
  );
}

LayerSwitcher.propTypes = {
  viewer: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  hideLayerSwitcher: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  visible: state.bottom.showLayerSwitcher,
  viewer: state.system.viewer2D,
  layerList: state.bottom.layerList,
});
const mapDispatchToProps = (dispatch) => ({
  hideLayerSwitcher: () => dispatch(showLayerSwitcher(false)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LayerSwitcher);
export default WrappedContainer;
