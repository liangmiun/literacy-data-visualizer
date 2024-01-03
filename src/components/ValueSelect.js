import { Box, Checkbox, FormControlLabel, Slider, FormGroup, FormControl, InputLabel, Select, MenuItem, ListItemText } from '@mui/material';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import * as d3 from 'd3';
import '../App.css';

export function OptionSelectGroup({ data, setFilterList,  checkedOptions, rangeOptions, setCheckedOptions, setRangeOptions }) {
    const allOptions = Object.keys(checkedOptions).concat(Object.keys(rangeOptions));
    const [selectedOptions, setSelectedOptions] = useState([]);  
    
    useEffect(() => {
        // Automatically select all options when the component mounts
        setSelectedOptions(allOptions);
        setFilterList(allOptions);
        allOptions.forEach(option => {
            if (checkedOptions.hasOwnProperty(option)) {
                const uniqueValues = [...new Set(data.map(item => item[option]))];
                setCheckedOptions(prev => ({ ...prev, [option]: uniqueValues }));
            }
            else if (rangeOptions.hasOwnProperty(option)) {
                const [minValue, maxValue] = d3.extent(data, d => d[option]);
                setRangeOptions(prev => ({ ...prev, [option]: [minValue, maxValue] }));
            }
        });
    }, []);


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
        //console.log("values set to filterList: "+values);


    };

    return (
        <div className='option-panel'  tyle={{ margin: '0px 3px'}}>
            <h4 style={{ textAlign: 'center' }}>Filter by option/range </h4>

            <div style={{ margin: '5px 30px',overflowY: 'auto',  overflowX: 'auto', maxWidth: '20vw', justifyContent: 'center', fontSize: '12px'}}>
                {selectedOptions.map(option => {
                    if (checkedOptions.hasOwnProperty(option)) {
                        const uniqueValues = [...new Set(data.map(item => item[option]))];
                        return <OptionCheckBoxes   key={option} label={option} options={uniqueValues} checkedOptions={checkedOptions[option]} setCheckedOptions={setCheckedOptions} />;
                    } else if (rangeOptions.hasOwnProperty(option)) {
                        const [minValue, maxValue] = d3.extent(data, d => d[option]);
                        return <OptionSlider   key={option} label={option} min={+minValue} max={+maxValue} setRangeOptions={setRangeOptions} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
}


function valueFormatter(value, option) {
    if (option === 'Lexplore Score') {
        return value;
    }
    else return new Date(value).toLocaleDateString();
}


function OptionSlider({ label, min, max, setRangeOptions }) {
    const [value, setValue] = useState([min, max]);
    const handleRangeChange = (event, newValue) => {
        setValue(newValue);
        setRangeOptions(prev => ({ ...prev, [label]: [newValue[0], newValue[1]] }));
    };

    return (
        <div style={{ margin: '5px 10px', width: '80%' }}>
            {label}:
            <Slider
                size="small"
                defaultValue={[min, max]}
                aria-labelledby="range-slider"
                step={1}
                min={min}
                max={max}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => valueFormatter(value, label)}
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

    console.log("options: "+options);
    const sorted_options = options
    .filter(option => option !== null)
    .sort((a, b) => a.toString().localeCompare(b.toString()));


    return (
        <div style={{ margin: '5px 5px', width: '95%'  }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                {label}:
                <Button size="small" style={{ marginLeft: '1px', minWidth: 0, minHeight: 0 }}
                    onClick={() => setCheckedOptions(prev => ({ ...prev, [label]: [] }))}
                >
                    X
                </Button>
            </div>
            <FormGroup row>
                {sorted_options.map(option => (
                    <FormControlLabel
                        key={option}
                        control={
                            <Checkbox
                                checked={checkedOptions.includes(option)}
                                onChange={(event) => handleCheckChange(option, event.target.checked)}
                                size= "small"
                            />
                        }
                        label={       
                                  <Box component="div" fontSize={12}>
                                    {option}
                                  </Box>
                        }
                        
                    />
                ))}
            </FormGroup>
        </div>
    );
}