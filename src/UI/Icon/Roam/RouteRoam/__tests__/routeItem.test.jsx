import React from 'react';
import { render, act } from "@testing-library/react";
import BOS3D from 'BOS3D';
import RouteItem from '../RouteItem';

const viewer = new BOS3D.Viewer();
const onDelete = jest.fn();
const onRename = jest.fn();
const onPlay = jest.fn();
const onChangeSpeed = jest.fn();
const onChangeTime = jest.fn();
const onExport = jest.fn();
const roamPlayer = {
  addStopPlayCallback: () => { },
  addKeyFrameCallback: () => { },
};

let riContainer;
let riGetByTitle;
let riGetByPlaceholderText;
let riGetByText;
let riRerender;

describe('route item', () => {
  beforeEach(() => {
    const {
      container, getByTitle, getByPlaceholderText, getByText, rerender
    } = render((
      <RouteItem
        name="test"
        viewer={viewer}
        onDelete={onDelete}
        onRename={onRename}
        onPlay={onPlay}
        onChangeTime={onChangeTime}
        onChangeSpeed={onChangeSpeed}
        onChangeFrame={() => {}}
        onExport={onExport}
        roamPlayer={roamPlayer}
        playingState="stop"
        recTimeLen={10}
        routeLen={11}
      />
    ));

    riContainer = container;
    riGetByTitle = getByTitle;
    riGetByPlaceholderText = getByPlaceholderText;
    riGetByText = getByText;
    riRerender = rerender;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should rename item', () => {
    act(() => {
      riGetByTitle('重命名').click();
    });
    expect(riContainer).toMatchSnapshot();

    act(() => {
      riGetByPlaceholderText('test').value = 'rename';
      riGetByText('确定').click();
    });
    expect(onRename).toBeCalledTimes(1);
    expect(onRename).lastCalledWith('rename');

    act(() => {
      riGetByTitle('重命名').click();
    });
    act(() => {
      riGetByText('取消').click();
    });
    expect(onRename).toBeCalledTimes(1);

    riRerender((
      <RouteItem
        name="rename"
        viewer={viewer}
        onDelete={onDelete}
        onRename={onRename}
        onPlay={onPlay}
        onChangeTime={onChangeTime}
        onChangeSpeed={onChangeSpeed}
        onExport={onExport}
        roamPlayer={roamPlayer}
        onChangeFrame={() => {}}
        playingState="stop"
        recTimeLen={10}
        routeLen={11}
      />
    ));
    expect(riGetByText('rename')).not.toBeUndefined();
  });

  it('should call functions', () => {
    riGetByTitle('删除').click();
    expect(onDelete).toBeCalledTimes(1);
    riGetByTitle('导出').click();
    expect(onExport).toBeCalledTimes(1);
    riGetByTitle('播放').click();
    expect(onPlay).toBeCalledTimes(1);
    expect(onPlay).lastCalledWith('play');
    riRerender((
      <RouteItem
        name="test"
        viewer={viewer}
        onDelete={onDelete}
        onRename={onRename}
        onPlay={onPlay}
        onChangeTime={onChangeTime}
        onChangeSpeed={onChangeSpeed}
        onExport={onExport}
        onChangeFrame={() => {}}
        roamPlayer={roamPlayer}
        playingState="play"
        recTimeLen={10}
        routeLen={11}
      />
    ));
    riGetByTitle('暂停').click();
    expect(onPlay).toBeCalledTimes(2);
    expect(onPlay).lastCalledWith('pause');
  });

  it('should change speed', () => {
    for (let index = 0; index < 5; index++) {
      // eslint-disable-next-line no-loop-func
      act(() => {
        riGetByText('+').click();
      });
    }
    expect(riGetByText('1.5')).not.toBeUndefined();
    for (let index = 0; index < 4; index++) {
      // eslint-disable-next-line no-loop-func
      act(() => {
        riGetByText('-').click();
      });
    }
    expect(riGetByText('1.1')).not.toBeUndefined();
  });
  // TODO: test ranger
});
