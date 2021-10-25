import React from "react";
import PropTypes from "prop-types";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Input from "./NumberInput";
import style from "./frameEditor.less";
import viewImg from "../../img/preview.png";
import deleteImg from "../../img/delete.png";

function FrameItem(props) {
  const [expand, setExpand] = React.useState(false);

  const onChange = (ev, type) => {
    ev.stopPropagation();
    const pos = [...props.coord];
    const val = Number(ev.target.value);
    // eslint-disable-next-line no-self-compare
    if (val !== val) return;
    switch (type) {
      case 'x':
        pos[0] = val;
        break;
      case 'y':
        pos[1] = val;
        break;
      case 'z':
        pos[2] = val;
        break;
      default:
        break;
    }
    props.onEdit(pos);
  };

  return (
    <div className={style.editorItemContainer}>
      <div className={style.editorItem}>
        <div className={style.itemName}>
          <PlayArrowIcon
            classes={{
              root: `${style.arrow} ${expand ? style.collapse : ''}`
            }}
            onClick={() => setExpand(!expand)}
          />
          <div>{props.name}</div>
        </div>
        <div className={style.icon}>
          <img alt="定位" title="定位" src={viewImg} onClick={props.onPreview} />
          <img alt="删除" title="删除" src={deleteImg} onClick={props.onRemove} />
        </div>
      </div>
      <div
        className={style.coordList}
        style={{ display: expand ? 'flex' : 'none' }}
      >
        <div>
          X&nbsp;&nbsp;
          <Input
            type="number"
            value={props.coord[0]}
            inputProps={{
              step: 1
            }}
            onChange={ev => onChange(ev, 'x')}
          />
        </div>
        <div>
          Y&nbsp;&nbsp;
          <Input
            type="number"
            value={props.coord[1]}
            inputProps={{
              step: 1
            }}
            onChange={ev => onChange(ev, 'y')}
          />
        </div>
        <div>
          Z&nbsp;&nbsp;
          <Input
            type="number"
            value={props.coord[2]}
            inputProps={{
              step: 1
            }}
            onChange={ev => onChange(ev, 'z')}
          />
        </div>
      </div>
    </div>
  );
}

FrameItem.propTypes = {
  name: PropTypes.string.isRequired,
  coord: PropTypes.arrayOf(PropTypes.number).isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
};

export default FrameItem;
