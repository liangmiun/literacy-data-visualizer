import * as d3 from 'd3';
import React, { useState, useMemo } from 'react';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import AggregateCanvas from './components/AggregateCanvas';
import ScatterCanvas from './components/ScatterCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import LogicCanvas from './components/LogicCanvas';
import { generateClassId } from './Utils.js';
import './App.css';


const ScatterPage = ({
  data,
  xField,
  setXField,
  yField,
  setYField,
  colorField,
  setColorField,
  fields,
  checkedSchools,
  setCheckedSchools,
  checkedClasses,
  setCheckedClasses,
  checkedOptions,
  setCheckedOptions,
  rangeOptions,
  setRangeOptions,
  filteredData,
  setFilteredData,
  save,
  load,
  expression,
  setExpression,
  query,
  setQuery,
  setConfigFromPreset,
  handleFileUpload,
  showLines,
  setShowLines
} ) => {  

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isDeclined, setIsDeclined] = useState(false);
  const [isClassView, setIsClassView] = useState(false);
  const [viewSwitchCount, setViewSwitchCount] = useState(0);
  const [selectedClassDetail, setSelectedClassDetail] = useState([]);


  const handlePartClick = (details) => {
    setSelectedClassDetail(details);
  };


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

  const classKeyList =
  [
    'lastingclass',
    'class',
    'season',
    'min',
    'q1',
    'median',
    'q3',
    'max',
    'count'
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
 

  //const handlePointClick = (event,record) => setSelectedRecords([record]);   


  return (   
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
        isDeclined={isDeclined}
        setIsDeclined={setIsDeclined}
        handleFileUpload={handleFileUpload}
        showLines={showLines}
        setShowLines={setShowLines}
        isClassView={isClassView}
        setIsClassView={setIsClassView}
        viewSwitchCount={viewSwitchCount}
        setViewSwitchCount={setViewSwitchCount}
      />

      {isClassView ?

        <AggregateCanvas
        filteredData={shownData}
        xField={xField}
        yField={yField}
        colorField = {colorField}
        width={1000}
        height={700}    
        onPartClick={handlePartClick} 
        // studentsChecked={studentsChecked}
        // showViolin={showViolin}
        />
        :
        <ScatterCanvas
          shownData={shownData}
          xField={xField}
          yField={yField}
          colorField = {colorField}
          width= {1000}
          height={800}
          setSelectedRecords={setSelectedRecords}
          showLines={showLines} 
          viewSwitchCount={viewSwitchCount}
          
        />

      }
      
      <DetailCanvas data={isClassView? selectedClassDetail :selectedRecords} keyList={isClassView? classKeyList : studentKeyList} />


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
        setFilteredData={setFilteredData}
        expression={expression}
        setExpression={setExpression}
        query={query}
        setQuery={setQuery}
      /> 
      
    </div>
  );
};


export function schoolClassFilteredData(data,checkedClasses,checkedSchools) {
  return data.filter(record => {
      // Check if the school of the record is in checkedSchools
      if (checkedSchools.includes(record.Skola)) {
          return true;
      }

      // Construct the school.class string from the record
      const schoolClassCombo = `${record.Skola}.${generateClassId(record)}`;
      // Check if this combo is in checkedClasses
      if (checkedClasses.includes(schoolClassCombo)) {
          return true;
      }

      // If none of the above conditions are met, exclude this record
      return false;
  } );    
}

function DeclinedData(data) {
  // 1. Parse Testdatum to a numeric format (e.g., timestamp) if it's not already numeric
  data.forEach(d => {
      d.numericTestdatum = +new Date(d.Testdatum);
  });

  data = data.filter(d => d.numericTestdatum !== null && d['Lexplore Score'] !== null)

  // 2. Group data by ElevID
  const groupedData = d3.group(data, d => d.ElevID);

  // 3. For each group, calculate the slope of the regression line
  const declinedGroups = [];
  groupedData.forEach((group, elevId) => {
      const x = group.map(d => d.numericTestdatum);
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

function calculateSlope(x, y) {
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumXX = d3.sum(x.map(xi => xi * xi));

  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}


export default ScatterPage;