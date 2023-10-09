import React, { useState, useEffect,useMemo } from 'react';
import { csv, csvParse } from 'd3';
import * as d3 from 'd3';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import ScatterCanvas from './components/ScatterCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import LogicCanvas from './components/LogicCanvas';
import './App.css';


export function schoolClassFilteredData(data,checkedClasses,checkedSchools) {
  return data.filter(record => {
      // Check if the school of the record is in checkedSchools
      if (checkedSchools.includes(record.Skola)) {
          return true;
      }

      // Construct the school.class string from the record
      const schoolClassCombo = `${record.Skola}.${record.Klass}`;
      // Check if this combo is in checkedClasses
      if (checkedClasses.includes(schoolClassCombo)) {
          return true;
      }

      // If none of the above conditions are met, exclude this record
      return false;
  } );    
}

const ScatterPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredtData] = useState(data);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isDeclined, setIsDeclined] = useState(false);
  const [xField, setXField] = useState('Testdatum');
  const [yField, setYField] = useState('Lexplore Score');
  const [colorField, setColorField] = useState('Årskurs');
  const fields = Object.keys(data[0] || {});

  const [query, setQuery] = useState('');
  const [expression, setExpression] = useState('');
  const [checkedSchools, setCheckedSchools] = useState([]);
  const [checkedClasses, setCheckedClasses] = useState([]);
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

  const studentKeyList = 
    ['Skola',
    'Årskurs',
    'Klass',
    'ElevID',
    'Födelsedatum',
    'Läsår',
    'Testdatum',
    'Standardpoäng',
    'Lexplore Score'
    ];

  const [filterList, setFilterList] = useState([]);


  function checkedFilteredData(data) {
    return data.filter(record => {
        for (let key in checkedOptions) {
            if ( filterList.includes(key) && ! checkedOptions[key].includes(record[key])) {
                return false;
            }
        }
        return true;
    });
  }


  function rangeFilteredData(data) {
    return data.filter(record => {
        for (let key in rangeOptions) {
          const [min, max] = rangeOptions[key];
          if ( filterList.includes(key)  && !(record[key] >= min && record[key] <= max)) {
              return false;
          }
        }
        return true;
    });
  }

  const dataToShow = isDeclined ? DeclinedData(filteredData) : filteredData;
  const shownData = useMemo(() => {      
      return checkedFilteredData(rangeFilteredData(schoolClassFilteredData(dataToShow,checkedClasses,checkedSchools)));
    }, [dataToShow, checkedOptions, rangeOptions, checkedSchools, checkedClasses]);  


  const preset_dict = {
    xField: '',
    yField: '',
    colorField: '',
    checkedSchools: [],
    checkedClasses: [],
    checkedOptions: {},
    rangeOptions: {},
    query: '',
    expression: []
  };

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
  }

  const save = () => {
    updatePreset();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset_dict));
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

  const load = (callback) => {
    const uploadInputNode = document.createElement('input');
    uploadInputNode.setAttribute("type", "file");
    uploadInputNode.setAttribute("accept", "application/json");
  
    uploadInputNode.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const loadedConfig = JSON.parse(content);
        callback(loadedConfig);
      };
  
      reader.readAsText(file);
    };
  
    document.body.appendChild(uploadInputNode);
    uploadInputNode.click();
    uploadInputNode.remove();
  };

  //  D3.v4 version:
  useEffect(() => {
    csv('/LiteracySample.csv', rowParser).then(setData)
    }, []);

  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target.result;
        const parsedData = await csvParse(csvData, rowParser);
        setData(parsedData);
        setFilteredtData(parsedData);
      };
      reader.readAsText(file);      
      //csv(file, rowParser).then(setData);
    }
  };


  const handlePointClick = (event,record) => setSelectedRecords([record]);   


  // Function to update data
  const updateData = (newData) => {
    setData(newData);
  }



  return (   
    <div>    
    <div className="app" >  
      <AxisSelectionCanvas
        data={data}
        fields={fields}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        onXFieldChange={setXField}
        onYFieldChange={setYField}
        onColorFieldChange={setColorField}
        save = {save}
        load = {load}
        setConfig = {setConfigFromPreset}
        updateData={updateData}
        isDeclined={isDeclined}
        setIsDeclined={setIsDeclined}
        handleFileUpload={handleFileUpload}
      />
      <ScatterCanvas
        shownData={shownData}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width= {1000}
        height={700}
        setSelectedRecords={setSelectedRecords}   
      />

      
      <DetailCanvas data={selectedRecords} keyList={studentKeyList} />


      <FilterCanvas 
        data={data}
        fields={fields.filter(field => field !== 'StudentID')} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
        rangeOptions={rangeOptions}
        setRangeOptions={setRangeOptions}
        checkedOptions={checkedOptions}
        setCheckedOptions={setCheckedOptions}
        setFilterList=  {setFilterList}
      />   

      <LogicCanvas  
        fields={fields} 
        data ={data}
        setFilteredData={setFilteredtData}
        expression={expression}
        setExpression={setExpression}
        query={query}
        setQuery={setQuery}
      /> 
      
    </div>
    </div>
  );
};

const parseDate = d3.timeParse('%y%m%d');


function rowParser(d) {


    // Initialize an empty object to hold the parsed fields
    const parsedRow = {};

    // Manually parse each field
    for (let field in d) {
      if (field === 'Skola' || field === 'Klass' || field === 'Läsår') {
        parsedRow[field] = String(d[field]);
      } else if (field === 'Födelsedatum' || field === 'Testdatum') {
        parsedRow[field] = parseDate(d[field]);
      } else if (field === 'Årskurs' || field === 'Läsnivå (5 = hög)') {
        parsedRow[field] = parseInt(d[field], 10);	
      }
      else {
        parsedRow[field] = d3.autoType({ [field]: d[field] })[field];
      }
    }


  return parsedRow;
}


function calculateSlope(x, y) {
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumXX = d3.sum(x.map(xi => xi * xi));

  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

function DeclinedData(data) {
  // 1. Parse Testdatum to a numeric format (e.g., timestamp) if it's not already numeric
  data.forEach(d => {
      d.Testdatum = +new Date(d.Testdatum);
  });

  data = data.filter(d => d.Testdatum !== null && d['Lexplore Score'] !== null)

  // 2. Group data by ElevID
  const groupedData = d3.group(data, d => d.ElevID);

  // 3. For each group, calculate the slope of the regression line
  const declinedGroups = [];
  groupedData.forEach((group, elevId) => {
      const x = group.map(d => d.Testdatum);
      const y = group.map(d => d['Lexplore Score']);
      const slope = calculateSlope(x, y);

      // If slope is negative, it indicates a decline
      if (slope < 0) {
          declinedGroups.push(group);
      }
  });

  // 4. Flatten the array of declined groups to get a single array of declined data records
  const declinedData = [].concat(...declinedGroups);

  return declinedData;
}







export default ScatterPage;