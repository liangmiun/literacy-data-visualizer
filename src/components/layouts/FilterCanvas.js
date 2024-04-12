import React from "react";
import "rc-slider/assets/index.css";
import SchoolTreeView from "./SchoolTreeView";
import { OptionSelectGroup } from "./ValueSelect";
import "assets/App.css";

const FilterCanvas = (props) => {
  return (
    <div className="filter-canvas">
      <SchoolTreeView
        id="school-tree-view"
        className="school-tree-view"
        allClasses={props.allClasses}
        selectedClasses={props.selectedClasses}
        setSelectedClasses={props.setSelectedClasses}
        isClassView={props.isClassView}
        school_class_map={props.school_class_map}
        onColorPaletteClick={props.onColorPaletteClick}
        classColors={props.classColors}
        groupOption={props.groupOption}
        setGroupOption={props.setGroupOption}
        emptyFilterOptions={props.emptyFilterOptions}
      />

      <OptionSelectGroup
        className="option-select-group"
        data={props.data}
        setFilterList={props.setFilterList}
        checkedOptions={props.checkedOptions}
        setCheckedOptions={props.setCheckedOptions}
        rangeOptions={props.rangeOptions}
        setRangeOptions={props.setRangeOptions}
        emptyFilterOptions={props.emptyFilterOptions}
      />
    </div>
  );
};

export default FilterCanvas;
