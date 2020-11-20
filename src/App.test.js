import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

jest.mock('./GameContainer', () => () => 'GameContainer');

it('renders', () => {
  const { container } = render(<App />);
  expect(container).toMatchSnapshot();
});
