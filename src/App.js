import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import About from './About';
import ScatterPage from './ScatterPage';
import AlternativePlot from './AlternativePlot';


const App = () => {

  const liStyle = {
    display: "inline-block",/* Display the list items in a horizontal line */
    marginRight: "10px",
  };

  return (  
    <Router  >
      <div>
        {/* Add navigation links */}
        <nav className ="headers">
          <ul>
            <li style={liStyle}>
              <Link to="/">ScatterPlot</Link>
            </li>
            <li style={liStyle}>
              <Link to="/alternative-plot">AlternativePlot</Link>
            </li>
            <li style={liStyle}>
              <Link to="/about">About</Link>
            </li>
            <li style={liStyle}>
              <Link to="/">ClassView</Link>
            </li>
          </ul>
        </nav>
        {/* Define routes */}
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/alternative-plot" element={<AlternativePlot />} />
          <Route path="/" element={<ScatterPage />} />
          
        </Routes>
      </div>
    </Router> 
  );
};


export default App;