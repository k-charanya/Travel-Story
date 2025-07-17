import React from 'react'
import { BrowserRouter as Router, Route,Routes,Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Home/Home'


function App() {
  return (
    <div>
    <Router>
      <Routes>
      <Route path='/' exact element={<Root/>}/>
        <Route path='/dashboard' exact element={<Home/>}/>
        <Route path='/signup' exact element={<SignUp/>}/>
        <Route path='/login' exact element={<Login/>}/>
      </Routes>
      </Router>      
      
    </div>
  )
}
//define the root component to handle the initial redirect 
const Root=()=>{
  //check if token exists in local storage 
  const isAuthenticated= !!localStorage.getItem("token");
  //Redirect to dashboard if authenticated otherwise to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ):
  (<Navigate to="/login" />) ;
};

export default App
