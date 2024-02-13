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

  const trends = { all: 'all', overall_decline: 'overall decline',  logarithmic_decline: "logarithmicly decline", last_time_decline: 'last time decline'};
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [trend, setTrend] = useState(trends.all);
  const [isClassView, setIsClassView] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState([]);
  const [studentsChecked, setStudentsChecked] = useState(false);
  const [aggregateType, setAggregateType] = useState('box'); 
  const [schoolClassesAndColorScale, setSchoolClassesAndColorScale ]= useState({schoolClasses:{}, colorScale: {}});
  const [declineSlopeThreshold, setDeclineSlopeThreshold] = useState(0);
  const [diffThreshold, setDiffThreshold] = useState(0);
  const [dataToShow, setDataToShow] = useState([]);
  const [minDeclineThreshold, setMinDeclineThreshold] = useState(-1);

  console.log("checked schools:", props.checkedSchools);


  useEffect(() => {
    if (Object.keys(props.data).length > 0)
    {
      const newSchoolClasses = generateSchoolLastingClassMap(props.data);
      const newClassColorScale = generateSchoolClassColorScale(newSchoolClasses).classColor;
      setSchoolClassesAndColorScale({ schoolClasses: newSchoolClasses, colorScale: newClassColorScale});
    }
  }, [ props.data]);   

  useEffect(() => {
    if (Object.keys(props.logicFilteredData).length > 0)
    {
      setDataToShow(props.logicFilteredData);
    }
  }, [ props.logicFilteredData]);   
  

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

  const handleTrendOptionChange = (optionValue) => {
    setTrend(optionValue);
    const threshold = optionValue === trends.overall_decline? declineSlopeThreshold : diffThreshold;
    filterWithTrendThreshold(optionValue,  threshold);
  }

  const filterWithTrendThreshold = (optionValue, threshold) => {

    if(optionValue === trends.overall_decline){
      const linearDeclined = linearDeclinedData(props.logicFilteredData, threshold);
      setMinDeclineThreshold(linearDeclined.minSlope);
      setDataToShow(linearDeclined.data);
    }
    else if(optionValue === trends.logarithmic_decline){
      const logarithmicDeclined = logarithmicDeclinedData(props.logicFilteredData, threshold);
      setMinDeclineThreshold(logarithmicDeclined.minCoeff);
      setDataToShow(logarithmicDeclined.data);
    }
    else if(optionValue === trends.last_time_decline){
      const lastTimeDeclined = lastTimeDeclinedData(props.logicFilteredData, threshold);
      setMinDeclineThreshold(lastTimeDeclined.minDiff);
      setDataToShow(lastTimeDeclined.data);
    }
    else{
      setDataToShow(props.logicFilteredData);
    }   
  }

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

  const shownData = useMemo(() => {
      return checkedFilteredData(rangeFilteredData(schoolClassFilteredData(dataToShow,props.checkedClasses,props.checkedSchools)));
    }, [dataToShow, props.checkedOptions, props.rangeOptions, props.checkedSchools, props.checkedClasses]);  


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
        aggregateType = {aggregateType}
        setAggregateType = {setAggregateType}
        trendSet={trends}
        trend={trend}
        onTrendChange={handleTrendOptionChange}
        handleFileUpload={props.handleFileUpload}
        showLines={props.showLines}
        setShowLines={props.setShowLines}
        isClassView={isClassView}
        setIsClassView={setIsClassView}
        declineSlope={declineSlopeThreshold}
        setDeclineSlope={setDeclineSlopeThreshold}
        minDeclineThreshold={minDeclineThreshold}
        diffThreshold={diffThreshold}
        setDiffThreshold={setDiffThreshold}
        filterWithTrendThreshold={filterWithTrendThreshold}
      />

      {isClassView ?

        <AggregateCanvas
          shownData={shownData}
          xField={props.xField}
          yField={props.yField}
          colorField = {props.colorField}
          width={1000}
          height={700}    
          onPartClick={handlePartClick} 
          studentsChecked={studentsChecked}
          aggregateType = {aggregateType}
          classColors={schoolClassesAndColorScale.colorScale}
          checkedClasses={props.checkedClasses}
          showLines={props.showLines} 
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
        />

      }
      
      <DetailCanvas 
        data={isClassView? selectedClassDetail :selectedRecords} 
        keyList={isClassView? classKeyList : studentKeyList} />


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
        setLogicFilteredData={props.setLogicFilteredData}
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


function linearDeclinedData(data, declineSlopeThreshold) {
  // 1. Parse Testdatum to a numeric format (e.g., timestamp) if it's not already numeric
  const millisecondsPerDay = 86400000;
  data.forEach(d => {
      d.numericTestdatum = +new Date(d.Testdatum)/ millisecondsPerDay;
  });

  data = data.filter(d => d.numericTestdatum !== null && d['Lexplore Score'] !== null)

  // 2. Group data by ElevID
  const groupedData = d3.group(data, d => d.ElevID);

  // 3. For each group, calculate the slope of the regression line
  const declinedGroups = [];
  var minSlope = 0;  //-0.1
  groupedData.forEach((group, elevId) => {
      const x = group.map(d => d.numericTestdatum);
      const y = group.map(d => d['Lexplore Score']);
      const slope = calculateSlope(x, y);

      if (slope < minSlope) {
          minSlope = slope;
      }

      // If slope is negative, it indicates a decline
      if (slope < declineSlopeThreshold) {
          declinedGroups.push(group);
      }
  });

  // 4. Flatten the array of declined groups to get a single array of declined data records
  minSlope = parseFloat(minSlope.toFixed(2)) ;
  const declinedData = [].concat(...declinedGroups);

  return { data: declinedData,  minSlope: minSlope };
}


function logarithmicDeclinedData(data, declineCoeffThreshold) {
  // 1. Parse Testdatum to a numeric format if it's not already numeric
  const millisecondsPerDay = 86400000;
  data.forEach(d => {
    d.numericTestdatum = +new Date(d.Testdatum) / millisecondsPerDay;
  });

  data = data.filter(d => d.numericTestdatum !== null && d['Lexplore Score'] !== null)

  // 2. Group data by ElevID
  const groupedData = d3.group(data, d => d.ElevID);

  // 3. For each group, fit a logarithmic model and calculate its coefficient
  const declinedGroups = [];
  var minCoeff = 0;
  groupedData.forEach((group, elevId) => {
    const x = group.map(d => Math.log(d.numericTestdatum));
    const y = group.map(d => d['Lexplore Score']);
    const { coeffA, coeffB } = fitLogarithmicModel(x, y);

    if (coeffA < minCoeff) {
      minCoeff = coeffA;
    }

    // If coeffA is negative and below the threshold, it indicates a decline
    if (coeffA < declineCoeffThreshold) {
      declinedGroups.push(group);
    }
  });

  // 4. Flatten the array of declined groups to get a single array of declined data records
  minCoeff = parseFloat(minCoeff.toFixed(2));
  const declinedData = [].concat(...declinedGroups);

  return { data: declinedData, minCoeff: minCoeff };
}


function fitLogarithmicModel(x, y) {
  // Transform x values
  const lnX = x.map(value => Math.log(value));

  // Calculate means
  const meanX = lnX.reduce((acc, val) => acc + val, 0) / lnX.length;
  const meanY = y.reduce((acc, val) => acc + val, 0) / y.length;

  // Calculate coefficients a and b for the model y = a * log(x) + b
  let num = 0;
  let den = 0;
  for (let i = 0; i < lnX.length; i++) {
    num += (lnX[i] - meanX) * (y[i] - meanY);
    den += (lnX[i] - meanX) ** 2;
  }

  const coeffA = num / den;
  const coeffB = meanY - coeffA * meanX;

  return { coeffA, coeffB };
}


function lastTimeDeclinedData(data, diffThreshold) {
  data.forEach(d => {
      d.numericTestdatum = +new Date(d.Testdatum);
    });
  data = data.filter(d => d.numericTestdatum !== null && d['Lexplore Score'] !== null)

  const groupedData = d3.group(data, d => d.ElevID);

  const declinedGroups = [];
  var minDiff = 0;
  groupedData.forEach((group, elevId) => {
    const descendDatedGroup = group.sort((a, b) => b.numericTestdatum - a.numericTestdatum);
    if (descendDatedGroup.length >= 2 ) {
      const diff = descendDatedGroup[0]['Lexplore Score'] - descendDatedGroup[1]['Lexplore Score']
      if(diff < 0) 
      {
        if(diff < minDiff){ 
          minDiff = diff;
        }  
        if(diff < diffThreshold){
          declinedGroups.push(group)
        };
      } 
    }
  });

  const declinedData = [].concat(...declinedGroups);

  return { data: declinedData, minDiff: minDiff};

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