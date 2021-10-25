import React from 'react';
import { render, act, fireEvent } from "@testing-library/react";
import BOS3D from "mock/BOS3D";
import FreeRoamOption from '../FreeRoamOption';

const onChange = jest.fn();
const viewer = new BOS3D.Viewer();
let froContainer;
let getEleByText;
let getEleByValue;

describe('freeRoamOption', () => {
  beforeEach(() => {
    const { container, getByText, getByDisplayValue } = render((
      <FreeRoamOption
        onChange={onChange}
        realManHeight={1.5}
        viewer={viewer}
        BOS3D={BOS3D}
      />
    ));
    froContainer = container;
    getEleByText = getByText;
    getEleByValue = getByDisplayValue;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render dom', () => {
    expect(froContainer).toMatchSnapshot();
  });

  it('should change impact state', () => {
    act(() => {
      getEleByText('碰撞').previousElementSibling.firstElementChild.click();
    });
    expect(froContainer).toMatchSnapshot();
    expect(onChange).lastCalledWith('hit', true);
    act(() => {
      getEleByText('碰撞').previousElementSibling.firstElementChild.click();
    });
    expect(froContainer).toMatchSnapshot();
    expect(onChange).lastCalledWith('hit', false);
  });

  it('should change gravity state', () => {
    act(() => {
      getEleByText('重力').previousElementSibling.firstElementChild.click();
    });
    expect(froContainer).toMatchSnapshot();
    expect(onChange).lastCalledWith('gravity', true);
    act(() => {
      getEleByText('重力').previousElementSibling.firstElementChild.click();
    });
    expect(froContainer).toMatchSnapshot();
    expect(onChange).lastCalledWith('gravity', false);
  });

  it("should trigger man height dialog's state", () => {
    act(() => {
      getEleByText('重力').previousElementSibling.firstElementChild.click();
      getEleByText('镜头高度').previousElementSibling.firstElementChild.click();
    });
    expect(froContainer).toMatchSnapshot();

    act(() => {
      getEleByText('镜头高度').previousElementSibling.firstElementChild.click();
    });
    expect(froContainer).toMatchSnapshot();

    act(() => {
      getEleByText('镜头高度').previousElementSibling.firstElementChild.click();
      getEleByText('确定').click();
    });
    expect(froContainer).toMatchSnapshot();

    act(() => {
      getEleByText('镜头高度').previousElementSibling.firstElementChild.click();
      getEleByText('取消').click();
    });
    expect(froContainer).toMatchSnapshot();
  });

  it('should change man height', () => {
    act(() => {
      getEleByText('重力').previousElementSibling.firstElementChild.click();
      getEleByText('镜头高度').previousElementSibling.firstElementChild.click();
    });
    act(() => {
      const input = getEleByValue('1.5');
      fireEvent.change(input, {
        target: {
          value: 2.2
        }
      });
    });
    getEleByText('确定').click();
    expect(onChange).lastCalledWith('manHeight', true, { value: 2.2 });
  });
});
