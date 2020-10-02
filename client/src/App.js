import React,{Fragment, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import {loadUser} from './actions/auth';
import setAuthToken from './utils/setAuthToken'
import Routes from './components/routing/Routes'
import {LOGOUT} from './actions/types'
import './App.css';
//Redux
import {Provider} from 'react-redux';
import store from './store';

const App = () => {

  useEffect(()=>{
    if(localStorage.token)
      setAuthToken(localStorage.token)
    store.dispatch(loadUser(),[])

    window.addEventListener('storage', () => {
      if (!localStorage.token) store.dispatch({ type: LOGOUT });
    });
  },[])

  return(
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar/>
          <Switch>
            <Route exact path='/' component={Landing}/>
            <Route component={Routes} />
          </Switch>
        </Fragment>
      </Router>
    </Provider>
)}
export default App;
