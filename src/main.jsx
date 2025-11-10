import React from "react";
import ReactDOM from "react-dom/client";

// 1) Bootstrap first
import "bootstrap/dist/css/bootstrap.min.css";

// 2) Your overrides AFTER Bootstrap
import "./styles.css";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
