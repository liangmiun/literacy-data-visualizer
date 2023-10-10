import React, {useState} from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import About from './About';
import ScatterPage from './ScatterPage';
import AlternativePlot from './AlternativePlot';


const App = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const checkCredentials = () => {
    // Hard-coded credentials (not secure!)
    const correctUsername = 'lex';
    const correctPassword = 'lex';
    
    if (username === correctUsername && password === correctPassword) {
      setAuthenticated(true);
    } else {
      alert('Incorrect username or password!');
    }
  };

  if (!authenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={checkCredentials}>Log In Lexplore Visualization</button>
        </div>
      </div>
    );
  }

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