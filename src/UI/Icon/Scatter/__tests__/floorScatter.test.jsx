import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import FloorScatter from '../FloorScatter';

const store = genStore();
store.getState().system.viewer3D.floorExplosion = jest.fn();
store.getState().system.viewer3D.closeFloorExplosion = jest.fn();
let scatterContainer;
let scatterRerender;

describe('floor scatter', () => {
  beforeEach(() => {
    const { container, rerender } = render((
      <Provider store={store}>
        <FloorScatter enable coefficient={1} />
      </Provider>
    ));
    scatterContainer = container;
    scatterRerender = rerender;
  });

  it('should render dom', () => {
    expect(scatterContainer).toMatchSnapshot();
  });

  it("should scatter model's floor", () => {
    const viewer3D = store.getState().system.viewer3D;
    scatterRerender((
      <Provider store={store}>
        <FloorScatter enable coefficient={1.5} />
      </Provider>
    ));
    expect(viewer3D.floorExplosion).toBeCalledTimes(1);
    expect(viewer3D.floorExplosion.mock.calls[0]).toMatchSnapshot();

    scatterRerender((
      <Provider store={store}>
        <FloorScatter enable={false} coefficient={2} />
      </Provider>
    ));
    expect(viewer3D.floorExplosion).toBeCalledTimes(1);
    expect(viewer3D.closeFloorExplosion).toBeCalledTimes(1);
  });
});
