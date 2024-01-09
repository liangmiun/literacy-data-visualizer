import * as d3 from 'd3';
import React, { useState, useMemo, useEffect } from 'react';
import AxisSelectionCanvas from './components/AxisSelectionCanvas';
import AggregateCanvas from './components/AggregateCanvas';
import ScatterCanvas from './components/ScatterCanvas';
import DetailCanvas from './components/DetailCanvas';
import FilterCanvas from './components/FilterCanvas';
import LogicCanvas from './components/LogicCanvas';
import { generateClassId, generateSchoolLastingClassMap, generateSchoolClassColorScale} from './Utils.js';
import './App.css';


const ScatterPage = (props ) => {  

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isDeclined, setIsDeclined] = useState(false);
  const [isClassView, setIsClassView] = useState(false);
  const [viewSwitchCount, setViewSwitchCount] = useState(0);
  const [selectedClassDetail, setSelectedClassDetail] = useState([]);
  const [studentsChecked, setStudentsChecked] = useState(false);
  const [showViolin, setShowViolin] = useState(false);
  const [schoolClassesAndColorScale, setSchoolClassesAndColorScale ]= useState({schoolClasses:{}, colorScale: {}});


  useEffect(() => {
    if (Object.keys(props.data).length > 0)
    {
      const newSchoolClasses = generateSchoolLastingClassMap(props.data);
      const newClassColorScale = generateSchoolClassColorScale(newSchoolClasses).classColor;
      setSchoolClassesAndColorScale({ schoolClasses: newSchoolClasses, colorScale: newClassColorScale});
    }
  }, [props.data]);  
  

  const handlePartClick = (details) => {
    setSelectedClassDetail(details);
  };

  const handleClassColorPaletteClick= (school, classID, newColor) => {
    setSchoolClassesAndColorScale(prevState => {
      // Extracting the current state of schoolClasses and colorScale
      const { schoolClasses, colorScale } = prevState;
      const prevClasses = colorScale[school] || {};
      const updatedClasses = { ...prevClasses, [classID]: newColor };   
      // Returning the new state with the updated colorScale and unchanged schoolClasses
      return {
        schoolClasses: schoolClasses, // keeping the existing schoolClasses unchanged
        colorScale: { ...colorScale, [school]: updatedClasses } // updating the colorScale
      };
    });
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
        for (let key in props.checkedOptions) {
            if ( filterList.includes(key) && ! props.checkedOptions[key].includes(record[key])) {
                return false;
            }
        }
        return true;
    });
  }


  function rangeFilteredData(data) {
    return data.filter(record => {
        for (let key in props.rangeOptions) {
          const [min, max] = props.rangeOptions[key];
          if ( filterList.includes(key)  && !(record[key] >= min && record[key] <= max)) {
              return false;
          }
        }
        return true;
    });
  }

  const dataToShow = isDeclined ? DeclinedData(props.filteredData) : props.filteredData;
  const shownData = useMemo(() => {      
      return checkedFilteredData(rangeFilteredData(schoolClassFilteredData(dataToShow,props.checkedClasses,props.checkedSchools)));
    }, [dataToShow, props.checkedOptions, props.rangeOptions, props.checkedSchools, props.checkedClasses]);  
 

  //const handlePointClick = (event,record) => setSelectedRecords([record]);   


  return (   
    <div className="app" >  
      <AxisSelectionCanvas
        data={props.data}
        fields={props.fields}
        xField={props.xField}
        yField={props.yField}
        colorField = {props.colorField}
        onXFieldChange={props.setXField}
        onYFieldChange={props.setYField}
        onColorFieldChange={props.setColorField}
        save = {props.save}
        load = {props.load}
        setConfig = {props.setConfigFromPreset}
        studentsChecked = {studentsChecked}
        setStudentsChecked = {setStudentsChecked}
        showViolin = {showViolin}
        setShowViolin = {setShowViolin}
        isDeclined={isDeclined}
        setIsDeclined={setIsDeclined}
        handleFileUpload={props.handleFileUpload}
        showLines={props.showLines}
        setShowLines={props.setShowLines}
        isClassView={isClassView}
        setIsClassView={setIsClassView}
        viewSwitchCount={viewSwitchCount}
        setViewSwitchCount={setViewSwitchCount}
      />

      {isClassView ?

        <AggregateCanvas
        filteredData={shownData}
        xField={props.xField}
        yField={props.yField}
        colorField = {props.colorField}
        width={1000}
        height={700}    
        onPartClick={handlePartClick} 
        studentsChecked={studentsChecked}
        showViolin={showViolin}
        classColors={schoolClassesAndColorScale.colorScale}
        checkedClasses={props.checkedClasses}
        />
        :
        <ScatterCanvas
          shownData={shownData}
          xField={props.xField}
          yField={props.yField}
          colorField = {props.colorField}
          width= {1000}
          height={800}
          setSelectedRecords={setSelectedRecords}
          showLines={props.showLines} 
          viewSwitchCount={viewSwitchCount}
          
        />

      }
      
      <DetailCanvas data={isClassView? selectedClassDetail :selectedRecords} keyList={isClassView? classKeyList : studentKeyList} />


      <FilterCanvas 
        data={props.data}
        fields={props.fields.filter(field => field !== 'StudentID')} 
        checkedSchools={props.checkedSchools}
        setCheckedSchools={props.setCheckedSchools}
        checkedClasses={props.checkedClasses}
        setCheckedClasses={props.setCheckedClasses}
        rangeOptions={props.rangeOptions}
        setRangeOptions={props.setRangeOptions}
        checkedOptions={props.checkedOptions}
        setCheckedOptions={props.setCheckedOptions}
        setFilterList=  {setFilterList}
        isClassView={isClassView}
        school_class={schoolClassesAndColorScale.schoolClasses}
        onColorPaletteClick={handleClassColorPaletteClick}
        classColors = {schoolClassesAndColorScale.colorScale}
      />   

      <LogicCanvas  
        fields={props.fields} 
        data ={props.data}
        setFilteredData={props.setFilteredData}
        expression={props.expression}
        setExpression={props.setExpression}
        query={props.query}
        setQuery={props.setQuery}
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