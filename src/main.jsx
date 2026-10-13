import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
// Self-hosted fonts: Fraunces for headlines, Source Sans 3 for text, Caveat for Kamron's handwritten notes
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/source-sans-3';
import '@fontsource-variable/caveat';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
