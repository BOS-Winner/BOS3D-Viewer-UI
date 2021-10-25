import React from "react";
import PropTypes from "prop-types";
import SmallConfirm from "Base/SmallConfirm";
// import toastr from "../../toastr";
import { Popover } from 'antd';
import style from "./style.less";
import { AntdIcon } from '../../utils/utils';
import ShapShotForm from './ShapShotForm';

class Snapshot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rename: false,
      reComment: false,
      showUpdateConfirm: false,
      showDeleteConfirm: false,
      isPopoverVisible: false
    };
  }

  onSubmit = (type, value) => {
    const tempValue = value != null ? value.trim() : '';
    switch (type) {
      case "name": {
        this.setState({
          rename: false
        });
        if (tempValue) {
          this.props.onEditTitle(tempValue);
        }
        break;
      }
      case "description": {
        this.setState({
          reComment: false
        });
        this.props.onEditComment(tempValue);
        break;
      }
      default:
        break;
    }
  }

  onUpdate = () => {
    this.setState({
      isPopoverVisible: false,
    });
    if (this.props.needUpdateConfirm) {
      this.setState({
        showUpdateConfirm: true,
      });
    } else {
      this.props.onUpdate(true);
    }
  }

  confirmUpdate(type, neverConfirm) {
    if (type === 'ok') {
      this.props.onUpdate(true, neverConfirm);
    }
    this.setState({
      showUpdateConfirm: false,
    });
  }

  onDelete() {
    if (this.props.needDeleteConfirm) {
      this.setState({
        showDeleteConfirm: true,
      });
    } else {
      this.props.onDelete(true);
    }
  }

  confirmDelete(type, neverConfirm) {
    if (type === 'ok') {
      this.props.onDelete(true, neverConfirm);
    }
    this.setState({
      showDeleteConfirm: false,
    });
  }

  cancelEdit = () => {
    this.setState({
      rename: false,
      reComment: false,
    });
  }

  downloadImage() {
    const a = document.createElement('a');
    a.href = this.props.imageURL;
    a.download = `${this.props.name}.png`;
    a.click();
  }

  onPopoverVisibleChange = visible => {
    this.setState({ isPopoverVisible: visible });
  };

  render() {
    const { isPopoverVisible } = this.state;
    const { isMobile } = this.props;
    let title = <></>;
    let description = <></>;

    if (this.state.rename) {
      title = <ShapShotForm initValue={this.props.name} type="name" isMobile={isMobile} onSubmit={this.onSubmit} cancelEdit={this.cancelEdit} />;
    } else {
      title = (
        <span
          className={style.text}
          title={this.props.name}
          role="note"
          onClick={() => { this.setState({ rename: true }) }}
        >
          <AntdIcon type="iconicon_edit" />
          <span style={{ marginLeft: 5 }}>{this.props.name}</span>
        </span>
      );
    }

    if (this.state.reComment) {
      description = <ShapShotForm initValue={this.props.description} type="description" isMobile={isMobile} onSubmit={this.onSubmit} cancelEdit={this.cancelEdit} />;
    } else {
      description = (
        <span
          className={style.text}
          title={this.props.description}
          role="note"
          onClick={() => { this.setState({ reComment: true }) }}
        >
          {this.props.description || "添加注释"}
        </span>
      );
    }

    const ActionJSXInMobile = (
      <div className={`${style.mobileActionWrap}`}>
        <button type="button" className={`${style.actionBtn}  bos-btn`} onClick={() => { this.onUpdate() }}>
          <AntdIcon type="iconupdatetheview" />
          更新视图
        </button>
        <button type="button" className={`${style.actionBtn}  bos-btn`} onClick={() => { this.downloadImage() }}>
          <AntdIcon type="icondownload" />
          下载快照
        </button>
      </div>
    );

    return (
      <div className={style.snapshot}>
        <div className={style.header}>
          {title}
        </div>
        <div className={style.previewWrap}>
          <span role="presentation" className={style.remove} onClick={() => { this.onDelete() }} />
          <div
            className={style.preview}
            style={{
              backgroundImage: `url(${this.props.imageURL})`,
            }}
            title="快照"
            aria-hidden
            onClick={() => {
              if (isMobile) {
                this.props.onPlay();
              }
            }}
          />
          <div className={style.footer}>
            {description}
            {isMobile && (
              <Popover
                placement="topRight"
                trigger="click"
                overlayClassName={style.mobilePopOverlayClass}
                content={ActionJSXInMobile}
                visible={isPopoverVisible}
                onVisibleChange={this.onPopoverVisibleChange}
              >
                <div className={`${style.mobileMoreAction}`}><AntdIcon type="iconicon_more_1" /></div>
              </Popover>
            )}
          </div>
          {
            !isMobile && (
              <div className={style.action}>
                <button type="button" className={`${style.actionBtn}  bos-btn bos-btn-primary`} onClick={() => { this.props.onPlay() }}>
                  <AntdIcon type="iconjumptoview" />
                  跳转视图
                </button>
                <button type="button" className={`${style.actionBtn}  bos-btn bos-btn-primary`} onClick={() => { this.onUpdate() }}>
                  <AntdIcon type="iconupdatetheview" />
                  更新视图
                </button>
                <button type="button" className={`${style.actionBtn}  bos-btn bos-btn-primary`} onClick={() => { this.downloadImage() }}>
                  <AntdIcon type="icondownload" />
                  下载快照
                </button>
              </div>
            )
          }
        </div>

        {/* 需要显示确认弹框的时候才显示（包括父级指定和用户点更新） */}
        {this.state.showUpdateConfirm && this.props.needUpdateConfirm && (
          <div className={style.confirmContainer}>
            <div>
              <SmallConfirm
                title="确定更新此快照吗？"
                onOk={neverConfirm => { this.confirmUpdate('ok', neverConfirm) }}
                onCancel={neverConfirm => { this.confirmUpdate('cancel', neverConfirm) }}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
        {this.state.showDeleteConfirm && this.props.needDeleteConfirm && (
          <div className={style.confirmContainer}>
            <div>
              <SmallConfirm
                title="确定删除此快照吗？"
                isMobile={isMobile}
                type="danger"
                onOk={neverConfirm => { this.confirmDelete('ok', neverConfirm) }}
                onCancel={neverConfirm => { this.confirmDelete('cancel', neverConfirm) }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

Snapshot.propTypes = {
  imageURL: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  onEditTitle: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  // viewportId: PropTypes.string.isRequired,
  needUpdateConfirm: PropTypes.bool,
  needDeleteConfirm: PropTypes.bool,
  isMobile: PropTypes.bool,
};
Snapshot.defaultProps = {
  needUpdateConfirm: true,
  needDeleteConfirm: true,
  isMobile: false
};

export default Snapshot;
