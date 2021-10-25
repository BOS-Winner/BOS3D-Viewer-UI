import React from 'react';
import { render, act } from "@testing-library/react";
import BOS3D from 'BOS3D';
import RouteManager from '../RouteManager';

const viewer = new BOS3D.Viewer();
jest.mock('../PerspectiveManager', () => {
  // eslint-disable-next-line global-require
  const json = require('../../fileParser/__tests__/json1_2_0').default;
  const data = {
    name: json.name,
    key: json.id,
    route: json.keyFrameList,
    roamTime: json.roamTime,
  };
  // eslint-disable-next-line react/prop-types
  return ({ onSaveRoute }) => (
    <div>
      <button type="button" onClick={() => onSaveRoute(data)}>生成路径</button>
    </div>
  );
});

let rmContainer;
let rmGetByText;
let rmGetByTitle;
let rmGetAllByText;

describe('route item', () => {
  beforeEach(() => {
    const {
      container, getByText, getByTitle, getAllByText
    } = render((
      <RouteManager
        viewer={viewer}
        BIMWINNER={{
          BOS3D
        }}
      />
    ));
    rmContainer = container;
    rmGetByText = getByText;
    rmGetByTitle = getByTitle;
    rmGetAllByText = getAllByText;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should add and remove route', () => {
    act(() => {
      rmGetByText('生成路径').click();
    });
    expect(rmContainer).toMatchSnapshot();

    act(() => {
      rmGetByTitle('删除').click();
    });
    act(() => {
      rmGetByText('确定').click();
    });
    expect(rmContainer).toMatchSnapshot();
  });

  it('should highlight item', () => {
    act(() => {
      rmGetByText('生成路径').click();
      rmGetByText('生成路径').click();
    });
    act(() => {
      rmGetAllByText('00:00:00')[1].click();
    });
    expect(rmContainer).toMatchSnapshot();
    act(() => {
      rmGetAllByText('00:00:00')[0].click();
    });
    expect(rmContainer).toMatchSnapshot();
  });
});
