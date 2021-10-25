import React from 'react';
import { render, act } from "@testing-library/react";
import BOS3D from 'BOS3D';
import PerspectiveItem from '../PerspectiveItem';

const viewer3D = new BOS3D.Viewer();
const onSwitchPersp = jest.fn();
const onChangePersp = jest.fn();
const onRemovePersp = jest.fn();
const onAddOrder = jest.fn();
const onPlusOrder = jest.fn();
const onPlay = jest.fn();
let itemContainer;
let itemRerender;
let itemGetByTitle;

describe('perspective item', () => {
  beforeEach(() => {
    const { container, rerender, getByTitle } = render((
      <PerspectiveItem
        name="路径"
        viewer={viewer3D}
        onSwitchPersp={onSwitchPersp}
        onRemovePersp={onRemovePersp}
        onAddOrder={onAddOrder}
        onPlusOrder={onPlusOrder}
        onChangePersp={onChangePersp}
        onPlay={onPlay}
        coord={{
          x: 100,
          y: 100,
          z: 100,
        }}
        enableDown
        enableUp
      />
    ));
    itemContainer = container;
    itemRerender = rerender;
    itemGetByTitle = getByTitle;
  });

  it('should render dom', () => {
    expect(itemContainer).toMatchSnapshot();

    itemRerender((
      <PerspectiveItem
        name="路径2"
        viewer={viewer3D}
        onSwitchPersp={onSwitchPersp}
        onRemovePersp={onRemovePersp}
        onAddOrder={onAddOrder}
        onPlusOrder={onPlusOrder}
        onChangePersp={onChangePersp}
        coord={{
          x: 100,
          y: 100,
          z: 100,
        }}
        enableDown
        enableUp
      />
    ));
    expect(itemContainer).toMatchSnapshot();

    act(() => {
      itemGetByTitle('编辑').click();
    });
    expect(itemContainer).toMatchSnapshot();

    itemRerender((
      <PerspectiveItem
        name="路径2"
        viewer={viewer3D}
        onSwitchPersp={onSwitchPersp}
        onRemovePersp={onRemovePersp}
        onAddOrder={onAddOrder}
        onPlusOrder={onPlusOrder}
        onChangePersp={onChangePersp}
        coord={{
          x: 100,
          y: 200,
          z: 300,
        }}
        enableDown
        enableUp
      />
    ));
    expect(itemContainer).toMatchSnapshot();

    act(() => {
      itemGetByTitle('编辑').click();
    });
    expect(itemContainer).toMatchSnapshot();
  });

  it('should call functions', () => {
    act(() => {
      itemGetByTitle('播放').click();
    });
    expect(onPlay).toBeCalledTimes(1);
    act(() => {
      itemGetByTitle('查看').click();
    });
    expect(onSwitchPersp).toBeCalledTimes(1);
    act(() => {
      itemGetByTitle('更新').click();
    });
    expect(onChangePersp).toBeCalledTimes(1);
    act(() => {
      itemGetByTitle('删除').click();
    });
    expect(onRemovePersp).toBeCalledTimes(1);
    act(() => {
      itemGetByTitle('上移').click();
    });
    expect(onPlusOrder).toBeCalledTimes(1);
    act(() => {
      itemGetByTitle('下移').click();
    });
    expect(onAddOrder).toBeCalledTimes(1);
  });
});
