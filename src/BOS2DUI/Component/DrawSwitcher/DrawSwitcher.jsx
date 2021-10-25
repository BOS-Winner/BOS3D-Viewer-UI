import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import { updateLayerList } from "../../redux/bottomRedux/action";
import style from "./style.less";
import { mobileCheck } from "../../../UI/utils/utils";

const drawStateList = {
  noDraw: {
    key: "noDraw",
    name: "暂无图纸",
    isLoaded: true,
  },
  fetching: {
    key: "fetching",
    isLoaded: false,
    name: "正在获取图纸",
  }
};

function DrawSwitcher(props) {
  const [drawList, setDrawList] = React.useState([drawStateList.fetching]);
  const [isExpand, setExpand] = React.useState(false);
  const [selectedDraw, setSelectedDraw] = React.useState(drawStateList.fetching);
  // 为了不重复调用useEffect，手动做个ref关联。看来hook还是带来了一定的麻烦事::>_<::
  const drawListRef = React.useRef(drawList);

  React.useEffect(() => {
    // 加载的时候获取图纸列表
    props.viewer.onDrawListLoad = list => {
      if (list.length > 0) {
        const cloneList = _.cloneDeep(list);
        drawListRef.current = cloneList;
        setDrawList(cloneList);
        props.viewer.showDraw(list[0].key, layers => {
          setSelectedDraw(list[0]);
          props.updateLayerList(layers);
        });
      } else {
        drawListRef.current = [drawStateList.noDraw];
        setDrawList([drawStateList.noDraw]);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    props.viewer.onDrawLoad = draw => {
      // todo: 图纸加载出错需要提示
      if (draw) {
        drawListRef.current.some((item, index) => {
          if (item.key === draw.drawKey) {
            const list = _.cloneDeep(drawListRef.current);
            list[index].isLoaded = true;
            drawListRef.current = list;
            setDrawList(list);
            return true;
          }
          return false;
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchDraw = ev => {
    ev.stopPropagation();
    const key = ev.target.getAttribute('data-key');
    if (key && key !== 'noDraw' && key !== 'fetching') {
      drawList.some(item => {
        if (item.key === key && item.isLoaded) {
          props.viewer.showDraw(key, layers => {
            setSelectedDraw(item);
            props.updateLayerList(layers);
          });
          return true;
        }
        return false;
      });
    }
  };

  const drawItemJSX = [];
  drawList.forEach(item => {
    drawItemJSX.push(
      <div
        key={item.key}
        className={`${style.drawItem} ${!item.isLoaded ? style.drawLoading : ''}`}
        title={item.name}
        data-key={item.key}
        // style={{ background: '#ccc' }}
      >
        <span data-key={item.key}>{item.name}</span>
      </div>
    );
  });

  return (
    <div className={`${style.draw} ${isExpand ? style.drawPopup : ''}`}>
      <div
        className={style.drawSelect}
        title={selectedDraw.name}
        role="menu"
        tabIndex={0}
        onClick={() => setExpand(!isExpand)}
      >
        <span>图纸</span>
        <div>
          <span>{selectedDraw.name}</span>
        </div>
      </div>
      <div className={style.drawOption}>
        <div
          role="list"
          className={style.drawOptionContainer}
          style={mobileCheck() ? { height: '200px' } : {}}
          onClick={switchDraw}
        >
          {drawItemJSX}
        </div>
      </div>
    </div>
  );
}

DrawSwitcher.propTypes = {
  viewer: PropTypes.object.isRequired,
  updateLayerList: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
});
const mapDispatchToProps = (dispatch) => ({
  updateLayerList: layers => dispatch(updateLayerList(layers)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawSwitcher);

export default WrappedContainer;
