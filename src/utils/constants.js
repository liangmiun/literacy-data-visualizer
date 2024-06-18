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

export const season_choice_fields = ["Månad", "Kvartal", "Termin"];

export const labels = {
  xFieldLabel: "X-axel",
  yFieldLabel: "Y-axel",
  colorFieldLabel: "Färgläggning",
  trendFieldLabel: "Trend",
  // all the four above dropdowns
  trendOverallSlope: "med lutning <",
  trendLogSlope: "med koefficient <",
  trendLastTimeValue: "med värde <",
  showLine: "Visa Linjer",
  showAverage: "Visa Genomsnittslinjer",
  tenureCheckbox: "Aggregera datan",
  boxToggle: "Box",
  violinToggle: "Violin",
  circleToggle: "Punkt",
  presentIndividual: "Visa individer",
  connectIndividual: "Koppla samman individer",
  reset: "Nollställ",
  resetLatest: "Nollställ till senast sparad",
  savePreset: "Spara vy",
  loadPreset: "Ladda vy",
  importData: "Importera data",
  editConfig: "Ändra inställningar",
  saveConfig: "Spara inställningar",
  help: "Instruktioner",
  plotPage: "Visualisering",
  helpPage: "Instruktioner",
  aboutPage: "Omnämningar",
  logoutPage: "Stäng ner",
  filterBySchoolandClass: "Filtrera över skola och klasser.",
  filterByOptionRange: "Filtreringsval",
  schoolTreeTopLevelTag: "Skolor",
  groupClassBy: "Aggregera klasser som",
  symbolicFilterTag:
    'Symboliskt filter',
  aggregateView_X_tag: "Testperioder",
  brushTag: "Markera",
  deBrushTag: "Avmarkera",
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
