import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import { updateLayerList } from "../../redux/bottomRedux/action";
import style from "./style.less";
import { AntdIcon } from '../../../UI/utils/utils';

function ModalContent(props) {
  const switchLayerShow = React.useCallback((index, show) => {
    const list = _.cloneDeep(props.layerList);
    if (index < 0) {
      list.forEach(item => {
        item.isVisible = show;
        if (show) {
          props.viewer.showDrawLayer(item);
        } else {
          props.viewer.hideDrawLayer(item);
        }
      });
    } else {
      list[index].isVisible = show;
      if (show) {
        props.viewer.showDrawLayer(list[index]);
      } else {
        props.viewer.hideDrawLayer(list[index]);
      }
    }
    props.updateLayerList(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.layerList]);

  const listJSX = [];
  let allHide = true;
  props.layerList.forEach((layer, index) => {
    let title = "点击显示图层";
    if (layer.isVisible) {
      title = "点击隐藏图层";
      allHide = false;
    }
    listJSX.push(
      <div
        key={
          // eslint-disable-next-line react/no-array-index-key
          layer.name + index
        }
        className={`${style.layerItem}`}
        title={title}
        role="list"
        data-index={index}
        onClick={ev => {
          ev.stopPropagation();
          switchLayerShow(index, !layer.isVisible);
        }}
      >
        <AntdIcon
          type={layer.isVisible ? "iconcaozuolishikejian-01" : "iconcaozuolishibukejian-01"}
          className={style.icon}
          style={{ color: layer.isVisible ? "#fff" : "#999" }}
        />
        {/* <div className={style.rect} style={{ background: layer.clayerColor || "#ccc" }} /> */}
        <span>{layer.name}</span>
      </div>
    );
  });

  return (
    <div className={style.viewer2DLayer}>
      <div className={style.layerContainer}>
        {listJSX}
      </div>
      <div
        className={style.layerAll}
        title={allHide ? "点击显示全部图层" : "点击隐藏全部图层"}
        role="list"
        onClick={ev => {
          ev.stopPropagation();
          switchLayerShow(-1, allHide);
        }}
      >
        {allHide ? "显示全部图层" : "隐藏全部视图"}
      </div>
    </div>
  );
}

ModalContent.propTypes = {
  layerList: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateLayerList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  layerList: state.bottom.layerList,
  viewer: state.system.viewer2D,
});
const mapDispatchToProps = (dispatch) => ({
  updateLayerList: layers => dispatch(updateLayerList(layers)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalContent);

export default WrappedContainer;
