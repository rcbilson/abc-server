import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ErrorPage from "./ErrorPage.js";
import Music from "./Music.tsx";
import HomePage from "./HomePage.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/render/*",
    element: <Music />
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}
