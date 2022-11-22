/*
 * @author simone marchi <simone.marchi@ilc.cnr.it>
 */
//TextArea for CodeMirror
const sqlTextarea = "sqlTextarea";
//const pseudocodeTextarea = "pseudocodeTextarea";


window.onload = function() {

    var percFormatter = function(cell, formatterParams) {
	console.log(cell.getValue());
	return "<pre style='margin:0;'>" + cell.getValue().padStart(9) + "</pre>";
    };

    var averageFormatter  = function(cell, formatterParams) {

	const formatConfig = {
	    style: "decimal",
	    minimumFractionDigits: 4,
	};
	var val = new Intl.NumberFormat('it-IT',formatConfig).format(Number(cell.getValue()))

	return "<pre style='margin:0;'>" + val + "</pre>";
    };


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
	placeholder:"No Data Available", //display message to user on empty table
//	layout:"fitColumns",
	layout:"fitDataFill",
//	layout:"fitDataTable",
	paginationSize:25,
	height:"480px",
	columnMinWidth:150,
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
            definitions.forEach((column) => {
		column.headerFilter = true; // add header filter to every column
		/*		field: "id"
				headerFilter: true
				sorter: "number"
				title:"id"*/
		if(column.field==="id") {
		    column.visible=false;
		}

		if(column.sorter==="number" ) {
		    column.headerFilterFunc="=";
		    column.hozAlign="right";
		    column.formatter="money";
		    column.formatterParams={decimal:",",
					    thousand:".",
					    precision:false,
					   }
		    
		}

		if(column.field==="perc") {
		    column.hozAlign="left";
		    column.formatter=percFormatter;
		}
		
		//average deve essere dopo number altrimenti e' sovrascritto il formatter
		if(column.field==="average") {
		    column.hozAlign="right";
		    column.formatter=averageFormatter;
		}

		if(column.sorter==="string") {
//		    column.headerFilterFunc="starts";
		}
		if(column.sorter==="alphanum") {
//		    column.headerFilterFunc="starts";
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
    el.innerHTML = "Query in progess...";
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
    'Size and coverage of PSC',
    'Number and coverage of SemUs',
    'Number and coverage of SynUs',
    'Number and coverage of MUs',
    'Number and coverage of PUs',
];

var sizeAndCoverageQueriesLabel = [

    queriesLabel0 = [
	'Distribution of all entries',
    ],

    queriesLabel1 = [
	'Distribution of SemUs per PoS',
	'Distribution of PoS per class of SemU',
	'Presence of definition',
	'Presence of example',
	'Presence of comment',
	'Presence of SynUs',
	'Presence of trait',
	'Presence of template',
	'Presence of predicate',
	'Presence of relation',
	'Average number of SynUs',
	'Average number of traits',
	'Average number of templates',
	'Average number of predicates',
	'Average number of relations',
    ],

    queriesLabel2 = [
	'Distribution of all SynUs',
	'Presence of PoS',
	'Presence of MUs',
	'Presence of SemUs',
	'Presence of comment',
	'Presence of example',
	'Presence of description',
	'Presence of descriptionL',
	'Presence of framesetL',
    ],

    queriesLabel3 = [
	'Distribution of all MUs',
	'Presence of PoS',
	'Presence of ginp',
	'Presence of PUs',
	'Distribution of all Musphu with the PoS and percentage',
	'Distribution of the morphFeat in MUSPHU',
    ],

    queriesLabel4 = [
	'Distribution of all PUs',
    ],

];

var sizeAndCoverageQueries = [

    queries0 = [
	'SELECT \\\'USEM\\\'  AS Entries, COUNT(*) AS Num FROM usem UNION SELECT \\\'USYNS\\\', COUNT(*) FROM usyns UNION SELECT \\\'MUS\\\', COUNT(*) FROM mus UNION SELECT \\\'PHU\\\', COUNT(*) FROM phu union select \\\'MUSPHU\\\', count(*) FROM musphu union select \\\'USYNUSEM\\\', count(*) from usynusem union select \\\'USEMPREDICATES\\\', count(*) from usempredicate union select \\\'USEMREL\\\', count(*) from usemrel union select \\\'USEMTRAITS\\\', count(*) from usemtraits union select \\\'USEMTEMPLATES\\\', count(*) from usemtemplates',
 ],

 queries1 = [
      
      'with totals as (select count(*) as cnt 	 from usem 	 ), 	totalStd as (select count(*) as cnt 	 from usem 	 where BINARY idUsem REGEXP BINARY \\\'^USem(?!TH|D|0D)\\\' 	 ), 	 totalTh as (select count(*) as cnt 	 from usem 	 where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' 	 ), 	 totalD as (select count(*) as cnt 	 from usem 	 where BINARY idUsem REGEXP BINARY \\\'^USem0?D\\\' 	 ) 	 select \\\'Total\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\') union select \\\'Standard\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totalStd.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totalStd where BINARY u.idUsem REGEXP BINARY \\\'^USem(?!TH|D|0D)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\') union select \\\'Thamus\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totalTh.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totalTh where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USemTH\\\',1,1,\\\'c\\\') union	 select \\\'Dummy\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totalD.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totalD where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\')',

      'with totals as (select u2.pos, count(*) as cnt 	 from usem u2 	 group by u2.pos), 	tot as ( 		select count(*) as cnt 	 	from usem 	 	) select \\\'Total\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/tot.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, tot group by u.pos union select \\\'Standard\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals where u.pos = totals.pos and BINARY u.idUsem REGEXP BINARY \\\'^USem(?!TH|D|0D)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^(USem)\\\',1,1,\\\'c\\\') union	 select \\\'Thamus\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals where u.pos = totals.pos and BINARY u.idUsem REGEXP BINARY \\\'^(USemTH)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^(USemTH)\\\',1,1,\\\'c\\\') union	 select \\\'Dummy\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u, totals where u.pos = totals.pos and BINARY u.idUsem REGEXP BINARY \\\'^(USem0?D)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsem ,\\\'^USem\\\',1,1,\\\'c\\\')',

     'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) 	 select \\\'Definition\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.definition is not null UNION 	 select \\\'Definition\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.definition is not null and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) 	 select \\\'Example\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.exemple is not null UNION 	 select \\\'Example\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.exemple is not null and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) 	 select \\\'Comment\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.comment is not null UNION 	 select \\\'Comment\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.comment is not null and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\'), totals.cnt ',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'SynU\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u3.idUsem from usynusem u3) UNION 	 select \\\'SynU\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u3.idUsem from usynusem u3) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Trait\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usemtraits u4) UNION 	 select \\\'Trait\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usemtraits u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Template\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usemtemplates u4) UNION 	 select \\\'Template\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usemtemplates u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

      'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Predicate\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usempredicate u4) UNION 	 select \\\'Predicate\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usempredicate u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

 'with total as (select count(*) as cnt 	 from usem u2 	 ), 	 totals as ( 	select BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as cnt 	from usem u2 	group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') 	) select \\\'Relation\\\', \\\'All\\\', count(*) as num, ANY_VALUE(total.cnt) as total, ANY_VALUE(concat(round(( COUNT(*)/total.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , total where u.idUsem in (select u4.idUsem from usemrel u4) UNION 	 select \\\'Relation\\\', BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') as prefix, count(*) as num, totals.cnt, (concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usem u , totals where u.idUsem in (select u4.idUsem from usemrel u4) and totals.prefix = BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') group by BINARY REPLACE(REGEXP_SUBSTR(idUsem ,\\\'^(USemTH|USem0?D|USem)\\\',1,1,\\\'c\\\'),\\\'USem0D\\\',\\\'USemD\\\') , totals.cnt',

      'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , u.idUsyn, count(*) as cnt from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem , u.idUsyn) as t), countD as ( select count(*) as tot from (select u.idUsem , u.idUsyn from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem , u.idUsyn) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , u.idUsyn, count(*) as cnt from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem , u.idUsyn) as t), countTH as ( select count(*) as tot from (select u.idUsem , u.idUsyn from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem , u.idUsyn) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , u.idUsyn, count(*) as cnt from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem , u.idUsyn) as t), countS as ( select count(*) as tot from (select u.idUsem , u.idUsyn from usynusem u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem , u.idUsyn) as v) select \\\'avg of SynUs Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of SynUs Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of SynUs Standard\\\', num, tot, num/tot from sumS, countS',

      'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot from (select u.idUsem from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usemtraits u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of traits Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of traits Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of traits Standard\\\', num, tot, num/tot from sumS, countS',

     'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot from (select u.idUsem from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usemtemplates u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of templates Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of templates Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of templates Standard\\\', num, tot, num/tot from sumS, countS',

     'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot  from (select u.idUsem from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usempredicate u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of predicates Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of predicates Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of predicates Standard\\\', num, tot, num/tot from sumS, countS',

     'with sumD as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as t), countD as ( select count(*) as tot from (select u.idUsem from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\' group by u.idUsem ) as v), sumTH as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as t), countTH as ( select count(*) as tot from (select u.idUsem from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' group by u.idUsem ) as v), sumS as ( select sum(t.cnt) as num from (select u.idUsem , count(*) as cnt from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as t), countS as ( select count(*) as tot from (select u.idUsem from usemrel u where BINARY u.idUsem REGEXP BINARY \\\'^USem[^(D|TH)]\\\' group by u.idUsem ) as v) select \\\'avg of relations Dummies\\\', num, tot, num/tot as average from sumD, countD union select \\\'avg of relations Thamus\\\', num, tot, num/tot from sumTH, countTH union select \\\'avg of relations Standard\\\', num, tot, num/tot from sumS, countS',

 ],

 queries2 = [

     'with totals as (select pos, count(*) as cnt from usyns group by pos), tot as ( select count(*) as cnt from usyns ) select \\\'Total\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/tot.cnt * 100 ),2),\\\'%\\\')) as perc from usyns u, tot group by u.pos union select \\\'Standard\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usyns u, totals where u.pos = totals.pos and BINARY u.idUsyn REGEXP BINARY \\\'^SYNU(?!TH)\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsyn ,\\\'^SYNU\\\',1,1,\\\'c\\\') union select \\\'Thamus\\\' as type, u.pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from usyns u, totals where u.pos = totals.pos and BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' group by u.pos, BINARY REGEXP_SUBSTR(idUsyn ,\\\'^SYNUTH\\\',1,1,\\\'c\\\') order by type desc, num desc',

     'WITH sumTH as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and u.pos is not NULL), countTH as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' ), sumS as ( select count(*) as num from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' and u.pos is not NULL), countS as ( select count(*) as tot from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNU[^(TH)]\\\' ) select \\\'PoS in Thamus\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from sumTH, countTH union select \\\'PoS in Standard\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') from sumS, countS',

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
 
	'WITH notnull as ( select count(*) as num from mus m where m.pos is not NULL), totals as ( select count(*) as tot from mus m )select \\\'presence of PoS\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from notnull, totals',

	'WITH notnull as ( select count(*) as num from mus m where m.ginp is not NULL), totals as ( select count(*) as tot from mus m )select \\\'presence of ginp\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from notnull, totals',

	'with notnull as ( select count(*) as num from mus m where m.idMus in ( select m2.idMus from musphu m2) ), totals as ( select count(*) as tot from mus m )select \\\'presence of link with PUs\\\', num, tot, concat(round(( num/tot * 100 ),2),\\\'%\\\') as perc from notnull, totals',

	'with totals as (select count(*) as cnt from musphu) select a.pos, a.num, a.perc from ( select pos, count(*) as num, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),4),\\\'%\\\')) as perc from musphu, totals group by pos order by num desc) as a union select * from ( select \\\'TOTAL\\\' as pos, count(*) as num, \\\'100%\\\' as perc from musphu m ) as b',

	'WITH totals AS (SELECT COUNT(*) AS cnt FROM musphu) select morphFeat , count(*) as num, ANY_VALUE(concat(round((COUNT(*) / totals.cnt * 100), 2), \\\'%\\\')) AS perc from musphu m , totals group by morphFeat  order by num desc',
 
    ],
    
    queries4 = [

	'with totals as (select count(*) as cnt from phu) select \\\'presence of phono\\\', count(*) as num, ANY_VALUE(totals.cnt) as tot, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from phu, totals where phono is not null union select \\\'presence of sampa\\\', count(*) as num, ANY_VALUE(totals.cnt) as tot, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from phu, totals where sampa is not null union select \\\'presence of syllables\\\', count(*) as num, ANY_VALUE(totals.cnt) as tot, ANY_VALUE(concat(round(( COUNT(*)/totals.cnt * 100 ),2),\\\'%\\\')) as perc from phu, totals where syllables is not null',

    ],

];

/* Peculiar Entries Dropdown MENU */
var peculiarEntriesQueriesMenuLabel = [
    'Dummy entries',
    'Thamus entries',
];

var peculiarEntriesQueriesLabel = [
    peculiarDummiesLabel = [
	'Dummy SemUs',
	'Dummy SemUs sharing naming with Standard SemUs',
	'Dummy SemUs sharing naming with Thamus SemUs',
	'Dummy SemUs with NULL definition',
	'Dummy SemUs with definition and without semantic relations',
	'Dummy SemUs without semantic relations',
	'Dummy SemUs without predicates',
	'Dummy SemUs with NULL example',
	'Dummy SemUs with NULL naming',
	'Dummy SemUs with comment',
	'Dummy SemUs with templates',
	'Dummy SemUs with traits',
	'Dummy SemUs with relation',
	'Dummy SemUs with predicate',
	'Dummy SemUs with SynUs',
    ],
    peculiarThamusLabel = [
	'Thamus SemUs',
	'Thamus SynUs',
	'MUs connected to Thamus SynUs',
	'MUs with NULL ginp connected to Thamus SynUs',
	'PUs connected to MUs connected to Thamus SynUs',
	'Thamus SemUs with no comment',
	'Thamus SemUs with no example',
	'Thamus SemUs with no definition',
	'Thamus SemUs with PoS "ADV" ending with "-mente"',
	'Proper Nouns in Thamus SemUs',
	'Thamus SynUs with a descriptionL',
	'Thamus SynUs with a framesetL',
	'Thamus SynUs with the ginp as comment',
	'Thamus SemUs with at least one template',
	'Thamus SemUs with two templates',
	'Thamus SemUs in relation with another SemU',
	'Thamus SemUs in relation ISA with another SemU',
	'Thamus SemUs in relation with Thamus SemUs',
	'USYNUSEM between Thamus entries with no idCorresp',
	'USYNUSEM between Thamus entries with idCorresp = 70',
	'Duplicate Thamus entries in USYNUSEM with idCorresp = 70',
	'Redundant PUs connected to Thamus SynUs'
    ],
];

var peculiarEntriesQueries = [
    peculiarDummiesQueries = [
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem[0-9]?D\\\'',
	'select * from usem u where BINARY  u.idUsem REGEXP BINARY \\\'^USem[0-9]?D\\\' and u.naming in (select u2.naming from usem u2 where BINARY u2.idUsem REGEXP BINARY \\\'^USem(?!TH|0?D)\\\')',
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem[0-9]?D\\\' and u.naming in (select u2.naming from usem u2 where BINARY u2.idUsem REGEXP BINARY \\\'^USemTH\\\')',
	'select * from usem u where BINARY u.idUsem REGEXP  BINARY \\\'^USem[0-9]?D\\\' and u.definition is NULL ',
	'select * from usem u where BINARY u.idUsem REGEXP  BINARY \\\'^USem[0-9]?D\\\' and u.definition is not NULL and idUsem not in (select idUsem from usemrel)',
	'select * from usem where BINARY idUsem REGEXP  BINARY \\\'^USem[0-9]?D\\\' and idUsem not in (select idUsem from usemrel) ',
	'select * from usem where BINARY idUsem REGEXP  BINARY \\\'^USem[0-9]?D\\\' and idUsem not in (select idUsem from usempredicate)',
	'select * from usem where BINARY idUsem REGEXP BINARY  \\\'^USem[0-9]?D\\\' and exemple is NULL',
	'select * from usem where BINARY idUsem REGEXP BINARY  \\\'^USem[0-9]?D\\\' and naming is NULL',
	'select * from usem where BINARY idUsem REGEXP BINARY  \\\'^USem[0-9]?D\\\' and comment is not NULL',
	'select * from usemtemplates ut where ut.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select * from usemtraits ut where ut.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select * from usemrel ur where ur.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select * from usempredicate up where up.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
	'select * from usynusem uu where uu.idUsem in (select u.idUsem from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USem0?D\\\')',
		  ],

    peculiarThamusQueries = [
	'select * from usem where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\'',
	'select * from usyns where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\'',
	'select distinct idUms, idUsyn from usyns where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\'',
	'select * from mus m where m.idMus in (select u.idUms from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\') and m.ginp is NULL',
	'select distinct idPhu from musphu where idMus in (select m.idMus from mus m where m.idMus in (select u.idUms from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\') )',
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' and u.comment is NULL',
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' and u.exemple is NULL',
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' and u.definition is NULL',
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' and u.pos = \\\'ADV\\\' and u.naming REGEXP \\\'mente$\\\'',
	'select * from usem u where BINARY u.idUsem REGEXP BINARY \\\'^USemTH\\\' and u.pos = \\\'NP\\\'',
	'select * from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and descriptionL is not NULL  and descriptionL <> ""',
	'select * from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and framesetL is not NULL  and framesetL <> ""',
	'select * from usyns u where BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY u.comment REGEXP BINARY \\\'^GINP\\\\\\\\d+$\\\'',
	'select DISTINCT idUsem from usemtemplates  where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\'',
	'select idUsem, count(*) as count from usemtemplates where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' group by idUsem  HAVING count(*) = 2',
	'select idUsem, idRSem, idUsemTarget from usemrel where BINARY idUsem REGEXP BINARY \\\'USemTH\\\'',
	'select idUsem, \\\'ISA\\\', idUsemTarget from usemrel where BINARY idUsem REGEXP BINARY \\\'USemTH\\\' and idRSem = \\\'R146\\\'',
	'select idUsem, idRSem, idUsemTarget from usemrel where BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and BINARY idUsemTarget  REGEXP BINARY \\\'^USemTH\\\'',
	'select * from usynusem where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and idCorresp is NULL',
	'select * from usynusem where BINARY idUsyn REGEXP BINARY \\\'^SYNUTH\\\' and BINARY idUsem REGEXP BINARY \\\'^USemTH\\\' and idCorresp = 70',
	'select u2.ID, u2.idUsem , u2.idUsyn, u2.idCorresp, u2.description  from ( select idUsem , idUsyn , idCorresp , description ,count(*) as cnt from usynusem group by idUsem , idUsyn , idCorresp, description HAVING COUNT(*)>1 ) as u, usynusem u2 where u.idUsem = u2.idUsem AND u.idUsyn = u2.idUsyn AND u.idCorresp = u2.idCorresp AND u2.idCorresp = 70 and COALESCE (u.description,\\\'\\\') = COALESCE (u2.description,\\\'\\\') ORDER by idUsem ASC',
	'select DISTINCT rp.idRedundant ,  u.idUsyn from RedundantPhu rp , musphu m , usyns u where rp.idRedundant = m.idPhu and m.idMus = u.idUms and BINARY u.idUsyn REGEXP BINARY \\\'^SYNUTH\\\'',
	      ],
    
    
    unusedQueries1 = [
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\') , COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')',
	'select t.duplicate, t.source, mp.pos , mp.morphFeat, mp.idKey , mp2.idKey from musphu mp, musphu mp2,	(select m2.idMus as duplicate, m.idMus as source from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and COALESCE (m.ginp, \\\'\\\') = COALESCE (m2.ginp, \\\'\\\')) as t where t.duplicate = mp.idMus and t.source = mp2.idMus and mp.pos = mp2.pos and mp.morphFeat = mp2.morphFeat ',
	'select m2.idMus , m.idMus, m.naming, m.pos, COALESCE (m.ginp, \\\'\\\'), COALESCE (m2.ginp, \\\'\\\') from mus m , mus m2 where m.naming = m2.naming and m.pos = m2.pos and m2.idMus > m.idMus and m.ginp is NULL and m2.ginp is NOT NULL ',
    ],
    unusedQueries3  = [
'select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c from phu p group by p.naming , p.phono 	HAVING (c=2)) as t, phu p2 where p2.naming = t.naming and p2.phono = t.phono',
		 'select p2.idPhu, p2.naming, p2.phono from (select p.naming , p.phono, COUNT(*) as c	from phu p group by p.naming , p.phono HAVING (c=3)) as t, phu p2 where p2.naming = t.naming and p2.phono = t.phono',
		 'SELECT * FROM usyns'
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
	'MUSPHU entries linked to redundant PUs',
	'Duplicate rows in MUSPHU',
	'Duplicate rows in USYNUSEM',
    ];
    
    var arrayQuery = [
	'select * from RedundantUsem',
	'select * from RedundantPhu',
	'select * from RedundantUsyn',
	'select * from RedundantMus',
	'select * from RedundantMusPhu',
	'select * from DuplicateMUSPHU',
	'select * from DuplicateUsynUsem',
    ];

    var arrayPseudocode = [
	"\
\'foreach (pair of entries SemU<sub>a</sub> and SemU<sub>b</sub> &isin; USEM)<br/>\
  if (SemU<sub>a</sub> &  SemU<sub>b</sub> have same naming & same pos & same semantic traits &<br/>\
    same templates & same predicates & same semantic relations) then<br/>\
    if (SemU<sub>a</sub> and SemU<sub>b</sub> have same SynU of reference) then<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example & same comment) then<br/>\
        mark the entry with higher id with status := 15<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example) then<br/>\
        mark the entry with higher id with status := 14<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same example) then<br/>\
        mark the entry with higher id with status := 13<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same example)<br/>\
        mark the entry with higher id with status := 12<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same definition) then<br/>\
        mark the entry with higher id with status := 11<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition) then<br/>\
        mark the entry with higher id with status := 10 <br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment) then<br/>\
        mark the entry with higher id with status := 9<br/>\
      else <br/>\
        mark the entry with higher id with status := 8<br/>\
    else<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example & same comment) then<br/>\
        mark the entry with higher id with status := 7<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition & same example) then<br/>\
        mark the entry with higher id with status := 6<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same example) then<br/>\
        mark the entry with higher id with status := 5<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same example)<br/>\
        mark the entry with higher id with status := 4<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment & same definition) then<br/>\
        mark the entry with higher id with status := 3<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same definition) then<br/>\
        mark the entry with higher id with status := 2<br/>\
      if (SemU<sub>a</sub> and SemU<sub>b</sub> have same comment) then<br/>\
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
\'foreach (pair of entries SynU<sub>a</sub> and SynU<sub>b</sub> &isin; USYNS)<br/>\
  if (SynU<sub>a</sub> & SynU<sub>b</sub> have same naming & same pos & same description &<br/>\
    same descriptionL & same framesetL) then<br/>\
    if (SynU<sub>a</sub> and SynU<sub>b</sub> have same SemU of reference) then<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example & same comment) then<br/>\
        mark the entry with higher id with status := 15<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example) then<br/>\
        mark the entry with higher id with status := 14<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example & same comment) then<br/>\
        mark the entry with higher id with status := 13<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example) then<br/>\
        mark the entry with higher id with status := 12<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment & same idMus) then<br/>\
        mark the entry with higher id with status := 11<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same same idMus) then<br/>\
        mark the entry with higher id with status := 10<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment) then<br/>\
        mark the entry with higher id with status := 9<br/>\
      <br/>\
        mark the entry with higher id with status := 8<br/>\
    else<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example & same comment) then<br/>\
        mark the entry with higher id with status := 7<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same idMus & same example) then<br/>\
        mark the entry with higher id with status := 6<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example & same comment) then<br/>\
        mark the entry with higher id with status := 5<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same example) then<br/>\
        mark the entry with higher id with status := 4<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment & same idMus) then<br/>\
        mark the entry with higher id with status := 3<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same same idMus) then<br/>\
        mark the entry with higher id with status := 2<br/>\
      if (SynU<sub>a</sub> and SynU<sub>b</sub> have same comment) then<br/>\
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
