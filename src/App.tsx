// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UsersList from './components/UsersList';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UsersList/>} />
      </Routes>
    </Router>
  );
};

export default App;
