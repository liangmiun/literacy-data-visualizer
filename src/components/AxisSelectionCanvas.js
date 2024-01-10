import React , {useState}  from 'react';
import Select from 'react-select';
import { Slider } from '@mui/material';
import './AxisSelectionCanvas.css';

const AxisSelectionCanvas = (props) => {
  const options = props.fields.map(field => ({ value: field, label: field }));
  const colorOptions = ['Skola','Årskurs', 'Läsår','Stanine'].map(field => ({ value: field, label: field }));  
  const onSavePreset = () => {  props.save()};
  const onLoadPreset= () => { props.load(props.setConfig)};


  const ImportDataButton = ({handleFileUpload}) => (
    <button>
      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} id="fileUpload" />
      <label htmlFor="fileUpload" className="import-button">Import Data</label>
    </button>
  );
  
  return (
    <div className="axis-selection-canvas" >

      <div className="axis-selects-row"  style={{ display: 'flex' }} >

        <div className="field-pair"  >
          <label htmlFor="x-field">X-field:</label>
          <Select 
            isDisabled = {props.isClassView} 
            id="x-field"
            value={{ value: props.xField, label: props.xField }}
            options={options}
            onChange={option => props.onXFieldChange(option.value)}
          />
        </div>       

        <div className="field-pair" >
          <label htmlFor="y-field">Y-field:</label>
          <Select
            id="y-field"
            value={{ value: props.yField, label: props.yField }}
            options={options}
            onChange={option => props.onYFieldChange(option.value)}
          />
        </div>

        <div className="field-pair">
          <label htmlFor="color-field">Color:</label>      
          <Select
            isDisabled = {props.isClassView}
            id="color-field"
            value={{ value: props.colorField, label: props.colorField }}
            options={colorOptions}
            onChange={option => props.onColorFieldChange(option.value)}
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

              <ImportDataButton  handleFileUpload={props.handleFileUpload} />  

        </div>

        <div className='check-boxes'  style={{ display: 'inline-flex', alignItems: 'center', fontSize: '12px' }}>
          <div  style={{ display: 'inline-flex', marginLeft: '1%',  border: '1px solid lightgray'}}>
                  <input 
                      type="checkbox" 
                      checked = {props.isDeclined}
                      onChange={() => props.setIsDeclined(!props.isDeclined)} 
                  />
                  <label><br/>Only declining score </label>
                  <RegressSlopeSlider 
                    isDisabled = {!props.isDeclined}
                    setSlope={props.setDeclineSlope}
                    minDeclineSlope={props.minDeclineSlope}                    
                  />
          </div>
          <div  style={{ display: 'inline-flex', marginLeft: '1%'}}>
                  <input 
                      type="checkbox" 
                      checked = {props.showLines}
                      onChange={() => props.setShowLines(!props.showLines)} 
                  />
                  <label><br/>Show lines </label>
          </div>
          <div  style={{ display: 'inline-flex', marginLeft: '1%',  border: '1px solid lightgray'}}>
                  <input 
                      type="checkbox" 
                      checked = {props.isClassView}
                      onChange={() => {props.setIsClassView(!props.isClassView); }}   
                  />
                  <label><br/>Class View </label>
                  {props.isClassView &&
                    <div className='aggregate-buttons-row' 
                      style={{ display: 'inline-flex', alignItems: 'center',marginRight:'20px', padding:'10px' }}>

                        <button className="btn"
                        id="show-violin-btn"
                        onClick={() => props.setShowViolin(!props.showViolin)} 
                        >
                          {props.showViolin ? "BoxPlot" : "ViolinPlot"}
                        </button>

                        <div  style={{ display: 'inline-block', marginLeft: '5%'}}>
                            <input 
                                type="checkbox" 
                                checked={props.studentsChecked} 
                                onChange={() => props.setStudentsChecked(!props.studentsChecked)}
                            />
                            <label>Show Individuals </label>
                        </div>
                    
                    </div>
                  }
          </div>
        </div>



      </div>

    </div>

    
  
  );
};


function RegressSlopeSlider({ setSlope, isDisabled, minDeclineSlope }) {
  const label = 'Slope';
  const max = 0;
  const min = minDeclineSlope;
  const handleSlopeChange = (event, newValue) => {
      setSlope(newValue);      
  };

  return (
      <div style={{ margin: '5px 10px', width: '80%' }}>
          {label}:
          <Slider
              disabled = {isDisabled}
              size="small"
              step={0.01}
              defaultValue={max}
              min={min}
              max={max}
              valueLabelDisplay="auto"
              onChange={handleSlopeChange}
          />
      </div>
  );
}

export default AxisSelectionCanvas;
