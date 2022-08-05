import React from 'react';
import PropTypes from 'prop-types';
import style from "./style.less";
import ToolbarItem from "../ToolbarItem/ToolbarItem";
import { ButtonAction, BUTTON_ICONS } from '../resource';

class ImageMover extends React.Component {
  static propTypes = {
    buttonAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    moveSelected: false,
    moveDisable: true,
    zoomOutDisable: true,
    zoomInDisable: false
  };

  buttonAction = (tag) => {
    this.props.buttonAction(tag);
  }

  isActionDisable(action) {
    return this.props.disableActions.indexOf(action) !== -1;
  }

  render() {
    return (
      <div
        role="presentation"
        className={style.container}
      >
        <div className={`${style.group}`}>
          <ToolbarItem
            title="撤销"
            tag={ButtonAction.Undo}
            disabled={this.isActionDisable(ButtonAction.Undo)}
            icon={BUTTON_ICONS.undoIcon}
            onClick={this.buttonAction}
          />
          <ToolbarItem
            title="重做"
            tag={ButtonAction.Redo}
            disabled={this.isActionDisable(ButtonAction.Redo)}
            icon={BUTTON_ICONS.redoIcon}
            onClick={this.buttonAction}
          />
          <ToolbarItem
            title="删除"
            tag={ButtonAction.Delete}
            disabled={this.isActionDisable(ButtonAction.Delete)}
            icon={BUTTON_ICONS.deleteIcon}
            onClick={this.buttonAction}
          />
        </div>

        <div className={style.group}>
          <ToolbarItem
            title="移动"
            tag={ButtonAction.Drag}
            selected={this.props.moveSelected}
            disabled={this.isActionDisable(ButtonAction.Drag)}
            icon={BUTTON_ICONS.dragIcon}
            onClick={this.buttonAction}
          />
          <ToolbarItem
            title="放大"
            tag={ButtonAction.ZoomIn}
            disabled={this.isActionDisable(ButtonAction.ZoomIn)}
            icon={BUTTON_ICONS.zoomInIcon}
            onClick={this.buttonAction}
          />
          <ToolbarItem
            title="缩小"
            tag={ButtonAction.ZoomOut}
            disabled={this.isActionDisable(ButtonAction.ZoomOut)}
            icon={BUTTON_ICONS.zoomOutIcon}
            onClick={this.buttonAction}
          />
        </div>
      </div>
    );
  }
}

export default ImageMover;
