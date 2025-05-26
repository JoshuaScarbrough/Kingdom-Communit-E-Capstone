import React from "react";
import AllRoutes from "./routes-nav/Routes.js";
import './App.css';

// Super simple App component - just renders the routes
// All the real action happens in the AllRoutes component
function App() {
  return (
    <div className="App">
      <AllRoutes />
    </div>
  );
}

export default App;
