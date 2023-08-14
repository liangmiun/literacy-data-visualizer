import React from 'react';
import Select from 'react-select';
import { save } from './Preset';  

const AxisSelectionCanvas = ({ fields, xField, yField, colorField, onXFieldChange, onYFieldChange,onColorFieldChange, isClassView,setIsClassView  }) => {
  const options = fields.map(field => ({ value: field, label: field }));

  const onSavePreset = () => {  save()};
  const onLoadPreset= () => {};
  const onSwitchView =  () => { setIsClassView()};
  
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
      <label htmlFor="Colorfiled">Color:</label>
      <Select
        id="color-field"
        value={{ value: colorField, label: colorField }}
        options={options}
        onChange={option => onColorFieldChange(option.value)}
      />

      <button 
          id="switch-class-student-view-btn"
          onClick={() => onSwitchView()} // function to switch between class or student view.
        >
          {isClassView ?  'Student View': 'Class View' }
        </button>

      <button 
          id="save-preset-btn"
          //style={{ color: 'gray' }} 
          onClick={() => onSavePreset()} // function to save current state as a preset
        >
          Save Preset As
        </button>

      <button 
        id="load-preset-btn"
        style={{ color: 'gray' }} 
        onClick={() => onLoadPreset()} // function to load a saved preset
      >
        Load Preset
      </button>
    </div>
  );
};

export default AxisSelectionCanvas;
