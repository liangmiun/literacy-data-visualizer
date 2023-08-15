import React from 'react';
import Select from 'react-select';


const AxisSelectionCanvas = ({ fields, xField, yField, colorField, onXFieldChange, onYFieldChange,onColorFieldChange, isClassView,setIsClassView, save, load, setConfig  }) => {
  const options = fields.map(field => ({ value: field, label: field }));

  const onSavePreset = () => {  save()};
  const onLoadPreset= () => { load(setConfig)};
  const onSwitchView =  () => { setIsClassView()};
  
  return (
    <div className="axis-selection-canvas">

      <div className="axis-selects-row"  style={{ display: 'flex' }} >
        <div className="field-pair">
          <label htmlFor="x-field">X-field:</label>
          <Select
            id="x-field"
            value={{ value: xField, label: xField }}
            options={options}
            onChange={option => onXFieldChange(option.value)}
          />
        </div>

        <div className="field-pair">
          <label htmlFor="y-field">Y-field:</label>
          <Select
            id="y-field"
            value={{ value: yField, label: yField }}
            options={options}
            onChange={option => onYFieldChange(option.value)}
          />
        </div>

        <div className="field-pair">
          <label htmlFor="Colorfiled">Color:</label>      
          <Select
            id="color-field"
            value={{ value: colorField, label: colorField }}
            options={options}
            onChange={option => onColorFieldChange(option.value)}
          />
        </div>
      </div>

      <div className="preset-buttons-row" >
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
            Save Preset
          </button>

        <button 
          id="load-preset-btn"
          onClick={() => onLoadPreset()} // function to load a saved preset
        >
          Load Preset
        </button>
      </div>
    </div>
  
  );
};

export default AxisSelectionCanvas;
