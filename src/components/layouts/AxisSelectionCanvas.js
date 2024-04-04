import React from 'react';
import {InputLabel, Select as MuiSelect, MenuItem } from '@mui/material';
import { Slider } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import 'assets/AxisSelectionCanvas.css';

const AxisSelectionCanvas = (props) => {
  const x_options = props.fields_x.map(field => ({ value: field, label: field }));
  const y_options = props.fields_y.map(field => ({ value: field, label: field }));
  const colorOptions = ['Skola','Årskurs', 'Klass', 'Läsår','Stanine'].map(field => ({ value: field, label: field }));  
  const onSavePreset = () => {  props.save()};
  const onLoadPreset= () => { props.load(props.setConfig)};
  const trendOptions = Object.entries(props.trendSet).map(([key, value]) => ({ value: value, label: value }));

  const ImportDataButton = ({handleFileUpload}) => (
    <button className="btn">
      <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} id="fileUpload" />
      <label htmlFor="fileUpload" className="import-button">
      <Tooltip title="Import csv-format source data" followCursor>
      <label>Import Data</label>
      </Tooltip>
        
      </label>
    </button>
  );

  const handleTrendChange = (event) => {
    props.onTrendChange(event.target.value);
  };

  // Define the trend-to-string mapping dictionary
  const trendToLabel = {
    [props.trendSet.all]: "  ", // Assuming props.trendSet.all is a constant value
    [props.trendSet.overall_decline]: "with slope <", // Assuming props.trendSet.overall_decline is a constant value
    [props.trendSet.logarithmic_decline]: "with coeff <", // Assuming props.trendSet.individual_decline is a constant value
    [props.trendSet.last_time_decline]: "with value <", // Assuming props.trendSet.individual_decline is a constant value
    // Add other mappings as necessary
  };
  
  return (
    <div className="axis-selection-canvas" >
      <div className="axis-canvas-row"  style={{ display: 'flex' }} >
    
        <Axes  props={props} x_options={x_options} y_options={y_options} colorOptions={colorOptions} />

        <TrendBar   props={props} trendOptions={trendOptions} handleTrendChange={handleTrendChange} trendToLabel={trendToLabel} />

        <ShowLinesToggle props={props} />

        <ClassViewBar props={props} />

        <PresetBar  props={props} onSavePreset={onSavePreset} onLoadPreset={onLoadPreset} ImportDataButton={ImportDataButton} />

      </div>
    </div>
  );

};

function Axes({ props, x_options, y_options, colorOptions}) {
  return (
    <div className="axes" >
      <div className="field-pair"  >
        <FormControl fullWidth   size="small">
          <Tooltip title="Select variable on horizontal axis" followCursor>
            <InputLabel id="x-field-label">X-field</InputLabel>
          </Tooltip>
          <div>
            <MuiSelect
              labelId="x-field-label"
              id="x-field"
              sx={{ width: '7vw' }}
              value={props.isClassView? props.seasonField: props.xField}   //props.isClassView? 'Testdatum': props.xField
              onChange={ (event) => {  props.isClassView? props.onSeasonFieldChange(event.target.value) :  props.onXFieldChange(event.target.value)}}
              label="X-field"
            >
              {x_options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </MuiSelect>
          </div>
        </FormControl>
      </div>       

      <div className="field-pair" >
        <FormControl fullWidth   size="small">
          <Tooltip title="Select variable on vertical axis" followCursor>
            <InputLabel id="y-field-label">Y-field</InputLabel>
          </Tooltip>
          <MuiSelect
            labelId="y-field-label"
            id="y-field"
            sx={{ width: '9vw' }}
            value={props.yField}
            onChange={(event) => props.onYFieldChange(event.target.value)}
            label="Y-field"
          >
            {y_options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>
      </div>

      <div className="field-pair">
        <FormControl fullWidth   size="small">
          <Tooltip title="Select variable for color coded data" followCursor>
            <InputLabel id="color-field-label">Color</InputLabel>
          </Tooltip>

          <Tooltip title={props.isClassView ? "Color is locked to class names in Class View" : ''} followCursor>
          <div>
          <MuiSelect
            disabled = {props.isClassView}
            labelId="color-label"
            id="color-field"
            value={props.isClassView? 'Klass': props.colorField}
            sx={{ width: '6vw' }}
            onChange={(event) => props.onColorFieldChange(event.target.value)}
            label="Color-field"
          >
            {colorOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </MuiSelect>
          </div>
          </Tooltip>
        </FormControl>
      </div>
    </div>
  );
}

function TrendBar({props, trendOptions, handleTrendChange, trendToLabel}) {

  return(
    <div className="trend-bar" >
      <div  style={{width :'50%'}}  >     
        <FormControl fullWidth   size="small">
          <Tooltip title="show all records or only declining records" followCursor>
            <InputLabel id="trend-label">Trend</InputLabel>
          </Tooltip>

          <Tooltip title={props.isClassView ? "Trend for individual students is disabled Class View" : ''} followCursor>
          <div>
            <MuiSelect
              disabled = {props.isClassView} 
              labelId="trend-label"
              id="trend"
              value={props.trend}
              onChange={handleTrendChange}
              label="Trend"
            >
              {trendOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </MuiSelect>
          </div>
          </Tooltip>
        </FormControl>

      </div>

      <div style={{width :'50%'}}>
        <DeclineThresholdSlider 
          trend = {props.trend}
          isDisabled = {props.trend === props.trendSet.all || props.isClassView}
          setThreshold={props.trend === props.trendSet.overall_decline? props.setDeclineSlope : props.setDiffThreshold}
          minThreshold={props.minDeclineThreshold}
          label = {trendToLabel[props.trend]|| "  "}
          filterWithTrendThreshold = {props.filterWithTrendThreshold}                    
        />
      </div>
    </div>
  );

}

function ShowLinesToggle({props}) {

  return (
    <div className ="show-lines"  >
      <input 
          type="checkbox" 
          checked = {props.showLines}
          onChange={() => props.setShowLines(!props.showLines)} 
      />

      <Tooltip title="Line-connect records from identical individuals" followCursor>                
      <label> Show lines </label>
      </Tooltip>
  </div>
  );

}

function ClassViewBar({props}) {

  return (
    <div className = "show-class-view" >
      <div style={{ width: '30%', display: 'inline-flex', marginLeft: '1%', alignItems: 'center', marginRight:'2%'  }}>
        <input 
            type="checkbox" 
            checked = {props.isClassView}
            onChange={() => {props.setIsClassView(!props.isClassView); }}   
            style={{ marginLeft: '5%'}}
        />

        <Tooltip  title="Switch between class-aggregation view and individual view" followCursor>
        <label style={{ 
          fontSize: '12px',
          width: '100%', 
          overflow: 'hidden',
          whiteSpace: 'normal',
          textOverflow: 'clip'   
          }}> Class/ Tenure View </label >
        </Tooltip>

      </div>

      {props.isClassView &&
        <div className='aggregate-buttons-row' 
          style={{   width: '70%',display: 'inline-flex', alignItems: 'center',marginRight:'20px', padding:'2px' }}>

            <FormControl  style={{width: '50%', fontSize:'12px'}}>
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

            <div style={{  width: '50%', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '10%' }}>

              <div  style={{ display: 'inline-flex', margin: '10% 10%', alignItems: 'center'}}>
                  <input 
                      type="checkbox" 
                      checked={props.studentsChecked} 
                      onChange={() => props.setStudentsChecked(!props.studentsChecked)}
                  />
                <Tooltip title="Whether to show individual dots on the class view" followCursor>
                  <label> Present Individuals </label>
                </Tooltip>
              </div>

              <div  style={{ display: 'inline-flex', margin: '10% 10%', alignItems: 'center'}}>
                  <input 
                      type="checkbox" 
                      checked={props.connectIndividual} 
                      onChange={() => props.setConnectIndividual(!props.connectIndividual)}
                  />
                <Tooltip title="Whether to show lines connecting individual dots on the class view" followCursor>
                  <label>Connect individuals </label>
                </Tooltip>
              </div>

            </div >
        
        </div>
      }
    </div>

  );
}

function PresetBar({props, onSavePreset, onLoadPreset, ImportDataButton}) {

  return (

    <div className="preset-buttons-row"  >

          <button className="btn"
            id="reset-btn"
            onClick={() => props.handleResetToOnboarding()} // function to reset the state to the initial state
          >
            <Tooltip title="Reset to on-boarding view" followCursor>
            <label>Reset</label>
            </Tooltip>
          </button>

          <button className="btn"
            id="reset-latest-btn"
            onClick={() => props.handleResetToLatest()} // function to reset the state to the initial state
          >
            <Tooltip title="Reset to view of the last saved preset" followCursor>
            <label>Reset to latest saved</label>
            </Tooltip>
          </button>

          <button className="btn"                  
              id="save-preset-btn"
              //style={{ color: 'gray' }} 
              onClick={() => onSavePreset()} // function to save current state as a preset
            >
              <Tooltip title="Save current filters, axis fields and view mode settings to a preset file" followCursor>
              <label>Save Preset</label>
              </Tooltip>
            </button>

          <button className="btn"
            id="load-preset-btn"
            onClick={() => onLoadPreset()} // function to load a saved preset
          >
            <Tooltip title="Load filters, axis fields and view mode settings from a preset" followCursor>
            <label>Load Preset</label>
            </Tooltip>
          </button>

          <ImportDataButton  handleFileUpload={props.handleFileUpload} />  


    </div>

  );
}

function DeclineThresholdSlider({ trend, setThreshold, isDisabled, minThreshold, label, filterWithTrendThreshold }) {
  const max = 0;
  const min = minThreshold;
  const handleSlopeChange = (event, newValue) => {
      setThreshold(newValue); 
      filterWithTrendThreshold(trend, newValue);     
  };

  return (
      <div style={{ margin: '5px 10px', width: '80%' }}>
          <div style={{ whiteSpace: 'pre' }}>
          <Tooltip title="Set a threshold so the filtered data are declining under the thresthold." followCursor>            
            <label>  {label } </label>
          </Tooltip>            
          </div>

          <Slider
              disabled = {isDisabled}
              size="small"
              step={(max-min) / 50}
              defaultValue={max}
              min={min}
              max={max}
              valueLabelDisplay="auto"
              valueLabelFormat={value => <div>{value.toFixed(4)}</div>}
              onChange={handleSlopeChange}
          />
      </div>
  );
}

export default AxisSelectionCanvas;
