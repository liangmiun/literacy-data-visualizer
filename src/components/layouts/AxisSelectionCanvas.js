import React, { useContext, useRef } from "react";
import AppLevelContext from "context/AppLevelContext";
import { InputLabel, Select as MuiSelect, MenuItem } from "@mui/material";
import { Slider } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Tooltip from "@mui/material/Tooltip";
import "assets/AxisSelectionCanvas.css";
import { Editor } from "utils/configEditor.js";
import { ShowHelp } from "components/screens/Help";
import { labels, color_fields } from "utils/constants.js";

const AxisSelectionCanvas = (props) => {
  const appContextValue = useContext(AppLevelContext);
  const x_options = appContextValue.fields_x.map((field) => ({
    value: field,
    label: field,
  }));
  const y_options = appContextValue.fields_y.map((field) => ({
    value: field,
    label: field,
  }));
  const colorOptions = color_fields.map((field) => ({
    value: field,
    label: field,
  }));
  const onSavePreset = () => {
    appContextValue.save();
  };
  const onLoadPreset = () => {
    appContextValue.load(appContextValue.setConfig);
  };
  const trendOptions = Object.entries(props.trendSet).map(([key, value]) => ({
    value: value,
    label: value,
  }));

  const ImportDataButton = ({ handleFileUpload }) => {
    // Create a reference to the hidden file input
    const fileInputRef = useRef(null);

    // Function to simulate clicking the hidden file input
    const handleClick = () => {
      fileInputRef.current.click();
    };

    return (
      <div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          ref={fileInputRef} // Attach the reference to the file input
          id="fileUpload"
        />
        <button className="btn import-button" onClick={handleClick}>
          {/* Assuming Tooltip is a component from a library like Material-UI; adjust as needed */}
          <Tooltip title="Import csv-format source data" followCursor>
            <span>{labels.importData}</span>
          </Tooltip>
        </button>
      </div>
    );
  };

  const handleTrendChange = (event) => {
    props.onTrendChange(event.target.value);
  };

  // Define the trend-to-string mapping dictionary
  const trendToLabel = {
    [props.trendSet.all]: "  ", // Assuming props.trendSet.all is a constant value
    [props.trendSet.overall_decline]: labels.trendOverallSlope,
    [props.trendSet.logarithmic_decline]: labels.trendLogSlope,
    [props.trendSet.last_time_decline]: labels.trendLastTimeValue,
  };

  return (
    <div className="axis-selection-canvas">
      <div className="axis-canvas-row" style={{ display: "flex" }}>
        <Axes
          x_options={x_options}
          y_options={y_options}
          colorOptions={colorOptions}
        />

        <TrendBar
          props={props}
          trendOptions={trendOptions}
          handleTrendChange={handleTrendChange}
          trendToLabel={trendToLabel}
        />

        <ShowLinesToggle props={props} />

        <ClassViewBar props={props} />

        <PresetBar
          props={props}
          onSavePreset={onSavePreset}
          onLoadPreset={onLoadPreset}
          ImportDataButton={ImportDataButton}
        />
      </div>
    </div>
  );
};

function Axes({ x_options, y_options, colorOptions }) {
  const appContextValue = useContext(AppLevelContext);
  return (
    <div className="axes">
      <div className="field-pair">
        <FormControl fullWidth size="small">
          <Tooltip title="Select variable on horizontal axis" followCursor>
            <InputLabel id="x-field-label">{labels.xFieldLabel}</InputLabel>
          </Tooltip>
          <div>
            <MuiSelect
              labelId="x-field-label"
              id="x-field"
              sx={{ width: "7vw" }}
              value={
                appContextValue.isClassView
                  ? appContextValue.seasonField
                  : appContextValue.xField
              } //props.isClassView? 'Testdatum': props.xField
              onChange={(event) => {
                appContextValue.isClassView
                  ? appContextValue.setSeasonField(event.target.value)
                  : appContextValue.setXField(event.target.value);
              }}
              label={labels.xFieldLabel}
            >
              {x_options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </MuiSelect>
          </div>
        </FormControl>
      </div>

      <div className="field-pair">
        <FormControl fullWidth size="small">
          <Tooltip title="Select variable on vertical axis" followCursor>
            <InputLabel id="y-field-label">{labels.yFieldLabel}</InputLabel>
          </Tooltip>

          <Tooltip
            title={
              appContextValue.isClassView
                ? "Y-field is locked to Lexplore Score in Class/Tenure View"
                : ""
            }
            followCursor
          >
            <MuiSelect
              labelId="y-field-label"
              disabled={appContextValue.isClassView}
              id="y-field"
              sx={{ width: "9vw" }}
              value={
                appContextValue.isClassView
                  ? "Lexplore Score"
                  : appContextValue.yField
              }
              onChange={(event) =>
                appContextValue.setYField(event.target.value)
              }
              label={labels.yFieldLabel}
            >
              {y_options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </MuiSelect>
          </Tooltip>
        </FormControl>
      </div>

      <div className="field-pair">
        <FormControl fullWidth size="small">
          <Tooltip title="Select variable for color coded data" followCursor>
            <InputLabel id="color-field-label">
              {labels.colorFieldLabel}
            </InputLabel>
          </Tooltip>

          <Tooltip
            title={
              appContextValue.isClassView
                ? "Color is locked to class names in Class View"
                : ""
            }
            followCursor
          >
            <div>
              <MuiSelect
                disabled={appContextValue.isClassView}
                labelId="color-label"
                id="color-field"
                value={
                  appContextValue.isClassView
                    ? "Klass"
                    : appContextValue.colorField
                }
                sx={{ width: "6vw" }}
                onChange={(event) =>
                  appContextValue.setColorField(event.target.value)
                }
                label={labels.colorFieldLabel}
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </div>
          </Tooltip>
        </FormControl>
      </div>
    </div>
  );
}

function TrendBar({ props, trendOptions, handleTrendChange, trendToLabel }) {
  const { isClassView } = useContext(AppLevelContext);
  return (
    <div className="trend-bar">
      <div style={{ width: "50%" }}>
        <FormControl fullWidth size="small">
          <Tooltip
            title="show all records or only declining records"
            followCursor
          >
            <InputLabel id="trend-label">{labels.trendFieldLabel}</InputLabel>
          </Tooltip>

          <Tooltip
            title={
              isClassView
                ? "Trend for individual students is disabled Class View"
                : ""
            }
            followCursor
          >
            <div>
              <MuiSelect
                disabled={isClassView}
                labelId="trend-label"
                id="trend"
                value={props.trend}
                onChange={handleTrendChange}
                label={labels.trendFieldLabel}
              >
                {trendOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </div>
          </Tooltip>
        </FormControl>
      </div>

      <div style={{ width: "50%" }}>
        <DeclineThresholdSlider
          trend={props.trend}
          isDisabled={props.trend === props.trendSet.all || isClassView}
          setThreshold={
            props.trend === props.trendSet.overall_decline
              ? props.setDeclineSlope
              : props.setDiffThreshold
          }
          minThreshold={props.minDeclineThreshold}
          label={trendToLabel[props.trend] || "  "}
          filterWithTrendThreshold={props.filterWithTrendThreshold}
        />
      </div>
    </div>
  );
}

function ShowLinesToggle({ props }) {
  const { showLines, setShowLines } = useContext(AppLevelContext);
  return (
    <div className="show-lines">
      <div
        style={{
          width: "100%",
          fontSize: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginLeft: "0%",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            height: "50%",
            margin: "5% 5%",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            checked={showLines}
            onChange={(event) => setShowLines(event.target.checked)}
          />

          <Tooltip
            title="Line-connect records from identical individuals"
            followCursor
          >
            <label> {labels.showLine} </label>
          </Tooltip>
        </div>

        <div
          style={{
            display: "inline-flex",
            height: "50%",
            margin: "5% 5%",
            alignItems: "flex-start",
          }}
        >
          <div style={{ width: "100%" }}>
            <input
              type="checkbox"
              checked={props.showAverageLine}
              onChange={(event) =>
                props.setShowAverageLine(event.target.checked)
              }
            />

            <Tooltip
              title="Show average Lexplore Score of all individuals in this municipality as reference line"
              followCursor
            >
              <label> {labels.showAverage} </label>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassViewBar({ props }) {
  const { isClassView, setIsClassView, aggregateType, setAggregateType } =
    useContext(AppLevelContext);
  return (
    <div className="show-class-view">
      <div
        style={{
          width: "30%",
          display: "inline-flex",
          marginLeft: "1%",
          alignItems: "center",
          marginRight: "2%",
        }}
      >
        <input
          type="checkbox"
          checked={isClassView}
          onChange={() => {
            setIsClassView(!isClassView);
          }}
          style={{ marginLeft: "5%" }}
        />

        <Tooltip
          title="Switch between class-aggregation view and individual view"
          followCursor
        >
          <label
            style={{
              fontSize: "12px",
              width: "100%",
              overflow: "hidden",
              whiteSpace: "normal",
              textOverflow: "clip",
            }}
          >
            {" "}
            {labels.tenureCheckbox}{" "}
          </label>
        </Tooltip>
      </div>

      {isClassView && (
        <div
          className="aggregate-buttons-row"
          style={{
            width: "60%",
            display: "inline-flex",
            alignItems: "center",
            marginRight: "20px",
            padding: "2px",
          }}
        >
          <FormControl style={{ width: "50%", fontSize: "12px" }}>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={aggregateType}
              onChange={(event) => setAggregateType(event.target.value)}
            >
              <FormControlLabel
                value="box"
                control={
                  <Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 12 } }} />
                }
                label={<div style={{ fontSize: 12 }}> {labels.boxToggle} </div>}
              />
              <FormControlLabel
                value="violin"
                control={
                  <Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 12 } }} />
                }
                label={
                  <div style={{ fontSize: 12 }}> {labels.violinToggle} </div>
                }
              />
              <FormControlLabel
                value="circle"
                control={
                  <Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 12 } }} />
                }
                label={
                  <div style={{ fontSize: 12 }}> {labels.circleToggle} </div>
                }
              />
            </RadioGroup>
          </FormControl>

          <div
            style={{
              width: "50%",
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginLeft: "10%",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                margin: "10% 10%",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={props.studentsChecked}
                onChange={() =>
                  props.setStudentsChecked(!props.studentsChecked)
                }
              />
              <Tooltip
                title="Whether to show individual dots on the class view"
                followCursor
              >
                <label> {labels.presentIndividual} </label>
              </Tooltip>
            </div>

            <div
              style={{
                display: "inline-flex",
                margin: "10% 10%",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={props.connectIndividual}
                disabled={props.disableIndiLines}
                onChange={() =>
                  props.setConnectIndividual(!props.connectIndividual)
                }
              />
              <Tooltip
                title="Switch whether to show lines connecting individual dots on aggregation view; Unavailable when more than 2 schools selected ."
                followCursor
              >
                <label>{labels.connectIndividual} </label>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PresetBar({ props, onSavePreset, onLoadPreset, ImportDataButton }) {
  const { handleFileUpload, handleResetToOnboarding, handleResetToLatest } =
    useContext(AppLevelContext);
  return (
    <div className="preset-buttons-row">
      <button
        className="btn"
        id="reset-btn"
        onClick={() => handleResetToOnboarding()} // function to reset the state to the initial state
      >
        <Tooltip title="Reset to on-boarding view" followCursor>
          <label>{labels.reset}</label>
        </Tooltip>
      </button>

      <button
        className="btn"
        id="reset-latest-btn"
        onClick={() => handleResetToLatest()} // function to reset the state to the initial state
      >
        <Tooltip title="Reset to view of the last saved preset" followCursor>
          <label>{labels.resetLatest}</label>
        </Tooltip>
      </button>

      <button
        className="btn"
        id="save-preset-btn"
        onClick={() => onSavePreset()} // function to save current state as a preset
      >
        <Tooltip
          title="Save current filters, axis fields and view mode settings to a preset file"
          followCursor
        >
          <label>{labels.savePreset}</label>
        </Tooltip>
      </button>

      <button
        className="btn"
        id="load-preset-btn"
        onClick={() => onLoadPreset()} // function to load a saved preset
      >
        <Tooltip
          title="Load filters, axis fields and view mode settings from a preset"
          followCursor
        >
          <label>{labels.loadPreset}</label>
        </Tooltip>
      </button>

      <ImportDataButton handleFileUpload={handleFileUpload} />

      <Editor triggerRenderByConfigChange={props.triggerRenderByConfigChange} />

      <ShowHelp />
    </div>
  );
}

function DeclineThresholdSlider({
  trend,
  setThreshold,
  isDisabled,
  minThreshold,
  label,
  filterWithTrendThreshold,
}) {
  const max = 0;
  const min = minThreshold;
  const handleSlopeChange = (event, newValue) => {
    setThreshold(newValue);
    filterWithTrendThreshold(trend, newValue);
  };

  return (
    <div style={{ margin: "5px 10px", width: "80%" }}>
      <div style={{ whiteSpace: "pre" }}>
        <Tooltip
          title="Set a threshold so the filtered data are declining under the thresthold."
          followCursor
        >
          <label> {label} </label>
        </Tooltip>
      </div>

      <Slider
        disabled={isDisabled}
        size="small"
        step={(max - min) / 50}
        defaultValue={max}
        min={min}
        max={max}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => <div>{value.toFixed(4)}</div>}
        onChange={handleSlopeChange}
      />
    </div>
  );
}

export default AxisSelectionCanvas;
