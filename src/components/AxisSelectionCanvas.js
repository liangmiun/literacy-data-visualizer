import React from 'react';
import Select from 'react-select';
import { Slider } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import './AxisSelectionCanvas.css';

const AxisSelectionCanvas = (props) => {
  const options = props.fields.map(field => ({ value: field, label: field }));
  const colorOptions = ['Skola','Årskurs', 'Läsår','Stanine'].map(field => ({ value: field, label: field }));  
  const onSavePreset = () => {  props.save()};
  const onLoadPreset= () => { props.load(props.setConfig)};
  const trendOptions = Object.entries(props.trendSet).map(([key, value]) => ({ value: value, label: value }));

  const ImportDataButton = ({handleFileUpload}) => (
    <button className="btn">
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
         style={{display: 'inline-flex',border: '1px solid lightgray', padding:'5px' }}>

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

        <div className="trend-bar" style={{ display: 'inline-flex', marginLeft: '1%',  border: '1px solid lightgray', padding:"5px"}}>
                  <div  style={{ width: '180px' }}>
                    <label htmlFor="trend">Trend:</label>
                    <Select
                      id="trend"
                      defaultInputValue= {props.trend}
                      options={trendOptions}
                      onChange={option => props.onTrendChange(option.value)}
                    />
                  </div>
                 
                 <div style={{ width: '120px' }}>
                  <DeclineThresholdSlider 
                    trend = {props.trend}
                    isDisabled = {props.trend === props.trendSet.all}
                    setThreshold={props.trend === props.trendSet.overall_decline? props.setDeclineSlope : props.setDiffThreshold}
                    minThreshold={props.minDeclineThreshold}
                    label={props.trend === props.trendSet.all? "  " :  props.trend === props.trendSet.overall_decline? 'with slope <' : 'with value <'} 
                    filterWithTrendThreshold = {props.filterWithTrendThreshold}                    
                  />
                </div>
          </div>

        <div className ="show-lines"  style={{ display: 'inline-flex', marginLeft: '1%'}}>
                <input 
                    type="checkbox" 
                    checked = {props.showLines}
                    onChange={() => props.setShowLines(!props.showLines)} 
                />
                <label><br/>Show lines </label>
        </div>

        <div className = "show-class-view" style={{ display: 'inline-flex', marginLeft: '1%',  border: '1px solid lightgray'}}>
                <input 
                    type="checkbox" 
                    checked = {props.isClassView}
                    onChange={() => {props.setIsClassView(!props.isClassView); }}   
                    style={{  marginLeft: '5%'}}
                />
                <label><br/>Class View </label>
                {props.isClassView &&
                  <div className='aggregate-buttons-row' 
                    style={{ display: 'inline-flex', alignItems: 'center',marginRight:'20px', padding:'2px' }}>

                      <FormControl  style={{fontSize:'12px'}}>
                        <RadioGroup                          
                          aria-labelledby="demo-controlled-radio-buttons-group"
                          name="controlled-radio-buttons-group"
                          value= {props.aggregateType}
                          onChange={(event)=> props.setAggregateType(event.target.value)}
                        >
                          <FormControlLabel value="box" control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 12}}}/>}  label={<div style={{fontSize:12}}> Box </div>} />
                          <FormControlLabel value="violin" control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 12}}}/>} label={<div style={{fontSize:12}}> Violin </div>}  />
                          <FormControlLabel value="circle" control={<Radio sx={{ '& .MuiSvgIcon-root': { fontSize: 12}}}/>} label={<div style={{fontSize:12}}> Circle </div>} />
                        </RadioGroup>
                      </FormControl>

                      <div  style={{ display: 'inline-block', marginLeft: '10%'}}>
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

  );
};


function DeclineThresholdSlider({ trend, setThreshold, isDisabled, minThreshold, label, filterWithTrendThreshold }) {
  const max = 0;
  const min = minThreshold;
  const handleSlopeChange = (event, newValue) => {
      console.log("set threshold: ", newValue);
      setThreshold(newValue); 
      filterWithTrendThreshold(trend, newValue);     
  };

  return (
      <div style={{ margin: '5px 10px', width: '80%' }}>
          <div style={{ whiteSpace: 'pre' }}>{label}</div>
          <Slider
              disabled = {isDisabled}
              size="small"
              step={(max-min) / 10}
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
