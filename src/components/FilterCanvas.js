import React, { useState } from 'react';
import Select from 'react-select';
//import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider';


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



  // Define a custom handle component to display the selected min and max values
  // const Handle = ({ handle: { id, value, percent }, getHandleProps }) => {
    
  //   return (
  //     <div
  //       style={{
  //         left: `${percent}%`,
  //         position: 'absolute',
  //         marginLeft: -15,
  //         marginTop: 25,
  //         zIndex: 2,
  //         width: 30,
  //         height: 30,
  //         border: 0,
  //         textAlign: 'center',
  //         cursor: 'pointer',
  //         borderRadius: '50%',
  //         backgroundColor: '#2C4870',
  //         color: '#333',
  //       }}
  //       {...getHandleProps(id)}
  //     >
  //       <div style={{ fontFamily: 'Arial', fontSize: 'smaller', marginTop: -35 }}>{value}</div>
  //     </div>
  //   )
  // }
  
  const Handle = ({ handle: { id, value, percent }, getHandleProps }) => {
    return (
      <div
        style={{
          left: `${percent}%`,
          position: 'absolute',
          marginLeft: -10, 
          marginTop: 0, // adjust the position to make the handle on the track
          zIndex: 2,
          width: 15, // make the handle smaller
          height: 15, // make the handle smaller
          border: 0,
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: '#2C4870',
          color: '#333',
        }}
        {...getHandleProps(id)}
      >
        <div style={{ fontFamily: 'Arial', fontSize: 'smaller', marginTop: -25 }}>{value}</div> 
      </div>
    )
  }
  


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

      
      <div style={sliderContainerStyle}>
        <Slider
          rootStyle={{ position: 'relative', width: '100%' }}
          domain={rangeValues || [0, 100]}
          step={1}
          mode={2}
          values={range}
          onChange={handleSliderChange}
        >
          <Rail>
            {({ getRailProps }) => (
              <div style={{ position: 'absolute', width: '100%', height: 14, borderRadius: 7, cursor: 'pointer', backgroundColor: 'rgb(155,155,155)' }} {...getRailProps()} />
            )}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <div
                    key={id}
                    className="slider-track"
                    style={{
                      position: 'absolute',
                      height: 14,
                      zIndex: 1,
                      backgroundColor: '#546C91',
                      borderRadius: 7,
                      cursor: 'pointer',
                      left: `${source.percent}%`,
                      width: `${target.percent - source.percent}%`,
                    }}
                    {...getTrackProps()}
                  />
                ))}
              </div>
            )}
          </Tracks>
          <Ticks count={10}>
            {({ ticks }) => (
              <div className="slider-ticks">
              {ticks.map(tick => (
                  <div key={tick.id} style={{ position: 'absolute', marginTop: 14, marginLeft: -0.5, width: 1, height: 5, backgroundColor: 'rgb(200,200,200)', left: `${tick.percent}%` }} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
      </div>

      {/* <div style={sliderContainerStyle}>
        <div>
          <span>{rangeValues ? rangeValues[0] : 0}</span> 
          <span style={{ float: 'right' }}>{rangeValues ? rangeValues[1] : 100}</span>
        </div>
        <Slider
          range
          min={rangeValues ? rangeValues[0] : 0}
          max={rangeValues ? rangeValues[1] : 100}
          value={range}
          onChange={handleSliderChange}
          styles={selectStyles}
        />
        <div>
          <span>{range[0]}</span> 
          <span style={{ float: 'right' }}>{range[1]}</span>
        </div>
      </div> */}

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
