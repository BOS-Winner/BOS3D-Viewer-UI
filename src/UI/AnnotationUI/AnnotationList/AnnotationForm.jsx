import React, { useState, useEffect, useRef } from "react";
import { Form, Input } from 'antd';
import style from "./AnnotationForm.less";
import { AntdIcon } from '../../utils/utils';
import Modal from "../../Base/Modal";

function AnnotationForm(props) {
  const [value, changeValue] = useState(props.initValue);
  const inputRef = useRef();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  if (props.isMobile) {
    return (
      <div>
        {value}
        <MobileInputModal
          parentNode={document.body}
          cancelEdit={props.cancelEdit}
          type={props.type}
          initValue={props.initValue}
          onSubmit={(value) => {
            props.onSubmit && props.onSubmit(value);
          }}
        />
      </div>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    props.onSubmit && props.onSubmit(value, e);
  };

  const cancelEdit = (e) => {
    props.cancelEdit && props.cancelEdit(e);
  };

  return (
    <form className={style.editor} onSubmit={onSubmit}>
      <input
        type="text"
        value={value}
        placeholder="请输入批注名称"
        ref={inputRef}
        onChange={(e) => {
          changeValue(e.target.value);
        }}
      />
      <AntdIcon onClick={onSubmit} style={{ marginLeft: 15 }} type="icondetermine" />
      <AntdIcon onClick={e => { cancelEdit(e) }} style={{ marginLeft: 9 }} type="iconcancel" />
    </form>
  );
}

// 当移动端，输入框使用这个组件弹窗输入
const MobileInputModal = (props) => {
  const [value, changeValue] = useState(props.initValue);
  const mapTitle = {
    'description': '添加注释',
    'name': '修改名称'
  };
  const mapLabel = {
    'description': '注释',
    'name': '修改名称'
  };
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  return (
    <Modal
      onCancel={() => {
        props.cancelEdit();
      }}
      mask
      visible
      title={mapTitle[props.type]}
      top="10%"
      height="auto"
      width="60%"
      minWidth={100}
      minHeight={200}
      right="20%"
      viewportDiv={props.parentNode}
    >
      <div className={`${style.mobileInputContainer}`}>
        <section className="boss3d-theme-one-form-form-antd">
          <Form {...layout}>
            <Form.Item {...layout} label={mapLabel[props.type]}>
              <Input
                placeholder="请输入"
                onChange={(e) => {
                  changeValue(e.target.value);
                }}
                value={value}
              />
            </Form.Item>
          </Form>
        </section>

        <div className={style.bottomButtons}>
          <div
            onClick={(e) => {
              props.cancelEdit(e);
            }}
            className={`bos-btn bos-btn-default ${style.btn}`}
          >
            取消
          </div>

          <div
            role="presentation"
            className={`bos-btn bos-btn-primary ${style.btn}`}
            onClick={(e) => {
              props.onSubmit(value, e);
            }}
          >
            确定
          </div>
        </div>
      </div>

    </Modal>
  );
};

export default AnnotationForm;
