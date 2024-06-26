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

| Jämförelse | Kan användas för | Exempel                                                                                                                                                                                                                                                                                                        |
|------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| contains   | Ord              | Skola contains "dån"<br><br>I ett dataset med "Bondånger skola" inkluderat, kommer alla datapunkter vars 'Skola' är den skolan att göra uttrycket 'Sant', eftersom "Bon-_dån_-ger" har "dån" i sig.                                                                                                            |
| !contains  | Ord              | Skola !contain "kråka"<br><br>I ett dataset med "Klackamo skola" inkluderat, kommer alla datapunkter vars 'Skola' är den skolan att göra uttrycket 'Falskt', eftersom "Klackmo" _inte_ har "kråka" i sig.                                                                                                      |
| ==         | Ord, Nummer      | Skola == "Svinarp skola"<br><br>I ett dataset med "Svinarp skola" inkluderat, kommer alla datapunkter som har _exakt_ det värdet i 'Skola' att göra uttrycket 'Sant'.<br><br>"Lexplore score" == 500<br><br>Alla datapunkter där 'Lexplore score' är _exakt_ lika med 500 kommer göra uttrycket 'Sant'.        |
| !=         | Ord, Nummer      | Skola != "Loftbacken"<br><br>I ett dataset med "Loftbacken" inkluderat, kommer alla datapunkter som har _exakt_ det värdet i 'Skola' att göra uttrycket 'Falskt.<br><br>"Lexplore score" != 500<br><br>Alla datapunkter där 'lexplore score' är _exakt_ lika med 500 kommer att göra uttrycket 'Falskt'.       |
| <          | Nummer           | Stanine < 5<br><br>Alla datapunkter där 'Stanine' är lägre än 5 kommer att göra uttrycket 'Sant'.                                                                                                                                                                                                              |
| >          | Nummer           | Stanine > 5<br><br>Alla datapunkter där 'Stanine' är högre än 5 kommer att göra uttrycket 'Sant.                                                                                                                                                                                                               |

När man har dessa enkla boolska uttryck, kan man kombinera dem till mer komplexa uttryck med konjunktion ('OR') eller disjunktion ('AND'). T.ex. "Lexplore score" > 500 AND "Lexplore score" < 700 kommer att vara sann för alla punkter med Lexplore score mellan 500 och 700. Uttryck evalueras från vänster till höger, med pritoritet för parenteser; 'P1 OR P2 AND P3' är _inte_ samma sak som 'P3 AND P2 OR P1', men P1 OR P2 AND P3 _är_ samma sak som P3 AND (P2 OR P1).

Som sagt, denna filter är något svårare för gemene person att ge sig in på, men den är ett kraftfullt komplement som hade varit väldigt svårt att ge tillgång till via ett grafiskt gränssnitt. Börja försiktigt med enkla uttryck, och gå senare upp mot mer komplexa uttryck när det känns bekvämt. Läs mer om boolsk algebra [här](https://en.wikipedia.org/wiki/Boolean_algebra_(structure)), om du vill.

## Funktionsgenvägar
Knapparna uppe där du importerade datan är genvägar för en del funktioner som berör hela visualiseringen. De gås igenom i detta avsnitt

### Nollställ
Nollställ-knappen nollställer all val du har gjort efter att du importerade datan. Den är bekväm att använda när man ha stökat till det lite mycket, och det är enklare att börja om "färskt".

### Nollställ till senaste sparad
Likt nollställ-knappen, nollställer denna knapp till när du senaste klickade på "Spara Vy". Av olika anledningar, kan denna vy vara en bra start att nollställa till.

### Spara vy
Denna knapp låter dig exportera nuvarande inställningar som en fil för att ladda upp senare.

### Ladda vy
Denna knapp låter dig importera en inställningsfil som du har sparat sedan tidigare.

Observera att om det är annan data vid det tillfälle en inställningsfil importeras, görs inga garantier för hur den hanterar specifika attributer som klass- och skolnamn.

### Importera data
Som beskrivet ovan, importerar man data att visualisera med denna knapp

### Ändra inställningar
Denna knapp låter användaren ställa in specifika inställningar som inte är menade att vara särskilt dynamiska, men som användaren kan vilja ändra på.

Mest relevant är nog "seasonBoundaries" som avgör gränserna för kvartal. Om man märker att vissa individer som egentligen har testats vid samma period har hamnat på varsin sida av en kvartalgräns, kan man ändra gränsen här.

Utöver "seasonBoundaries" är dessa inställningar inget som rekommenderas att man ändrar så mycket på, om man inte verkligen vill det.

### Instruktioner
Denna knapp visar dessa instruktioner. Mer behöver inte sägas.
