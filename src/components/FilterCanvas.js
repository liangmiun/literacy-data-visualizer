import React from 'react';
import 'rc-slider/assets/index.css';
import SchoolTreeView from './SchoolTreeView';
import {SliderGroup, AgeCheckGroup } from './ValueSelect';


const FilterCanvas = ({ data, checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses, weightSegments,setWeightSegments,checkedAges, setCheckedAges }) => {


  return (

    <div  className='filter-canvas'>
      <h2>Filter by School and Class</h2>
      
      {/* Detail Component */}
      <div style={{ margin: '20px 0' }}>
        <p>School: {checkedSchools.join(', ')}</p>
        <p>Class: {checkedClasses.join(', ')}</p>
        <p>Weight Range: {weightSegments.map(segment => `${segment[0]} to ${segment[1]}`).join(', ')}</p>
        <p>Age: {checkedAges.join(', ')}</p>
        <p>SchoolClass: {[...checkedSchools, ...checkedClasses].join(', ') }</p>
      </div>


      <SchoolTreeView
        data={data} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
      />


      {/* Age Component */}
      <AgeCheckGroup checkedAges={checkedAges} setCheckedAges={setCheckedAges} />


      {/* Weight Component */}
      <SliderGroup weightSegments={weightSegments} setWeightSegments={setWeightSegments} />



    </div>
  );
};

export default FilterCanvas;
