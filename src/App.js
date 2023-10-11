import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import About from './About';
import ScatterPage from './ScatterPage';
import AlternativePlot from './AlternativePlot';
import { useAuth } from './authentications/AuthContext';
import ProtectedWrapper from './authentications/ProtectedWrapper';
import Login from './authentications/Login';
import Logout from './authentications/Logout';


const App = () => { 

  const { currentUser } = useAuth();

  console.log("App: currentUser = ", currentUser);

  const liStyle = {
    display: "inline-block",/* Display the list items in a horizontal line */
    marginRight: "10px",
  };

  return ( 
      <Router  basename="literacy-data-visualizer" >
          <div>
            {/* Add navigation links */}
            <nav className ="headers">
              <ul>

                {currentUser && (
                  <>
                  <li style={liStyle}>
                    <Link to="/">ScatterPlot</Link>
                  </li>
                  <li style={liStyle}>
                    <Link to="/alternative-plot">Class Aggregation</Link>
                  </li>
                  <li style={liStyle}>
                    <Link to="/about">About</Link>
                  </li>
                  </>
                )}

                <li style={liStyle}>
                  <Link to="/login">Login</Link>
                </li>
                <li style={liStyle}>
                  <Link to="/logout">Logout</Link>
                </li>
              </ul>
            </nav>
            {/* Define routes */}
            <Routes>
              <Route path="/login" element={ <Login />} />
              <Route path="/logout" element={ <Logout />} />
              <Route path="/about" 
                  element={
                    <ProtectedWrapper  element={<About/>} />
                  } 
              />
              <Route path="/alternative-plot" 
                  element={
                    <ProtectedWrapper  element={<AlternativePlot/>} />
                  }
              />
              <Route path="/"               
                  element={
                    <ProtectedWrapper  element={<ScatterPage/>} />
                  }
              />              
            </Routes>
          </div>
      </Router> 
  );
};


export default App;