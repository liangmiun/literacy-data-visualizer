import {preset_dict, updatePreset} from '../ScatterPage.js';


// export const preset_dict = {
//   xField: '',
//   yField: '',
//   isClassView: false,
// };



export const save = () => {
  updatePreset();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset_dict));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "preset_config.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const load = (callback) => {
  const uploadInputNode = document.createElement('input');
  uploadInputNode.setAttribute("type", "file");
  uploadInputNode.setAttribute("accept", "application/json");

  uploadInputNode.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const loadedConfig = JSON.parse(content);
      callback(loadedConfig);
    };

    reader.readAsText(file);
  };

  document.body.appendChild(uploadInputNode);
  uploadInputNode.click();
  uploadInputNode.remove();
};