import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import {
  add, remove, update, clear
} from "../../userRedux/snapshot/action";
import Snapshot from "./Snapshot";
import { EVENT } from "../../constant";
import style from "./style.less";
import { AntdIcon } from '../../utils/utils';
import Empty from '../../Base/Empty/index';

let count = 0;

function getShot(viewer) {
  const scene = _.cloneDeep(viewer.viewerImpl.getSceneState());
  const snapshot = viewer.viewerImpl.modelManager.getModelSnapshotPhoto();
  return {
    code: new Date().getTime().toString(),
    name: `快照${count}`,
    description: '',
    imageURL: snapshot.imgURL,
    width: snapshot.width,
    height: snapshot.height,
    cameraState: scene.camera,
    componentState: scene.state,
    highlightComponentsKeys: scene.selection,
    highlightModelsKeys: scene.modelSelection,
  };
}

function restoreToShot(viewer, code, shotList) {
  const item = _.find(shotList, { code });
  console.log(item);
  viewer.viewerImpl.setSceneState({
    camera: item.cameraState,
    state: item.componentState,
    selection: item.highlightComponentsKeys,
    modelSelection: item.highlightModelsKeys
  });
  // 如果当前场景中没有高亮构件，就取消高亮
  if (!item.highlightComponentsKeys.length) {
    viewer.clearHighlightList();
  }
  viewer.render();
}

class ShotManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      neverConfirmUpdate: false,
      neverConfirmDelete: false,
    };
    this.enableUpdate = true;
    this.enableDelete = true;
  }

  componentDidMount() {
    const ee = this.props.eventEmitter;
    ee.on(EVENT.userAddSnapshot, shot => {
      this.props.add(shot);
    });
    ee.on(EVENT.userDeleteSnapshot, code => {
      this.props.remove(code);
    });
    ee.on(EVENT.userUpdateSnapshot, (code, shot) => {
      this.props.update(code, shot);
    });
    ee.on(EVENT.userRenameSnapshot, (code, name) => {
      this.props.update(code, { name });
    });
    ee.on(EVENT.userAnnotationSnapshot, (code, description) => {
      this.props.update(code, { description });
    });
    ee.on(EVENT.userRestoreToSnapshot, code => {
      restoreToShot(this.props.viewer, code, this.props.shotList);
    });
    ee.on(EVENT.userClearSnapshot, () => {
      this.props.clear();
    });
  }

  createShot() {
    count++;
    const shot = getShot(this.props.viewer);
    if (
      !this.props.eventEmitter.emit(EVENT.sysAddSnapshot, shot, (s, param) => {
        if (s) {
          this.props.add(param || shot);
        }
      })
    ) {
      this.props.add(shot);
    }
  }

  rmShot(code, needDelete, neverConfirmDelete) {
    if (needDelete && this.enableDelete) {
      if (
        !this.props.eventEmitter.emit(EVENT.sysDeleteSnapshot, code, s => {
          if (s) {
            this.props.remove(code);
          }
        })
      ) {
        this.props.remove(code);
      }
    }
    if (neverConfirmDelete) {
      this.enableDelete = needDelete;
      this.setState({
        neverConfirmDelete: true,
      });
    }
  }

  onPlay(code) {
    if (
      !this.props.eventEmitter.emit(EVENT.sysRestoreToSnapshot, code, s => {
        if (s) {
          restoreToShot(this.props.viewer, code, this.props.shotList);
        }
      })
    ) {
      console.log(code, this.props.shotList);
      restoreToShot(this.props.viewer, code, this.props.shotList);
    }
  }

  onUpdate(code, needUpdate, neverConfirmUpdate) {
    if (needUpdate && this.enableUpdate) {
      const shot = getShot(this.props.viewer);
      const newShot = {
        imageURL: shot.imageURL,
        cameraState: shot.cameraState,
        componentState: shot.componentState,
        highlightComponentsKeys: shot.highlightComponentsKeys,
        highlightModelsKeys: shot.highlightModelsKeys,
        width: shot.width,
        height: shot.height,
      };
      if (
        !this.props.eventEmitter.emit(EVENT.sysUpdateSnapshot, code, newShot, (s, code2, shot2) => {
          if (s) {
            this.props.update(code2 || code, shot2 || newShot);
          }
        })
      ) {
        this.props.update(code, newShot);
      }
    }
    if (neverConfirmUpdate) {
      this.enableUpdate = needUpdate;
      this.setState({
        neverConfirmUpdate: true,
      });
    }
  }

  onEdit(type, code, value) {
    switch (type) {
      case 'name': {
        if (
          !this.props.eventEmitter.emit(EVENT.sysRenameSnapshot, code, value, (s, name) => {
            if (s) {
              this.props.update(code, {
                name: name || value
              });
            }
          })
        ) {
          this.props.update(code, {
            name: value
          });
        }
        break;
      }
      case 'description':
        if (
          !this.props.eventEmitter.emit(EVENT.sysAnnotationSnapshot, code, value, (s, desc) => {
            if (s) {
              this.props.update(code, {
                description: desc || value
              });
            }
          })
        ) {
          this.props.update(code, {
            description: value
          });
        }
        break;
      default:
        break;
    }
  }

  render() {
    const list = [];
    this.props.shotList.forEach(item => {
      list.push(
        <Snapshot
          key={item.code}
          viewportId={this.props.viewer.viewport}
          imageURL={item.imageURL}
          name={item.name}
          description={item.description || ''}
          onDelete={
            (needUpdate, neverConfirmUpdate) => {
              this.rmShot(item.code, needUpdate, neverConfirmUpdate);
            }
          }
          onPlay={() => { this.onPlay(item.code) }}
          onUpdate={
            (needUpdate, neverConfirmUpdate) => {
              this.onUpdate(item.code, needUpdate, neverConfirmUpdate);
            }
          }
          onEditComment={value => { this.onEdit('description', item.code, value) }}
          onEditTitle={value => { this.onEdit('name', item.code, value) }}
          needUpdateConfirm={!this.state.neverConfirmUpdate}
          needDeleteConfirm={!this.state.neverConfirmDelete}
          isMobile={this.props.isMobile}
        />
      );
    });
    return (
      <div className={style.shotManager}>
        <div className={style.btnWrap}>
          <button className={style.btn} type="button" onClick={() => { this.createShot() }}>
            <AntdIcon type="iconplus" />
            创建快照
          </button>
        </div>
        {
          list.length > 0 ? (
            <div className={style.shotContent}>
              {list}
            </div>
          )
            : (
              <Empty>
                <div>您还未创建快照</div>
                <div>点击顶部的“创建快照”试试吧</div>
              </Empty>
            )
        }

      </div>
    );
  }
}

ShotManager.propTypes = {
  shotList: PropTypes.arrayOf(PropTypes.object).isRequired,
  add: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  eventEmitter: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  shotList: state.snapshot.shotList,
  viewer: state.system.viewer3D,
  eventEmitter: state.system.eventEmitter,
  isMobile: state.system.isMobile,
});
const mapDispatchToProps = (dispatch) => ({
  add: shot => { dispatch(add(shot)) },
  remove: code => { dispatch(remove(code)) },
  update: (code, shot) => { dispatch(update(code, shot)) },
  clear: () => { dispatch(clear()) },
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ShotManager);

export default WrappedContainer;
