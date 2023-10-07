import React   from 'react';
import Select from 'react-select';
import './AxisSelectionCanvas.css';


const AxisSelectionCanvas = ({ data, fields, xField, yField, colorField, 
  onXFieldChange, onYFieldChange,onColorFieldChange, isClassView,setIsClassView, 
  save, load, setConfig, studentsChecked, setStudentsChecked,
  showViolin, setShowViolin, showXField = true, showClassbar=false
}) => {
  const options = fields.map(field => ({ value: field, label: field }));
  const colorOptions = ['Skola','Årskurs', 'Läsår','Stanine'].map(field => ({ value: field, label: field }));
  
  const onSavePreset = () => {  save()};
  const onLoadPreset= () => { load(setConfig)};
  const onSwitchView =  () => { setIsClassView()};
  
  return (
    <div className="axis-selection-canvas">

      <div className="axis-selects-row"  style={{ display: 'flex' }} >
        {showXField && 
          <div className="field-pair">
            <label htmlFor="x-field">X-field:</label>
            <Select 
              id="x-field"
              value={{ value: xField, label: xField }}
              options={options}
              onChange={option => onXFieldChange(option.value)}
            />
          </div>
        }

        <div className="field-pair" >
          <label htmlFor="y-field">Y-field:</label>
          <Select
            id="y-field"
            value={{ value: yField, label: yField }}
            options={options}
            onChange={option => onYFieldChange(option.value)}
          />
        </div>

        <div className="field-pair">
          <label htmlFor="color-field">Color:</label>      
          <Select
            id="color-field"
            value={{ value: colorField, label: colorField }}
            options={colorOptions}
            onChange={option => onColorFieldChange(option.value)}
          />
        </div>

        <div className="preset-buttons-row" 
         style={{display: 'inline-flex',border: '1px solid lightgray', marginRight:'20px', padding:'10px' }}>

              <button className="btn"
                  
                  id="save-preset-btn"
                  //style={{ color: 'gray' }} 
                  onClick={() => onSavePreset()} // function to save current state as a preset
                >
                  Save Preset
                </button>

              <button className="btn"
                id="load-preset-btn"
                onClick={() => onLoadPreset()} // function to load a saved preset
              >
                Load Preset
              </button>

          </div>

          {showClassbar &&
            <div className='aggregate-buttons-row' 
              style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid lightgray',marginRight:'20px', padding:'10px' }}>
                <span className="text">Class Aggregation: </span>

                <button className="btn"
                id="show-violin-btn"
                onClick={() => setShowViolin(!showViolin)} 
                >
                  {showViolin ? "BoxPlot" : "ViolinPlot"}
                </button>

                <div  style={{ display: 'inline-block', marginLeft: '5%'}}>
                    <input 
                        type="checkbox" 
                        checked={studentsChecked} 
                        onChange={() => setStudentsChecked(!studentsChecked)} 
                    />
                    <label>Show Individuals </label>
                </div>
            
            </div>
          }

      </div>

      <div style={{display: 'inline-flex', marginLeft:'30px'}}>



      </div>

    </div>

    
  
  );
};

export default AxisSelectionCanvas;
