import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Pretty straightforward test - just making sure the App component renders
// Had to wrap it in BrowserRouter since the app uses React Router
test('renders the app', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  // Verify that the App component renders
  const appElement = document.querySelector('.App');
  expect(appElement).toBeInTheDocument();
});
