import React, { useState } from 'react';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';



const FilterRow = ({ fields, onAdd, onRemove, handleRangeChange, rangeValues }) => {
  const [logicField, setLogicField] = useState(null);
  const [subjectField, setSubjectField] = useState(null);
  const [range, setRange] = useState(rangeValues || [0, 100]);
  
  const handleSliderChange = (newRange) => {
    setRange(newRange);
  };


  const selectStyles = {    

    control: base => ({
      width: '150px',
    }),

  }

  const selectorContainerStyle = {
    borderStyle: 'none', // You can change this to 'dotted', 'dashed', 'double', etc.
    //width: '1200px', 
  };

  const sliderContainerStyle = {
    width: '400px', // Set the desired length of the slider here
  };

  return (
    <div className="filter-row" style={selectorContainerStyle}>
      <Select
        className="logic-field" 
        value={logicField ? { value: logicField, label: logicField } : null}
        options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }, { value: 'NOT', label: 'NOT' }]}
        onChange={option => setLogicField(option.value)}
        styles={selectStyles}
        placeholder="Logic..."
      />
      <Select
        className="subject-field"
        value={subjectField ? { value: subjectField, label: subjectField } : null}
        options={fields.map(field => ({ value: field, label: field }))}
        onChange={option => setSubjectField(option.value)}
        styles={selectStyles}
        placeholder="Subject...d"
      />
      <div style={sliderContainerStyle} >
        <Slider
          range
          min={rangeValues ? rangeValues[0] : 0}
          max={rangeValues ? rangeValues[1] : 100}
          value={range}
          onChange={handleSliderChange}
          styles={selectStyles}
        />
      </div>
      <button onClick={onAdd}>Add</button>
      <button onClick={onRemove}>Remove</button>
    </div>
  );
};

const FilterCanvas = ({ fields, handleRangeChange }) => {
  const [rows, setRows] = useState([0]);
  const handleAddRow = () => setRows([...rows, rows[rows.length - 1] + 1]);
  const handleRemoveRow = index => setRows(rows.filter(row => row !== index));

  return (
    <div className="filter-canvas">
      {rows.map(index => (
        <FilterRow
          key={index}
          fields={fields}
          onAdd={handleAddRow}
          onRemove={() => handleRemoveRow(index)}
          //handleRangeChange={handleRangeChange}
          rangeValues={null} // Set the rangeValues according to the subjectField.
        />
      ))}
    </div>
  );
};

export default FilterCanvas;
