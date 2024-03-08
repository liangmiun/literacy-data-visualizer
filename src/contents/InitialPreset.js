 export const initial_preset = JSON.stringify( 
  {"xField":"Testdatum",
  "yField":"Lexplore Score",
  "colorField":"Årskurs",
  "checkedSchools":["Bodals skola"],
  "checkedClasses":["Bodals skola.Boda:17-4A","Bodals skola.Boda:17-4B","Bodals skola.Boda:18-4A","Bodals skola.Boda:18-4B","Bodals skola.Boda:19-4A",
  "Bodals skola.Boda:20-4A","Bodals skola.Boda:20-4B","Bodals skola.Boda:20-7A","Bodals skola.Boda:21-7A","Bodals skola.Boda:21-7B",  "Bodals skola.Boda:22-7A"],
  "checkedOptions":{"Årskurs":[2,3,4,1,5,6,7,9,8],"Läsår":["18/19","19/20","20/21","21/22","22/23"],
  "Stanine":[null,7,5,8,4,9,3,6,2,1]},
  "rangeOptions":{"Födelsedatum":["2006-01-03T23:00:00.000Z","2011-04-24T22:00:00.000Z"],
  "Testdatum":["2019-03-06T23:00:00.000Z","2023-02-02T23:00:00.000Z"],
  "Lexplore Score":[128,855]},"query":"","expression":"",
  "isClassView":true,"showLines":true,"aggregateType":"circle"}
 );


export var latest_preset = initial_preset;


export function updateLatestPreset(newPreset) {

    latest_preset = newPreset;
  }

