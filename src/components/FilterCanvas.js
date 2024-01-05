import React from 'react';
import 'rc-slider/assets/index.css';
import SchoolTreeView from './SchoolTreeView';
import {OptionSelectGroup } from './ValueSelect';
import '../App.css';


const FilterCanvas = ({ data, setFilterList, checkedSchools,setCheckedSchools,checkedClasses,setCheckedClasses,
   rangeOptions,setRangeOptions,checkedOptions, setCheckedOptions, showOptionFilter=true, isAggregatedView=false, school_class }) => {


  return (

    <div  className='filter-canvas'>      

      <SchoolTreeView  className='school-tree-view' 
        data={data} 
        checkedSchools={checkedSchools}
        setCheckedSchools={setCheckedSchools}
        checkedClasses={checkedClasses}
        setCheckedClasses={setCheckedClasses}
        isAggregatedView={isAggregatedView}
        school_class={school_class}
      />

      { showOptionFilter &&
        <OptionSelectGroup className='option-select-group' 
          data={data} 
          setFilterList={setFilterList}      
          checkedOptions={checkedOptions} setCheckedOptions={setCheckedOptions}   rangeOptions={rangeOptions}  setRangeOptions={setRangeOptions} />
      }

    </div>
  );
};

export default FilterCanvas;
