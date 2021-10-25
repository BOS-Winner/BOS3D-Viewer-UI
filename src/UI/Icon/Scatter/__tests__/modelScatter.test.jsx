import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import ModelScatter from '../ModelScatter';

const store = genStore();
store.getState().system.viewer3D.modelsExplosion = jest.fn();
store.getState().system.viewer3D.closeModelsExplosion = jest.fn();
let scatterContainer;
let scatterRerender;

describe('model scatter', () => {
  beforeEach(() => {
    const { container, rerender } = render((
      <Provider store={store}>
        <ModelScatter enable coefficient={1} />
      </Provider>
    ));
    scatterContainer = container;
    scatterRerender = rerender;
  });

  it('should render dom', () => {
    expect(scatterContainer).toMatchSnapshot();
  });

  it('should scatter model', () => {
    const viewer3D = store.getState().system.viewer3D;
    scatterRerender((
      <Provider store={store}>
        <ModelScatter enable coefficient={1.5} />
      </Provider>
    ));
    expect(viewer3D.modelsExplosion).toBeCalledTimes(1);
    expect(viewer3D.modelsExplosion.mock.calls[0]).toMatchSnapshot();

    scatterRerender((
      <Provider store={store}>
        <ModelScatter enable={false} coefficient={2} />
      </Provider>
    ));
    expect(viewer3D.modelsExplosion).toBeCalledTimes(1);
    expect(viewer3D.closeModelsExplosion).toBeCalledTimes(1);
    expect(viewer3D.closeModelsExplosion.mock.calls[0]).toMatchSnapshot();
  });
});
