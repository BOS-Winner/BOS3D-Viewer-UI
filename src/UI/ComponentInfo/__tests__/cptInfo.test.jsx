import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import ComponentInfo from '../index';
import cptJson from './cptInfo';
import toastr from '../../toastr';

jest.mock('../../toastr', () => ({
  error: jest.fn(),
}));

jest.mock('Base/Modal', () => {
  // eslint-disable-next-line global-require
  const Modal = require('mock/Modal').default;
  return props => <Modal {...props} />;
});
const store = genStore();
const viewer3D = store.getState().system.viewer3D;
const onClose = jest.fn();
let cptInfoContainer;
let cptInfoGetAllByRole;
let cptInfoGetByText;
let cptInfoRerender;

describe('component info', () => {
  beforeEach(() => {
    viewer3D.getHighlightComponentsKey = () => [];
    viewer3D.getComponentsAttributeByKey = (keys, cb) => {
      cb();
    };
    const {
      container, getAllByRole, getByText, rerender
    } = render((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} />
      </Provider>
    ));
    cptInfoContainer = container;
    cptInfoGetAllByRole = getAllByRole;
    cptInfoGetByText = getByText;
    cptInfoRerender = rerender;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should show or hide component info', async () => {
    viewer3D.getComponentsAttributeByKey = (keys, cb) => {
      cb(cptJson);
    };
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    expect(cptInfoContainer).toMatchSnapshot();

    viewer3D.getComponentsAttributeByKey = (keys, cb) => {
      cb(null);
    };
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} />
      </Provider>
    ));
    expect(cptInfoContainer).toMatchSnapshot();

    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    expect(toastr.error).toBeCalledTimes(1);
    expect(cptInfoContainer).toMatchSnapshot();
  });

  it('should toggle expand', async () => {
    viewer3D.getComponentsAttributeByKey = (keys, cb) => {
      cb(cptJson);
    };
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    act(() => {
      cptInfoGetAllByRole('tree')[0].click();
    });
    expect(cptInfoContainer).toMatchSnapshot();

    act(() => {
      cptInfoGetAllByRole('tree')[0].click();
    });
    expect(cptInfoContainer).toMatchSnapshot();
  });

  it('should show loading state', async () => {
    viewer3D.getComponentsAttributeByKey = () => {};
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    expect(cptInfoContainer).toMatchSnapshot();
  });

  it('should get component info once', async () => {
    let _cb;
    const mockFn = jest.fn();
    viewer3D.getComponentsAttributeByKey = (keys, cb) => {
      mockFn();
      _cb = cb;
    };
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    expect(mockFn).toBeCalledTimes(1);

    act(() => {
      _cb(cptJson);
    });
    await cptInfoRerender((
      <Provider store={store}>
        <ComponentInfo onClose={onClose} cptKey="M1584073315322_305908" />
      </Provider>
    ));
    expect(mockFn).toBeCalledTimes(1);
  });

  it('should call onClose', () => {
    cptInfoGetByText('close mock modal').click();
    expect(onClose).toBeCalledTimes(1);
  });
});
