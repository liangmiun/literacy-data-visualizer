import React, {useState, useEffect} from 'react';
import { csv } from 'd3';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { rowParser } from './Utils.js';
import About from './About';
import ScatterPage from './ScatterPage';
import AlternativePlot from './AlternativePlot';
import { useAuth } from './authentications/AuthContext';
import ProtectedWrapper from './authentications/ProtectedWrapper';
import Login from './authentications/Login';
import Logout from './authentications/Logout';


const App = () => { 

  //const { currentUser } = useAuth();
  const currentUser = true;
  const [data, setData] = useState([]);

  //D3.v4 version:
  useEffect(() => {
    csv(process.env.PUBLIC_URL +'/LiteracySample.csv', rowParser)
    .then(setData);
  },  []);  


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
                    <ProtectedWrapper  element={<AlternativePlot  data={data} setData={setData}   />} />
                  }
              />
              <Route path="/"               
                  element={
                    <ProtectedWrapper  element={<ScatterPage data={data} setData={setData}/>} />
                  }
              />              
            </Routes>
          </div>
      </Router> 
  );
};


export default App;