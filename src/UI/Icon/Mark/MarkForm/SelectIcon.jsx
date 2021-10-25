import React, {
  useState, createRef, PureComponent, Component
} from "react";
import { Select, InputNumber } from 'antd';
import _ from "lodash-es";
import style from "./selectIcon.less";
import { AntdIcon } from '../../../utils/utils';
import spriteImg from "../spriteImg";

const { Option } = Select;
const MAX_LENGTH = 10;

const OPTION_LIST = [
  {
    value: 'position',
    label: '位置',
  },
  {
    value: 'qa',
    label: '质量',
  },
  {
    value: 'fault',
    label: '故障',
  },
  {
    value: 'warning',
    label: '警告',
  },
  {
    value: 'security',
    label: '安全',
  },
  {
    value: 'lighting',
    label: '照明',
  },
  {
    value: 'personnel',
    label: '人员',
  },
  {
    value: 'progress',
    label: '进度',
  },
];

class SelectIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpand: false,
      // curSpriteImg: this.props.defaultValue || spriteImg.position
    };
    this.toggleContainer = React.createRef();
    this.onClickOutsideHandler = this.onClickOutsideHandler.bind(this);
    this.changeExpand = this.changeExpand.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.onClickOutsideHandler);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.onClickOutsideHandler);
  }

  onClickOutsideHandler(event) {
    if (this.state.isExpand && !this.toggleContainer.current.contains(event.target)) {
      this.setState({ isExpand: false });
    }
  }

  changeExpand() {
    this.setState(currentState => ({
      isExpand: !currentState.isExpand
    }));
  }

  selectSprite(name, e) {
    if (name) {
      // this.state.curSpriteImg = spriteImg[name]
      this.changeExpand();
      this.props.selectCb && this.props.selectCb(spriteImg[name]);
    }
  }

  render() {
    const { isExpand } = this.state;
    const { value } = this.props;

    return (
      <div className={style.spriteSelect}>
        <div
          role="presentation"
          tabIndex={-1}
          className={style.selectedInput}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.changeExpand();
          }}
        >
          <div className={style.selectImgWrap}>
            {value && <img alt="" className={style.img} src={value} />}
          </div>
          <div className={style.selectedInputDropdown}><AntdIcon type="iconicon_arrowdown" /></div>
        </div>
        <div
          role="menu"
          tabIndex={-1}
          className={style.optionList}
          style={{
            display: isExpand ? 'block' : 'none'
          }}
          ref={this.toggleContainer}
        >
          {OPTION_LIST.map(((item, idx) => (
            <div
              role="presentation"
              onClick={this.selectSprite.bind(this, item.value)}
              title={item.value}
              key={item.value}
              className={`${style.option} ${spriteImg[item.value] === value ? 'option-selected' : ''}  `}
            >
              <div className={style.content}>
                <div>
                  <img alt={item.label} className={style.img} src={spriteImg[item.value]} />
                  <label className={style.label}>
                    类别：
                    {item.label}
                  </label>
                </div>
                {spriteImg[item.value] === value && <AntdIcon type="iconcheck" fill="#1B1B1B" />}
              </div>
            </div>
          )))}

        </div>
      </div>
    );
  }
}

export default SelectIcon;
