
export const preset_dict = {
  xField: '',
  xRange: [],
  yField: '',
  yRange: [],
  isClassView: false,
  filterConfiguration: {}
};

export const updatePreset = (xField, xRange, yField, yRange, isClassView, filterConfiguration) => {
  preset_dict.xField = xField;
  preset_dict.xRange = xRange;
  preset_dict.yField = yField;
  preset_dict.yRange = yRange;
  preset_dict.isClassView = isClassView;
  preset_dict.filterConfiguration = filterConfiguration;
};


export const save = (config) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
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