
import React from "react";
import ReactDOM from "react-dom";

import { HashRouter, Routes, Route } from "react-router-dom";

console.log("React version:", React.version);

const rootElement = window.document.getElementById("root")!;

const Demo = React.lazy(() => import("./demo"));
const render = (app: React.ReactElement) => { ReactDOM.render(app, rootElement); };

render(
  <HashRouter>
    <Routes>
      <Route path="*" element={<React.Suspense fallback={<>...</>}><Demo /></React.Suspense>} />
    </Routes>
  </HashRouter>
);
