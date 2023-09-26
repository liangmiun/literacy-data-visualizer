import React from 'react';
import 'rc-slider/assets/index.css';
import SchoolTreeView from './SchoolTreeView';
import {OptionSelectGroup } from './ValueSelect';


const FilterCanvas = ({ data, setFilterList, checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses, rangeOptions,setRangeOptions,checkedOptions, setCheckedOptions }) => {


  return (

    <div  className='filter-canvas'>
      <h2>Filter by School and Class</h2>
      
      {/* Detail Component */}
      <div style={{ margin: '20px 0' }}>
        <p>School: {checkedSchools.join(', ')}</p>
        <p>Class: {checkedClasses.join(', ')}</p>
        <p>Checked:
          {Object.entries(checkedOptions).map(([key, values]) => {
              if (values.length > 0) {
                  return <span key={key}><br />{key}: {values.join(', ')}</span>;
              }
              return null;
          })}
        </p>
        <p>Range:
          {Object.entries(rangeOptions).map(([key, values]) => {
              if (values.length > 0) {
                  return <span key={key}><br />{key}: {values.join(', ')}</span>;
              }
              return null;
          })} 
        </p> 
        <p>SchoolClass: {[...checkedSchools, ...checkedClasses].join(', ') }</p>
      </div>


      <SchoolTreeView
        data={data} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
      />

      <OptionSelectGroup data={data} 
        setFilterList={setFilterList}      
        checkedOptions={checkedOptions} setCheckedOptions={setCheckedOptions}   rangeOptions={rangeOptions}  setRangeOptions={setRangeOptions} />


    </div>
  );
};

export default FilterCanvas;
