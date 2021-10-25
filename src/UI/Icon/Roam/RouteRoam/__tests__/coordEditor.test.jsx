import React from 'react';
import { render, fireEvent } from "@testing-library/react";
import CoordEditor from '../CoordEditor';

const onChange = jest.fn();
let editorContainer;
let rerenderEditor;

describe('coord editor', () => {
  beforeEach(() => {
    const { container, rerender } = render(<CoordEditor coord={[1, 2, 3]} onChange={onChange} />);
    editorContainer = container;
    rerenderEditor = rerender;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should render dom', () => {
    expect(editorContainer).toMatchSnapshot();
    rerenderEditor(<CoordEditor coord={[4, 5, 6]} onChange={onChange} />);
    expect(editorContainer).toMatchSnapshot();
  });

  it('should call onChange', () => {
    onChange.mockClear();
    const inputs = editorContainer.querySelectorAll('input');
    fireEvent.change(inputs[0], {
      target: {
        value: 10,
      }
    });
    expect(onChange).lastCalledWith([10, 2, 3]);
    fireEvent.change(inputs[1], {
      target: {
        value: 10,
      }
    });
    expect(onChange).lastCalledWith([1, 10, 3]);
    fireEvent.change(inputs[2], {
      target: {
        value: 10,
      }
    });
    expect(onChange).lastCalledWith([1, 2, 10]);
    expect(onChange).toBeCalledTimes(3);
  });
});
