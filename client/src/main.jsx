import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createHashRouter, RouterProvider} from "react-router-dom";
import {Provider, useSelector} from 'react-redux';
import store from './store/store';
import { Home } from './Home.jsx';
import { Login } from './Login.jsx';
import { SignUp } from './SignUp.jsx';
import { MusicStatsPage } from './MusicStats.jsx';
import { SpotifyAuthRedirect } from './SpotifyAuthRedirect.jsx';
import { Api, ApiContext } from './utils/api.js';
import { SpotifyLogin } from './SpotifyLogin.jsx';

const router = createHashRouter([
  {
    path: "",
    element:  <App />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/sign_up",
        element: <SignUp />
      },
      {
        path: "/music_stats",
        element: <MusicStatsPage/>
      },
      {
        path: "/spotify/auth/spotify",
        element: <SpotifyAuthRedirect />
      },
      { 
        path: "/spotify_login", 
        element: <SpotifyLogin /> }
    ]
  }
])


const Main = () => {
  const authToken = useSelector(state => state.application.authToken)
  const apiRef = useRef(new Api(authToken));

  useEffect(() => {
    if(apiRef.current) {
      apiRef.current.authToken = authToken;
    }
  }, [authToken])

  return (
    <ApiContext.Provider value={apiRef.current}>
      <RouterProvider router={router} />
    </ApiContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Main />
  </Provider>
)
