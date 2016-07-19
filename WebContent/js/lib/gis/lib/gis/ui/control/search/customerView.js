/**
 * WKTを編集レイヤに表示するコントロール
 */
gis.ui.control.search.customerView = function(spec,my){
	my = my || {};

	var that = gis.ui.control.search(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'customerView';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Search Customer';

	my.dialog = gis.ui.dialog({ divid : my.id });

	my.tableId = "table-" + my.id;
	my.pagerId = "pager-" + my.id;

	my.height = 510;
	my.width = 940;
	my.url = './rest/Customers/';
	my.colModelSettings= [
       {name:"villageid",index:"villageid",width:60,align:"center",classes:"villageid_class"},
       {name:"villagename",index:"villagename",width:150,align:"left",classes:"villagename_class"},
       {name:"zone",index:"zone",width:50,align:"center",classes:"zone_class"},
       {name:"con",index:"con",width:70,align:"left",classes:"con_class"},
       {name:"name",index:"name",width:300,align:"left",classes:"name_class"},
       {name:"status",index:"status",width:60,align:"center",classes:"status_class"},
       {name:"serialno",index:"serialno",width:150,align:"left",classes:"serialno_class"},
       {name:"wkt",index:"wkt",width:300,align:"left",classes:"wkt_class"}
   ]
	my.colNames = ["Village ID","Village Name","Zone","Con","Customer Name","Status","Meter S/N","Location"];

	that.CLASS_NAME =  "gis.ui.control.search.customerView";
	return that;
};