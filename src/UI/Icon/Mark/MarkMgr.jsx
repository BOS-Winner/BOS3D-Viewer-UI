import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import style from "./MarkMgr.less";
import { AntdIcon } from '../../utils/utils';
import MarkForm from './MarkForm/index.jsx';

class MarkMgr extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    DOMMark: PropTypes.object.isRequired,
    SpriteMark: PropTypes.object.isRequired,
    eventEmitter: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {

    };
    this.formRef = React.createRef();
  }

  changeCurMarkType(markType) {
    this.props.changeCurMarkType && this.props.changeCurMarkType(markType);
  }

  render() {
    const { curMarkType } = this.props;
    const mapTabClass = (tabkey) => {
      const keys = [style.tab];
      if (tabkey === curMarkType) {
        keys.push(style.active);
      }
      return keys.join(' ');
    };

    const formDom = (
      <MarkForm
        ref={this.formRef}
        curMarkType={curMarkType}
        domColor={this.props.domColor}
        domOpacity={this.props.domOpacity}
        isEdit={this.props.isEdit}
        setColor={this.props.setColor}
        viewer={this.props.viewer}
        startAddingMark={this.props.startAddingMark}
        confirmUpdateBaseInfo={this.props.confirmUpdateBaseInfo}
        exitEdit={this.props.exitEdit}
      />
    );

    return (
      <div className={style.mark} id="customMark">
        <section className={style.tabs}>
          <div
            role="presentation"
            className={mapTabClass('dom')}
            key="dom"
            onClick={this.changeCurMarkType.bind(this, 'dom')}
          >
            <AntdIcon type="icontextlabel" />
            {' '}
            文字标签
          </div>
          <div
            role="presentation"
            className={mapTabClass('sprite')}
            key="sprite"
            onClick={this.changeCurMarkType.bind(this, 'sprite')}
          >
            <AntdIcon type="icongenielabel" />
            {' '}
            精灵标签
          </div>
        </section>
        {curMarkType === 'dom' && formDom}
        {curMarkType === 'sprite' && formDom}
      </div>

    );
  }
}

export default MarkMgr;
