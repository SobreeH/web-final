import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

const App = () => {
  return (
    <div
      className="mx-4 sm:mx-[10%]" /* mx-4 = margin from x , sm:mx-[10%] = different screen size */
    >
      <Routes>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </div>
  );
};

export default App;
