import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Editor from "./editor";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Editor />
      </header>
    </div>
  );
}

export default App;
