/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import { render, act } from "@testing-library/react";
import Index from '../index';

jest.mock('Base/Modal', () => props => (
  <div
    className={props.className}
    style={props.style}
  >
    {props.children}
  </div>
));
const store = genStore();
let g_getByTitle;
let indexContainer;

describe('Section index', () => {
  beforeEach(() => {
    const { container, getByTitle } = render((
      <Provider store={store}>
        <Index />
      </Provider>
    ));
    indexContainer = container;
    g_getByTitle = getByTitle;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render dom', () => {
    expect(indexContainer).toMatchSnapshot();
  });

  it('should trigger popup', () => {
    const popup = indexContainer.querySelector('.popup');
    const indexBtn = g_getByTitle('剖切');

    act(() => {
      indexBtn.click();
    });
    expect(popup.style.display).not.toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('false');
    act(() => {
      g_getByTitle('模型剖切').click();
    });
    expect(popup.style.display).toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('true');
    act(() => {
      indexBtn.click();
    });
    expect(popup.style.display).toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('false');

    act(() => {
      indexBtn.click();
    });
    expect(popup.style.display).not.toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('false');
    act(() => {
      g_getByTitle('自由剖切').click();
    });
    expect(popup.style.display).toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('true');
    act(() => {
      indexBtn.click();
    });
    expect(popup.style.display).toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('false');

    act(() => {
      indexBtn.click();
    });
    expect(popup.style.display).not.toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('false');
    act(() => {
      indexBtn.click();
    });
    expect(popup.style.display).toEqual('none');
    expect(indexBtn.children[0].getAttribute('data-selected')).toEqual('false');
  });
});
