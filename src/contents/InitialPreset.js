export const initial_preset = JSON.stringify( 
  {"xField":"Testdatum",
  "yField":"Lexplore Score",
  "colorField":"Årskurs",
  "checkedOptions":{"Årskurs":[2,3,4,1,5,6,7,9,8],"Läsår":["18/19","19/20","20/21","21/22","22/23"],
  "Stanine":[null,7,5,8,4,9,3,6,2,1]},
  "rangeOptions":{"Födelsedatum":["2006-01-03T23:00:00.000Z","2011-04-24T22:00:00.000Z"],
      "Testdatum":["2019-03-06T23:00:00.000Z","2023-02-02T23:00:00.000Z"],
      "Lexplore Score":[128,855]},
  "query":"","expression":"",
  "isClassView":true,
  "showLines":true,
  "aggregateType":"circle",
  "selectedClasses":[
      {"school":"Bodals skola","schoolYear":"19/20","class":"6A"},
      {"school":"Bodals skola","schoolYear":"20/21","class":"7A"},
      {"school":"Bodals skola","schoolYear":"21/22","class":"8A"},
      {"school":"Bodals skola","schoolYear":"22/23","class":"9A"},
      {"school":"Bodals skola","schoolYear":"19/20","class":"6B"},
      {"school":"Bodals skola","schoolYear":"20/21","class":"4A"},
      {"school":"Bodals skola","schoolYear":"21/22","class":"5A"},
      {"school":"Bodals skola","schoolYear":"22/23","class":"6A"},
      {"school":"Bodals skola","schoolYear":"20/21","class":"4B"},
      {"school":"Bodals skola","schoolYear":"21/22","class":"5B"},
      {"school":"Bodals skola","schoolYear":"22/23","class":"6B"},
      {"school":"Bodals skola","schoolYear":"19/20","class":"4A"},
      {"school":"Bodals skola","schoolYear":"20/21","class":"5A"},
      {"school":"Bodals skola","schoolYear":"21/22","class":"6A"},
      {"school":"Bodals skola","schoolYear":"22/23","class":"7A"},
      {"school":"Bodals skola","schoolYear":"18/19","class":"4A"},
      {"school":"Bodals skola","schoolYear":"19/20","class":"5A"},
      {"school":"Bodals skola","schoolYear":"20/21","class":"6A"},
      {"school":"Bodals skola","schoolYear":"21/22","class":"7A"},
      {"school":"Bodals skola","schoolYear":"22/23","class":"8A"},
      {"school":"Bodals skola","schoolYear":"18/19","class":"4B"},
      {"school":"Bodals skola","schoolYear":"19/20","class":"5B"},
      {"school":"Bodals skola","schoolYear":"20/21","class":"6B"},
      {"school":"Bodals skola","schoolYear":"21/22","class":"7B"},
      {"school":"Bodals skola","schoolYear":"22/23","class":"8B"}
  ]}  
 );


export var latest_preset = initial_preset;


export function updateLatestPreset(newPreset) {

    latest_preset = newPreset;
  }
