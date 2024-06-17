import React, { useState, useEffect, useRef, useMemo } from "react";
import { AppContextProvider } from "./context/AppLevelContext";
import { csvParse } from "d3";
import CryptoJS from "crypto-js";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLocation,
} from "react-router-dom";
import { rowParser, load } from "./utils/Utils";
import {
  data_fields,
  y_data_fields,
  season_choice_fields,
  teacher_choice_preset,
} from "./utils/constants";
import { useAuth } from "./authentications/AuthContext";
import ProtectedWrapper from "./authentications/ProtectedWrapper";
import Login from "./authentications/Login";
import Logout from "./authentications/Logout";
import * as settingsIO from "./utils/settingsIO";
import "./assets/App.css";
import About from "./components/screens/About";
import Help from "./components/screens/Help";
import ScatterPage from "./components/screens/ScatterPage";

const App = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [logicFilteredData, setLogicFilteredData] = useState(data);
  const [encryptKey, setEncryptKey] = useState("");
  const [isLogin, setIsLogin] = useState(false); //  set as true for test purpose without login;
  const [showLines, setShowLines] = useState(false);
  const [xField, setXField] = useState("Testdatum");
  const [yField, setYField] = useState("Lexplore Score");
  const [seasonField, setSeasonField] = useState("Quarter");
  const [colorField, setColorField] = useState("Årskurs");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [query, setQuery] = useState("");
  const [expression, setExpression] = useState("");
  const [checkedOptions, setCheckedOptions] = useState({
    Årskurs: [],
    Läsår: [],
    Stanine: [],
  });
  const [rangeOptions, setRangeOptions] = useState({
    Födelsedatum: [],
    Testdatum: [],
    "Lexplore Score": [],
  });
  const [isClassView, setIsClassView] = useState(true);
  const [aggregateType, setAggregateType] = useState("circle");
  const fields = data_fields;
  const fields_x = isClassView
    ? season_choice_fields
    : data_fields.filter((element) => !y_data_fields.includes(element));
  const fields_y = y_data_fields;
  const [userType, setUserType] = useState("principal");
  const [schoolClassMapForTeacher, setSchoolClassMapForTeacher] = useState({});
  const [teacherChoice, setTeacherChoice] = useState({});

  const savePresetSetters = {
    xField,
    yField,
    colorField,
    selectedClasses,
    checkedOptions,
    rangeOptions,
    query,
    expression,
    isClassView,
    showLines,
    aggregateType,
  };

  const configSetters = useMemo(
    () => ({
      setXField,
      setYField,
      setColorField,
      setSelectedClasses,
      setCheckedOptions,
      setRangeOptions,
      setQuery,
      setExpression,
      setIsClassView,
      setShowLines,
      setAggregateType,
    }),
    []
  );

  const fileUploadSetters = {
    setData,
    setLogicFilteredtData: setLogicFilteredData,
  };

  const onResetToOnboardingRef = useRef();

  useEffect(() => {
    // Update the ref's current value whenever userType changes
    onResetToOnboardingRef.current = settingsIO.handleResetToOnboarding(
      configSetters,
      userType,
      teacherChoice
    );
  }, [configSetters, userType, teacherChoice]); // Dependency array includes userType to react to its changes

  const onResetToLatest = settingsIO.handleResetToLatest(configSetters);
  const onSavePreset = settingsIO.saveConfig(savePresetSetters);
  const onSetConfigFromPreset = settingsIO.setConfigFromPreset(configSetters);
  const onFileUpload = (event) => {
    settingsIO.handleFileUpload(event, fileUploadSetters);
  };

  useEffect(() => {
    if (!isLogin) return;
    fetch(process.env.PUBLIC_URL + "/LiteracySampleEncrypt.csv")
      .then((response) => response.text()) // Get as text, not JSON
      .then((encryptedData) => {
        // Decrypt data
        const bytes = CryptoJS.AES.decrypt(encryptedData, encryptKey); // Replace with encryptKey
        const originalData = bytes.toString(CryptoJS.enc.Utf8);
        const parsedData = csvParse(originalData, rowParser);
        setData(parsedData);
        setLogicFilteredData(parsedData);
        onResetToOnboardingRef.current();
      })
      .catch((error) => {
        console.error("Error fetching or parsing data:", error);
      });
  }, [isLogin, encryptKey, userType]);

  useEffect(() => {
    if (
      isLogin &&
      Object.keys(teacherChoice).length === 0 &&
      Object.keys(schoolClassMapForTeacher).length > 0
    ) {
      const schoolYearClassMap = {};
      Object.keys(schoolClassMapForTeacher).forEach((school) => {
        schoolYearClassMap[school] = Object.keys(
          schoolClassMapForTeacher[school]
        ).reduce((acc, key) => {
          const [, yearClass] = key.split(":"); // Ignore the school part, split by ':'
          const [year, classTag] = yearClass.split("-"); // Split by '-' to get year and class tag
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(classTag);
          return acc;
        }, {});
      });
      queryTeachOrPrincipal(schoolYearClassMap);
    }

    function queryTeachOrPrincipal(schoolYearClassMap) {
      // Create the modal container
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "50%";
      modal.style.left = "50%";
      modal.style.width = "400px";
      modal.style.height = "auto"; // Adjusted for content size
      modal.style.transform = "translate(-50%, -50%)";
      modal.style.backgroundColor = "#EFEFEF";
      //modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.style.flexDirection = "column";
      modal.style.padding = "20px";
      modal.style.zIndex = "1000"; // Make sure it's on top

      // Create title element
      const title = document.createElement("h2");
      title.textContent = "Choose your onboarding view";
      title.style.marginBottom = "20px"; // Space below the title
      modal.appendChild(title);

      // Create the dropdowns
      const schoolSelect = document.createElement("select");
      const yearSelect = document.createElement("select");
      const classSelect = document.createElement("select");

      // Function to update Year options based on selected School
      function updateYearOptions(selectedSchool) {
        yearSelect.innerHTML = ""; // Clear previous options
        Object.keys(schoolYearClassMap[selectedSchool]).forEach((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
        updateClassOptions(selectedSchool, yearSelect.value); // Update class options for the initial year
      }

      // Function to update Class options based on selected School and Year
      function updateClassOptions(selectedSchool, selectedYear) {
        classSelect.innerHTML = ""; // Clear previous options
        schoolYearClassMap[selectedSchool][selectedYear].forEach((cls) => {
          const option = document.createElement("option");
          option.value = cls;
          option.textContent = cls;
          classSelect.appendChild(option);
        });
      }

      // Populate School dropdown and initial cascading options
      Object.keys(schoolYearClassMap).forEach((school) => {
        const option = document.createElement("option");
        option.value = school;
        option.textContent = school;
        schoolSelect.appendChild(option);
      });

      schoolSelect.value = teacher_choice_preset.school;
      updateYearOptions(schoolSelect.value); // Initially populate year and class based on first school

      setTimeout(() => {
        // Use setTimeout to ensure DOM updates have been processed
        yearSelect.value = teacher_choice_preset.year;
        updateClassOptions(schoolSelect.value, yearSelect.value); // Populate classes based on the selected year and school
      }, 0);

      setTimeout(() => {
        classSelect.value = teacher_choice_preset.class;
      }, 0);

      // Event listener to update Year and Class dropdowns when School changes
      schoolSelect.addEventListener("change", () => {
        updateYearOptions(schoolSelect.value);
      });

      // Event listener to update Class dropdown when Year changes
      yearSelect.addEventListener("change", () => {
        updateClassOptions(schoolSelect.value, yearSelect.value);
      });

      // Create Teacher's button
      const teacherButton = document.createElement("button");
      teacherButton.textContent = "Teacher's Onboarding View";
      teacherButton.style.marginBottom = "10px"; // Space between buttons
      teacherButton.onclick = function () {
        setUserType("teacher");
        setTeacherChoice({
          school: schoolSelect.value,
          year: yearSelect.value,
          class: classSelect.value,
        });
        document.body.removeChild(modal); // Remove the modal on click
      };
      // Append dropdowns to modal before the buttons
      // Container for selects and button
      const selectionContainer = document.createElement("div");
      selectionContainer.style.border = "1px solid #ccc";
      selectionContainer.style.padding = "10px";
      selectionContainer.style.marginBottom = "20px"; // Space between container and button

      // Create and append labels and selects with style adjustments
      function createSelectWithLabel(labelText, selectElement) {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.marginBottom = "10px"; // Space between rows

        const label = document.createElement("label");
        label.textContent = labelText;
        label.style.marginRight = "10px"; // Space between label and select

        container.appendChild(label);
        container.appendChild(selectElement);
        selectionContainer.appendChild(container);
      }

      // Adjust styles for selects for better appearance
      [schoolSelect, yearSelect, classSelect].forEach((select) => {
        select.style.width = "40%";
        //select.style.marginBottom = "10px";
      });

      // Create and append each select with its label
      createSelectWithLabel("School:", schoolSelect);
      createSelectWithLabel("Year:", yearSelect);
      createSelectWithLabel("Class:", classSelect);

      // Append the selection container before the buttons in the modal
      modal.appendChild(selectionContainer);

      // Modify teacherButton style to be within the container
      teacherButton.style.width = "100%";
      selectionContainer.appendChild(teacherButton);

      // Create Principal's button
      const principalButton = document.createElement("button");
      principalButton.textContent = "Principal's Onboarding View";
      principalButton.onclick = function () {
        setUserType("principal");
        document.body.removeChild(modal);
      };
      modal.appendChild(principalButton);

      // Append modal to the body
      document.body.appendChild(modal);
    }
  }, [isLogin, schoolClassMapForTeacher, teacherChoice]);

  const appContextValue = {
    data,
    setSchoolClassMapForTeacher,
    logicFilteredData,
    setLogicFilteredData,
    xField,
    setXField,
    yField,
    setYField,
    seasonField,
    setSeasonField,
    colorField,
    setColorField,
    fields,
    fields_x,
    fields_y,
    save: onSavePreset,
    load,
    query,
    setQuery,
    expression,
    setExpression,
    selectedClasses,
    setSelectedClasses,
    checkedOptions,
    setCheckedOptions,
    rangeOptions,
    setRangeOptions,
    handleFileUpload: onFileUpload,
    setConfigFromPreset: onSetConfigFromPreset,
    showLines,
    setShowLines,
    handleResetToOnboarding: onResetToOnboardingRef.current,
    handleResetToLatest: onResetToLatest,
    isClassView,
    setIsClassView,
    aggregateType,
    setAggregateType,
  };

  return (
    <Router basename="literacy-data-visualizer">
      <div className="grid-container">
        <div className="navigation-container">
          <Navigation currentUser={currentUser} />
        </div>
        <div className="content">
          <Routes>
            <Route
              path="/login"
              element={
                <Login setEncryptKey={setEncryptKey} setIsLogin={setIsLogin} />
              }
            />
            <Route
              path="/logout"
              element={
                <ProtectedWrapper
                  element={<Logout setIsLogin={setIsLogin} />}
                />
              }
            />
            <Route
              path="/help"
              element={<ProtectedWrapper element={<Help />} />}
            />
            <Route
              path="/about"
              element={<ProtectedWrapper element={<About />} />}
            />
            <Route
              path="/"
              element={
                <ProtectedWrapper
                  element={
                    <AppContextProvider value={appContextValue}>
                      <ScatterPage />
                    </AppContextProvider>
                  }
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

function Navigation({ currentUser }) {
  const location = useLocation(); // Correct use within a functional component

  return (
    <nav className="navigation">
      <ul className="headers">
        {currentUser ? (
          <>
            <li className="header-li-style">
              <Link to="/">Plot</Link>
            </li>
            <li className="header-li-style">
              <Link to="/help">Help</Link>
            </li>
            <li className="header-li-style">
              <Link to="/about">About</Link>
            </li>
            {location.pathname !== "/" && (
              <li className="header-li-style">
                <Link to="/logout">Logout</Link>
              </li>
            )}
          </>
        ) : (
          <li className="header-li-style">
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default App;
