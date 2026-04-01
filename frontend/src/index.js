import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // <--- මේ පේළිය අනිවාර්යයෙන්ම තියෙන්න ඕනේ!
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);