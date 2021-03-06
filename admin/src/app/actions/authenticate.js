import { push } from 'react-router-redux';

import feathers from '../../feathers-client';
import {
  UPDATE_USER,
  APP_LOADING
} from '../constants';
import fetchPages from './fetch-pages';

const authenticate = function(userDetails) {
  return (dispatch, getState) => {

    // If there is a user, add the feathers
    // auth strategy to it
    userDetails = userDetails ?
      Object.assign({}, userDetails, { strategy: 'local' }) :
      userDetails;

    // Authenticate the user. If no user is supplied
    // feathers will check for a JWT in local storage
    feathers.authenticate(userDetails)
      .then(response => feathers.passport.verifyJWT(response.accessToken))
      .then(payload => feathers.service('users').get(payload.userId))
      .then(user => {
        feathers.set('user', user);
        dispatch({ type: UPDATE_USER, user });

        // Get the pages from the DB
        dispatch(fetchPages());

        // If a user is logging in then redirect
        // them to the index
        if (userDetails) {
          console.log('Logging user in... redirecting');
          dispatch(push('/'));
        }
      })
      .catch(error => {
        dispatch({
          type: APP_LOADING,
          state: false
        });

        console.log('Login error', error);

        // If there the user is not authenticated
        // redirect them to the login view
        dispatch(push('/login'));
      });
  };
};

export default authenticate;
