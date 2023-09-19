
import { Checkbox,FormControlLabel, Slider, FormGroup } from '@mui/material';
import '../App.css';


export function WeightSlider({ weightRange, setWeightRange}) {   

    
    const handleWeightRange = (event, newValue) => {
        setWeightRange(newValue);
      };  
  
  
    return (
        <div style={{ margin: '20px 20px', width: '80%', border: '2px solid green' }}>
        Weight:
        <Slider
          defaultValue={[15, 35]}
          aria-labelledby="range-slider"
          step={1}
          min={10}
          max={50}
          valueLabelDisplay="auto"
          value={weightRange}  // set the value prop to the state
          onChange={handleWeightRange}  // attach the onChange handler
        />
      </div>
    );
}


export function AgeCheckBoxes({ checkedAges, setCheckedAges}){

    const handleAgeCheckChange = (age, isChecked) => {
        if (isChecked) {
            setCheckedAges(prev => [...prev, age]);
        } else {
            setCheckedAges(prev => prev.filter(a => a !== age));
        }
      };



    return (
        <div style={{ margin: '20px 20px', width: '80%', border: '2px solid blue' }}>
            Age:
        <FormGroup row>
          {[9, 10, 11].map(age => (
            <FormControlLabel
              key={age}
              control={
                <Checkbox 
                  checked={checkedAges.includes(age)}
                  onChange={(event) => handleAgeCheckChange(age, event.target.checked)}
                />
              }
              label={age.toString()}
            />
          ))}
        </FormGroup>
      </div>
      );

}

  
  



