import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';
import { csvParse } from 'd3';
import CryptoJS from 'crypto-js';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { rowParser, preset_dict, load, data_fields, y_data_fields} from './Utils.js';
import About from './About';
import ScatterPage from './ScatterPage';
import { useAuth } from './authentications/AuthContext';
import ProtectedWrapper from './authentications/ProtectedWrapper';
import Login from './authentications/Login';
import Logout from './authentications/Logout';
import {initial_preset, updateLatestPreset, latest_preset}  from './InitialPreset.js';


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



  const updatePreset = () => {
    preset_dict.xField = xField;
    preset_dict.yField = yField;
    preset_dict.colorField = colorField;
    preset_dict.checkedSchools = checkedSchools;
    preset_dict.checkedClasses = checkedClasses;
    preset_dict.checkedOptions = checkedOptions;
    preset_dict.rangeOptions = rangeOptions;
    preset_dict.query = query;
    preset_dict.expression = expression;
    preset_dict.isClassView = isClassView;
    preset_dict.showLines = showLines;
    preset_dict.aggregateType = aggregateType;
  }
  

  const setConfigFromPreset = (preset) => {
    setXField( preset.xField);
    setYField( preset.yField);
    setColorField( preset.colorField);
    setCheckedSchools( preset.checkedSchools);
    setCheckedClasses( preset.checkedClasses);
    setCheckedOptions( preset.checkedOptions);
    setRangeOptions( preset.rangeOptions);
    setQuery( preset.query);
    setExpression( preset.expression);
    setIsClassView( preset.isClassView);
    setShowLines( preset.showLines);
    setAggregateType( preset.aggregateType);
  }


  const save = () => {
    updatePreset();
    const stringified = JSON.stringify(preset_dict);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(stringified);
    updateLatestPreset(stringified);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
  
    // Ask the user for the filename
    const fileName = prompt("Please enter the desired filename", "preset_config.json");
    
    // If user clicks "Cancel" on the prompt, fileName will be null. In that case, don't proceed with the download.
    if (fileName) {
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
  };


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target.result;
        const parsedData = await csvParse(csvData, rowParser);
        setData(parsedData);
        setLogicFilteredtData(parsedData);
      };
      reader.readAsText(file);     
    }
  };


  const handleResetToOnboarding = () => {
    handleResetToTarget(initial_preset);
  }


  const handleResetToLatest = () => { 
    handleResetToTarget(latest_preset);
  }


  const handleResetToTarget = (preset) => { 
    let parsed = JSON.parse(preset, (key, value) => { 
      if (key === "Födelsedatum" || key === "Testdatum") return value.map(v => new Date(v));
      console.log("reset to target key", key, "value", value);
      return value;
    });
    setConfigFromPreset(parsed);
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
      handleResetToOnboarding();     

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
                            save={save}
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
                            handleFileUpload={handleFileUpload}
                            setConfigFromPreset={setConfigFromPreset}
                            showLines={showLines}
                            setShowLines={setShowLines}
                            handleResetToOnboarding={handleResetToOnboarding}
                            handleResetToLatest={handleResetToLatest}
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


export function generateSchoolClassColorScale(schoolClasses) {

  const classColorScaleMap = {};
  const colors = d3.schemeCategory10;
  const brighterColors = colors.map(color => d3.color(color).brighter(1).toString());
  const Colors20 = colors.concat(brighterColors);

  for(const school in schoolClasses){
    const classsIDs = Object.keys(schoolClasses[school]);
    const classColorScale = classsIDs.reduce((acc, classID, index) => {
      acc[classID] = Colors20[index % 20];
      return acc;
    }, {});
    classColorScaleMap[school] = classColorScale;
  }


  const schools = Object.keys(schoolClasses);
  const schoolColorScale = d3.scaleOrdinal()
  .domain(schools)
  .range(schools.map(d => Colors20[schools.indexOf(d) % 20]));

  return { schoolColor: schoolColorScale, classColor: classColorScaleMap };
}


export default App;