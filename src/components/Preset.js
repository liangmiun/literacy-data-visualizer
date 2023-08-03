import React, { useState } from 'react';


const Preset = ({ config, setConfig }) => {
  //const [preset, setPreset] = useState({});

  save = ({ xField, yField, colorField }) => {
    const config = { xField, yField, colorField };
    const file = new Blob([JSON.stringify(config)], {type: 'application/json'});
    const fileURL = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = 'config.json';
    link.click();
  }

  
  load= () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const config = JSON.parse(event.target.result);
          resolve(config);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      };
      input.click();
    });
  }
  

  // const handleSavePreset = () => {
  //   // save current configuration to local storage or file
  //   localStorage.setItem('preset', JSON.stringify(config));
  //   alert('Configuration saved as preset.');
  // }

  // const handleLoadPreset = () => {
  //   // load preset from local storage or file
  //   const loadedPreset = JSON.parse(localStorage.getItem('preset'));
  //   if (loadedPreset) {
  //     setPreset(loadedPreset);
  //     setConfig(loadedPreset);
  //     alert('Configuration loaded from preset.');
  //   } else {
  //     alert('No preset found.');
  //   }
  // }

  // return (
  //   <>
  //     <button 
  //       id="save-preset-btn"
  //       onClick={handleSavePreset}
  //     >
  //       Save Preset As
  //     </button>
  //     <button 
  //       id="load-preset-btn"
  //       onClick={handleLoadPreset}
  //     >
  //       Load Preset
  //     </button>
  //   </>
  // );
};

export default Preset;
