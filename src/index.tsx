import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import AutoLocation from "./AutoLocation";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <AutoLocation />
    </StyledEngineProvider>
  </React.StrictMode>
);
