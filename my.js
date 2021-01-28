
window.onload = function() {

    //CODEMIRROR Editor init
    var editor = new CodeMirror.fromTextArea(document.getElementById("myTextarea"), {
	lineNumbers: true, 
	mode: "text/x-mysql",
	theme: "idea", 
	lineWrapping: false,
	setSize: (200,200)
    });
    
    //editor.getDoc().setValue(sqlFormatter.format("select * from mus where idMus like 'MUScast%'"));


    //TABULATOR table result init
    var table = new Tabulator("#example-table", {
	autoColumns:true,
	placeholder:"No Data Available", //display message to user on empty table
	layout:"fitColumns",
//	layout:"fitDataStretch",
	paginationSize:20,
	height:"500px",
	width:"1500px",
	pagination:"local", //enable local pagination.
	paginationSizeSelector:[10, 20, 50, 100, 1000, 10000], //enable page size select element with these options
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
	    
            definitions.forEach((column) => {
		column.headerFilter = true; // add header filter to every column
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
    makeQueriesMenu();

} //window.onload() END


function editorSetContent(query){
    var editor = document.querySelector('.CodeMirror').CodeMirror;

    /* REF: https://github.com/zeroturnaround/sql-formatter */
    var sqlString = sqlFormatter.format(query, {  language: 'sql', uppercase: true, indent: '   '});
    sqlString =  sqlString.replace(/,\n\s*/g,', ');
    editor.setValue(sqlString);

}

function runQuery(query) {
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



/* Dropdown MENU */
var queriesMenu = ['3.2 Redundant Phu',
		   '3.4 Redundant Mus',
		   '5.2.1 The dummy entries',
		  ];

var queriesLabel = [
    queriesMenu0 = [
	'Coppie PHU ridondanti',
	'Triple PHU ridondanti',
    ],
    queriesMenu1 = [
	'IF (MUa & MUb have same ginp) THEN',
	'#3.4.1 - Table YYY. The two analysed MUs appearing in table MUSPHU.',
	'IF (MUa & MUb have same ginp) ELSE ###IF MUa has ginp NULL (#944)',
    ],
    queriesMenu2 = [
	'#Total count of USemD e USem0D',
    ],
    queriesMenu3 = [
	'Titolo della query'
    ],
];

var queries = [
    queriesSet0 = ['select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c from phu p group by p.naming , p.phono 	HAVING (c=2)) as t, phu p2 where p2.naming = t.naming  and p2.phono = t.phono',
		   'select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c	from phu p group by p.naming , p.phono HAVING (c=3)) as t, phu p2 where p2.naming = t.naming and p2.phono = t.phono',
		   'SELECT * FROM usyns'
		  ],
    queriesSet1 = [
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\') , COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2  where m.naming = m2.naming  and m.pos = m2.pos  and m2.idMus > m.idMus  and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')',
	'select t.duplicate, t.source, mp.pos , mp.morphFeat, mp.idKey , mp2.idKey  from musphu mp, musphu mp2,	(select m2.idMus as duplicate, m.idMus as source from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus  and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')) as t  where  	t.duplicate = mp.idMus  	and t.source = mp2.idMus and mp.pos  = mp2.pos  and mp.morphFeat = mp2.morphFeat ',
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\'), COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2  where m.naming = m2.naming  and m.pos = m2.pos  and m2.idMus > m.idMus  and m.ginp  is NULL  and m2.ginp is NOT NULL ',
    ],
    queriesSet3  = [
	'select count(*) from usem u  where  BINARY u.idUsem REGEXP  BINARY \\\'^USem[0-9]?D\\\' ',
    ],
    queriesSet1set4 =  [
	'select * from mus',
    ],
];


function makeSqlTablesMenu () {
    var arrayLabel = [
	'Redundant PUs',
	'Redundant MUSPHU',
	'Redundant MUS',
	'Redundant USEM',
	'Redundant USYN'
    ];
    
    var arrayQuery = [
	'select * from RedundantPhu',
	'select * from RedundantMusPhu',
	'select * from RedundantMus',
	'select * from RedundantUsem',
	'select * from RedundantUsyn',
    ];

    updateQueriesList(arrayLabel, arrayQuery);
    
}

function makeQueriesMenu () {
    makeDropDownMenu ('queriesMenuId', queriesMenu);
}

function makeDropDownMenu (menuId, array) {
    

    var anchor = document.getElementById(menuId);
    var list = document.createElement('div');
    list.setAttribute('id',menuId);
    list.setAttribute('class','dropdown-content');
    for (var i = 0; i < array.length; i++) {
	var link = document.createElement('a');
	link.setAttribute('href', '#');
	link.setAttribute('onclick', 'updateQueriesListByIndex('+i+');return false;');
        link.appendChild(document.createTextNode(array[i]));
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
	newlink.setAttribute('onclick', "editorSetContent('"+arrayQuery[i]+"');return false;");
        // Set its contents:
        newlink.appendChild(document.createTextNode(arrayLabel[i]));
        item.appendChild(newlink);
        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
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

function updateQueriesListByIndex(index) {
    var arrayLabel = queriesLabel[index];
    var arrayQuery = queries[index];

    updateQueriesList(arrayLabel, arrayQuery);

}

function updateQueriesList(arrayLabel, arrayQuery) {

    document.getElementById('myMenu').replaceWith(makeUL(arrayLabel, arrayQuery));
}
