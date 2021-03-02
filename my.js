//TextArea for CodeMirror
const sqlTextarea = "sqlTextarea";
//const pseudocodeTextarea = "pseudocodeTextarea";


window.onload = function() {

    //CODEMIRROR Editor init
    var editor = new CodeMirror.fromTextArea(document.getElementById(sqlTextarea), {
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
	paginationSize:25,
	height:"480px",
	width:"1500px",
	layoutColumnsOnNewData:true,
	pagination:"local", //enable local pagination.
	paginationSizeSelector:[10,25, 50, 100, 1000, 10000], //enable page size select element with these options
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
//    var editor = document.querySelector('.CodeMirror').CodeMirror;
    var editor = document.querySelector('#'.concat(sqlTextarea)).nextSibling.CodeMirror;
//    console.log(editor);
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


function sqlEditorSetContent(query) {

    /* REF: https://github.com/zeroturnaround/sql-formatter */
    var sqlString = sqlFormatter.format(query, {  language: 'sql', uppercase: true, indent: '   '});
    sqlString =  sqlString.replace(/([A-Z]+)\n\s*/g,'$1 ');
    sqlString =  sqlString.replace(/\nUNION/g,'UNION');
    sqlString =  sqlString.replace(/(?!\n)UNION/g,'\nUNION\n');
//    console.log("sqlEditorSetContent: " +sqlString);
    editorSetContent(sqlTextarea,sqlString);
    
}

function pseudocodeSetContent(content) {
    if (typeof content !== "undefined") {
	var el = document.getElementById("code");
//	console.log("pseudocodeSetContent: " + el);
	//	console.log("pseudocodeSetContent: " + content);

	//When use Pretty print
	el.innerHTML = PR.prettyPrintOne(content);
	//    PR.prettyPrint(); //non funziona

	switchOnVisibilityElementId("code"); 
    } else  {
	switchOffVisibilityElementId("code");
    }
}

function codeEditorSetContent(content) {
    editorSetContent(pseudocodeTextarea,content);
}

function editorSetContent(textarea,content){

    var editor = document.querySelector('#'.concat(textarea)).nextSibling.CodeMirror;
    editor.setValue(content);
}

function runQuery() {
    //remove any error message
    var el = document.getElementById("querystatus");
    el.innerHTML ="";
    el.className = "success";
  //  var editor = document.querySelector('.CodeMirror').CodeMirror;
    var editor = document.querySelector('#'.concat(sqlTextarea)).nextSibling.CodeMirror;
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
    'The size and coverage of PSC',
    'The size and coverage of SemUs',
    'The size and coverage of SynUs',
    'The size and coverage of MUs',
    'The size and coverage of PUs',
];

var sizeAndCoverageQueriesLabel = [

    queriesLabel0 = [
	'The distribution of all Entries in PSC',
    ],

    queriesLabel1 = [
	'The distribution of all SemUs wrt to POS (column “Total”) and the distribution provided per class ...',
	'The distribution of SemUs’ POS provided per class',
	'The presence of Definition',
	'The presence of Example',
	'The presence of Comment',
	'The presence of SynU',
	'The presence of trait',
	'The presence of template',
	'The presence of predicate',
	'The presence of relation',
	'The average number of SynUs',
	'The average number of traits',
	'The average number of templates',
	'The average number of predicates',
	'The average number of relations',
    ],

    queriesLabel2 = [
	'The distribution of all SynUs',
	'The presence of POS',
	'The presence of MUs',
	'The presence of SemUs',
	'The presence of Comment',
	'The presence of Example',
	'The presence of Description',
	'The presence of DescriptionL',
	'The presence of FramesetL',
    ],

    queriesLabel3 = [
	'The distribution of all MUs',
	'The presence of POS',
	'The presence of ginp',
	'The presence of PUs',
	'The distribution of all Musphu with the POS and percentage',
    ],

    queriesLabel4 = [
	'The distribution of all PUs',
    ],

];

var sizeAndCoverageQueries = [

    queries0 = [
	'SELECT \\\'SemUs\\\', COUNT(*) AS Num FROM usem UNION SELECT \\\'SynUs\\\', COUNT(*) FROM usyns UNION SELECT \\\'MUs\\\', COUNT(*) FROM mus UNION SELECT \\\'PUs\\\', COUNT(*) FROM phu union select \\\'MusPhu\\\', count(*) FROM musphu union select \\\'usynusem\\\', count(*) from usynusem union select \\\'usempredicate\\\', count(*) from usempredicate union select \\\'usemrel\\\', count(*) from usemrel union select \\\'usemtraits\\\', count(*) from usemtraits union select \\\'usemtemplates\\\', count(*) from usemtemplates',
 ],

 queries1 = [
      'with totals as (select u2.pos, count(*) as cnt 	 from usem u2 	 group by u2.pos), 	tot as ( 		select count(*) as cnt 	 	from usem 	 	) select \\\'Total\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/tot.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, tot group by u.pos union select \\\'Standard\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals where u.pos = totals.pos and BINARY u.idUsem REGEXP BINARY \\\'^USem(?!TH|D|0D)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^(USem)\\\',1,1,\\\'c\\\') union	 select \\\'Thamus\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals where u.pos = totals.pos and BINARY u.idUsem REGEXP BINARY \\\'^(USemTH)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^(USemTH)\\\',1,1,\\\'c\\\') union	 select \\\'Dummy\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals where u.pos = totals.pos and BINARY u.idUsem REGEXP BINARY \\\'^(USem0?D)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\') order by type desc, num desc',
      
      'with totals as (select count(*) as cnt 	 from usem 	 ), 	totalStd as (select count(*) as cnt 	 from usem 	 where BINARY idUsem REGEXP BINARY \\\'^USem(?!TH|D|0D)\\\' 	 ), 	 totalTh as (select count(*) as cnt 	 from usem 	 where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' 	 ), 	 totalD as (select count(*) as cnt 	 from usem 	 where BINARY idUsem REGEXP BINARY \\\'^USem0?D\\\' 	 ) 	 select \\\'Total\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\') union select \\\'Standard\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totalStd.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totalStd where BINARY u.idUsem REGEXP BINARY \\\'^USem(?!TH|D|0D)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\') union select \\\'Thamus\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totalTh.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totalTh where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USemTH\\\',1,1,\\\'c\\\') union	 select \\\'Dummy\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totalD.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totalD where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\')',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) 	 select \\\'Definition\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.definition is not null UNION 	 select \\\'Definition\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.definition is not null and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') ',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) 	 select \\\'Example\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.exemple is not null UNION 	 select \\\'Example\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.exemple is not null and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') ',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) 	 select \\\'Comment\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.comment is not null UNION 	 select \\\'Comment\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.comment is not null and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') ',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'SynU\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u3.idUsem from usynusem u3) UNION 	 select \\\'SynU\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u3.idUsem from usynusem u3) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\')',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Trait\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usemtraits u4) UNION 	 select \\\'Trait\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usemtraits u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\')',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Template\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usemtemplates u4) UNION 	 select \\\'Template\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usemtemplates u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\')',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Predicate\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usempredicate u4) UNION 	 select \\\'Predicate\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usempredicate u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\')',

 'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Relation\\\', \\\'All\\\', count(*) as num, total.cnt as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usemrel u4) UNION 	 select \\\'Relation\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usemrel u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\')',

      'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , u.idUsyn, count(*) as cnt from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem , u.idUsyn) as t), countD as ( select count(*) as tot from (select u.idUsem , u.idUsyn from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem , u.idUsyn) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , u.idUsyn, count(*) as cnt from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem , u.idUsyn) as t), countTH as ( select count(*) as tot from (select u.idUsem , u.idUsyn from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem , u.idUsyn) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , u.idUsyn, count(*) as cnt from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem , u.idUsyn) as t), countS as ( select count(*) as tot from (select u.idUsem , u.idUsyn from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem , u.idUsyn) as v) select \\\'avg of SynUs Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of SynUs Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of SynUs Standard\\\', num, tot, num/tot from sumS, countS',

      'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot from (select u.idUsem from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of traits Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of traits Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of traits Standard\\\', num, tot, num/tot from sumS, countS',

     'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot from (select u.idUsem from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of templates Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of templates Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of templates Standard\\\', num, tot, num/tot from sumS, countS',

     'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot  from (select u.idUsem from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of predicates Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of predicates Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of predicates Standard\\\', num, tot, num/tot from sumS, countS',

     'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot from (select u.idUsem from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of relations Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of relations Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of relations Standard\\\', num, tot, num/tot from sumS, countS',

 ],

 queries2 = [

     'with totals as (select pos, count(*) as cnt from usyns group by pos), tot as ( select count(*) as cnt from usyns ) select \\\'Total\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/tot.cnt * 100 ),2),\\\'%\\\')) as perc from usyns u, tot group by u.pos union select \\\'Standard\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usyns u, totals where u.pos = totals.pos and BINARY u.idUsyn REGEXP BINARY \\\'^SYNU(?!TH)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsyn ,\\\'^SYNU\\\',1,1,\\\'c\\\') union select \\\'Thamus\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usyns u, totals where u.pos = totals.pos and BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsyn ,\\\'^SYNUTH\\\',1,1,\\\'c\\\') order by type desc, num desc',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.pos is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.pos is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'POS Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'POS Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.idUms is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.idUms is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'MUs in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'MUs in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'with sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.idUsyn in (select u2.idUsyn from usynusem u2)), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\'), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.idUsyn in (select u2.idUsyn from usynusem u2)), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\') select \\\'SemUs Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'SemUs Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.comment is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.comment is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'comment in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'comment in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.example is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.example is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'example in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'example in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.description is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.description is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'description in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'description in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.descriptionL is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.descriptionL is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'descriptionL in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'descriptionL in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.framesetL is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.framesetL is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'framesetL in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'framesetL in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',
 
    ],

    
    queries3 = [
	'with totals as (select count(*) as cnt from mus) select a.pos, a.num, a.perc from ( select pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),4),\\\'%\\\')) as perc from mus, totals group by pos order by num DESC) as a union select b.pos, b.num, b.perc from (select \\\'Total\\\' as pos , count(*) as num, \\\'100%\\\' as perc from mus order by num DESC) as b',
 
	'WITH notnull as ( select count(*) as num from mus m where m.pos is not NULL), totals as ( select count(*) as tot from mus m )select \\\'presence of POS\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from notnull, totals',

	'WITH notnull as ( select count(*) as num from mus m where m.ginp is not NULL), totals as ( select count(*) as tot from mus m )select \\\'presence of ginp\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from notnull, totals',

	'with notnull as ( select count(*) as num from mus m where m.idMus in ( select m2.idMus from musphu m2) ), totals as ( select count(*) as tot from mus m )select \\\'presence of link with PUs\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from notnull, totals',

	'with totals as (select count(*) as cnt from musphu) select a.pos, a.num, a.perc from ( select pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),4),\\\'%\\\')) as perc from musphu, totals group by pos order by num desc) as a union select * from ( select \\\'TOTAL\\\' as pos, count(*) as num, \\\'100%\\\' as perc from musphu m ) as b',
 
    ],

    
    queries4 = [
	'with totals as (select count(*) as cnt from phu) select \\\'presence of phono\\\', count(*) as num, totals.cnt as tot, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from phu, totals where phono is not null union select \\\'presence of sampa\\\', count(*) as num, totals.cnt as tot, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from phu, totals where sampa is not null union select \\\'presence of syllables\\\', count(*) as num, totals.cnt as tot, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from phu, totals where syllables is not null',
    ],

];

/* Peculiar Entries Dropdown MENU */
var peculiarEntriesQueriesMenuLabel = [
    'The dummies entries',
    'The thamus entries',
];

var peculiarEntriesQueriesLabel = [
    queriesLabel0 = [
	'Number of Dummy SemUs',
	'Number of template connected to Dummy SemUs',
	'Number of trait connected to Dummy SemUs',
	'Number of relation connected to Dummy SemUs',
	'Number of predicate connected to Dummy SemUs',
	'Number of Usyn connected to Dummy SemUs',
    ],
    queriesLabel1 = [
	'Number of SemU Thamus',
	'Number of SynU Thamus',
	'Number of MUS associated to SynU Thamus',
	'Number of MUS with NULL ginp associated to SynU Thamus',
	'Number of Phu connected to MUS connected to SynU Thamus',
	'Number of SemU Thamus with NULL comment',
	'Number of SemU Thamus with NULL exemple',
	'Number of SemU Thamus with NULL definition',
	'Number of SemU Thamus with pos ADV ending with "mente"',
	'Number of Proper Nouns in SemU Thamus',
	'SYNUTH with a valid descriptionL',
	'SYNUTH with a valid framesetL',
	'Number of SynU con GINP nel comment',
	'Number of Usem Thamus with at least one template',
	'Usem Thamus with two templates',
	'Number of USem Thamus in relation ISA with another USem',
	'Number of USem Thamus in relation with USem Thamus',
	'Number of USYNUSEM tra syunTH e semuTH con idcorresp a NULL',
	'Number of USYNUSEM tra syunTH e semuTH con idcorresp 70'
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
	'select count(*) from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' ',
	'select count(*) from usemtemplates ut where ut.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select count(*) from usemtraits ut where ut.idUsem in (select u.idUsem	from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select count(*) from usemrel ur where ur.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select count(*) from usempredicate up where up.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select count(*) from usynusem uu where uu.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
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
	       'select count(*) from usynusem where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and idCorresp is NULL',
	       'select count(*) from usynusem where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and idCorresp = 70',
	      ],
    
    
    querie1 = [
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\') , COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')',
	'select t.duplicate, t.source, mp.pos , mp.morphFeat, mp.idKey , mp2.idKey from musphu mp, musphu mp2,	(select m2.idMus as duplicate, m.idMus as source from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')) as t where t.duplicate = mp.idMus and t.source = mp2.idMus and mp.pos = mp2.pos and mp.morphFeat = mp2.morphFeat ',
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\'), COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and m.ginp is NULL and m2.ginp is NOT NULL ',
    ],
    queries3  = [
'select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c from phu p group by p.naming , p.phono 	HAVING (c=2)) as t, phu p2 where p2.naming = t.naming and p2.phono = t.phono',
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

    var arrayPseudocode = [
	"\
\'foreach (pair of entries SemU<sub>a</sub> and SemU<sub>b</sub> &isin; USEM)<br/>\
  if (SemU<sub>a</sub> &  SemU<sub>b</sub> have same naming & same pos & same semantic traits &<br/>\
      same templates & same predicates & same semantic relations) then<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same SynU of reference) then<br/>\
        if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example & same comment) then<br/>\
          mark the entry with higher id with status := 15<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example) then<br/>\
          mark the entry with higher id with status := 14<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same example) then<br/>\
          mark the entry with higher id with status := 13<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same example)<br/>\
          mark the entry with higher id with status := 12<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same definition) then<br/>\
          mark the entry with higher id with status := 11<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition) then<br/>\
          mark the entry with higher id with status := 10 <br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment) then<br/>\
          mark the entry with higher id with status := 9<br/>\
        else <br/>\
          mark the entry with higher id with status := 8<br/>\
      else<br/>\
        if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example & same comment) then<br/>\
          mark the entry with higher id with status := 7<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example) then<br/>\
          mark the entry with higher id with status := 6<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same example) then<br/>\
          mark the entry with higher id with status := 5<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same example)<br/>\
          mark the entry with higher id with status := 4<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same definition) then<br/>\
          mark the entry with higher id with status := 3<br/>\
        else if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition) then<br/>\
          mark the entry with higher id with status := 2<br/>\
        else  if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment) then<br/>\
          mark the entry with higher id with status := 1<br/>\
        else<br/>\
          mark the entry with higher id with status := 0;\'",
	
	"\
\'foreach (pair of entries PU<sub>a</sub> and PU<sub>b</sub> &isin; PHU) <br/>\
  if (PU<sub>a</sub> & PU<sub>b</sub> have same naming & same phono) then<br/>\
    if (PU<sub>a</sub> and PU<sub>b</sub> have same MU of reference) then <br/>\
      if (PU<sub>a</sub> and PU<sub>b</sub> have same morphFeat) then<br/>\
        mark the entry with higher id with status := 1;<br/>\
      else<br/>\
        mark the entry with higher id with status := 2;<br/>\
    else if (PU<sub>a</sub> has no MU of reference) then<br/>\
      mark PU<sub>a</sub> with status := 3;<br/>\
    else if (PU<sub>b</sub> has no MU of reference) then<br/>\
      mark PU<sub>b</sub> with status := 3;<br/>\
    else<br/>\
      mark the entry with higher id with status := 4;\'",
	
	"\
\'foreach (pair of entries SynU<sub>a</sub> and SynU<sub>b</sub> &isin; USYNS<br/>\
  if (SynU<sub>a</sub> & SynU<sub>b</sub> have same naming & same pos & same description &<br/>\
    same descriptionL & same framesetL) then<br/>\
    if (SynU<sub>a</sub> and SynU<sub>b</sub> have same SemU of reference) then<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example & same comment) then<br/>\
        mark the entry with higher id with status := 15<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example) then<br/>\
        mark the entry with higher id with status := 14<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example & same comment) then<br/>\
        mark the entry with higher id with status := 13<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example) then<br/>\
        mark the entry with higher id with status := 12<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment & same idMus) then<br/>\
        mark the entry with higher id with status := 11<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same same idMus) then<br/>\
        mark the entry with higher id with status := 10<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment) then<br/>\
        mark the entry with higher id with status := 9<br/>\
      else <br/>\
        mark the entry with higher id with status := 8<br/>\
    else<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example & same comment) then<br/>\
        mark the entry with higher id with status := 7<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example) then<br/>\
        mark the entry with higher id with status := 6<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example & same comment) then<br/>\
        mark the entry with higher id with status := 5<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example) then<br/>\
        mark the entry with higher id with status := 4<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment & same idMus) then<br/>\
        mark the entry with higher id with status := 3<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same same idMus) then<br/>\
        mark the entry with higher id with status := 2<br/>\
      else if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment) then<br/>\
        mark the entry with higher id with status := 1<br/>\
      else <br/>\
        mark the entry with higher id with status := 0;\'",
	
	"\
\'foreach (pair of entries MU<sub>a</sub> and MU<sub>b</sub> &isin; MUS)<br/>\
  if (MU<sub>a</sub> & MU<sub>b</sub> have<br/>\
    same naming & <br/>\
    same pos) then<br/>\
    if (MU<sub>a</sub> & MU<sub>b</sub> have same ginp) then<br/>\
      if (MU<sub>a</sub> and MU<sub>b</sub> have same PUs of reference) then<br/>\
        mark the entry with higher id with status := 1;<br/>\
      else <br/>\
        if (MU<sub>a</sub> has ginp == null) then<br/>\
          mark MU<sub>a</sub> with status := 2;<br/>\
        if (MU<sub>b</sub> has ginp == null) then<br/>\
          mark MU<sub>b</sub> with status := 2;\'",
    ];
    
    updateQueriesList(arrayLabel, arrayQuery, arrayPseudocode);
    
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

function makeUL(arrayLabel, arrayQuery, arrayPseudoCode) {
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

	// onclick attribute creation 
	var attr = "sqlEditorSetContent('"+arrayQuery[i]+"');"
	//if pseudo code should be shown in the pseudocodeTextarea
	if (arrayPseudoCode) {
	    //	    attr = attr.concat("codeEditorSetContent(pseudocodeTextarea,'"+arrayPseudoCode[i]+"');")
//	    console.log( arrayPseudoCode[i]);
	    attr = attr.concat("pseudocodeSetContent("+arrayPseudoCode[i]+");");
	}
	attr = attr.concat("runQuery();return false;");
	newlink.setAttribute('onclick', attr);

        // Set its contents:
        newlink.appendChild(document.createTextNode(arrayLabel[i]));
        item.appendChild(newlink);
        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function switchOnVisibilityElementId(id) {
     document.getElementById(id).style.display = "block";
}

function switchOffVisibilityElementId(id) {
     document.getElementById(id).style.display = "none";
}

function swapVisibilityElementId(id) {
//    console.log("switchVisibilityElementId " + id);
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
    switchOffVisibilityElementId("code");
}

function updateQueriesList(arrayLabel, arrayQuery) {

    updateQueriesList(arrayLabel, arrayQuery,null); 
}


function updateQueriesList(arrayLabel, arrayQuery, arrayPseudocode) {

    document.getElementById('myMenu').replaceWith(makeUL(arrayLabel, arrayQuery, arrayPseudocode));

}
