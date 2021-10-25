import React, { useState, useEffect } from 'react';
import {
  Select, Cascader, Radio, Input, Button
} from 'antd';
import style from './MoreOptionBox.less';
import { AntdIcon, getModelKey } from '../../../utils/utils';
import { getSubAttributesNames } from '../api';

const { Option } = Select;
// 初始条件
const initCondition = {
  key: 0,
  relation: 1,
  attribute: [],
  option: "==",
  content: ""
};

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

const tableAttributeObj = {
  "floor": "楼层",
  "system": "系统",
  "room": "房间",
  "attribute": "自定义"
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
        isLeaf: true,
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
  const displayRender = () => {
    const tempAttr = [].concat(attributes);
    if (tempAttr[0]) {
      tempAttr[0] = tableAttributeObj[attributes[0]];
    }
    return <span title={tempAttr.join(" / ")}>{tempAttr.join(" / ")}</span>;
  };
  return (
    <div className={`${style.itemContainer} boss3d-theme-one-form-form-antd`}>
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
        className="boss3d-theme-one-form-form-antd"
        popupClassName="boss3d-theme-one-form-form-antd-dropdown bos3d-select-dropdown bos3d-cascader-dropdown-single-has-check-anticon"
      // value={attributes}
      />
      <Select defaultValue={option} style={{ width: "80px", marginRight: '10px' }} onChange={hanldeOption} dropdownClassName="boss3d-theme-one-form-form-antd-dropdown">
        {optionList.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
      </Select>
      <Input style={{ width: "120px", marginRight: '10px' }} value={content} onChange={handleContent} />
      {
        showOperators ? (
          <div className={style.operators}>
            <Button style={{ marginRight: '10px' }} size="small" type="primary" onClick={() => add(currentCondition.key)} shape="circle" icon={<AntdIcon type="iconplus" />} />
            {showRomve ? <Button size="small" type="primary" onClick={() => remove(currentCondition.key)} shape="circle" icon={<AntdIcon type="iconminussign" />} /> : null}
          </div>
        ) : null
      }
      <div />
    </div>
  );
}

export default function MoreOptionBox(moreProps) {
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
