import React from 'react';
import { render } from '@testing-library/react-native';
import TreeImage from '../../src/components/TreeImage';

describe('TreeImage', () => {
  it('renders the dead-tree image when value is 0', () => {
    const { getByTestId } = render(<TreeImage value={0} />);
    expect(getByTestId('tree-dead')).toBeTruthy();
  });

  it('renders 0-25 image when value is between 1 and 24', () => {
    const { getByTestId } = render(<TreeImage value={10} />);
    expect(getByTestId('tree-0-25')).toBeTruthy();
  });

  it('renders 25-50 image at the lower boundary (value=25)', () => {
    const { getByTestId } = render(<TreeImage value={25} />);
    expect(getByTestId('tree-25-50')).toBeTruthy();
  });

  it('renders 25-50 image when value is 49', () => {
    const { getByTestId } = render(<TreeImage value={49} />);
    expect(getByTestId('tree-25-50')).toBeTruthy();
  });

  it('renders 50-75 image at the lower boundary (value=50)', () => {
    const { getByTestId } = render(<TreeImage value={50} />);
    expect(getByTestId('tree-50-75')).toBeTruthy();
  });

  it('renders 75-100 image when value is 80', () => {
    const { getByTestId } = render(<TreeImage value={80} />);
    expect(getByTestId('tree-75-100')).toBeTruthy();
  });

  it('renders the full-grown tree image when value is 100', () => {
    const { getByTestId } = render(<TreeImage value={100} />);
    expect(getByTestId('tree-full')).toBeTruthy();
  });

  it('renders the full-grown tree image when value exceeds 100', () => {
    const { getByTestId } = render(<TreeImage value={110} />);
    expect(getByTestId('tree-full')).toBeTruthy();
  });

  // NaN falls through all if-else branches → renders the full-grown tree (else branch).
  it('renders without crashing when value is NaN', () => {
    const { getByTestId } = render(<TreeImage value={NaN} />);
    expect(getByTestId('tree-full')).toBeTruthy();
  });
});
