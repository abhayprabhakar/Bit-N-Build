import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from './assets/components/sign-in/SignIn';
import Dashboard from './assets/components/dashboard/Dashboard';

function App() {
   return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Dashboard />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
