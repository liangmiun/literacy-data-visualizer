# Help

## Import Data

- Click on "Import Data" button on the top of webpage to import a .csv data. The .csv would stay at the user's client-side browser and be visualized.
- The user-imported .csv is expected to include fields as below, so that the fields-based tree/option/range filters would operate at their full capacity.
  > " Skola, Årskurs, Klass, ElevID, Födelsedatum, Läsår, Testdatum, Percentil, Läsnivå (5 = hög), Stanine, Standardpoäng, Lexplore Score "

- If no data is imported by user, the webpage would present a sample data from the server-side which is AES-encrypted by Firebase key.

## The scatterplot view

  Toggle off "Is Class View" to show a scatterplot of literacy record of individual students.

1. Dimensions:

    - Click on X-filed, Y-Field to select the record field intended for X-axis and Y-axis.
    - Click on Color to select a record field whose values would present as different colors.
2. Filtering:
    - Toggle the "Only declined score" to show only the individuals with linear-regression declining lexplore scores.
    - Navigate the School/Class tree  on the right side "Filter by School/Class" panel and toggle checkboxes, to filter results based on school and class-within-that-school selections.
    - Select some filters for Grade/School Year/ Lexplore School/ Stanine/ Birth Date/ Test Date from the "Filter by options/ranges" panel on the right side, and select the desired option/range by checkbox or slider.
    - Filter by logical expressions like "Skola.contains Bo AND Lexplore Score > 500" in the Symbolic Filter in the bottom right.
    - When some or all the four filter panels work together, they work in a conjunctional way, like "Filter-by-school-Class AND Filter-by-options-ranges".
3. Individual and group selection on the plot
    - Select an individual dot by left-clicking, and its detailed would show on the top-right detail panel.
    - Records belonging to the same student are connected by lines.
    - Select multiple individuals, by clicking on the brush button (in the bottom-right of plot) and then rectangle-brush the desired dots, and their aggregated detail would show on the detail panel. De-select them by clicking on the de-brush button.
4. Zoom and Pan: use mouse rolling and dragging to zoom and pan. Zoom and pan would stop when you are doing brushing (group selection).
  
5. Saving and loading presets
    - Clicking on save preset would save a local json file containing information of  current axis and filters configurations.
    - Clicking on load preset would load a preset json file into the current view.
  
## The class aggregation plot 

  Toggle on "Is Class View" to show box/violin/circle plots of aggregation measures of selected classes.

- Click on the top-sided Violin/Box button to switch between box/violin view.
- Toggle the "Show Individuals" checkbox between showing or not showing individual dots in classes.
- Click on a single box or violin, and its aggregated detail would show in the detail panel on the right.
- The box/violin plots represent the performance of students from the same class across different years, with each cross-year-class consistently color-coded for easy comparison. The lines connecting the box plots illustrate the progression or trends of these student groups over the years.