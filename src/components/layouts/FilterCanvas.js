import React, { useContext } from "react";
import AppLevelContext from "context/AppLevelContext";
import "rc-slider/assets/index.css";
import SchoolTreeView from "./SchoolTreeView";
import { OptionSelectGroup } from "./ValueSelect";
import "assets/App.css";

const FilterCanvas = (props) => {
  const {
    data,
    selectedClasses,
    setSelectedClasses,
    rangeOptions,
    setRangeOptions,
    checkedOptions,
    setCheckedOptions,
    isClassView,
  } = useContext(AppLevelContext);

  return (
    <div className="filter-canvas">
      <SchoolTreeView
        id="school-tree-view"
        className="school-tree-view"
        allClasses={props.allClasses}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        isClassView={isClassView}
        school_class_map={props.school_class_map}
        onColorPaletteClick={props.onColorPaletteClick}
        classColors={props.classColors}
        groupOption={props.groupOption}
        setGroupOption={props.setGroupOption}
        emptyFilterOptions={props.emptyFilterOptions}
        triggerRenderByConfig={props.triggerRenderByConfig}
      />

      <OptionSelectGroup
        className="option-select-group"
        data={data}
        setFilterList={props.setFilterList}
        checkedOptions={checkedOptions}
        setCheckedOptions={setCheckedOptions}
        rangeOptions={rangeOptions}
        setRangeOptions={setRangeOptions}
        emptyFilterOptions={props.emptyFilterOptions}
      />
    </div>
  );
};

export default FilterCanvas;
