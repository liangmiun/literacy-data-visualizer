
import { Checkbox, FormControlLabel, Slider, FormGroup, FormControl, InputLabel, Select, MenuItem, ListItemText  } from '@mui/material';
import React, { useState } from 'react';
import '../App.css';



export function OptionSelectGroup({ checkedAges, setCheckedAges,  setWeightSegments }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionChange = (event) => {
      const values = event.target.value;
      setSelectedOptions(values);
      // setSelectedOptions(prev => {
      //     if (prev.includes(value)) {
      //         return prev.filter(item => item !== value);
      //     } else {
      //         return [...prev, value];
      //     }
      // });
  };

  return (
      <div>
          <div style={{ margin: '20px 0' }}>
          <FormControl fullWidth variant="outlined" style={{ margin: '20px 0' }}>
              <InputLabel>Add Option Filter:</InputLabel>
              <Select
                  multiple
                  value={selectedOptions}
                  onChange={handleOptionChange}
                  renderValue={(selected) => selected.join(', ')}
              >
                  {["checkbox", "slider"].map(name => (
                      <MenuItem key={name} value={name}>
                          <Checkbox checked={(() => {
                              console.log("Selected Options:", selectedOptions);
                              console.log(`Does it include ${name}?`, selectedOptions.includes(name));
                              return selectedOptions.includes(name);
                          })()} />
                          <ListItemText primary={name.charAt(0).toUpperCase() + name.slice(1)} />
                      </MenuItem>
                  ))}
              </Select>
          </FormControl>
          </div>

          <div style={{ margin: '20px 0' }}>

            {selectedOptions.includes("checkbox") && (
                <AgeCheckBoxes start={9} checkedAges={checkedAges} setCheckedAges={setCheckedAges} />
            )}

            {selectedOptions.includes("slider") && (
                <WeightSlider idx={0} min={0} max={100} setWeightSegments={setWeightSegments} />
            )}

          </div>
      </div>
  );
}


function WeightSlider({ idx, min, max, setWeightSegments}) {
  
    const [value, setValue] = useState([min, max]);

     
    const handleWeightRange = (event, newValue) => {
      setValue(newValue);
      setWeightSegments( [newValue[0], newValue[1]] );
    }; 
  
  
    return (
        <div style={{ margin: '20px 20px', width: '80%' }}>
        Weight:
        <Slider
          defaultValue={[min, max]}
          aria-labelledby="range-slider"
          step={1}
          min={min}
          max={max}
          valueLabelDisplay="auto"
          value={value}   // set the value prop to the state
          onChange={handleWeightRange}  // attach the onChange handler
        />
      </div>
    );
}


function AgeCheckBoxes({ start,checkedAges, setCheckedAges}){

    const handleAgeCheckChange = (age, isChecked) => {
        if (isChecked) {
            setCheckedAges(prev => [...prev, age]);
        } else {
            setCheckedAges(prev => prev.filter(a => a !== age));
        }
      };



    return (
        <div style={{ margin: '20px 20px', width: '80%'  }}>
            Age:
        <FormGroup row>
          {[start, start+1, start+2].map(age => (
            <FormControlLabel
              key={age}
              control={
                <Checkbox 
                  checked={checkedAges.includes(age)}
                  onChange={(event) => handleAgeCheckChange(age, event.target.checked)}
                />
              }
              label={age}
            />
          ))}
        </FormGroup>
      </div>
      );

}

  
  

