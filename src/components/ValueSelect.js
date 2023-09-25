
import { Checkbox,FormControlLabel, Slider, FormGroup } from '@mui/material';
import React, { useState } from 'react';
import '../App.css';


function WeightSlider({ idx, min, max, setWeightSegments}) {
  
    const [value, setValue] = useState([min, max]);

     
    const handleWeightRange = (event, newValue) => {
      setValue(newValue);
      setWeightSegments(prev => { return prev.map((item, index) => index === idx ? [newValue[0], newValue[1]] : item)});
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


export function SliderGroup({ weightSegments, setWeightSegments}){
    const [sliderRanges, setSliderRanges] = useState([]);
    
    
    const handleAddSlider = () => {
      const lastSliderMaxValue = sliderRanges.length === 0 ? 35 : sliderRanges[sliderRanges.length - 1].max;
      const newStart = lastSliderMaxValue + 1;
      const newEnd = newStart + 20; // You can adjust this as per the desired range
      setSliderRanges([...sliderRanges, { min: newStart, max: newEnd }]);
      setWeightSegments([...weightSegments, [newStart, newEnd]]);
    };

    const handleRemoveSlider = (index) => {
      const newSliderRanges = [...sliderRanges];
      const newWeightSegments = [...weightSegments];
  
      // Remove the slider range and weight segment at the given index
      newSliderRanges.splice(index, 1);
      newWeightSegments.splice(index, 1);
  
      setSliderRanges(newSliderRanges);
      setWeightSegments(newWeightSegments);
    };
  

    return (
      <div>
        <button onClick={handleAddSlider}>Add Weight Slider?</button>
        {sliderRanges.map((range, index) => (
          <div key={index} style={{ position: 'relative', width: '80%',border: '2px solid blue' }}>
              <span style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer' }}
                    onClick={() => handleRemoveSlider(index)}>x</span>

              <WeightSlider 
                key={index} 
                idx={index}
                min = {range.min}
                max = {range.max}
                setWeightSegments={setWeightSegments}    

              />                
          </div>

        ))}
      </div>
    );
  }




export function AgeCheckGroup({ checkedAges, setCheckedAges}){
    const [ageCheckBoxGroups, setAgeCheckBoxGroups] = useState([]);

    const handleAddAgeBox = () => {
      const lastGroup = ageCheckBoxGroups[ageCheckBoxGroups.length - 1];
      const newStart = ageCheckBoxGroups.length === 0 ? 9 :lastGroup.start + 3;
      setAgeCheckBoxGroups([...ageCheckBoxGroups, { start: newStart }]);
    };

    const handleRemoveAgeBox = (index) => {
        const newAgeCheckBoxGroups = [...ageCheckBoxGroups];

        const groupToRemove = ageCheckBoxGroups[index];
        // Filter out the ages of the removed AgeCheckBoxes from the checkedAges state
        const agesToRemove = [groupToRemove.start, groupToRemove.start + 1, groupToRemove.start + 2];    
        const newCheckedAges = checkedAges.filter(age => !agesToRemove.includes(age));
        setCheckedAges(newCheckedAges);

        newAgeCheckBoxGroups.splice(index, 1);
        setAgeCheckBoxGroups(newAgeCheckBoxGroups);
    };

    return(

      <div>
        <button onClick={handleAddAgeBox}>Add Age Box?</button>

        {ageCheckBoxGroups.map((group, index) => (
            <div key={index} style={{ position: 'relative', width: '80%',border: '2px solid blue' }}>
                <span style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer' }}
                      onClick={() => handleRemoveAgeBox(index)}>x</span>
                <AgeCheckBoxes start={group.start} checkedAges={checkedAges} setCheckedAges={setCheckedAges} />
            </div>
        ))}

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

  
  



