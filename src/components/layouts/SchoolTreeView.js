import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import React, { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { sequenceIDfromYearSchoolClass } from "utils/AggregateUtils.js";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";
import "assets/App.css";
import Tooltip from "@mui/material/Tooltip";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grayTheme } from "assets/themes.js";
import { EmptyCheckBoxBlankIcon } from "assets/themes.js";
import { tenureSequenceTag } from "utils/tenureFormat.js";
import { colors20 } from "utils/Utils";
import { labels, GROUPING_OPTIONS } from "utils/constants";

function SchoolTreeView(props) {
  const {
    allClasses,
    selectedClasses,
    setSelectedClasses,
    isClassView,
    classColors,
    school_class_map,
    onColorPaletteClick,
    groupOption,
    setGroupOption,
    triggerRenderByConfig,
  } = props;

  const [areAllSchoolSelected, setAreAllSchoolSelected] = useState(true);
  const [paletteID, setPaletteID] = useState("");
  const [expandedSchools] = useState(["root"]); // "Bodals skola"
  const [classesGroupOptions] = useState(GROUPING_OPTIONS);

  useEffect(() => {
    const createComparableString = (obj) =>
      `${obj.school}-${obj.schoolYear}-${obj.class}`;

    // Sort both arrays based on the string representation
    const sortedAll = allClasses.map(createComparableString).sort();
    const sortedSelected = selectedClasses.map(createComparableString).sort();
    // Check if both sorted arrays are equal in length and all elements match
    const areAllClassesSelected =
      sortedAll.length === sortedSelected.length &&
      sortedAll.every((element, index) => element === sortedSelected[index]);

    if (areAllClassesSelected) {
      setAreAllSchoolSelected(true);
    } else {
      setAreAllSchoolSelected(false);
    }
  }, [selectedClasses, allClasses]);

  const handleAllSchoolsCheckChange = (isChecked) => {
    if (isChecked) {
      setSelectedClasses(allClasses);
    } else {
      setSelectedClasses([]);
    }
  };

  const handleColorChange = (school, sequenceID, newColor) => {
    setPaletteID("");
    onColorPaletteClick(school, sequenceID, newColor);
  };

  function sortedSequences(classesMap) {
    return Object.entries(classesMap).sort((a, b) => {
      // Extract sequenceIDs from the entries
      const sequenceID_A = a[0];
      const sequenceID_B = b[0];

      const valueA = tenureSequenceTag(sequenceID_A, groupOption);
      const valueB = tenureSequenceTag(sequenceID_B, groupOption);

      // For numerical or string comparison
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
  }

  return (
    <div className="school-tree-view" style={{ margin: "0px 3px" }}>
      <h4 style={{ textAlign: "center" }}>
        <Tooltip
          title="Välj skolor och klasser: ☑ för alla, ☐ för inga, och ▣ för några"
          followCursor
        >
          <label>{labels.filterBySchoolandClass} </label>
        </Tooltip>
      </h4>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormControl size="small" variant="outlined">
          <InputLabel
            sx={{
              backgroundColor: "white",
              paddingRight: "4px",
              paddingLeft: "4px", // Ensuring there's background padding
            }}
          >
            Aggregera klasser som
          </InputLabel>
          <MuiSelect
            sx={{ width: "10vw", height: "1.5vw" }}
            value={groupOption}
            onChange={(event) => setGroupOption(event.target.value)}
            label="class-group-field"
          >
            {classesGroupOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>
      </div>

      <TreeView
        style={{
          margin: "5px 5px",
          width: "100%",
          overflowX: "auto",
          maxWidth: "20vw",
          overflowY: "auto",
          maxHeight: "50vh",
        }}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={expandedSchools}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <Checkbox
            style={{ padding: "1px" }}
            checked={areAllSchoolSelected}
            indeterminate={!areAllSchoolSelected && selectedClasses.length > 0}
            onChange={(event) => {
              handleAllSchoolsCheckChange(event.target.checked);
            }}
          />

          <TreeItem
            nodeId="root"
            label={
              <div className="school-tree-label">
                {labels.schoolTreeTopLevelTag}
              </div>
            }
          >
            {Object.entries(school_class_map).map(
              ([school, classesMap], idx) => (
                <SchoolComponent
                  key={school}
                  props={{
                    school,
                    selectedClasses,
                    setSelectedClasses,
                    allClassesInSchool: allClasses.filter(
                      (c) => c.school === school
                    ),
                    sortedSequenceEntries: sortedSequences(classesMap),
                    idx,
                    setPaletteID,
                    paletteID,
                    handleColorChange,
                    isClassView,
                    classColors,
                    groupOption,
                    emptyFilterOptions: props.emptyFilterOptions,
                    triggerRenderByConfig,
                  }}
                />
              )
            )}
          </TreeItem>
        </div>
      </TreeView>
    </div>
  );
}

function SchoolComponent({ props }) {
  const {
    school,
    selectedClasses,
    setSelectedClasses,
    allClassesInSchool,
    sortedSequenceEntries,
    setPaletteID,
    paletteID,
    handleColorChange,
    isClassView,
    classColors,
    groupOption,
    emptyFilterOptions,
    triggerRenderByConfig,
  } = props;

  const isEmptiedByChildren = useMemo(() => {
    return emptyFilterOptions["schools"]?.some((item) => item === school);
  }, [school, emptyFilterOptions]);

  const [areAllClassesInSchoolSelected, setAreAllClassesInSchoolSelected] =
    useState(false);
  const [selectedClassesInSchool, setSelectedClassesInSchool] = useState(
    selectedClasses.filter((c) => c.school === school)
  );

  useEffect(() => {
    const createComparableString = (obj) =>
      `${obj.school}-${obj.schoolYear}-${obj.class}`;

    // Sort both arrays based on the string representation
    const sortedAll = allClassesInSchool.map(createComparableString).sort();
    const sortedSelected = selectedClassesInSchool
      .map(createComparableString)
      .sort();
    // Check if both sorted arrays are equal in length and all elements match
    const areAllInSchoolSelected =
      sortedAll.length === sortedSelected.length &&
      sortedAll.every((element, index) => element === sortedSelected[index]);

    if (areAllInSchoolSelected) {
      setAreAllClassesInSchoolSelected(true);
    } else {
      setAreAllClassesInSchoolSelected(false);
    }
  }, [school, selectedClassesInSchool, allClassesInSchool]);

  useEffect(() => {
    //update selected classes in school
    setSelectedClassesInSchool(
      selectedClasses.filter((c) => c.school === school)
    );
  }, [selectedClasses, school]);

  function handleSchoolCheckChange(isChecked) {
    if (isChecked) {
      setSelectedClasses((prev) => [
        ...prev.filter((c) => c.school !== school),
        ...allClassesInSchool,
      ]);
    } else {
      setSelectedClasses((prev) => prev.filter((c) => c.school !== school));
    }
  }

  return (
    <div id={school} style={{ display: "flex", alignItems: "flex-start" }}>
      <ThemeProvider
        key={`Theme-${school}`}
        theme={isEmptiedByChildren ? grayTheme : createTheme()}
      >
        <Checkbox
          icon={isEmptiedByChildren ? <EmptyCheckBoxBlankIcon /> : undefined}
          style={{ padding: "1px" }}
          checked={areAllClassesInSchoolSelected}
          indeterminate={
            !areAllClassesInSchoolSelected && selectedClassesInSchool.length > 0
          }
          onChange={(event) => handleSchoolCheckChange(event.target.checked)}
        />
      </ThemeProvider>
      {/* Render classes and other UI elements here */}

      <TreeItem
        nodeId={school}
        label={
          <div className="school-tree-label">
            {`${school}\t${sortedSequenceEntries.reduce(
              (acc, entry) =>
                acc +
                entry[1].classes.reduce(
                  (innerAcc, classItem) => innerAcc + classItem.studentIDs.size,
                  0
                ),
              0
            )}`}
          </div>
        }
        key={school}
      >
        {sortedSequenceEntries.map(([sequenceID, classes], cIdx) => (
          <ClassSequenceComponent
            key={sequenceID}
            id={sequenceID}
            props={{
              school,
              sequenceID,
              selectedClasses,
              setSelectedClasses,
              allClassesInSequence: classes.classes.map((item) => ({
                school: school,
                schoolYear: item.Läsår,
                class: item.Klass,
              })),
              classesInSequence: classes.classes.map((item) => ({
                classID: item.Läsår + "-" + item.Klass,
                studentIDCount: item.studentIDs.size,
              })),
              setPaletteID,
              paletteID,
              handleColorChange,
              isClassView,
              classColors,
              groupOption,
              emptyFilterOptions: props.emptyFilterOptions,
              triggerRenderByConfig,
            }}
          />
        ))}
      </TreeItem>
    </div>
  );
}

function ClassSequenceComponent({ props }) {
  const {
    school,
    sequenceID,
    selectedClasses,
    setSelectedClasses,
    allClassesInSequence,
    classesInSequence,
    setPaletteID,
    paletteID,
    handleColorChange,
    isClassView,
    classColors,
    handleYearlyClassCheckChange,
    groupOption,
    emptyFilterOptions,
    triggerRenderByConfig,
  } = props;

  const isEmptiedByChildren = useMemo(() => {
    return emptyFilterOptions["sequences"]?.some((item) => item === sequenceID);
  }, [sequenceID, emptyFilterOptions]);

  const [areAllClassesInSequenceSelected, setAreAllClassesInSequenceSelected] =
    useState(false);
  const [selectedClassesInSequence, setSelectedClassesInSequence] = useState(
    selectedClasses.filter(
      (c) =>
        c.school === school &&
        sequenceIDfromYearSchoolClass(
          parseInt(c.schoolYear.split("/")[0]),
          school,
          c.class,
          groupOption
        ) === sequenceID
    )
  );

  useEffect(() => {
    const createComparableString = (obj) =>
      `${obj.school}-${obj.schoolYear}-${obj.class}`;

    // Sort both arrays based on the string representation
    const sortedAll = allClassesInSequence.map(createComparableString).sort();
    const sortedSelected = selectedClassesInSequence
      .map(createComparableString)
      .sort();
    // Check if both sorted arrays are equal in length and all elements match
    const areAllInSequenceSelected =
      sortedAll.length === sortedSelected.length &&
      sortedAll.every((element, index) => element === sortedSelected[index]);

    if (areAllInSequenceSelected) {
      setAreAllClassesInSequenceSelected(true);
    } else {
      setAreAllClassesInSequenceSelected(false);
    }
  }, [selectedClassesInSequence, allClassesInSequence]);

  useEffect(() => {
    //update selected classes in sequence
    setSelectedClassesInSequence(
      selectedClasses.filter(
        (c) =>
          c.school === school &&
          sequenceIDfromYearSchoolClass(
            parseInt(c.schoolYear.split("/")[0]),
            school,
            c.class,
            groupOption
          ) === sequenceID
      )
    );
  }, [selectedClasses, sequenceID, school, groupOption]);

  const [sequenceTag, setSequenceTag] = useState(
    tenureSequenceTag(sequenceID, groupOption)
  );

  useEffect(() => {
    setSequenceTag(tenureSequenceTag(sequenceID, groupOption));
  }, [sequenceID, groupOption, triggerRenderByConfig]);

  function handleClassSequenceCheckChange(isChecked) {
    if (isChecked) {
      //setSelectedClassesInSequence(allClassesInSequence);
      setSelectedClasses((prev) => [
        ...prev.filter(
          (c) =>
            c.school !== school ||
            sequenceIDfromYearSchoolClass(
              parseInt(c.schoolYear.split("/")[0]),
              school,
              c.class,
              groupOption
            ) !== sequenceID
        ),
        ...allClassesInSequence,
      ]);
    } else {
      //setSelectedClassesInSequence([]);
      setSelectedClasses((prev) =>
        prev.filter(
          (c) =>
            c.school !== school ||
            sequenceIDfromYearSchoolClass(
              parseInt(c.schoolYear.split("/")[0]),
              school,
              c.class,
              groupOption
            ) !== sequenceID
        )
      );
    }
  }

  return (
    <div
      key={sequenceID}
      id={sequenceID}
      style={{ display: "flex", alignItems: "flex-start" }}
    >
      {/* //  style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }} */}
      <ThemeProvider
        key={`Theme-${sequenceID}`}
        theme={isEmptiedByChildren ? grayTheme : createTheme()}
      >
        <Checkbox
          icon={isEmptiedByChildren ? <EmptyCheckBoxBlankIcon /> : undefined}
          checked={areAllClassesInSequenceSelected}
          style={{ padding: "1px" }}
          indeterminate={
            !areAllClassesInSequenceSelected &&
            selectedClassesInSequence.length > 0
          }
          onChange={(event) =>
            handleClassSequenceCheckChange(event.target.checked)
          }
        />
      </ThemeProvider>
      <TreeItem
        nodeId={`classSequence-${sequenceID}`}
        label={
          <div className="school-tree-label">
            {`${sequenceTag}\t${Object.values(classesInSequence).reduce(
              (acc, item) => acc + item.studentIDCount,
              0
            )}`}
          </div>
        }
        key={sequenceID}
      >
        {!["school-year", "trajectory"].includes(groupOption) &&
          Object.values(classesInSequence).map((item) => (
            <SingleYearClassComponent
              key={`${school}-${item.classID}`}
              id={`${school}-${item.classID}`}
              props={{
                school,
                selectedClasses,
                setSelectedClasses,
                handleYearlyClassCheckChange,
                yearlyClass: item.classID,
                setPaletteID,
                paletteID,
                handleColorChange,
                isClassView,
                classColors,
                emptyFilterOptions: props.emptyFilterOptions,
                classIDCount: item.studentIDCount,
              }}
            />
          ))}
      </TreeItem>
      <div>
        <div
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: props.isClassView
              ? props.classColors[school][sequenceID]
              : "white",
            marginLeft: "5px",
            marginTop: "6px",
          }}
          onClick={() => setPaletteID(sequenceID)}
        />
        {paletteID === sequenceID && props.isClassView && (
          <div style={{ marginTop: "5px" }}>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} style={{ display: "flex" }}>
                {colors20()
                  .slice(row * 5, (row + 1) * 5)
                  .map((paletteColor, index) => (
                    <div
                      key={index}
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: paletteColor,
                        marginLeft: "2px",
                      }}
                      onClick={() =>
                        handleColorChange(school, sequenceID, paletteColor)
                      }
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SingleYearClassComponent({ props }) {
  const {
    school,
    setSelectedClasses,
    selectedClasses,
    yearlyClass,
    setPaletteID,
    paletteID,
    handleColorChange,
    isClassView,
    classColors,
    emptyFilterOptions,
    classIDCount,
  } = props;

  const [isClassChecked, setIsClassChecked] = useState(false);

  const isOptionEmptiedByOthers = useMemo(() => {
    return emptyFilterOptions["classes"]?.some(
      (item) =>
        item.school === school &&
        item.schoolYear === yearlyClass.split("-")[0] &&
        item.class === yearlyClass.split("-")[1]
    );
  }, [emptyFilterOptions, school, yearlyClass]);

  useEffect(() => {
    setIsClassChecked(
      selectedClasses.some(
        (c) =>
          c.school === school &&
          c.schoolYear === yearlyClass.split("-")[0] &&
          c.class === yearlyClass.split("-")[1]
      )
    );
  }, [selectedClasses, school, yearlyClass]);

  function handleYearlyClassCheckChange(isChecked) {
    const schoolYear = yearlyClass.split("-")[0];
    const className = yearlyClass.split("-")[1];
    if (isChecked) {
      setSelectedClasses((prev) => [
        ...prev.filter(
          (c) =>
            !(
              c.school === school &&
              c.schoolYear === schoolYear &&
              c.class === className
            )
        ),
        { school: school, schoolYear: schoolYear, class: className },
      ]);
    } else {
      setSelectedClasses((prev) =>
        prev.filter(
          (c) =>
            !(
              c.school === school &&
              c.schoolYear === schoolYear &&
              c.class === className
            )
        )
      );
    }
  }

  const defaultTheme = createTheme();

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "row" }}
    >
      <TreeItem
        nodeId={`classByYear-${school}-${yearlyClass}`}
        label={
          <div className="school-tree-label">
            <ThemeProvider
              key={`Theme-${school}-${yearlyClass}`}
              theme={isOptionEmptiedByOthers ? grayTheme : defaultTheme}
            >
              <Checkbox
                icon={
                  isOptionEmptiedByOthers ? (
                    <EmptyCheckBoxBlankIcon />
                  ) : undefined
                }
                checked={isClassChecked}
                onChange={(event) =>
                  handleYearlyClassCheckChange(event.target.checked)
                }
              />
            </ThemeProvider>
            {/* <Tooltip title={transformClassTooltip(yearlyClass)} followCursor>        */}
            <label>{yearlyClass + " " + classIDCount}</label>
            {/* </Tooltip> */}
          </div>
        }
        key={yearlyClass}
      />

      <div>
        <div
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: isClassView
              ? classColors[school][yearlyClass]
              : "white",
            marginLeft: "5px",
          }}
          onClick={() => setPaletteID(yearlyClass)}
        />
        {paletteID === yearlyClass && isClassView && (
          <div style={{ marginTop: "5px" }}>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} style={{ display: "flex" }}>
                {colors20()
                  .slice(row * 5, (row + 1) * 5)
                  .map((paletteColor, index) => (
                    <div
                      key={index}
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: paletteColor,
                        marginLeft: "2px",
                      }}
                      onClick={() =>
                        handleColorChange(school, yearlyClass, paletteColor)
                      }
                    />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SchoolTreeView;
