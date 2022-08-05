import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Spin } from 'antd';
import _ from "lodash-es";
import { updateDrawKey, updateLayerList, updateViewKey } from "../../redux/bottomRedux/action";
import style from "./style.less";
import { mobileCheck } from "../../../UI/utils/utils";
import defaultThumbnail from './img/defaultThumbnail.jpg';

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

function defined(value) {
  return value !== undefined && value !== null;
}

function DrawSwitcher(props) {
  const [drawList, setDrawList] = React.useState([drawStateList.fetching]);
  const [isExpand, setExpand] = React.useState(false);
  const [selectedDraw, setSelectedDraw] = React.useState(drawStateList.fetching);
  // 为了不重复调用useEffect，手动做个ref关联。看来hook还是带来了一定的麻烦事::>_<::
  const drawListRef = React.useRef(drawList);
  const vieweListRef = React.useRef();

  React.useEffect(() => {
    // 加载的时候获取图纸列表
    props.viewer.pkgDataLoad.addEventListener(result => {
      if (result.code !== "SUCCESS") return;
      const { data: list } = result;
      if (list.length > 0) {
        const cloneList = _.cloneDeep(list);
        drawListRef.current = cloneList;
        for (let i = 0; i < cloneList.length; i++) {
          console.log(cloneList, 'ah');
          if (cloneList[i]['thumbnail'] && cloneList[i]['thumbnail']['fileKey']) {
            fetch(`${props.viewer.host}/data?fileKey=${cloneList[i]['thumbnail']['fileKey']}`)
              .then(response => {
                const reader = response.body.getReader();
                return new ReadableStream({
                  start(controller) {
                    // 下面的函数处理每个数据块
                    function push() {
                      // "done"是一个布尔型，"value"是一个Uint8Array
                      reader.read().then(({ done, value }) => {
                        // 判断是否还有可读的数据？
                        if (done) {
                          // 告诉浏览器已经结束数据发送
                          controller.close();
                          return;
                        }
                        // 取得数据并将它通过controller发送给浏览器
                        controller.enqueue(value);
                        push();
                      });
                    }
                    push();
                  }
                });
              })
            // Create a new response out of the stream
              .then(rs => new Response(rs))
            // Create an object URL for the response
              .then(response => response.blob())
              .then(blob => URL.createObjectURL(blob))
            // Update image
              .then(url => {
                console.log(url, "获取的缩略图");
                cloneList[i]['thumbnailImageUrl'] = url;
                cloneList[i]['isLoaded'] = true;
                // cloneList[i]['isLoaded'] = true;
                setDrawList(() => cloneList);
              })
              .catch(console.error);
          }
        }
        // 获取视图数据
        const layoutList = {};
        if (list.length) {
          list.forEach(item => {
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
        }
        const viewList = Object.values(layoutList);
        vieweListRef.current = viewList;
        setSelectedDraw(drawListRef.current[0]);
        setDrawList(cloneList);
      } else {
        drawListRef.current = [drawStateList.noDraw];
        setDrawList([drawStateList.noDraw]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    props.viewer.onDrawLoad = draw => {
      // todo: 图纸加载出错需要提示
      if (draw) {
        drawListRef.current.some((item, index) => {
          if (item.key === draw.key || item.key === draw.drawKey) {
            const list = _.cloneDeep(drawListRef.current);
            list[index].isLoaded = true;
            drawListRef.current = list;
            setDrawList(list);
            const drawKey = drawListRef.current[0]?.key;
            let viewKey = vieweListRef.current[0]?.key;
            if (vieweListRef.current.some(_view => _view.key === "Model")) {
              viewKey = "Model";
            }
            if (!selectedDraw.isLoaded) {
              props.viewer.showLayoutInDraw(
                drawKey,
                viewKey,
                layers => {
                  setSelectedDraw(drawListRef.current[0]);
                  props.updateDrawKey(drawKey);
                  props.updateLayerList(layers);
                });
            }

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
          props.viewer.showLayoutInDraw(
            key,
            props.viewKey,
            layers => {
              setSelectedDraw(item);
              props.updateDrawKey(item.key);
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
        className={`${style.drawItem}`}
        title={item.name}
        data-key={item.key}
        style={{
          // background: '#fff',
          backgroundImage: `url(${item.thumbnailImageUrl || defaultThumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Spin key={item.key} spinning={!item.isLoaded} size="large" />
        <span data-key={item.key}>{item.name}</span>
      </div>
      // </Spin>

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
  updateDrawKey: PropTypes.func.isRequired,
  // updateViewKey: PropTypes.func.isRequired,
  viewKey: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
  viewKey: state.bottom.viewKey,
});
const mapDispatchToProps = (dispatch) => ({
  updateLayerList: layers => dispatch(updateLayerList(layers)),
  updateDrawKey: drawKey => dispatch(updateDrawKey(drawKey)),
  updateViewKey: viewKey => dispatch(updateViewKey(viewKey)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawSwitcher);

export default WrappedContainer;
