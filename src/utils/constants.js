// === START of fields that relate to English-Swedish translation ===

export const data_fields = [
  "Testdatum",
  "Lexplore Score",
  "Skola",
  "Årskurs",
  "Klass",
  "Födelsedatum",
  "Läsår",
  "Percentil",
  "Läsnivå (5 = hög)",
  "Stanine",
  "Standardpoäng",
  "Antal korrekta svar",
  "Antal fel svar",
  "Antal frågor",
  "Läshastighet medelvärde",
  "Läshastighet högläsning",
  "Läshastighet tystläsning",
];

export const y_data_fields = [
  "Lexplore Score",
  "Läsnivå (5 = hög)",
  "Antal korrekta svar",
  "Antal fel svar",
  "Antal frågor",
  "Läshastighet medelvärde",
  "Läshastighet högläsning",
  "Läshastighet tystläsning",
];

export const x_data_fields = [
  "Testdatum",
  "Skola",
  "Årskurs",
  "Klass",
  "Födelsedatum",
  "Läsår",
  "Percentil",
  "Stanine",
  "Standardpoäng",
];

export const color_fields = [
  "Skola",
  "Årskurs",
  "Klass",
  "Läsår",
  "Stanine",
  "Läsnivå (5 = hög)",
  "Invandringsdatum",
  "Kön",
];

export const season_choice_fields = ["Month", "Quarter", "Semester"];

export const labels = {
  xFieldLabel: "X-field",
  yFieldLabel: "Y-field",
  colorFieldLabel: "Color",
  trendFieldLabel: "Trend",
  // all the four above dropdowns
  trendOverallSlope: "with slope <",
  trendLogSlope: "with coeff <",
  trendLastTimeValue: "with value <",
  showLine: "Show Lines",
  showAverage: "Show Municipal Average",
  tenureCheckbox: "Class/  Tenure View",
  boxToggle: "Box",
  violinToggle: "Violin",
  circleToggle: "Circle",
  presentIndividual: "Present Individuals",
  connectIndividual: "Connect Individuals",
  reset: "Reset",
  resetLatest: "Reset to latest saved",
  savePreset: "Save Preset",
  loadPreset: "Load Preset",
  importData: "Import Data",
  editConfig: "Edit Config",
  saveConfig: "Save Config",
  help: "Help",
  plotPage: "Plot",
  helpPage: "Help",
  aboutPage: "About",
  logoutPage: "Logout",
  filterBySchoolandClass: "Filter by School and Class",
  filterByOptionRange: "Filter by Option/Range",
  schoolTreeTopLevelTag: "Schools",
  groupClassBy: "Group Classes By",
  symbolicFilterTag:
    'Symbolic Filter, e.g., "Skola.contains Bo AND Lexplore Score > 500"',
  aggregateView_X_tag: "Periods of Testdatum",
  brushTag: "Brush",
  deBrushTag: "De-Brush",
};

// ===End of fields that relate to English-Swedish translation===

export const plotMargin = { top: 20, right: 160, bottom: 80, left: 80 };

export const categoricals = [
  "Skola",
  "Klass",
  "Läsår",
  "Årskurs",
  "Läsnivå (5 = hög)",
  "Stanine",
  "Antal korrekta svar",
  "Antal fel svar",
  "Antal frågor",
  "ElevID",
];

export const teacher_choice_preset = {
  school: "Bodals skola",
  class: "5A",
  year: "21/22",
};
