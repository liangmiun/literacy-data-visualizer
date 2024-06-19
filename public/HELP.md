# Instruktioner
Välkommen till IMPRESS-visualiseringen. Kortfattat tar den rådata som beskriver individers läskunnighet och -vana, för att enklare ge en överblick för olika intressegrupper, t.ex. lärare kan se över sina direkta elevers resultat, samt deras resultat innan de blev hens elever, och rektorer kan se över hela sin verksamhets framgång, eller regression. Vid första anblick, och särskilt för den ovana, kan upplevelsen verka överväldigande. Om man bryter ner upplevelsen till några steg i taget, blir den mycket mera användarvänlig. Instruktionerna här kommer inte *bara* att beskriva hur varje komponent påverkar upplevelsen, men de kommer också att göra det i den ordningen designerna anser att man bör närma sig upplevelsen.

## Kom igång
Innan man har någon som helst möjlighet att börja utforska sin data, behöver applikationen data. Högst upp till höger, i samma ruta med knappen för instruktionerna, finns det en knapp där det står "Importera Data". Därifrån laddar du en .csv fil, som enkelt går att exportera från Excel.

### Ladda in data
Notera att ev. konfidentialitet kring datan är helt och hållet bevarad och utan risk för att äventyras. Kortfattat är denna visualiseringsupplevelse levererad till din webbläsare, och sedan är datan endast lokalt laddad till din webbläsare; den skickas inte vidare på något vis överhuvudtaget. Detta går att bekräfta (och även försäkra sig om) genom att ladda upplevelsen, bryta internet anslutningen, och sedan ladda upp datan; det funkar eftersom allt från internet är redan hämtat och ingen vidare koppling till internet behövs vid det laget.

Datan bör ha dessa kolumner från Lexplore för att kunda laddas:
  > " Skola, Årskurs, Klass, ElevID, Födelsedatum, Läsår, Testdatum, Percentil, Läsnivå (5 = hög), Stanine, Standardpoäng, Lexplore Score "

### Välj startvy
Efter att datan har laddats, får du valmöjlighet att välja vilken vy du vill börja med. Det finns två generella vyer: Lärare och Rektor/Skolchef.
* Som lärare, får du välja vilken klass och årsgång du vill börja visa, som ett sätt att få lagom med data att visa till att börja med.
* Som rektor/skolchef visar all data på en gång.
Notera att valet påverkar *bara* startvyn; inga begränsningar sätts på hur datan filtreras och visas.

## Utforska datan
Nu när datan är laddad och startvy är vald, kan du börja utforska datan. Det finns en massa olika funktioner för att interagera med datan, och för att begripa dem, rekommenderas det att man tacklar en i taget. Det finns generellt två olika metoder att interagera med datan: Direkt frågebesvarning och allmän utforskning.

För frågebesvarning börjar man med en särskild, konkret fråga, och sedan använder man sina verktyg för att ta reda på det. För ett sådant tillvägagångsätt, är det bra att veta vilka verktyg man har till hands, och därför är det nog en rätt dålig tillvägagångsätt för nybörjare. Därför rekommenderas det istället att börja med utforsking medan man lär sig mer om visualiseringsupplevelsens verktyg. Se det som att "leka runt" lite, medan man *kanske* lyckas få någon djupare förståelse under tiden.

### Att tolka grafen
Grafen, som befinner sig i nedre vänstra hörnet av sidan, är huvudkomponenten av hela visualiseringsupplevelsen. Den framställer datan efter samtliga inställningar och funktioner som är tillgängliga. Den föreställer en vanlig graf med två axlar, samt punkter som placeras ut i grafen i förhållande till axlarna. Dessa punkter har en färg som beskrivs med en liten hjälpruta till höger i grafen. Punkterna går att klicka på för att få mer information om dem till höger om grafen, i informationsrutan. När en punkt är klickad, visas det tydligt i grafen genom någon form av highlight. Det går att zooma in och ut med scroll-hjulet eller scroll-funktionen på en musplatta och flytta runt punkterna i grafen genom att klicka och dra i bakgrunden.

Punkterna är bundna med linjer mellan sig, som går att stänga av i tredje rutan från vänster ovanför grafen. Dessa linjer binder samman samma enheter från olika tidstillfällen. I samma ruta går det även att visa genomsnittslinjer för datasetet.

Det går att byta vilka attributer som representeras av axlarna och färgerna genom att välja attributer i menyerna i första rutan från vänster ovanför grafen.

Allt detta är vad som gäller generellt för grafen, men det finns två olika sätt att framställa datan i grafen: Individuell och aggregerad framställning.

#### Olika framställningar
I den individuella framställningen visas punkter som förhåller sig till endast en individ. Denna framställning ger en bättre överblick över varje enskild persons läskunnighet och -vana. I den aggregerade framställningen är klasser, stadier, och årsgångar i fokus istället, vilket kan ge en enklare överblick över en hela skolans resultat. Det går fritt att byta mellan varje framställning utan att oberoende inställningar ändras eller nollställs. Vissa inställningar som beror direkt på vilken framställning som visas sparas mellan byten, så du behöver inte göra om dessa inställningar varje gång man går tillbaka. Den aggregerade framställningen är den som upplevelsen normalt börjar med. Det går att byta mellan framställningarna i fjärde rutan från vänster ovanför grafen, i checkrutan "Aggregera datan".

##### Individer
För denna framställning är det fritt att bestämma vad x-axeln, y-axeln, och vad för färg som representerar vilka attributer.

Till höger om axel- och färgvalen finns det en ruta som filtrerar kring individer som har i något avseende försämrat sina resultat, eller inte om man väljer att visa alla. Om de har en generell negativ lutning, eller en negativ koefficient i en regressionsmodel, eller om de har försämrats mellan de två senaste testen går att visa, och det går då även att sätta tröskelvärden för dessa, så man kan filtrera bort de med svagare indikationer i denna bemärkelse.

Det finns även en knapp i nedre högra hörnet av grafen, som tillåter en att markera ett område med punkter. Det går sedan att avmarkera området med samma knapp eller genom att klicka på en ny punkt. Om man istället vill välja fritt flera punkter som inte nödvändigtvis befinner sig på samma område, kan man välja dem individuellt genom att hålla in ctrl-knappen medan man klickar på samtliga intressanta punkter.

##### Aggregationer
För denna framställning är y-axeln låst till att visa Lexplore score, och färgerna låst till att visa vilken aggregation man har valt (mer om att välja aggregationer senare). X-axeln är inte låst, men har bara tidsrelaterade enheter att välja mellan.

I samma ruta som för att sätta på aggregation av datan, går det att byta ut punkterna mot 'box' och 'violin', som är olika framställningar för att visa statistiska sanningar kring de plural av datapunkter som har gett upphov till denna aggregerade punkt. Läs mer om dessa här: [Box](https://sv.wikipedia.org/wiki/L%C3%A5dagram)

### Filtrera över skolor och klasser


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
