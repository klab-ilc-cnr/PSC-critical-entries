
window.onload = function() {

    //CODEMIRROR Editor init
    var editor = new CodeMirror.fromTextArea(document.getElementById("myTextarea"), {
	lineNumbers: true, 
	mode: "text/x-mssql",
	theme: "cobalt", 
//	theme: "material-palenight", 
//	theme: "lucario", 
//	theme: "idea", 
	lineWrapping: false,
//	readOnly: true,
    });

//    editor.setSize('100%','auto');

    //TABULATOR table result init
    var table = new Tabulator("#example-table", {
	autoColumns:true,
/*	autoColumnsDefinitions:[
	    {field:"id", visible:false},
            {field:"idRedundant", headerFilter:true}, //add input editor to the name column
            {field:"idReferred", headerFilter:true}, //add header filters to the age column
            {field:"idPhu", headerFilter:true}, //add header filters to the age column
            {field:"idMus", headerFilter:true}, //add header filters to the age column
	    {field:"status", headerFilter:true, headerFilterFunc:"="},
	    {field:"naming", headerFilter:true, headerFilterFunc:"starts"},
	    {field:"phono", headerFilter:true, headerFilterFunc:"starts"},
	    {field:"pos", headerFilter:true, headerFilterFunc:"="},
	    
	],*/
	placeholder:"No Data Available", //display message to user on empty table
	layout:"fitColumns",
//	layout:"fitDataTable",
	paginationSize:15,
	height:"480px",
	width:"1500px",
	layoutColumnsOnNewData:true,
	pagination:"local", //enable local pagination.
	paginationSizeSelector:[15, 50, 100, 1000, 10000], //enable page size select element with these options
	ajaxResponse:function(url, params, response){
            //url - the URL of the request
            //params - the parameters passed with the request
            //response - the JSON object returned in the body of the response.
	    var el = document.getElementById("querystatus");
	    el.innerHTML = "Query ok.";
	    el.className = "success";
	    clearResults();
	    return response;
	},

	ajaxError: async function(error) { //DA RIVEDERE SE SI VUOLE AVERE UN FEEDBACK DELL'ERRORE SU QUERY
	    error.json().then(data => {
		//console.log("Type " + data.message);
		//console.log("ErrMessage " + data.code);
		var el = document.getElementById("querystatus");
		el.innerHTML = data.message;
		el.className = "error";
	    });
	    clearResults();
	},

	autoColumnsDefinitions:function(definitions){
            //definitions - array of column definition objects
//	    console.log(definitions);
            definitions.forEach((column) => {
		column.headerFilter = true; // add header filter to every column
		/*		field: "id"
				headerFilter: true
				sorter: "number"
				title:"id"*/
		if(column.field==="id") {
		    column.visible=false;
		}
		if(column.sorter==="string") {
//		    column.headerFilterFunc="starts";
		}
		if(column.sorter==="alphanum") {
//		    column.headerFilterFunc="starts";
		}
		
		if(column.sorter==="number" ) {
		    column.headerFilterFunc="=";
		}

		if(column.field.toLowerCase().startsWith("count")) {
		    column.headerFilter=false;
		}
		//column.headerFilterFunc = "starts";
            });
	    
            return definitions;
	},
	footerElement: "<span style='display:inline-block;float:left;padding-top:inherit;padding-right:20px;'>Number of rows:</span><span style='display:inline-block;padding-top:inherit;float:left;' id='row-count'>Rows: </span>", //add element element to footer to contain count
	dataFiltered: function(filter,rows) {
	    var el = document.getElementById("row-count");
	    el.innerHTML = rows.length;
	},
	dataLoaded:   function(data) {
	    var el = document.getElementById("row-count");
	    el.innerHTML = data.length;
	},
    });

    //init gui
//    updateQueryList(0);
    //makeSqlTablesMenu();

    
    var drpdwnBtn = document.getElementsByClassName('dropdown');
    for(var i = 0; i < drpdwnBtn.length; i++){
	drpdwnBtn[i].addEventListener('click', showHideOtherMenu, false);
    }

    
    //costruisco i dropdown menu
    makeSizeAndCoverageMenu();
    makePeculiarEntriesQueriesMenu();

} //window.onload() END


window.onclick = function(e) {
    //to manage dropdown menus visibility (joined to showHideOther() )
    if (!e.target.matches('.dropbtn')) {
	var list = document.getElementsByClassName("show");
	while(list.length) {
	    list[0].classList.remove('show');
	}
    }
}

function selectTheme(t) {
    var input = document.getElementById("select");
    var theme = input.options[input.selectedIndex].textContent;
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    editor.setOption("theme", theme);
}


//Show menu under the clicked button and hide the other ones
function showHideOtherMenu(e) {
//    console.log("hide " + e.currentTarget.id);
    var list = document.getElementsByClassName("show");
    while(list.length) {
//	console.log("showHideOther "+list[0].id);
	list[0].classList.remove('show');
    }
    e.currentTarget.classList.add = "show";
//    console.log(e.currentTarget.getElementsByClassName("dropdown-content")[0]);
    e.currentTarget.getElementsByClassName("dropdown-content")[0].classList.add("show");
}


function editorSetContent(query){
    var editor = document.querySelector('.CodeMirror').CodeMirror;

    /* REF: https://github.com/zeroturnaround/sql-formatter */
    var sqlString = sqlFormatter.format(query, {  language: 'sql', uppercase: true, indent: '   '});
    sqlString =  sqlString.replace(/([A-Z]+)\n\s*/g,'$1 ');
    sqlString =  sqlString.replace(/\nUNION/g,'UNION');
    sqlString =  sqlString.replace(/(?!\n)UNION/g,'\nUNION\n');
//    sqlString =  sqlString.replace(/,\n\s*/g,', ');
    editor.setValue(sqlString);

}

function runQuery() {
    //remove any error message
    var el = document.getElementById("querystatus");
    el.innerHTML ="";
    el.className = "success";
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    //alert(editor.getValue());
    var table = Tabulator.prototype.findTable('#example-table')[0];
    table.setData("DB.php", {"query":editor.getValue()},"POST");
}

function clearInput(){
    // Codemirror editor reset content
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    editor.setValue("")
}

function clearResults() {
    var table = Tabulator.prototype.findTable('#example-table')[0];
    table.clearFilter();
    table.clearHeaderFilter();
    table.clearData();
}

function clearFilters() {
    var table = Tabulator.prototype.findTable('#example-table')[0];
    table.clearFilter();
    table.clearHeaderFilter();
}



/* Size and Coverage Dropdown MENU */

var sizeAndCoverageQueriesMenuLabel = [
    'The size and coverage of SemUs',
    'The size and coverage of SynUs',
    'The size and coverage of MUs',
    'The size and coverage of PUs',
];

var sizeAndCoverageQueriesLabel = [
    queriesLabel0 = [
	'The distribution of all SemUs',
    ],
    queriesLabel1 = [
	'The distribution of all SynUs',
    ],
    queriesLabel2 = [
	'The distribution of all MUs',
    ],
    queriesLabel3 = [
	'The distribution of all PUs',
    ],
];

var sizeAndCoverageQueries = [
    queries0 = [
	'select pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\')as type, count(*) as num from usem group by pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\') union select  pos , \\\'ALL\\\' as type, count(*) from usem group by pos order by pos asc, num desc, type asc',
    ],
    queries1 = [
	'select pos, BINARY REGEXP_SUBSTR(idUsyn,\\\'^(SYNUTH|SYNU)\\\',1,1,\\\'c\\\') as type, count(*) as num from usyns group by pos, BINARY REGEXP_SUBSTR(idUsyn,\\\'^(SYNUTH|SYNU)\\\',1,1,\\\'c\\\') union select  pos , \\\'ALL\\\' as type, count(*) from usyns group by pos order by pos asc, num desc, type asc',
    ],
    queries2 = [
	'select pos, count(*) as num from mus group by pos order by num DESC',
    ],
    queries3 = [
	'select \\\'Total count\\\', count(*) as count from  phu union select \\\'Presence of phono\\\', count(*) from  phu where phono is not null union select \\\'Presence of sampa\\\', count(*) from  phu where sampa is not null union select \\\'Presence of syllables\\\', count(*) from  phu where syllables is not null',
    ],
];

/* Peculiar Entries Dropdown MENU */
var peculiarEntriesQueriesMenuLabel = [
    'The dummies entries',
    'The thamus entries',
];

var peculiarEntriesQueriesLabel = [
    queriesLabel0 = [
	'#Total count of Dummies',
	'#USemD/template',
	'#USemD/trait',
	'#USemD/relation',
	'#USemD/predicate',
	'#UsemD/Usyn',
    ],
    queriesLabel1 = [
	'#Number of SemU Thamus',
	'#Number of SynU Thamus',
	'#Number of MUS associated to Usyn Thamus',
	'#Number of MUS with NULL ginp associated to Usyn Thamus',
	'#Number of Phu connected to MUS connected to SynU Thamus',
	'#Number of SemU Thamus with NULL comment',
	'#Number of SemU Thamus with NULL exemple',
	'#Number of SemU Thamus with NULL definition',
	'#Number of SemU Thamus with pos ADV ending with "mente"',
	'#Number of Proper Nouns in SemU Thamus',
	'#SYNUTH with a valid descriptionL',
	'#SYNUTH with a valid framesetL',
	'#Number of SynU con GINP nel comment',
	'#Number of Usem Thamus with at least one template',
	'#Number of Usem Thamus with two templates',
	'#USem Thamus in relation ISA with another USem',
	'#USem Thamus in relation with USem Thamus',
	'#USYNUSEM tra syunTH e semuTH con idcorresp a NULL',
	'#USYNUSEM tra syunTH e semuTH con idcorresp 70'
    ],
    queriesLabel2 = [
	'Coppie PHU ridondanti',
	'Triple PHU ridondanti',
    ],
    queriesLabel3 = [
	'IF (MUa & MUb have same ginp) THEN',
	'#3.4.1 - Table YYY. The two analysed MUs appearing in table MUSPHU.',
	'IF (MUa & MUb have same ginp) ELSE ###IF MUa has ginp NULL (#944)',
    ]
];

var peculiarEntriesQueries = [
    queries0 = [
		'select count(*) from usem u  where  BINARY u.idUsem REGEXP  BINARY \\\'^USem0?D\\\' ',
	'select count(*) from usemtemplates ut where ut.idUsem in (select u.idUsem from usem u where BINARY  u.idUsem REGEXP BINARY  \\\'^USemD\\\')',
	'select count(*) from usemtraits ut where ut.idUsem in (select u.idUsem	from usem u where BINARY  u.idUsem REGEXP  BINARY \\\'^USemD\\\')',
	'select count(*) from usemrel ur where ur.idUsem in (select u.idUsem from usem u where BINARY  u.idUsem REGEXP BINARY \\\'^USemD\\\')',
	'select count(*) from usempredicate up where up.idUsem in (select u.idUsem from usem u where BINARY  u.idUsem REGEXP BINARY \\\'^USemD\\\')',
	'select count(*) from usynusem uu where uu.idUsem in (select u.idUsem from usem u where BINARY  u.idUsem REGEXP BINARY \\\'^USemD\\\')',
		  ],

    querie2 = ['select count(*) from usem where idUsem REGEXP \\\'^USemTH\\\'',
	       'select count(*) from usyns where idUsyn REGEXP \\\'^SYNUTH\\\'',
	       'select count(distinct idUms) from usyns where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\'',
	       'select count(*) from mus m where m.idMus in (select u.idUms from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\') and m.ginp is NULL',
	       'select count(distinct idPhu) from musphu where idMus in (select m.idMus from mus m where m.idMus in (select u.idUms from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\') )',
	       'select count(*) from usem u where u.idUsem REGEXP \\\'^USemTH\\\' and u.comment is NULL',
	       'select count(*) from usem u where u.idUsem REGEXP \\\'^USemTH\\\' and u.exemple is NULL',
	       'select count(*) from usem u where u.idUsem REGEXP \\\'^USemTH\\\' and u.definition is NULL',
	       'select count(*) from usem u where u.idUsem REGEXP \\\'^USemTH\\\' and u.pos = \\\'ADV\\\' and u.naming REGEXP \\\'mente$\\\'',
	       'select count(*) from usem u where u.idUsem REGEXP \\\'^USemTH\\\' and u.pos = \\\'NP\\\'',
	       'select * from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and descriptionL is not NULL  and descriptionL <> ""',
	       'select * from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and framesetL is not NULL  and framesetL <> ""',
	       'select count(idUsyn) from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY u.comment REGEXP BINARY \\\'^GINP\\\\\\\\d+$\\\'',
	       'select count(DISTINCT idUsem) from usemtemplates  where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\'',
	       'select idUsem, count(*) from usemtemplates where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' group by idUsem  HAVING count(*) = 2',
	       'select count(idUsem) from usemrel where idUsem REGEXP \\\'USemTH\\\' and idRSem = \\\'R146\\\'',
	       'select count(idUsem) from usemrel where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and BINARY idUsemTarget  REGEXP BINARY \\\'^USemTH\\\'',
	       'select count(*) from usynusem  where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and idCorresp is NULL',
	       'select count(*) from usynusem u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' and u.idCorresp = 70',
	      ],
    
    
    querie1 = [
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\') , COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2  where m.naming = m2.naming  and m.pos = m2.pos  and m2.idMus > m.idMus  and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')',
	'select t.duplicate, t.source, mp.pos , mp.morphFeat, mp.idKey , mp2.idKey  from musphu mp, musphu mp2,	(select m2.idMus as duplicate, m.idMus as source from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus  and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')) as t  where t.duplicate = mp.idMus and t.source = mp2.idMus and mp.pos = mp2.pos and mp.morphFeat = mp2.morphFeat ',
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\'), COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2  where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and m.ginp is NULL and m2.ginp is NOT NULL ',
    ],
    queries3  = [
'select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c from phu p group by p.naming , p.phono 	HAVING (c=2)) as t, phu p2 where p2.naming = t.naming  and p2.phono = t.phono',
		   'select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c	from phu p group by p.naming , p.phono HAVING (c=3)) as t, phu p2 where p2.naming = t.naming and p2.phono = t.phono',
		   'SELECT * FROM usyns'
    ],
    queries4 =  [
	'select * from mus',
    ],
];


function makeSizeAndCoverageMenu () {

    makeDropDownMenu ('sizeAndCoverageQueriesMenuId', sizeAndCoverageQueriesMenuLabel, 'SizeAndCoverage');

}

function makePeculiarEntriesQueriesMenu () {

    makeDropDownMenu ('peculiarEntriesQueriesMenuId', peculiarEntriesQueriesMenuLabel, 'PeculiarEntries');

}


function makeRedundantEntriesMenu () {
    var arrayLabel = [
	'Redundant Semantic Units',
	'Redundant Phonological Units ',
	'Redundant Syntactic Units',
	'Redundant Morphological Units',
	'Forms in MUSPHU linked to redundant PUs',
	'Duplicate rows in MUSPHU'
    ];
    
    var arrayQuery = [
	'select * from RedundantUsem',
	'select * from RedundantPhu',
	'select * from RedundantUsyn',
	'select * from RedundantMus',
	'select * from RedundantMusPhu',
	'select * from DuplicateMUSPHU',
    ];

    updateQueriesList(arrayLabel, arrayQuery);
    
}



function makeDropDownMenu (menuId, arrayLabel, name) {
    
    var anchor = document.getElementById(menuId);
    var list = document.createElement('div');
    list.setAttribute('id',menuId);
    list.setAttribute('class','dropdown-content');
    for (var i = 0; i < arrayLabel.length; i++) {
	var link = document.createElement('a');
	link.setAttribute('href', '#');
	link.setAttribute('onclick', 'update'+name+'QueriesListByIndex('+i+');return false;');
        link.appendChild(document.createTextNode(arrayLabel[i]));
	list.appendChild(link);
    }
    anchor.replaceWith(list);
}

/* 
* https://stackoverflow.com/questions/11128700/create-a-ul-and-fill-it-based-on-a-passed-array
*/

function makeUL(arrayLabel, arrayQuery) {
    // Create the list element:
    var list = document.createElement('ul');
    list.setAttribute('id', 'myMenu');
    
    for (var i = 0; i < arrayLabel.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
	item.setAttribute('onclick','highlightSelected(this)');
	var newlink = document.createElement('a');
	newlink.setAttribute('href', '#');
	var index = i + 1;
	newlink.setAttribute('onclick', "editorSetContent('"+arrayQuery[i]+"');runQuery();return false;");
        // Set its contents:
        newlink.appendChild(document.createTextNode(arrayLabel[i]));
        item.appendChild(newlink);
        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function showHideMenu(id) {
//    console.log(id);
//    console.log(document.getElementById(id));
    var el = document.getElementById(id);
    if (el.style.display === "none" ) {
	el.style.display = "block";
    } else {
	el.style.display = "none";
    }
}

function toggleContent(id) {
//    console.log("toggleContent id: " + id);
    document.getElementById(id).classList.toggle("show");
}

/* Menu items style class setter */
/* REFS
* https://jsfiddle.net/taditdash/LrMsA/
* http://anishrana.blogspot.com/2011/07/change-css-class-of-li-in-ul-onclick.html
*/
function highlightSelected(obj){
    var list = document.getElementById("myMenu").getElementsByTagName('li');

    for(i=0; i<list.length; i++)
    {
        list[i].classList.remove('selected')
    }
    
    obj.classList.add('selected');
}

function updateSizeAndCoverageQueriesListByIndex(index) {
    updateQueriesListByIndex(sizeAndCoverageQueriesLabel, sizeAndCoverageQueries, index);
}

function updatePeculiarEntriesQueriesListByIndex(index, array) {
    updateQueriesListByIndex(peculiarEntriesQueriesLabel, peculiarEntriesQueries, index); 
}

function updateQueriesListByIndex(queriesLabel, queries, index) {
    var arrayLabel = queriesLabel[index];
    var arrayQuery = queries[index];

    updateQueriesList(arrayLabel, arrayQuery);

}

function updateQueriesList(arrayLabel, arrayQuery) {

    document.getElementById('myMenu').replaceWith(makeUL(arrayLabel, arrayQuery));
}
