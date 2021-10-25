import React from 'react';
import { render } from "@testing-library/react";
import Instructions from '../Instructions';

let getEleByRole;
let rerenderIns;
const onClose = jest.fn();

describe('instruction', () => {
  beforeEach(() => {
    const div = document.createElement('div');
    div.id = 'test';
    document.body.appendChild(div);
    const { getByRole, rerender } = render((
      <Instructions
        show
        onClose={onClose}
        viewportDiv={div}
      />
    ));
    getEleByRole = getByRole;
    rerenderIns = rerender;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render dom', () => {
    expect(document.body).toMatchSnapshot();
    rerenderIns((
      <Instructions
        show={false}
        onClose={onClose}
        viewportDiv={document.querySelector('#test')}
      />
    ));
    expect(document.body).toMatchSnapshot();
  });

  it('should call onClose', () => {
    getEleByRole('button').click();
    expect(onClose).toBeCalledTimes(1);
  });
});
