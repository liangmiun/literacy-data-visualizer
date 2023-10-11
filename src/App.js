import React, {useState, useEffect} from 'react';
import { csvParse } from 'd3';
import CryptoJS from 'crypto-js';
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

  const { currentUser } = useAuth();
  //const currentUser = true;
  const [data, setData] = useState([]);
  const [encryptKey,setEncryptKey] = useState(""); 
  const [isLogin, setIsLogin] = useState(false);

  //D3.v4 version:
  useEffect(() => {
    if(!isLogin) return;
    fetch(process.env.PUBLIC_URL +'/LiteracySampleEncrypt.csv')
    .then(response => response.text())  // Get as text, not JSON
    .then(encryptedData => {
      // Decrypt data
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptKey);  // Replace with your secretKey
      const originalData = bytes.toString(CryptoJS.enc.Utf8);

      // Now, parse the decrypted string as CSV
      const parsedData = csvParse(originalData, rowParser);
      
      setData(parsedData);
    })
    .catch((error) => {
      console.error('Error fetching or parsing data:', error);
    });
  },  [isLogin, encryptKey]);  


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
                  <li style={liStyle}>
                    <Link to="/logout">Logout</Link>
                  </li>
                  </>
                )}

                {/* <li style={liStyle}>
                  <Link to="/login">Login</Link>
                </li> */}

              </ul>
            </nav>
            {/* Define routes */}
            <Routes>
              <Route path="/login" element={ <Login   setEncryptKey={setEncryptKey} setIsLogin={setIsLogin} />} />
              <Route path="/logout" element={ <Logout setIsLogin={setIsLogin} />} />
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