import React, { useEffect, useState } from 'react';
import {
  Tabs, Input, Button, Row, Col, Radio, Popover, Cascader, Select
} from 'antd';
import toastr from "customToastr";
import PropTypes from 'prop-types';
import style from './OnlineSearchBox.less';
import { AntdIcon, getModelKey } from '../../../utils/utils';
import { getSubAttributesNames } from '../api';

const { TabPane } = Tabs;
const { Option } = Select;
const optionList = [{
  value: '==',
  label: <span>&equiv;</span>
},
{
  value: '!=',
  label: <span>&ne;</span>
},
{
  value: '>',
  label: <span>&gt;</span>
},
{
  value: '<',
  label: <span>&lt;</span>
},
{
  value: '>=',
  label: <span>&ge;</span>
},
{
  value: '<=',
  label: <span>&le;</span>
},
{
  value: 'like',
  label: '包含'
}];

// 初始条件
const initCondition = {
  key: 0,
  relation: 1,
  attribute: [],
  option: "==",
  content: ""
};

// 获取层级
async function getCondition(viewer3D, attribute, callback, errCallback) {
  // 获取场景中modelKey
  const modelKeys = getModelKey(viewer3D);
  const param = {
    viewer3D,
    modelKeys,
    models: modelKeys,
    attribute,
  };
  const result = await getSubAttributesNames(viewer3D, param);
  if (result.statusText === "OK") {
    const attributes = result?.data.data;
    if (callback && typeof callback === 'function') {
      callback(attributes);
    }
  } else {
    console.debug('请求基础属性列表失败');
    if (errCallback && typeof errCallback === 'function') {
      errCallback();
    }
  }
}

function InputItem(inputProps) {
  const {
    // eslint-disable-next-line react/prop-types
    label, placeholder, inputValue, handleVaule, relation, show = true, handleRadio
  } = inputProps;

  function handleInputItem(e) {
    const { value: content } = e.target;
    handleVaule(content);
  }

  function customhandleRadio(e) {
    const { value: content } = e.target;
    handleRadio(content);
  }

  return (
    <div className={style.inputItem}>
      <div className={style.label}>{label}</div>
      <div className={style.input}>
        <Input placeholder={placeholder} value={inputValue} onChange={handleInputItem} />
      </div>
      {show ? (
        <div className={style.relation}>
          <Radio.Group onChange={customhandleRadio} value={relation}>
            <Radio value={1}>且</Radio>
            <Radio value={2}>或</Radio>
          </Radio.Group>
        </div>
      ) : null}
    </div>
  );
}

function MoreOptionItem(optionProps) {
  const {
    viewer3D,
    condition,
    handleCondition,
    showRelation,
    showRomve,
    currentCondition,
    handleAllCondition,
    showOperators = true,
    add,
    remove
  } = optionProps;

  const [attributes, setAttributes] = useState([]);
  // 处理级联选择
  function handleAttrChange(value) {
    setAttributes(value);
  }

  // 获取下级属性后的回调
  function callback(e, target) {
    if (e.length) {
      const temp = e.map(item => ({
        value: item,
        label: item,
        children: null,
        isLeaf: false,
      }));
      target.children = temp;
      target.loading = false;
    } else {
      target.children = null;
      target.loading = false;
      target.isLeaf = true;
    }
    handleCondition();
  }

  // 处理动态加载级联属性数据
  const loadData = async selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const tempAttr = selectedOptions.map(item => item.value) || [];
    if (tempAttr.length) {
      // 处理属性
      getCondition(viewer3D, tempAttr.join('.'), (value) => callback(value, targetOption));
    }
  };

  // 处理关系
  const [relation, setRelation] = useState(showRelation ? 1 : 0); // 1: 且， 2: 或
  function handleRelation(e) {
    const { value } = e.target;
    if (value !== 1 && value !== 2) {
      console.debug('关系输入错误');
      return;
    }
    setRelation(value);
  }

  // 处理逻辑符号
  const [option, setOption] = useState(optionList[0].value);
  function hanldeOption(value) {
    setOption(value);
  }

  // 处理用户输入内容
  const [content, setContent] = useState('');
  function handleContent(e) {
    const { value } = e.target;
    setContent(value);
  }

  // 处理数据
  function handleData(relations, attribute, options, contents) {
    currentCondition.relation = relations;
    currentCondition.attribute = attribute;
    currentCondition.option = options;
    currentCondition.content = contents;
    handleAllCondition();
  }

  // 数据改变则处理数据
  useEffect(() => {
    handleData(relation, attributes, option, content);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relation, attributes, option, content]);

  // 自定义级联菜单的显示
  const displayRender = (labels) => <span title={labels.join(" / ")}>{labels.join(" / ")}</span>;
  return (
    <div className={style.itemContainer}>
      {
        showRelation ? (
          <div className={style.relation}>
            <Radio.Group onChange={handleRelation} value={relation}>
              <Radio value={1}>且</Radio>
              <Radio value={2}>或</Radio>
            </Radio.Group>
          </div>
        ) : <div className={style.relation} />
      }

      <Cascader
        options={condition}
        onChange={handleAttrChange}
        loadData={loadData}
        changeOnSelect
        displayRender={displayRender}
        style={{ marginRight: '10px', width: '150px' }}
      />
      <Select defaultValue={option} style={{ width: "80px", marginRight: '10px' }} onChange={hanldeOption}>
        {optionList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
      </Select>
      <Input style={{ width: "120px", marginRight: '10px' }} value={content} onChange={handleContent} />
      {showOperators ? (
        <div className={style.operators}>
          <Button style={{ marginRight: '10px' }} size="small" type="primary" onClick={() => add(currentCondition.key)} shape="circle" icon={<AntdIcon type="iconplus" />} />
          {showRomve ? <Button size="small" type="primary" onClick={() => remove(currentCondition.key)} shape="circle" icon={<AntdIcon type="iconminussign" />} /> : null}
        </div>
      ) : null}
      <div />
    </div>
  );
}

function MoreOptionBox(moreProps) {
  const {
    initAttr, viewer3D, allCondition, setAllCondition
  } = moreProps;
  const [condition, setCondition] = useState("");
  const [conditionKey, setConditionKey] = useState(0);

  // 添加条件
  function addCondition(key) {
    const tempKey = conditionKey + 1;
    let index = -1;
    allCondition.forEach((item, idx) => {
      if (item.key === key) {
        index = idx;
      }
    });
    if (index !== -1) {
      allCondition.splice(index + 1, 0, {
        ...initCondition,
        key: tempKey,
        relation: 1,
      });
      setAllCondition([...allCondition]);
      setConditionKey(tempKey);
    } else {
      console.error("输入key值错误：", key);
    }
  }

  // 删除条件
  function removeCondition(key) {
    // 如果是最后一个则不允许删除
    if (allCondition.length === 1) {
      return;
    }
    const temp = allCondition.filter(item => item.key !== key);
    setAllCondition(temp);
  }

  // 构造一级级联属性
  function handleInitAttr(Attr) {
    if (!Attr.length) {
      console.debug('处理一级级联属性错误');
    }
    const attributes = Attr.map((item) => ({
      value: item,
      label: item,
      children: null,
      isLeaf: false,
    }));
    const tempAttr = [
      {
        value: 'floor',
        label: '楼层',
        isLeaf: true,
      },
      {
        value: 'system',
        label: '系统',
        isLeaf: true,
      },
      {
        value: 'room',
        label: '房间',
        isLeaf: true,
      },
      {
        value: 'attribute',
        label: '自定义',
        isLeaf: false,
        children: attributes
      }
    ];
    setCondition(tempAttr);
  }

  useEffect(() => {
    handleInitAttr(initAttr);
  }, [initAttr]);

  return (
    <div className={style.optionContainer}>
      {allCondition.map((item, index) => (
        <MoreOptionItem
          key={item.key}
          viewer3D={viewer3D}
          condition={condition}
          currentCondition={item}
          handleCondition={() => setCondition([...condition])}
          handleAllCondition={() => setAllCondition(allCondition)}
          add={addCondition}
          remove={removeCondition}
          showRelation
          showRomve={index !== 0}
        />
      ))}
    </div>
  );
}

export default function OnlineSearchBox(props) {
  const {
    value,
    handleVaule: setValue,
    search,
    handleSearchType,
    viewer3D,
    handleGeneralCondition,
    generalSearch,
    offline
  } = props;

  function handleAIcontent(e) {
    const { value: content } = e.target;
    setValue(content);
  }

  // 整理标签页
  const [tabKey, setTabKey] = useState(offline ? "2" : "1");

  function callback(key) {
    // 兼容离线包模式，离线包模式下不支持智能搜索
    if (offline) {
      toastr.warning("离线包暂不支持智能搜索！", "", {
        target: `#${viewer3D.viewport}`
      });
      return;
    }
    handleSearchType(key);
    setTabKey(key);
  }

  // 常规搜索
  const [cptName, setCptName] = useState('');
  const [cptType, setCptType] = useState('');
  const [cptTypeRelation, setCptTypeRelation] = useState(1);
  const [cptKey, setCptKey] = useState('');
  const [cptKeyRelation, setCptKeyRelation] = useState(1);
  const [moreOption, setMoreOption] = useState(false);
  const [options, setOptions] = useState([]);

  // 所有的条件
  const [allCondition, setAllCondition] = useState([initCondition]);

  // 搜索前数据整理
  function handleCustomSearch() {
    const tempCondition = {}; // 临时存储查询条件

    // 生成属性条件函数
    function genConditionItem(field, operator, content, logic) {
      return {
        "logic": logic === 2 ? "or" : "and",
        "field": field,
        "operator": operator,
        "value": content
      };
    }

    // 组装条件函数
    function assembleItem(field, operator, content, logic) {
      tempCondition[field] = {
        "operator": operator,
        "value": content,
        "logic": logic === 2 ? "or" : "and"
      };
    }

    // 处理构件名称
    if (cptName) {
      assembleItem('name', 'like', cptName, 1);
    }

    // 处理构件类型
    if (cptType) {
      assembleItem('type', 'like', cptType, cptTypeRelation);
    }

    // 处理构件key
    if (cptKey) {
      assembleItem('key', 'like', cptKey, cptKeyRelation);
    }

    // 更多条件
    allCondition.forEach(item => {
      // 如果输入条件存在
      if (item.attribute?.length > 1 && item.content) {
        if (Array.isArray(tempCondition['attribute'])) {
          tempCondition['attribute'].push(genConditionItem(item.attribute.join("."), item.option, item.content, item.relation));
        } else {
          tempCondition['attribute'] = [genConditionItem(item.attribute.join("."), item.option, item.content, item.relation)];
        }
      } else if (item.attribute?.length === 1 && item.content) {
        assembleItem(item.attribute[0], item.option, item.content, item.relation);
      }
    });

    // 保存组装好的条件到父组件
    handleGeneralCondition(tempCondition);

    if (Object.keys(tempCondition).length > 0) {
      generalSearch(tempCondition, 0, 100);
    } else {
      toastr.warning("搜索条件不能为空哦！", '', {
        target: `#${viewer3D.viewport}`
      });
    }
  }

  function handleShowMoreOption() {
    // 获取更多的条件
    if (!moreOption) {
      getCondition(viewer3D, 'attribute', (attributes) => {
        setOptions(attributes);
      });
    }
    // 处理显示隐藏
    setMoreOption(!moreOption);
  }

  // 重置
  function reset() {
    // 重置更多条件
    setAllCondition([{ key: Date.parse(new Date()) }]);
    // 重置智能搜索部分
    setValue("");
    // 处理常规搜索框的输入
    setCptName("");
    setCptTypeRelation(1);
    setCptType("");
    setCptKey("");
    setCptKeyRelation(1);
    setOptions([]);
  }

  // 卸载后执行重置操作
  useEffect(() => () => {
    reset();
  }, []);

  return (
    <div className={style.container}>
      <Tabs defaultActiveKey={offline ? "2" : "1"} activeKey={tabKey} onChange={callback} className={style.customTabs}>
        <TabPane tab="智能搜索" key="1">
          <Row gutter={12}>
            <Col span={20}>
              <Input className={style.input} allowClear placeholder="请输入需要搜索模型中的空间、系统相关信息或构件相关属性" value={value} onChange={handleAIcontent} />
            </Col>
            <Col span={4}>
              <Button className={style.search} type="primary" block onClick={() => search(value)}>搜索</Button>
            </Col>
          </Row>

        </TabPane>
        <TabPane tab="常规搜索" key="2">
          <div className={style.general}>
            <InputItem
              label="构件名称"
              placeholder="请输入构件名称"
              inputValue={cptName}
              handleVaule={(content) => setCptName(content)}
              show={false}
            />
            <InputItem
              label="类型"
              placeholder="请输入构件类型"
              inputValue={cptType}
              handleVaule={(content) => setCptType(content)}
              relation={cptTypeRelation}
              handleRadio={(relation) => setCptTypeRelation(relation)}
            />
            <InputItem
              label="构件Key"
              placeholder="请输入构件Key"
              inputValue={cptKey}
              handleVaule={(content) => setCptKey(content)}
              relation={cptKeyRelation}
              handleRadio={(relation) => setCptKeyRelation(relation)}
            />
            <div className={style.optionContainer}>
              <div className={style.moreOption}>
                <Popover
                  content={(
                    <MoreOptionBox
                      viewer3D={viewer3D}
                      initAttr={options}
                      allCondition={allCondition}
                      setAllCondition={data => setAllCondition(data)}
                    />
                  )}
                  trigger="click"
                  visible={moreOption}
                  placement="bottomLeft"
                  onVisibleChange={handleShowMoreOption}
                  overlayClassName={style.customPopover}
                  getPopupContainer={() => viewer3D.viewportDiv}
                >
                  <Button type="link" icon={<AntdIcon type="iconicon_shaixuan-01" />}>更多条件筛选</Button>
                </Popover>
              </div>
              <Button type="link" onClick={reset}>重置</Button>
              <div className={style.search}>
                <Button type="primary" onClick={handleCustomSearch}>搜索</Button>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}

OnlineSearchBox.propTypes = {
  value: PropTypes.string.isRequired,
  handleVaule: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired,
  handleSearchType: PropTypes.func.isRequired,
  viewer3D: PropTypes.object.isRequired,
  handleGeneralCondition: PropTypes.func.isRequired,
  generalSearch: PropTypes.func.isRequired,
  offline: PropTypes.bool.isRequired
};
