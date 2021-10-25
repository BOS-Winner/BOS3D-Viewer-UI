import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";
import CustomContentAlert from "../../Base/CustomContentAlert/CustomContentAlert";

const options = [
  { unit: "mm", title: "毫米", index: 0 },
  { unit: "cm", title: "厘米", index: 1 },
  { unit: "m", title: "米", index: 2 },
];

class AdjustAlert extends React.Component {
  constructor(props) {
    super(props);
    let unit = options[0].unit;
    let value = "";
    if (props.unit && props.value !== undefined) {
      value = String(props.value);
      unit = props.unit;
    }
    this.state = {
      unit,
      value,
    };
    this.inputRef = React.createRef();
    this.selectRef = React.createRef();
    this.inputChange = this.inputChange.bind(this);
  }

  static show(unit, allUnits, value, cancelAction, confirmAction, parent) {
    let ref;
    CustomContentAlert.show(
      <AdjustAlert
        unit={unit}
        allUnits={allUnits}
        value={value}
        ref={input => {
          ref = input;
        }}
      />,
      "测量校准",
      "清除",
      "确定",
      cancelAction,
      () => {
        confirmAction(ref ? ref.confirmed() : undefined);
      },
      parent
    );
  }

  confirmed() {
    let value;
    let unit;
    const input = this.inputRef.current;
    if (input) {
      value = input.value;
    }
    if (value) {
      const select = this.selectRef.current;
      if (select) {
        const index = select.selectedIndex;
        unit = select.options[index].value;
      }

      if (unit) {
        return {
          unit,
          value: parseFloat(value)
        };
      }
    }
    return undefined;
  }

  inputChange(e) {
    const newText = e.target.value.replace(/[^\d.]+/, '');
    this.setState({ value: newText });
  }

  render() {
    return (
      <table className={style.customTable}>
        <tbody>
          <tr>
            <td>
              <div className={style.tdTitle}>定义尺寸</div>
            </td>
            <td>
              <div className={style.tdValue}>
                <input ref={this.inputRef} value={this.state.value} onChange={this.inputChange} type="text" />
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className={style.tdTitle}>单位类型</div>
            </td>
            <td>
              <div className={style.tdValue}>
                <select ref={this.selectRef} defaultValue={this.state.unit}>
                  {
                    this.props.allUnits.map((option) => (
                      <option
                        key={option.unit}
                        value={option.unit}
                      >
                        {option.title}
                      </option>
                    ))
                  }
                </select>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

AdjustAlert.propTypes = {
  unit: PropTypes.string,
  allUnits: PropTypes.array,
  value: PropTypes.number
};

AdjustAlert.defaultProps = {
  unit: undefined,
  allUnits: options,
  value: undefined
};

export default AdjustAlert;
