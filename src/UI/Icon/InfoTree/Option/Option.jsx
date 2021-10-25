import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from "@material-ui/core";
import Select from "Base/Select";
import _ from "lodash-es";

import {
  Menu, Dropdown, Switch, Tooltip
} from 'antd';
import toastr from "../../../toastr";
import { AntdIcon, getModelKey } from '../../../utils/utils';
import style from "./style.less";

function Option(props) {
  // const { treeData, currentTreType } = props;
  const [selected, setSelected] = React.useState(0);
  const [otherOption, setOtherOption] = React.useState('其他树');
  const [showRoom, setShowRoom] = React.useState(false); // 显示房间
  const {
    translucentMode,
    handleTranslucent
  } = props; // 半透明状态
  const [visible, setVisible] = React.useState(false);
  const defaultLen = props.defaultOpts.length;
  const onChange = ev => {
    const opt = ev.target.getAttribute('data-value');
    if (opt) {
      props.onChange(opt);
      setSelected(defaultLen);
      setOtherOption(opt);
    }
  };

  // 记录当前是否可以导出
  const [isExporting, setIsExporting] = React.useState(false);
  function handleExportState(value) {
    setIsExporting(value);
  }

  // 处理扩展下拉框
  function handleVisible(flag) {
    setVisible(flag);
  }

  // 生成开关Item
  function SwitchItem(itemProps) {
    const {
      label,
      value,
      setValue
    } = itemProps;
    return (
      <div className={style.switchItem}>
        <span>{label}</span>
        <Switch size="small" checked={value} onChange={checked => setValue(checked)} />
      </div>
    );
  }

  // 处理房间显示
  function handleShowRoom(value) {
    // 获取搜索的roomkey
    const { viewer } = props;
    const list1 = viewer.getComponentKeysByType("IfcSpace");
    const list2 = viewer.getComponentKeysByProperty("buildInCategory", "OST_Rooms");
    const list3 = viewer.getComponentKeysByType("房间");
    const roomKeyList = [...list1, ...list2, ...list3];
    // const scope = treeData[currentTreType];
    // const ids = scope.genRenderIdByCptKey(roomKeyList);

    if (roomKeyList.length) {
      if (!value) {
        // 显示房间
        viewer.deactivateComponentsByKey(roomKeyList);
        setShowRoom(value);
        // ids.forEach(_id => {
        //   scope.checkNode(_id, false);
        // });
      } else if (value) {
        // 隐藏房间
        viewer.activateComponentsByKey(roomKeyList);
        setShowRoom(value);
        // ids.forEach(_id => {
        //   scope.checkNode(_id, true);
        // });
      }
      // scope.forceUpdate();
    } else {
      // 提示无法显示房间
      toastr.warning("该模型没有房间！", "", {
        target: `#${viewer.viewport}`
      });
    }
  }

  // 处理导出构件二维码
  function handleExport() {
    if (!props?.treeData[props.currentTreType]) {
      toastr.info(`${props.currentTreType}暂无数据`, "", {
        target: `#${props.viewer.viewport}`
      });
      return;
    }
    const {
      renderData = [],
      props: { type }
    } = props?.treeData[props.currentTreType];
    if (isExporting) {
      // toastr.warning("正在生成二维码，请稍后！", "", {
      //   target: `#${props.viewer.viewport}`,
      //   "timeOut": "180000",
      // });
      return;
    }
    if (type === props.currentTreType) {
      const tempKeys = [];
      for (let i = 0, Len = renderData.length; i < Len; i += 1) {
        const node = renderData[i];
        if (node.checked && (node.cptKey || node.familyKey) && node.children === 0) {
          tempKeys.push(node.cptKey || node.familyKey);
        }
      }
      // 请求前去重
      const keys = Array.from(new Set(tempKeys));
      if (keys.length) {
        toastr.warning("正在生成二维码，请稍后！", "", {
          target: `#${props.viewer.viewport}`,
          "timeOut": "180000",
        });
        const modelKey = renderData[0]?.modelKey;
        const model = props.viewer.getViewerImpl()
          .getModel(modelKey);
        const url = _.get(model, 'loader.url.serverUrl') || props.viewer.host;
        const projectKey = model.projectKey;
        const auth = model.accessToken;
        const share = model.shareKey === "" ? "" : `&share=${model.shareKey}`;
        const modelKeylist = getModelKey(props?.viewer);
        const urlModelKeys = modelKeylist ? modelKeylist.join(',') : [];
        const fileName = `${_.get(model, 'configLoader.config.modelName') + props.currentTreType}构件二维码`;
        handleExportState(true);
        props.BOS3D.ajax({
          type: "POST",
          url: `${url}/api/${projectKey}/components/qrcs?modelKey=${urlModelKeys}${share}`,
          headers: {
            Authorization: auth,
            "Content-type": "application/json;charset=UTF-8"
          },
          data: JSON.stringify({
            treeKey: props.treeData[props.currentTreType].props?.modelInfo[0]?.treeKey, // 系统树或者空间树的key
            components: keys,
            attributes: {
              "构件id": "key",
              "构件名称": "name",
              "构件类型": "type",
            },
            // size: 100
          }),
          responseType: "blob",
          success: (rsp) => {
            const urltemp = window.URL.createObjectURL(rsp);

            const a = document.createElement("a");

            a.setAttribute("href", urltemp);
            a.download = `${fileName}.xls`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            handleExportState(false);
            toastr.remove();
            toastr.success("导出成功！", "", {
              target: `#${props.viewer.viewport}`
            });
          },
          error: (status, message) => {
            console.error(message);
            handleExportState(false);
            setTimeout(() => {
              toastr.remove();
              toastr.error("导出失败，请稍后重试！", "", {
                target: `#${props.viewer.viewport}`
              });
            }, 500);
          }
        });
      } else {
        toastr.remove();
        toastr.info("未选择任何构件，请选择构件后导出二维码！", "", {
          target: `#${props.viewer.viewport}`
        });
      }
    } else {
      toastr.remove();
      toastr.warning("当前模型树节点为空！", "", {
        target: `#${props.viewer.viewport}`
      });
    }
  }
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <div
          className={`${style.switchItem} ${isExporting || props.offline ? style.downloadDisabled : ""}`}
          style={{ "justifyContent": "flex-start" }}
        >
          {!props.offline ? (isExporting ? (
            <Tooltip title="正在生成二维码，请稍候！" placement="topLeft">
              <span role="list" onClick={handleExport}>导出构件二维码</span>
            </Tooltip>
          ) : <span role="list" onClick={handleExport}>导出构件二维码</span>) : (
            <Tooltip title="离线包不支持导出构件二维码！" placement="topLeft">
              <span role="list">导出构件二维码</span>
            </Tooltip>
          )}

          <Tooltip title="批量导出当前模型树上所勾选的构件二维码信息，将会以Excel表格形式下载到本地。">
            <AntdIcon type="icontips" className={style.qrcodeIcon} />
          </Tooltip>
        </div>
      </Menu.Item>
      <Menu.Item key="1">
        <SwitchItem label="显示房间" value={showRoom} setValue={handleShowRoom} />
      </Menu.Item>
      <Menu.Item key="2">
        <SwitchItem label="开启半透明模式" value={translucentMode} setValue={handleTranslucent} />
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={style.option}>
      {props.defaultOpts.map(
        (option, i) => (
          <div key={option} className={style.defaultType}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelected(i);
                setOtherOption("其他树");
                props.onChange(option);
              }}
            >
              {option}
            </div>
            <div className={`${style.borderLine} ${selected === i ? style.selected : ''}`} />
          </div>
        ))}
      {/* <div
        className={style.divider}
        style={{
          display: props.opts.length > 0 ? 'block' : 'none',
        }}
      /> */}
      <div className={style.exContainer} style={{ marginBottom: '7px' }}>
        <Select
          classes={{
            root: `${style.selectContainer} ${selected === defaultLen ? style.selected : style.notSelected}`
          }}
          style={{
            display: props.opts.length > 0 ? 'block' : 'none',
          }}
          value={otherOption}
          onChange={onChange}
          title={otherOption}
        >
          <MenuItem value="其他树" style={{ display: 'none' }}>其他树</MenuItem>
          {/* https://material-ui.com/zh/components/menus/#limitations */}
          {props.opts.map(opt => (
            <MenuItem
              key={opt}
              classes={{
                root: style.menuItem,
              }}
              value={opt}
              title={opt}
            >
              <div className={style.menuItemText} data-value={opt}>
                {opt}
              </div>
            </MenuItem>
          ))}
        </Select>
        <Dropdown
          overlayClassName={style.optionDownload}
          overlay={menu}
          visible={visible}
          onVisibleChange={handleVisible}
          trigger={['click']}
          placement="bottomRight"
        >
          <AntdIcon type="iconicon_more_2" className={style.antIcon} />
        </Dropdown>
      </div>
    </div>
  );
}

Option.propTypes = {
  opts: PropTypes.arrayOf(PropTypes.string),
  defaultOpts: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  translucentMode: PropTypes.bool.isRequired,
  handleTranslucent: PropTypes.func.isRequired,
  treeData: PropTypes.object.isRequired,
  currentTreType: PropTypes.string.isRequired,
  BOS3D: PropTypes.object.isRequired,
  offline: PropTypes.bool.isRequired,
};

Option.defaultProps = {
  opts: [],
};

export default Option;
