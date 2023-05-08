import React from 'react';
import Select from 'react-select';

const AxisSelectionCanvas = ({ fields, xField, yField, onXFieldChange, onYFieldChange }) => {
  const options = fields.map(field => ({ value: field, label: field }));

  return (
    <div className="axis-selection-canvas">
      <label htmlFor="x-field">X-field:</label>
      <Select
        id="x-field"
        value={{ value: xField, label: xField }}
        options={options}
        onChange={option => onXFieldChange(option.value)}
      />
      <label htmlFor="y-field">Y-field:</label>
      <Select
        id="y-field"
        value={{ value: yField, label: yField }}
        options={options}
        onChange={option => onYFieldChange(option.value)}
      />
    </div>
  );
};

export default AxisSelectionCanvas;
