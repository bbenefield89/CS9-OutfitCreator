<<<<<<< HEAD
import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
=======
import React, { Component } from 'react';
import logo from './logo.svg';
import Landing from './Components/Landing';
import './App.css';
import { Switch, Route } from 'react-router-dom';
>>>>>>> 617d2350f309ae88d8a62022e4e52d5b134e3d1b

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <Switch>
          <Route exact path='/' component={Landing} />
          <Route exact path='/SignUp' />
        </Switch>

        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
