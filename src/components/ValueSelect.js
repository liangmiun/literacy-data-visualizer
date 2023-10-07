import { Checkbox, FormControlLabel, Slider, FormGroup, FormControl, InputLabel, Select, MenuItem, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import * as d3 from 'd3';
import '../App.css';

export function OptionSelectGroup({ data, setFilterList,  checkedOptions, rangeOptions, setCheckedOptions, setRangeOptions }) {
    const allOptions = Object.keys(checkedOptions).concat(Object.keys(rangeOptions));
    const [selectedOptions, setSelectedOptions] = useState([]);    

    const handleOptionChange = (event) => {
        const values = event.target.value;
        const newlySelectedOptions = values.filter(option => !selectedOptions.includes(option));        
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
        
        
            // Set all options to be checked for the newly selected options
        newlySelectedOptions.forEach(option => {
            if (checkedOptions.hasOwnProperty(option)) {
                const uniqueValues = [...new Set(data.map(item => item[option]))];
                setCheckedOptions(prev => ({ ...prev, [option]: uniqueValues }));
            }
            else if (rangeOptions.hasOwnProperty(option)) {
                const [minValue, maxValue] = d3.extent(data, d => d[option]);
                setRangeOptions(prev => ({ ...prev, [option]: [minValue, maxValue] }));
            }
        });
        
        setSelectedOptions(values);
        setFilterList(values);
        console.log("values set to filterList: "+values);


    };

    return (
        <div className='option-panel'>
            <h4>Filter by option/range </h4>
            <div style={{ margin: '5px 0' }}>
                    <FormControl fullWidth variant="outlined" style={{ margin: '5px 0' }}>
                        <InputLabel  ></InputLabel>
                        <Select
                            multiple
                            value={selectedOptions}
                            onChange={handleOptionChange}
                            renderValue={(selected) => 
                                (
                                    <div style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                                        {selected.join(', ')}
                                    </div>
                                )                         
                            
                            }
                            style={{ margin: '5px 0' }}
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
            <div style={{ margin: '5px 0',overflowY: 'auto', maxHeight:'32vh', overflowX: 'auto', maxWidth: '15vw' }}>
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
        <div style={{ margin: '5px 5px', width: '80%' }}>
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
        <div style={{ margin: '5px 5px', width: '80%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {label}:
                <button 
                    onClick={() => setCheckedOptions(prev => ({ ...prev, [label]: [] }))}
                >
                    Clear
                </button>
            </div>
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
