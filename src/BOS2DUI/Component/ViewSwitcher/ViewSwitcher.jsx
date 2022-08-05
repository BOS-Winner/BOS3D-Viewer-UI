import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import { updateLayerList, updateViewKey } from "../../redux/bottomRedux/action";
import style from "./style.less";
import { mobileCheck } from "../../../UI/utils/utils";

const drawStateList = {
  noDraw: {
    key: "noDraw",
    name: "暂无视图",
    isLoaded: true,
  },
  fetching: {
    key: "fetching",
    isLoaded: false,
    name: "正在获取视图",
  }
};

function defined(value) {
  return value !== undefined && value !== null;
}

function ViewSwitcher(props) {
  const [viewList, setViewList] = React.useState([drawStateList.fetching]);
  const [isExpand, setExpand] = React.useState(false);
  const [selectedDraw, setSelectedDraw] = React.useState(drawStateList.fetching);
  // 为了不重复调用useEffect，手动做个ref关联。看来hook还是带来了一定的麻烦事::>_<::
  const viewListRef = React.useRef(viewList);
  // const drawListRef = React.useRef([]);
  // const viewListLoadRef = React.useRef(false);

  React.useEffect(() => {
    props.viewer.pkgDataLoad.addEventListener(result => {
      // console.log('视图列表获取', result);
      if (result.code === "SUCCESS") {
        const { data } = result;
        const layoutList = {};
        data.forEach(item => {
          const layout = item['layout'];
          if (defined(layout)) {
            Object.keys(layout).forEach(_key => {
              layoutList[_key] = {
                key: _key,
                name: _key,
                isLoaded: true,
              };
            });
          }
        });
        const _viewList = Object.values(layoutList).length ? Object.values(layoutList) : [drawStateList.noDraw];
        viewListRef.current = _viewList;
        setViewList(_viewList);
        let initView = _viewList[0];
        const tmepModelView = _viewList.filter(_view => _view.key === "Model");
        if (tmepModelView.length) initView = tmepModelView[0];
        setSelectedDraw(() => initView);
        props.updateViewKey(initView.key);
        // viewListLoadRef.current = true;
      }
    });
    // 加载的时候获取图纸列表
    // props.viewer.onDrawListLoad = list => {
    //   if (list.length > 0) {
    //     const cloneList = _.cloneDeep(list);
    //     viewListRef.current = cloneList;
    //     setViewList(cloneList);
    //     props.viewer.showDraw(list[0].key, layers => {
    //       setSelectedDraw(list[0]);
    //       props.updateLayerList(layers);
    //     });
    //   } else {
    //     viewListRef.current = [drawStateList.noDraw];
    //     setViewList([drawStateList.noDraw]);
    //   }
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React.useEffect(() => {
  //   if (!viewListLoadRef.current) return;
  //   props.viewer.showLayoutInDraw(
  //         drawListRef.current[0]?.key,
  //         viewListRef.current[0]?.key,
  //         () => {
  //           console.log("视图的切换");
  //           setSelectedDraw(() => viewListRef.current[0]);
  //           props.updateViewKey(viewListRef.current[0].key);
  //           // props.updateLayerList(layers);
  //         }
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [viewListLoadRef.current]);

  const switchDraw = ev => {
    ev.stopPropagation();
    const key = ev.target.getAttribute('data-key');
    if (key && key !== 'noDraw' && key !== 'fetching') {
      viewList.some(item => {
        if (item.key === key && item.isLoaded) {
          props.viewer.showLayoutInDraw(props.drawKey, key, layers => {
            setSelectedDraw(item);
            props.updateViewKey(key);
            props.updateLayerList(layers);
          });
          return true;
        }
        return false;
      });
    }
  };

  const drawItemJSX = [];
  viewList.forEach(item => {
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
  // console.log('当前选择的视图', selectedDraw);
  return (
    <div className={`${style.draw} ${isExpand ? style.drawPopup : ''}`}>
      <div
        className={style.drawSelect}
        title={selectedDraw.name}
        role="menu"
        tabIndex={0}
        onClick={() => setExpand(!isExpand)}
      >
        <span>视图</span>
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

ViewSwitcher.propTypes = {
  viewer: PropTypes.object.isRequired,
  updateLayerList: PropTypes.func.isRequired,
  updateViewKey: PropTypes.func.isRequired,
  drawKey: PropTypes.string.isRequired,
  // viewKey: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
  drawKey: state.bottom.drawKey,
  // viewKey: state.bottom.viewKey,
});
const mapDispatchToProps = (dispatch) => ({
  updateLayerList: layers => dispatch(updateLayerList(layers)),
  updateViewKey: viewKey => dispatch(updateViewKey(viewKey)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewSwitcher);

export default WrappedContainer;
