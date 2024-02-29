import React, {useState, useEffect, useRef} from 'react';
import { csvParse } from 'd3';
import CryptoJS from 'crypto-js';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { rowParser,  load, data_fields, y_data_fields} from './Utils';
import { useAuth } from './authentications/AuthContext';
import ProtectedWrapper from './authentications/ProtectedWrapper';
import Login from './authentications/Login';
import Logout from './authentications/Logout';
import * as settingsIO from './settingsIO';
import './App.css';
import About from './About';
import ScatterPage from './ScatterPage';


const App = () => { 

  const {currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [logicFilteredData, setLogicFilteredtData] = useState(data);
  const [encryptKey,setEncryptKey] = useState(""); 
  const [isLogin, setIsLogin] = useState(false);   //  set as true for test purpose without login;
  const [showLines, setShowLines] = useState(false);
  const [xField, setXField] = useState('Testdatum');
  const [yField, setYField] = useState('Lexplore Score');
  const [colorField, setColorField] = useState('Årskurs');
  const [checkedSchools, setCheckedSchools] = useState([]);
  const [checkedClasses, setCheckedClasses] = useState([]);
  const [query, setQuery] = useState('');
  const [expression, setExpression] = useState('');
  const [checkedOptions, setCheckedOptions] = useState(
    {'Årskurs':[],
    'Läsår':[],
    'Stanine':[]}
    );
  const [rangeOptions, setRangeOptions] = useState(
    {'Födelsedatum':[],
    'Testdatum':[],
    'Lexplore Score':[]}
    );
  const [isClassView, setIsClassView] = useState(true);
  const [aggregateType, setAggregateType] = useState('circle');   

  const fields = data_fields;
  const fields_x = data_fields.filter(element => !y_data_fields.includes(element));
  const fields_y = y_data_fields;

  const savePresetSetters = {
    xField, yField, colorField, checkedSchools, checkedClasses,
    checkedOptions, rangeOptions, query, expression, isClassView,
    showLines, aggregateType
  } ;

  const configSetters = {
    setXField, setYField, setColorField, setCheckedSchools,
    setCheckedClasses, setCheckedOptions, setRangeOptions,
    setQuery, setExpression, setIsClassView, setShowLines, setAggregateType
    };

  const fileUploadSetters = {
    setData, setLogicFilteredtData
  } ;

  const onResetToOnboardingRef = useRef(settingsIO.handleResetToOnboarding(configSetters));
  const onResetToLatest = settingsIO.handleResetToLatest(configSetters);
  const onSavePreset = settingsIO.saveConfig(savePresetSetters);
  const onSetConfigFromPreset = settingsIO.setConfigFromPreset(configSetters);
  const onFileUpload = (event) =>{
    settingsIO.handleFileUpload(event, fileUploadSetters);
  }

  useEffect(() => {
    if(!isLogin) return;
    fetch(process.env.PUBLIC_URL +'/LiteracySampleEncrypt.csv')
    .then(response => response.text())  // Get as text, not JSON
    .then(encryptedData => {
      // Decrypt data
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptKey);  // Replace with encryptKey
      const originalData = bytes.toString(CryptoJS.enc.Utf8);
      const parsedData = csvParse(originalData, rowParser);  
      setData(parsedData);
      setLogicFilteredtData(parsedData); 
      onResetToOnboardingRef.current();     

    })
    .catch((error) => {
      console.error('Error fetching or parsing data:', error);
    });
    console.log("data parsed");    

  },  [isLogin, encryptKey]);  


  return ( 
      <Router  basename="literacy-data-visualizer"  >
          <div className = "grid-container">
            {/* Add navigation links */}
            <nav className='navigation'>
              <ul className ="headers">
                {currentUser? 
                  <>
                  <li  className="header-li-style">
                    <Link to="/">Plot</Link>
                  </li>
                  <li  className="header-li-style">
                    <Link to="/about">About</Link>
                  </li>
                  <li  className="header-li-style">
                    <Link to="/logout">Logout</Link>
                  </li>
                  </>                  
                  :
                  <li  className="header-li-style">
                  <Link to="/login">Login</Link>
                </li>
                }
              </ul>
            </nav>
            {/* Define routes */}
            <div className="content">
              <Routes>
                <Route path="/login" element={ <Login   setEncryptKey={setEncryptKey} setIsLogin={setIsLogin} />} />
                <Route path="/logout" 
                    element={
                      <ProtectedWrapper element={ <Logout setIsLogin={setIsLogin} />}/>
                    } 
                />
                <Route path="/about" 
                    element={
                      <ProtectedWrapper  
                        element={
                          <About
                            data = {data}
                          />
                        } 

                      />
                    } 
                />
                <Route path="/"               
                    element={
                      <ProtectedWrapper  
                        element={
                          <ScatterPage 
                            data={data} 
                            setData={setData}
                            logicFilteredData={logicFilteredData}
                            setLogicFilteredData={setLogicFilteredtData}
                            xField={xField}
                            setXField={setXField}
                            yField={yField}
                            setYField={setYField}
                            colorField={colorField}
                            setColorField={setColorField}
                            fields={fields}
                            fields_x={fields_x}
                            fields_y={fields_y}
                            save={ onSavePreset}  //savePresetSetters
                            load={load}
                            query={query}
                            setQuery={setQuery}
                            expression={expression}
                            setExpression={setExpression}
                            checkedSchools={checkedSchools}
                            setCheckedSchools={setCheckedSchools}
                            checkedClasses={checkedClasses}
                            setCheckedClasses={setCheckedClasses}
                            checkedOptions={checkedOptions}
                            setCheckedOptions={setCheckedOptions}
                            rangeOptions={rangeOptions}
                            setRangeOptions={setRangeOptions}
                            handleFileUpload={onFileUpload}
                            setConfigFromPreset={onSetConfigFromPreset}
                            showLines={showLines}
                            setShowLines={setShowLines}
                            handleResetToOnboarding={onResetToOnboardingRef.current}
                            handleResetToLatest={onResetToLatest}
                            isClassView={isClassView}
                            setIsClassView={setIsClassView}
                            aggregateType={aggregateType}
                            setAggregateType={setAggregateType}
                          />
                        } 
                      />
                    }
                />              
              </Routes>
            </div>
          </div>
      </Router> 
  );
};


export default App;