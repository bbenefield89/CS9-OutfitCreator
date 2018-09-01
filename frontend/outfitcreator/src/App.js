import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';

import Landing from './Components/Landing_Page/Landing';
import Login from './Components/Landing_Page/Login';
import Navigation from './Components/Navigation/Navigation';
import Create from './Components/Create_Component/Create';
import CreateLayers from './Components/Create_Component/CreateLayers';
import Upload from './Components/Upload_Page/Upload';
import Archive from './Components/Archive_Page/Archive';
import Settings from './Components/Settings_Page/Settings';
import Billing from './Components/Billing_Page/Billing';
import OutfitEdit from './Components/Archive_Page/OutfitEdit';
import Closet from './Components/Closet_Page/Closet.js';
import './App.css';

library.add(faShareAlt);

class App extends Component {
  tokenData() {
    const token = localStorage.getItem('authToken');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    }
  }

  signInSuccess = (data) => {
    this.setState({ user: data.user });
    localStorage.setItem('authToken', `Bearer ${data.token}`);
  }

  getUserID() {
    const token = localStorage.getItem('authToken');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64)).sub;
    }
  }

  signInSuccess = (data) => {
    console.log(data);
    localStorage.setItem('authToken', `Bearer ${data.token}`);
  }

  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path='/' render={props => 
            <Landing {...props} onSignin={this.signInSuccess} />
          } />
          <Route exact path='/login' render={props =>
            <Login {...props} onSignin={this.signInSuccess} />
          } />
          <Route path='/Create' render={props =>
            <div className='App--create'>
              <Create {...props} getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Layers' render={props =>
            <div className='App--create-layers'>
              <CreateLayers {...props} getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Archive' render={props =>
            <div>
              <Archive getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Settings' render={props =>
            <div>
              <Settings tokenData={this.tokenData} />
              <Billing {...props} getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Upload' render={props =>
            <div>
              <Upload getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Billing' render={props =>
            <div>
              <Billing {...props} getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Edit' render={props =>
            <div>
              <OutfitEdit {...props} getUserID={this.getUserID}/>
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
          <Route path='/Closet' render={props =>
            <div className="App">
              <Closet {...props} getUserID={this.getUserID} />
              <Navigation tokenData={this.tokenData} />
            </div>
          } />
        </Switch>
      </div>
    );
  }
}

export default App;
