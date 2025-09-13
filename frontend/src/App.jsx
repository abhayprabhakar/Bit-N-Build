import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from './assets/components/sign-in/SignIn';

function App() {
   return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
