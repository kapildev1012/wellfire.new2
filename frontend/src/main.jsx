import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/animations.css'
import { BrowserRouter } from 'react-router-dom'
import ShopContextProvider from './context/ShopContext.jsx';

// Add preload class to prevent transitions during initial load
document.body.classList.add('preload');

// Remove preload class after DOM is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('preload');
  }, 100);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
  </BrowserRouter>
);
