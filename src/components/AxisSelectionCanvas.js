import React , { useState} from 'react';
import Select from 'react-select';


const AxisSelectionCanvas = ({ data, fields, xField, yField, colorField, 
  onXFieldChange, onYFieldChange,onColorFieldChange, isClassView,setIsClassView, 
  save, load, setConfig, studentsChecked, setStudentsChecked,
  showViolin, setShowViolin, setFilteredData
}) => {
  const options = fields.map(field => ({ value: field, label: field }));
  const uniqueSkolaValues = [...new Set(data.map(record => record.Skola))];
  const skolaOptions = uniqueSkolaValues.map(skola => ({ value: skola, label: skola }));

  const onSavePreset = () => {  save()};
  const onLoadPreset= () => { load(setConfig)};
  const onSwitchView =  () => { setIsClassView()};
  const onSelectSchool = (optionValue) => {
      const selectedSchool = optionValue;
      const students = data.filter(d => d.Skola === selectedSchool);
      setFilteredData(students);
    }

 
  const [selectedSchool, setSelectedSchool] = useState('');
  
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
        <button 
          id="select-school-btn"
        >
          Select School
        </button>

        <button 
          id="show-violin-btn"
          onClick={() => setShowViolin(!showViolin)} 
        >
          ViolinPlot
        </button>

        <button 
          id="show-box-btn"
        >
          BoxPlot
        </button>

        <div>
            <input 
                type="checkbox" 
                checked={studentsChecked} 
                onChange={() => setStudentsChecked(!studentsChecked)} 
            />
            <label>Show Students</label>
        </div>


        <div className="field-pair">
          <label htmlFor="select-school">Select School:</label>
          <Select
            id="select-school"
            value={{ value: selectedSchool, label: selectedSchool }}
            options={skolaOptions}
            onChange={option => onSelectSchool(option.value)}
          />
        </div>



      </div>
    </div>
  
  );
};

export default AxisSelectionCanvas;
