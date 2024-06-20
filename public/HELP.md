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

I samma ruta som för att sätta på aggregation av datan, går det att byta ut punkterna mot 'box' och 'violin', som är olika framställningar för att visa statistiska faktum kring de plural av datapunkter som har gett upphov till denna aggregerade punkt. Läs mer om dessa här: [Box](https://sv.wikipedia.org/wiki/L%C3%A5dagram), [Violin (Tyvärr bara på engelska)](https://en.wikipedia.org/wiki/Violin_plot). Det går även att visa bakomliggande individer för de aggregerade punkterna, samt koppla samman dem, från denna ruta. Observera att p.g.a. prestandaskäl, går det inte att visa individer och koppla ihop dem, om det är väldigt mycket data att visa.

### Filtrera över skolor och klasser
Från att datan laddades till visualiseringsupplevelsen, fick du välja en startvy. Den startvyn påverkade egentligen bara inställningarna i rutan direkt till höger om grafen. I denna ruta framställs skolan (eller skolor om det finns flera), samt dess klasser, stadier, eller årsgångar (beroende på man väljer i valmenyn högst upp inom rutan) för varje läsår. Det går att välja fritt vilka grupper man vill visa och inte visa. Väljer man att visa eller inte visa en samling högre upp i hierarkin, påverkar det samtliga samlingar under, men om man sedan vill välja till eller bort några av dem under, kan man sedan göra det individuellt lägre ner i hierarkin.

Om man väljer att aggregera datapunkterna som stadier eller årsgångar, samlas datapunkter ihop för att framställas som enhetliga tre- eller nioårsperioder. T.ex. I en stadieaggregation, är datapunkter från 4A-19/20, 5A-20/21, och 6A-21/22 från samma skola tillsammans. Detta är för att enklare kunna se trender av grupper inte bara inom ett särskilt läsår, men även över flera läsår. I ett visst avseende går det att framställa dessa 3 klasser individuellt, via klassaggregationen, men de skulle då ha olika färger, och det kan då vara svårt att hålla reda på hur de är kopplade. Att aggregera datan på det här viset bör ses endast som ett sätt att hålla reda på klasser över en längre period, och *inte* som ett sätt att hålla reda på en särskild grupp individer.

### Filtreringsval
I rutan längst till höger, bredvid filtret för skolor och klasser, finns det lite allmänna filtreringsval. De är ganska självförklarande i vilka attributer de filtrerar över, och de byggs delvis upp av hur datasetet ser ut.

### Allmänt om checkruta-filter
Om en checkruta är grå, betyder det att dess status har ingen som helst påverkan på det nuvarande urvalet av data. Ett bra exempel på detta är att om man bara visar årskurs 7 i en skola, och skolan hade inga årskurs 7 som gjorde Lexplore-testen ett läsår 19/20, så kommer inklusionen eller exklusionen av detta läsår inte påverka filtret alls. Med det sagt, kan färgen återgå till blå, alltså att den nu spelar roll, om man ändrar lite. Det betyder att man behöver inte helt strunta i gråa rutor, om man ska ändra lite flera val.

### Avancerad Nivå: Symboliska filtret
Sista komponenten av visualiseringsupplevelsen är ett filter i textformat. I första anblick kan den se lite svår ut, men den är i verkligenheten rätt simpel när man börjar enkelt. Kortfattat tar den in "boolska" uttryck, alltså uttryck som kan evalueras som sanna eller falska för varje datapunkt. Detta filter appliceras utöver Skol- och klassfiltret och Filtreringsvalen beskrivna ovan. Om en datapunkt ger upphov till en falskt utfall från uttrycket, så visas inte den datapunkten; om istället den ger uppgov ett sant utfall, så visas den (om den också uppfyler får komma med enligt de andra filtren).

Varje attribut kan refereras till i det symboliska filtret. De attributer som har "sträng"-värden, alltså typiskt sätt ord, kan jämföras med funktionerna 'contains' (innehåller delvis), '!contains' (innehåller delvis _inte_), '==' (Är _exakt_ lika med), '!=' (Är _inte_ lika med). De attributer som har numeriska värden, alltså siffror, kan jämföras med funktionerna '==', '!=', '<', och '>'.

| Jämförelse | Kan användas för | Exempel                                                                                                                                                                                                                                                                                    
                    |
|------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| contains   | Ord              | Skola contains "dån"<br><br>I ett dataset med "Bondånger skola" inkluderat, kommer alla datapunkter vars 'Skola' är den skolan att göra uttrycket 'Sant', eftersom "Bon-_dån_-ger" har "dån" i sig.                                                                                        
                    |
| !contains  | Ord              | Skola !contain "kråka"<br><br>I ett dataset med "Klackamo skola" inkluderat, kommer alla datapunkter vars 'Skola' är den skolan att göra uttrycket 'Falskt', eftersom "Klackmo" _inte_ har "kråka" i sig.                                                                                  
                    |
| ==         | Ord, Nummer      | Skola == "Svinarp skola"<br><br>I ett dataset med "Svinarp skola" inkluderat, kommer alla datapunkter som har _exakt_ det värdet i 'Skola' att göra uttrycket 'Sant'.<br><br>"Lexplore score" == 500<br><br>Alla datapunkter där 'Lexplore score' är _exakt_ lika med 500 kommer göra uttrycket 'Sant'.   |
| !=         | Ord, Nummer      | Skola != "Loftbacken"<br><br>I ett dataset med "Loftbacken" inkluderat, kommer alla datapunkter som har _exakt_ det värdet i 'Skola' att göra uttrycket 'Falskt.<br><br>"Lexplore score" != 500<br><br>Alla datapunkter där 'lexplore score' är _exakt_ lika med 500 kommer att göra uttrycket 'Falskt'. |
| <          | Nummer           | Stanine < 5<br><br>Alla datapunkter där 'Stanine' är lägre än 5 kommer att göra uttrycket 'Sant'.                                                                                                                                                                                                              |
| >          | Nummer           | Stanine > 5<br><br>Alla datapunkter där 'Stanine' är högre än 5 kommer att göra uttrycket 'Sant.                                                                                                                                                                                                               |

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
