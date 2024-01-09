import React   from 'react';
import Select from 'react-select';
import './AxisSelectionCanvas.css';

const AxisSelectionCanvas = (props) => {
  const options = props.fields.map(field => ({ value: field, label: field }));
  const colorOptions = ['Skola','Årskurs', 'Läsår','Stanine'].map(field => ({ value: field, label: field }));
  const {
    showXField = true, 
    showClassbar=false, 
  } = props;
  
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
        {showXField && 
          <div className="field-pair">
            <label htmlFor="x-field">X-field:</label>
            <Select 
              id="x-field"
              value={{ value: props.xField, label: props.xField }}
              options={options}
              onChange={option => props.onXFieldChange(option.value)}
            />
          </div>
        }

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


        {!showClassbar &&
          <>
            <div  style={{ display: 'inline-block', marginLeft: '1%'}}>
                    <input 
                        type="checkbox" 
                        checked = {props.isDeclined}
                        onChange={() => props.setIsDeclined(!props.isDeclined)} 
                    />
                    <label><br/>Only declining score </label>
            </div>
            <div  style={{ display: 'inline-block', marginLeft: '1%'}}>
                    <input 
                        type="checkbox" 
                        checked = {props.showLines}
                        onChange={() => props.setShowLines(!props.showLines)} 
                    />
                    <label><br/>Show lines </label>
            </div>
            <div  style={{ display: 'inline-block', marginLeft: '1%'}}>
                    <input 
                        type="checkbox" 
                        checked = {props.isClassView}
                        onChange={() => {props.setIsClassView(!props.isClassView); props.setViewSwitchCount(props.viewSwitchCount+1) }}   
                    />
                    <label><br/>Class View </label>
            </div>
          </>
        }



        {props.isClassView &&
          <div className='aggregate-buttons-row' 
            style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid lightgray',marginRight:'20px', padding:'10px' }}>

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

    
  
  );
};

export default AxisSelectionCanvas;
