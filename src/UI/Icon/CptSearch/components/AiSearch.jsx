import React, { useState, useEffect } from 'react';
import {
  Row, Col, Input, Button, Table, Divider
} from 'antd';
import PropTypes from 'prop-types';
import toastr from "customToastr";
import style from './AiSearch.less';
import { AntdIcon, getModelKey } from '../../../utils/utils';
import { getComponentsList } from '../api';
import { ON_SEARCH_CPT } from "../../eventType";
// import { notFount } from '../../img/gray/notFount.png';
// 表格字段
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: {
      showTitle: true,
    },
    className: style.cell,
  },
  {
    title: '类型',
    dataIndex: 'type',
    ellipsis: {
      showTitle: true,
    },
    className: style.cell,
    align: 'center',
  },
  {
    title: '构件Key',
    dataIndex: 'key',
    className: style.cell,
    ellipsis: {
      showTitle: true,
    },
  },
];

export default function AiSearch(props) {
  const {
    viewer, ee, handleModalHeight, tabKeys
  } = props;

  // 智能搜索框输入
  const [value, setValue] = useState("");
  function handleAIcontent(e) {
    const { value: content } = e.target;
    setValue(content);
  }

  // 表格数据
  const [tableData, setTableData] = useState([]);
  function handleTableData(data = []) {
    setTableData(data);
  }

  //   not fund
  // const [searchState, setSearchState] = useState(false);
  // function handleSearchState(status) {
  //   setSearchState(status);
  // }

  // 分页
  const [pagination, setPaination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  function handlePagination(pageInfo) {
    setPaination({
      ...pagination,
      ...pageInfo,
    });
  }

  // 是否正在加载中
  const [loding, setLoding] = useState(false);
  const isLoding = () => setLoding(true);
  const loaded = () => setLoding(false);

  // 存储表格选中项
  const [selectedRows, setSelectedRows] = useState({
    selectedRowKeys: [],
    selectedRowItems: []
  });
  function handleTabSelect(selected) {
    const { selectedRowKeys, selectedRowItems } = selected;
    setSelectedRows({
      selectedRowKeys,
      selectedRowItems,
    });
  }

  //   重置函数
  //   function reset() {
  //     // 重置输入框内容
  //     setValue("");
  //     // // 重置表格选中内容
  //     // setSelectedRows({
  //     //   selectedRowKeys: [],
  //     //   selectedRowItems: []
  //     // });
  //   }

  /**
   * 选择表中构件的回调函数
   * 处理构件在模型中的高亮效果
   */
  function onSelectComponent(keys, rows) {
    // 当前模型高亮的构件key
    const tempHighCptKey = viewer.getHighlightComponentsKey() || [];

    // 获取当前选择的构件key
    const currentSelectCptKey = selectedRows.selectedRowKeys;

    // 传进来的构件key数组长度不为0，需要考虑是增加了还是减少了
    if (keys.length) {
      // 减少了
      if (keys.length < currentSelectCptKey.length) {
        // 取消勾选的构件key
        const cancelSelectedCptKeys = currentSelectCptKey.filter(
          item => !keys.includes(item));
        const remainingHighLightCptKeys = tempHighCptKey.filter(
          _key => !cancelSelectedCptKeys.includes(_key));

        // 取消不勾选的构件的高亮
        viewer.closeHighlightComponentsByKey(cancelSelectedCptKeys);
        // 同步模型树中的节点高亮
        ee.emit(ON_SEARCH_CPT, remainingHighLightCptKeys);
      } else {
        // 增加了高亮的构件
        tempHighCptKey.push(...keys);
        // 去重
        const tempKeys = Array.from(new Set(tempHighCptKey));

        // 高亮模型中构件
        viewer.highlightComponentsByKey(tempKeys);

        // 同步模型树
        ee.emit(ON_SEARCH_CPT, tempKeys);
      }
    } else {
      // 获取取消选择的构件key后剩下下的构件key
      const tempCptKey = tempHighCptKey.filter(item => !currentSelectCptKey.includes(item));

      // 取消高亮的构件
      viewer.closeHighlightComponentsByKey(currentSelectCptKey);

      // 同步树中高亮的构件
      ee.emit(ON_SEARCH_CPT, tempCptKey);
    }
    handleTabSelect({
      selectedRowKeys: keys,
      selectedRowItems: rows
    });
  }

  // 搜索结果的状态
  // const [searchList, setSearchList] = useState([]);

  // 查询函数
  async function getComponentList(current = 1, keyword, pageSize = 10, isSearchBtn = false) {
    // 判断搜索关键字是否合法
    if (!keyword.trim()) {
      toastr.warning("搜索条件不能为空哦！", "", {
        target: `#${viewer.viewport}`,
      });
      return;
    }

    if (isSearchBtn) {
      // 消息提示
      isLoding();
      toastr.info("搜索中，请稍后...", "", {
        target: `#${viewer.viewport}`,
        "timeOut": "180000",
        "progressBar": false,
      });
      onSelectComponent([], []);
    }

    // 如不是第一次请求且数据表中的数据不为空则不发送请求。
    if (tableData.length && tableData[(current - 1) * pageSize] !== null && !isSearchBtn) {
      loaded();
      toastr.clear();
      handlePagination({
        current,
        pageSize
      });
      return;
    }

    const tempCurrent = Math.floor((current - 1) * pageSize / 500);

    // 获取modelKey
    const modelKey = getModelKey(viewer);
    const { data: result } = await getComponentsList(
      viewer,
      modelKey,
      tempCurrent,
      500,
      keyword
    );
    // 返回成功
    if (result.code === "SUCCESS" && typeof result.data !== 'string') {
      setTimeout(() => toastr.clear(), 800);
      const {
        content, totalElements
      } = result.data;

      // 数据正确
      if (Array.isArray(content)) {
        if (!tableData.length) {
          // 生成空数组
          const tempArray = new Array(totalElements);
          tempArray.fill(null);
          // 给空数组赋值
          for (let i = 0; i < 500; i++) {
            tempArray[i] = content[i];
            if (i + 1 === totalElements) break;
          }
          handleTableData(tempArray);
        } else {
          const tempArray = [].concat(tableData);
          for (let i = 0; i < 500; i++) {
            tempArray[tempCurrent * 500 + i] = content[i];
            if (tempCurrent * 500 + i + 1 === totalElements) {
              tempArray.length = totalElements;
              break;
            }
          }
          handleTableData(tempArray);
        }
        if (isSearchBtn);
        // 处理分页
        handlePagination({
          current,
          pageSize,
          total: totalElements
        });
      } else {
        setTimeout(() => {
          // 没有数据
          if (!content) {
            toastr.error("找不到相应构件哦！", "", {
              target: `#${viewer.viewport}`,
              "progressBar": false,
            });
            // 更改表格内容
            handleTableData([]);
          } else {
            toastr.error("搜索失败，请稍后重新尝试!", "", {
              target: `#${viewer.viewport}`,
              "progressBar": false,
            });
          }
        }, 1200);
      }
    } else {
      toastr.clear();
      const returnStr = result.data || '';
      const SEARCH_INGS = ['尚未创建', "创建中", "正在创建"];
      const SEARCH_FAILS = ['创建失败'];
      const SEARCH_EXCEPTIONS = ['异常'];
      SEARCH_INGS.some(text => {
        if (returnStr.includes(text)) {
          setTimeout(() => {
            toastr.info("搜索中，请稍后...", "", {
              target: `#${viewer.viewport}`
            });
          }, 1200);
          return true;
        }
        return false;
      });
      SEARCH_FAILS.some(text => {
        if (returnStr.includes(text)) {
          setTimeout(() => {
            toastr.info("搜索失败，请稍后重新尝试！", "", {
              target: `#${viewer.viewport}`
            });
          }, 1200);
          return true;
        }
        return false;
      });
      SEARCH_EXCEPTIONS.some(text => {
        if (returnStr.includes(text)) {
          setTimeout(() => {
            toastr.info("搜索失败，服务出现异常！", "", {
              target: `#${viewer.viewport}`
            });
          }, 1200);
          return true;
        }
        return false;
      });
      // switch (result.data) {
      //   case "模型索引尚未创建，请稍后再试":
      //   case "模型索引创建中，请稍后再试":
      //   case "后台索引正在创建/创建中，请稍后再试":
      //     setTimeout(() => {
      //       toastr.info("搜索中，请稍后...", "", {
      //         target: `#${viewer.viewport}`
      //       });
      //     }, 1200);
      //     break;
      //   case "模型索引上次创建失败，正在重新提取":
      //     setTimeout(() => {
      //       toastr.info("搜索失败，请稍后重新尝试", "", {
      //         target: `#${viewer.viewport}`
      //       });
      //     }, 1200);
      //     break;
      //   default:
      //     setTimeout(() => {
      //       toastr.info("搜索失败，请稍后重新尝试!", "", {
      //         target: `#${viewer.viewport}`
      //       });
      //     }, 1200);
      //     break;
      // }
    }
    // 停止加载状态
    loaded();
  }

  // 表格选中配置
  const rowSelection = {
    selectedRowKeys: selectedRows.selectedRowKeys,
    onChange: (selectedKeys, tempRows) => {
      const currentItem = tempRows[tempRows.length - 1];
      if (currentItem?.primitives === 0) {
        toastr.info("所选构件为无几何结构，无法进行定位！", "", {
          target: `#${viewer.viewport}`
        });
      }
      onSelectComponent(selectedKeys, tempRows);
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === 'Disabled',
    //   name: record.name,
    // }),
    preserveSelectedRowKeys: true,
  };

  /**
   * 定位构件
   */
  function onAdaptive() {
    const { selectedRowKeys, selectedRowItems } = selectedRows;
    if (
      selectedRowItems.length > 0
      && selectedRowItems.every(item => item.primitives === 0)
    ) {
      toastr.info("所选构件为无几何结构，无法进行定位！", "", {
        target: `#${viewer.viewport}`
      });
    }
    if (selectedRowKeys.length > 0) {
      viewer.highlightComponentsByKey(selectedRowKeys);
      viewer.adaptiveSizeByKey(selectedRowKeys);
    } else {
      toastr.error("请选择构件哦！", '', {
        target: `#${viewer.viewport}`
      });
    }
  }

  //   设置modal的高度
  useEffect(() => {
    if (tabKeys === '1') {
      if (tableData.length) {
        const defH = 180;
        const tableHeaderH = 80;
        const tableFooterH = 80;
        const incrementH = Math.min(tableData.length * 39, 350);
        const maxScreenHeight = props.viewer.viewportDiv.clientHeight * 0.90 || 700;
        let h = 180;
        h = defH + tableHeaderH + tableFooterH + incrementH;
        h = Math.min(h, maxScreenHeight);

        // let h = tableData.length / 10 > 1 ? 700 : tableData.length * 70;
        // if (tableData.length <= 3) {
        //   h = 330 + h;
        // }
        handleModalHeight(h);
      } else {
        handleModalHeight(180);
      }
    }
  }, [handleModalHeight, tableData, tabKeys]);

  // // 加载 and 卸载
  useEffect(() => () => {
    // 重置选中构件
    onSelectComponent([], []);
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return (
    <div className={`${style.container}  boss3d-theme-one-form-form-antd`}>
      <div className={style.searchOption}>
        <Row gutter={12}>
          <Col span={20}>
            <Input className={style.input} allowClear placeholder="请输入需要搜索模型中的空间、系统相关信息或构件相关属性" value={value} onChange={handleAIcontent} />
          </Col>
          <Col span={4}>
            <Button
              className={style.search}
              type="primary"
              block
              onClick={() => {
                getComponentList(1, value, pagination.pageSize, true);
              }}
            >
              搜索
            </Button>
          </Col>
        </Row>
      </div>
      {tableData.length ? (
        <div className={style.result}>
          <Divider style={{ background: 'rgba(86, 90, 91, 1)', margin: '24px 0 10px' }} />
          <span>
            共找到相关结果
            <span className={style.totalNumber}>{pagination.total}</span>
            个
          </span>
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            columns={columns}
            dataSource={tableData}
            size="small"
            pagination={{
              ...pagination,
              onChange: (current, pageSize) => getComponentList(current, value, pageSize),
              showSizeChanger: true,
              showTotal: () => `每页显示:`,
              showLessItems: true,
            }}
            scroll={{ y: "350px" }}
            loading={loding}
            className={style.customTable}
          />
          <Button className={style.location} onClick={onAdaptive} type="primary" icon={<AntdIcon type="iconposition" />}>定位</Button>
        </div>
      ) : null}
      {/* {searchState ? (
        <div className={style.notFound}>
          <img src={notFount} alt="找不到相应构件哦！" />
          <span>找不到相应构件哦！</span>
        </div>
      ) : null} */}
    </div>
  );
}

AiSearch.defaultProps = {
};

AiSearch.propTypes = {
  viewer: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
  handleModalHeight: PropTypes.func.isRequired,
  tabKeys: PropTypes.string.isRequired,
};
