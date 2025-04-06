import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectSchool from "./pages/SelectSchool";

export const router = createBrowserRouter([
  { path: "/", element: <SelectSchool /> },
  { path: ":school/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path : ":school/:user/App", element: <App /> },
  { path : "/SelectSchool", element: <SelectSchool /> }

]);


