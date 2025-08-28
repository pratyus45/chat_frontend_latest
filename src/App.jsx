import React from 'react'
import {Navigate ,Routes , Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import {Toaster} from 'react-hot-toast'

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
 

const App = () => {

  const {value} = useContext(AuthContext);
  const {authUser, isLoading} = value;
  
  // Show loading while checking authentication
  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading...</p>
          </div>
      </div>;
  }
  
    return (
      <div className="bg-[url('/bgImage.svg')]
      bg-contain">
        <Toaster/>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to = "/login"/>} />  
            <Route path="/login" element={!authUser ?<LoginPage /> : <Navigate to = "/"/>} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to = "/login"/>} />
        </Routes>
        
      </div>
    )
  }

export default App