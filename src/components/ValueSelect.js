import { Checkbox, FormControlLabel, Slider, FormGroup, FormControl, InputLabel, Select, MenuItem, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import * as d3 from 'd3';
import '../App.css';

export function OptionSelectGroup({ data, setFilterList,  checkedOptions, rangeOptions, setCheckedOptions, setRangeOptions }) {
    const allOptions = Object.keys(checkedOptions).concat(Object.keys(rangeOptions));
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleOptionChange = (event) => {
        const values = event.target.value;        
        const deselectedOptions = selectedOptions.filter(option => !values.includes(option));

        // Reset the checkedOptions for the deselected options
        deselectedOptions.forEach(option => {
            if (checkedOptions.hasOwnProperty(option)) {                
                setCheckedOptions(prev => ({ ...prev, [option]: [] }));
            }
            else if (rangeOptions.hasOwnProperty(option)) {
                setRangeOptions(prev => ({ ...prev, [option]: [] }));
            }
        });    
        setSelectedOptions(values);
        setFilterList(values);
        console.log("values set to filterList: "+values);


    };

    return (
        <div>
            <div style={{ margin: '10px 0' }}>
                <FormControl fullWidth variant="outlined" style={{ margin: '10px 0' }}>
                    <InputLabel  >Add Option Filter:</InputLabel>
                    <Select
                        multiple
                        value={selectedOptions}
                        onChange={handleOptionChange}
                        renderValue={(selected) => selected.join(', ')}
                        style={{ margin: '20px 0' }}
                    >
                        {allOptions.map(name => (
                            <MenuItem key={name} value={name}>
                                <Checkbox checked={selectedOptions.includes(name)} />
                                <ListItemText primary={name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <div style={{ margin: '20px 0' }}>
                {selectedOptions.map(option => {
                    if (checkedOptions.hasOwnProperty(option)) {
                        const uniqueValues = [...new Set(data.map(item => item[option]))];
                        return <OptionCheckBoxes key={option} label={option} options={uniqueValues} checkedOptions={checkedOptions[option]} setCheckedOptions={setCheckedOptions} />;
                    } else if (rangeOptions.hasOwnProperty(option)) {
                        const [minValue, maxValue] = d3.extent(data, d => d[option]);
                        return <OptionSlider key={option} label={option} min={minValue} max={maxValue} setRangeOptions={setRangeOptions} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

function OptionSlider({ label, min, max, setRangeOptions }) {
    const [value, setValue] = useState([min, max]);
    const handleRangeChange = (event, newValue) => {
        setValue(newValue);
        setRangeOptions(prev => ({ ...prev, [label]: [newValue[0], newValue[1]] }));
    };

    return (
        <div style={{ margin: '20px 20px', width: '80%' }}>
            {label}:
            <Slider
                defaultValue={[min, max]}
                aria-labelledby="range-slider"
                step={1}
                min={min}
                max={max}
                valueLabelDisplay="auto"
                value={value}
                onChange={handleRangeChange}
            />
        </div>
    );
}

function OptionCheckBoxes({ label, options, checkedOptions, setCheckedOptions }) {
    const handleCheckChange = (option, isChecked) => {
        if (isChecked) {
            setCheckedOptions(prev => ({ ...prev, [label]: [...prev[label], option] }));
        } else {
            setCheckedOptions(prev => ({ ...prev, [label]: prev[label].filter(item => item !== option) }));
        }
    };

    return (
        <div style={{ margin: '20px 20px', width: '80%' }}>
            {label}:
            <FormGroup row>
                {options.map(option => (
                    <FormControlLabel
                        key={option}
                        control={
                            <Checkbox
                                checked={checkedOptions.includes(option)}
                                onChange={(event) => handleCheckChange(option, event.target.checked)}
                            />
                        }
                        label={option}
                    />
                ))}
            </FormGroup>
        </div>
    );
}
