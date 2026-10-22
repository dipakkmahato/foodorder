import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from './Home';

jest.mock('../components/Navbar', () => () => <div />);
jest.mock('../components/Footer', () => () => <div />);
jest.mock('../components/Card', () => ({ foodItem }) => <div>{foodItem.name}</div>);

beforeEach(() => {
  global.fetch = jest.fn();
  if (!AbortSignal.timeout) AbortSignal.timeout = () => new AbortController().signal;
});
afterEach(() => jest.restoreAllMocks());

function jsonResponse(data) {
  return { ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => data };
}

test('loads menu records from the API and supports searching', async () => {
  fetch.mockResolvedValue(jsonResponse([
    [{ _id: '1', CategoryName: 'Meals', name: 'Dal Bhat', options: [{ Regular: '200' }] }],
    [{ _id: 'c1', CategoryName: 'Meals' }],
  ]));
  render(<Home />);
  expect(screen.getByText('Loading menu…')).toBeInTheDocument();
  expect(await screen.findByText('Dal Bhat')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('/api/foodData', expect.any(Object));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pizza' } });
  expect(screen.getByText('No items match your search.')).toBeInTheDocument();
});

test('rejects HTML responses and allows retrying', async () => {
  fetch.mockResolvedValueOnce({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) })
    .mockResolvedValueOnce(jsonResponse([[], []]));
  render(<Home />);
  expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load the menu");
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText(/No menu items are available yet/)).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

test('shows an error on network failure', async () => {
  fetch.mockRejectedValue(new Error('Network failure'));
  render(<Home />);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
