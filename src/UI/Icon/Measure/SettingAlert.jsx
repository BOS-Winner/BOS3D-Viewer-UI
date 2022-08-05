import React from "react";
import PropTypes from "prop-types";
import { Form, Select, InputNumber } from 'antd';
import style from "./style.less";
import Modal from "../../Base/Modal";
import toastr from "../../toastr";

const { Option } = Select;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 },
};

const options = [
  { unit: "m", title: "米" },
  { unit: "cm", title: "厘米" },
  { unit: "mm", title: "毫米" }
];

const precisionsList = [
  { p: 1, t: "0.1" },
  { p: 2, t: "0.01" },
  { p: 3, t: "0.001" },
  { p: 4, t: "0.0001" },
  { p: 5, t: "0.00001" },
];

const mapTitle = {
  'Adjust': '测量校准',
  'Setting': '测量设置'
};

/**
 * 该alert会在document.body上弹出来
 */
class SettingAlert extends React.Component {
  constructor(props) {
    super(props);
    console.log(props, 'props');
    this.state = {
      unit: props.unit || 'mm',
      precision: props.precision || 3,
      value: props.value
    };
  }

  cancelAdjust() {
    this.props.cancelAdjust();
  }

  onCancel() {
    this.props.close();
  }

  onConfirm() {
    const { unit, precision, value } = this.state;
    if (!value && this.props.type === "Adjust") {
      toastr.error("", "定义尺寸值不能为空！");
      return;
    }
    this.props.onOk({
      unit, precision, value
    });
    this.onCancel();
  }

  onUnitChange = (value) => {
    this.setState({
      unit: value
    });
  }

  onPrecisionChange = (value) => {
    this.setState({
      precision: value
    });
  }

  onValueChange = (value) => {
    this.setState({
      value
    });
  }

  render() {
    const { unit, precision, value } = this.state;
    const { type, isMobile } = this.props;

    return (
      <Modal
        onCancel={() => {
          this.props.close();
        }}
        visible
        title={mapTitle[type]}
        top={isMobile ? '2%' : '160px'}
        height="auto"
        width="350px"
        minWidth={300}
        minHeight={200}
        right="calc(50% - 175px)"
        viewportDiv={this.props.parentNode}
      >
        <div className={style.settingAlertContainer}>
          <section className="boss3d-theme-one-form-form-antd">
            {
              type === 'Adjust' && (
                <Form.Item {...layout} label="定义尺寸">
                  <InputNumber
                    placeholder="请输入尺寸"
                    onChange={this.onValueChange}
                    value={value}
                  />
                </Form.Item>
              )
            }
            <Form {...layout}>
              <Form.Item label={type === 'Setting' ? '测量单位' : '单位类型'}>
                <Select
                  placeholder="请选择测量单位"
                  onChange={this.onUnitChange}
                  value={unit}
                  dropdownClassName="boss3d-theme-one-form-form-antd-dropdown bos3d-select-dropdown-select-single-has-anticon"
                  getPopupContainer={() => this.props.parentNode}
                >
                  {
                    this.props.allUnits.map((option) => (
                      <Option key={option.unit} value={option.unit}>
                        {option.title}
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>
              {
                type === 'Setting' && (
                  <Form.Item label="测量精度">
                    <Select
                      placeholder="请选择测量精度"
                      onChange={this.onPrecisionChange}
                      value={precision}
                      dropdownClassName="boss3d-theme-one-form-form-antd-dropdown bos3d-select-dropdown-select-single-has-anticon"
                      getPopupContainer={() => this.props.parentNode}
                    >
                      {
                        precisionsList.map((item) => (
                          <Option key={item.p} value={item.p}>
                            {item.t}
                          </Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                )
              }
            </Form>
          </section>

          <div className={style.bottomButtons}>
            {
              type === 'Setting' && (
                <div
                  role="presentation"
                  onClick={() => this.onCancel()}
                  className={`bos-btn bos-btn-default ${style.btn}`}
                >
                  取消
                </div>
              )
            }
            {
              type === 'Adjust'
              && (
                <div
                  role="presentation"
                  onClick={() => this.cancelAdjust()}
                  className={`bos-btn bos-btn-danger ${style.btn}`}
                >
                  清除
                </div>
              )
            }
            <div
              role="presentation"
              className={`bos-btn bos-btn-primary ${style.btn}`}
              onClick={() => this.onConfirm()}
            >
              确定
            </div>
          </div>
        </div>

      </Modal>
    );
  }
}

SettingAlert.propTypes = {
  allUnits: PropTypes.array,
  unit: PropTypes.string,
  precision: PropTypes.number,
  parentNode: PropTypes.object,
  isMobile: PropTypes.bool,

};

SettingAlert.defaultProps = {
  allUnits: options,
  unit: undefined,
  precision: undefined,
  parentNode: undefined,
  isMobile: false
};

export default SettingAlert;
