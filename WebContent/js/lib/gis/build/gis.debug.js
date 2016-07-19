/*

  gis.js -- Map Editor Library

  Copyright (c) 2015 by Jin Igarashi(Narok Water and Sewerage Services Company)

  this tool use OpenLayers, jquery and jquery-ui.

*/
/* ======================================================================
    gis/singleFile.js
   ====================================================================== */

/**
 * 圧縮された一つのファイルから参照されたときに読みこまれるファイル
 */
var gis = {
    /**
     * Constant: VERSION_NUMBER
     */
    VERSION_NUMBER: "Release 0.1",

    /**
     * Constant: singleFile
     * TODO: remove this in 3.0 when we stop supporting build profiles that
     * include gis.js
     */
    singleFile: true,

    /**
     * Method: _getScriptLocation
     * Return the path to this script. This is also implemented in
     * justice.js
     *
     * Returns:
     * {String} Path to this script
     */
    _getScriptLocation: (function() {
        var r = new RegExp("(^|(.*?\\/))(gis[^\\/]*?\\.js)(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for(var i=0, len=s.length; i<len; i++) {
            src = s[i].getAttribute('src');
            if(src) {
                m = src.match(r);
                if(m) {
                    l = m[1];
                    break;
                }
            }
        }
        return (function() { return l; });
    })()
};
/* ======================================================================
    gis/geometryOp.js
   ====================================================================== */

/**
 * ジオメトリに対して操作を行うクラスのトップクラス
 */
gis.geometryOp = function(spec,my){
	var that= {};

	my = my || {};

	my.geometry = spec.geometry;
	
	/**
	 * OpenLayers.Geometryを取得する
	 * @returns {OpenLayers.Geometry}
	 */
	that.getGeometry = function(){
		return my.geometry;
	};
	
	/**
	 * OpenLayers.geometryを設定する
	 * @param geom OpenLayers.Geometry
	 */
	that.setGeometry = function(geom){
		my.geometry = geom;
	};
	
	/**
     * OpenLayers.GeometryからOpenLayers.Feature.Vectorを作成する
     * @returns {OpenLayers.Feature.Vector}
     */
    that.toFeature = function(){
    	var feature = new OpenLayers.Feature.Vector(my.geometry);
        feature.state = OpenLayers.State.INSERT;
        return feature;
    },
    
    that.toString = function(){
    	return my.geometry.toString();
    };
	
	that.CLASS_NAME =  "gis.geometryOp";
	return that;
};

/**
 * OpenLayers.GeometryからOpenLayers.Feature.Vectorを作成する
 * @param OpenLayers.Geometry
 * @returns {OpenLayers.Feature.Vector}
 */
gis.geometryOp.toFeature = function(geometry){
	var geomOp = gis.geometryOp({geometry : geometry});
	return geomOp.toFeature();
};
/* ======================================================================
    gis/ui.js
   ====================================================================== */

/**
 * uiコントロールの最上位クラス
 */
gis.ui = function(spec,my){
	var that= {};

	my = my || {};

	/**
	 * UIコントロールを表示するDIVタグID
	 */
	my.divid = spec.divid;

	that.getHeight = function(){
		return $("#" + my.divid).height();
	};

	that.CLASS_NAME =  "gis.ui";
	return that;
};
/* ======================================================================
    gis/ui/control.js
   ====================================================================== */

/**
 * 地図編集コントロールを管理するスーパークラス
 */
gis.ui.control = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || undefined;

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || undefined;

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || "";

	/**
	 * デフォルトのチェック状態
	 */
	my.defaultchecked = false;

	/**
	 * OpenLayers.Mapオブジェクト
	 */
	my.map = spec.map || undefined;

	/**
	 * 編集レイヤオブジェクト
	 */
	my.editingLayer = spec.editingLayer || undefined;

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = undefined;

	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = false;

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = spec.toggleCallback || undefined;

	/**
	 * パラメータで渡されたフィーチャを点滅させる
	 */
	my.flashFeatures = function(features, index) {
		if (!index) {
			index = 0;
		}
		var current = features[index];
		var layer = my.editingLayer;
		if (current && current.layer === layer) {
			layer.drawFeature(features[index], "select");
		}
		var prev = features[index - 1];
		if (prev && prev.layer === layer) {
			layer.drawFeature(prev, "default");
		}
		++index;
		if (index <= features.length) {
			window.setTimeout(function() {
				my.flashFeatures(features, index);
			}, 100);
		}
	};

	/**
	 * OpenLayers.Mapオブジェクトにコントロールを追加する前の処理
	 */
	my.beforeAddControlInMap = function(map){
		return;
	};

	/**
	 * コントロールのHTML作成後の後処理（オプション用）
	 */
	my.afterCreateHtml = function(){
		return;
	};

	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		return;
	};

	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		return;
	};

	that.getId = function(){
		return my.id;
	};

	/**
	 * 地図編集コントロールかどうか
	 */
	that.isOlControl = function(){
		return my.isOlControl;
	};

	/**
	 * OpenLayersのコントロールを持っているかどうか
	 */
	that.haveOlControl = function(){
		if (my.olControl){
			return true;
		}else{
			return false;
		};
	};

	/**
	 * トグルチェンジのコールバック関数を設定する
	 */
	that.setToggleCallback = function(callback){
		my.toggleCallback = callback;
	};

	/**
	 * コントロールのHTMLを作成する
	 */
	that.createHtml = function(){
		my.id = "menu" + my.id;
		return "<a href='#' id='" + my.id + "'>" + my.label + "</a>";
	};

	that.createButtonHtml = function(){
		my.id = "btn" + my.id;
		return "<button id='" + my.id + "' class='gis-ui-buttonmenu'>" + my.label + "</button>"
	};


	/**
	 * OpenLayers.Mapオブジェクトにコントロールを追加する
	 */
	that.addControlInMap = function(map){
		if (!my.olControl){
    		return;
    	}
		my.beforeAddControlInMap(map);
    	map.addControl(my.olControl);
	};

	/**
	 * 指定されたエレメントの状態によってコントロールの状態を変更
	 * @param element DOMエレメント
	 */
	that.changeActivate = function(element){
		var isChecked = $("#" + my.id).is(':checked');
		if (isChecked === true){
			that.activate();
		}else{
			that.deactivate();
		}
	};

	/**
	 * コントロールをアクティブにする
	 */
	that.activate = function(){
		if (my.olControl){
			if (!my.olControl.active){
				my.olControl.activate();
			}
		}

		my.afterActivate();
	};

	/**
	 * コントロールを非アクティブにする
	 */
	that.deactivate = function(){
		if (my.olControl){
			if (my.olControl.active){
				my.olControl.deactivate();
			}
		}

		my.afterDeactivate();
	};

	/**
	 * コールバック関数を実行する
	 */
	that.execute = function(option){
		my.toggleCallback();
	};

	that.CLASS_NAME =  "gis.ui.control";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomToExtent.js
   ====================================================================== */

gis.ui.control.zoomToExtent = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoomToExtent';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom To Extent';

	/**
	 * OpenLayers.Mapオブジェクト
	 */
	my.map = spec.map;

	my.bounds = new OpenLayers.Bounds([35.8,-1.1,35.9,-1.0]);

	/**
	 * コンストラクタ
	 */
	my.init = function(){
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.map.zoomToExtent(my.bounds.transform(my.map.displayProjection,my.map.projection));
	}

	that.CLASS_NAME =  "gis.ui.control.zoomToExtent";
	return that;
};
/* ======================================================================
    gis/ui/control/drawHole.js
   ====================================================================== */

/**
 * 穴あきポリゴンを作成するコントロール
 */
gis.ui.control.drawHole = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'drawHole';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'drawHole';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Draw Hole Polygon.';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawHole(my.editingLayer,OpenLayers.Handler.Polygon);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.drawHole";
	return that;
};
/* ======================================================================
    gis/ui/control/drawLine.js
   ====================================================================== */

/**
 * ラインを作成するコントロール
 */
gis.ui.control.drawLine = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'drawLine';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'drawLine';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Draw Line';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawFeature(my.editingLayer,OpenLayers.Handler.Path);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.drawLine";
	return that;
};
/* ======================================================================
    gis/ui/control/redo.js
   ====================================================================== */

gis.ui.control.redo = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'redo';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Redo';
	
	my.controller = spec.controller;
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.controller.redo();
	};
	
	that.CLASS_NAME =  "gis.ui.control.redo";
	return that;
};
/* ======================================================================
    gis/ui/control/inputWorksheet.js
   ====================================================================== */

gis.ui.control.inputWorksheet = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'inputWorksheet';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Input O&M Worksheet';

	my.worksheetLayer = spec.worksheetLayer;

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawFeature(my.editingLayer,OpenLayers.Handler.Point);

	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;

	my.isInit = false;

	my.officers = [];
	my.worktypes = [];
	my.fields = [];

	my.objInputUsedMaterial = null;

	my.geometry = null;

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		if (my.isInit !== true){
			my.getWorktypes();
			my.getOfficers();
			my.setFields();
			my.dialog.create(my.getDialogHtml(),{
				title : 'Input O&M Worksheet',
				modal : true,
				position : 'center',
				width : 700,
				height : 600,
				buttons : {
					'Save' : my.btnSave_onClick,
					'Close' : function(){
						$(this).dialog('close');
					}
				}
			});
			$("#form" + my.id).validationEngine('attach',{
				promptPosition:"inline"
			});
			my.setDatePicker();
			my.isInit = true;
		}
	};

	my.getWorktypes = function(){
		$.ajax({
			url : './rest/WorkType/',
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		var types = json.value;
    		var data = [];
    		for (var i = 0 in types){
    			var x = types[i];
    			data.push({value:x.worktypeid,label:x.name})
    		}
    		my.worktypes = data;
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	};

	my.getOfficers = function(){
		$.ajax({
			url : './rest/Officers/',
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		var officers = json.value;
    		var data = [];
    		for (var i = 0 in officers){
    			var o = officers[i];
    			data.push({value:o.officerid,label:o.name})
    		}
    		my.officers = data;
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	};

	my.setFields = function(){
		var fields = [
		              {id : "workno", label : "Work No", "class" : "validate[required,custom[integer],min[1]]"}
		              ,{id : "worktypeid",label : "Type of O&M Work",type : "combobox",data : my.worktypes, "class" : "validate[required]"}
		              ,{id : "otherworkname", label : "Type of Work(3:Others)", "class" : "validate[maxSize[100]]"}
		              ,{id : "officerid", label : "Name of Officer", type : "combobox", data : my.officers, "class" : "validate[required]"}
		              ,{id : "inputdate", label : "Date",type : "date", "class" : "validate[required]"}
		              ,{id : "roadname", label : "Name of Road", "class" : "validate[required,maxSize[50]]"}
		              ,{id : "worklocation", label : "Location", "class" : "validate[required,maxSize[100]]"}
		              ,{
		            	  id : "lekagescale",
		            	  label : "Scale of Lekage",
		            	  type : "combobox",
		            	  "class" : "validate[required]",
		            	  data : [{value:'1',label:'1:Large'},{value:'2',label:'2:Medium'},
		            	          {value:'3',label:'3:Small'},{value:'-1',label:'-1:N/A'}]
		              }
		              ,{id : "dateofwork", label : "Date of Work",type : "date", "class" : "validate[required]"}
		              ,{id : "workersno", label : "No. of Workers", "class" : "validate[required,custom[integer],min[1],max[" + my.officers.length + "]]"}
		              ,{id : "timetaken", label : "Time Taken for Work(minutes)", "class" : "validate[required,custom[integer]]"}
		              ,{
		            	  id : "usedmaterial",
		            	  subid : "usedmaterialformatrix"
		              }
		              ,{
		            	  id : "pipe_material",
		            	  label : "Pipe Material",
		            	  type : "combobox",
		            	  "class" : "validate[required]",
		            	  data : [{value:'PVC',label:'1:PVC'},{value:'GIP',label:'2:GIP'},
		            	          {value:'PPR',label:'3:PPR'},{value:'HDPE',label:'4:HDPE'},
		            	          {value:'Others',label:'5:Others'}]
		              }
		              ,{
		            	  id : "pipe_diameter",
		            	  label : "Pipe Diameter(mm)",
		            	  type : "combobox",
		            	  skipValueWithLabel : true,
		            	  "class" : "validate[required]",
		            	  data : [{value:'13',label:'DN13(1/2 inch)'},{value:'20',label:'DN20(3/4 inch)'},
		            	          {value:'25',label:'DN25(1 inch)'},{value:'32',label:'DN32(1.25 inch)'},
		            	          {value:'38',label:'DN38(1.5 inch)'},{value:'50',label:'DN50(2 inch)'},
		            	          {value:'63',label:'DN63(2.5 inch)'},{value:'75',label:'DN75(3 inch)'},
		            	          {value:'100',label:'DN100(4 inch)'},{value:'150',label:'DN150(6 inch)'},
		            	          {value:'200',label:'DN200(8 inch)'},{value:'250',label:'DN250(10 inch)'}]
		              }
		              ,{id : "pipe_depth", label : "Pipe Depth(mm)", "class" : "validate[required,custom[integer],min[0],max[3000]]"}
		              ,{
		            	  id : "land_class",
		            	  label : "Landownership Classification",
		            	  type : "combobox",
		            	  "class" : "validate[required]",
		            	  data : [{value:'Public',label:'1:Public'},{value:'Private',label:'2:Private'}]
		              }
		              ,{id : "pipe_class",
		            	  label : "Pipe Classification",
		            	  type : "combobox",
		            	  "class" : "validate[required]",
		            	  data : [{value:'Distribution Pipe',label:'1:Distribution Pipe'},{value:'Service Pipe',label:'2:Service Pipe'},{value:'Transmission Pipe',label:'3:Transmission Pipe'}]
		              }
		              ,{
		            	  id : "surface",
		            	  label : "Surface",
		            	  type : "combobox",
		            	  "class" : "validate[required]",
		            	  data : [{value:'Asphalt',label:'1:Asphalt'},{value:'Concrete',label:'2:Concrete'},
		            	          {value:'Soil/Gravel',label:'3:Soil/Gravel'},{value:'Others',label:'4:Others'}]
		              }
		              ,{
		            	  id : "work_point",
		            	  label : "The Point of Works",
		            	  type : "combobox",
		            	  "class" : "validate[required]",
		            	  data : [{value:'Pipe Body',label:'1:Pipe Body'},{value:'Pipe Joint',label:'2:Pipe Joint'},
		            	          {value:'Valve',label:'3:Valve'},{value:'Fire Hydrant',label:'4:Fire Hydrant'},
		            	          {value:'Service Pipe',label:'5:Service Pipe'},{value:'Ferrule',label:'6:Ferrule'},
		            	          {value:'Water Meter',label:'7:Water Meter'},{value:'Others',label:'8:Others'}]
		              }
		              ,{id : "comments", label : "Comment", "class" : "validate[maxSize[500]]"}
		              ];
		my.fields = fields;
	};

	my.getDialogHtml = function(){
		var html = "<form id='form" + my.id + "' method='post'><table class='dialogstyle'>";
		for (var i = 0 in my.fields){
			var f = my.fields[i];
			if (f.id === 'usedmaterial'){
				html += "<tr><th colspan='2'><div id = '" + f.subid + "' style='width:100%'></div></td></tr>";
				my.objInputUsedMaterial = gis.ui.control.inputUsedMaterial({divid : f.subid});

			}else{
				html += "<tr><th style='width:40%'>" + f.label + "</th>";
				var insertHtml = "";
				if (f.type === 'combobox'){
					insertHtml = "<select id='" + f.id + "' style='width:100%' class='" + f["class"] + "'>";
					for (var i = 0 in f.data){
						if (i == 0){
							insertHtml += "<option value=''>Please choose from select</option>";
						}
						var d = f.data[i];
						insertHtml += "<option value='" + d.value + "'>" + d.label + "</option>";
					}
					insertHtml += "</select>";
				}else if (f.type === 'date'){
					insertHtml += "<input id='" + f.id + "' style='width:98%' class='" + f["class"] + "'/>";
				}else{
					if (!f["class"]){
						insertHtml += "<input id='" + f.id + "' type='text' style='width:98%'/>";
					}else{
						insertHtml += "<input id='" + f.id + "' type='text' style='width:98%' class='" + f["class"] + "'/>";
					}

				}
				html += "<td style='width:60%'>" + insertHtml + "</td>";
				html += "</tr>";
			}
		}
		html += "</table></form>"
		return html;
	};

	my.setDatePicker = function(){
		for (var i = 0 in my.fields){
			var f = my.fields[i];
			if (f.type === 'date'){
				$("#" + f.id).datepicker({
					dateFormat : 'dd/mm/yy'
				});
			}
		}
	}

	my.btnSave_onClick = function(){
		var valid = $("#form" + my.id).validationEngine('validate');
		if (valid !==true){
			return;
		}

		var usedmaterials = my.objInputUsedMaterial.getMatrixValues();
		if (usedmaterials.length === 0){
			if (!confirm("You don't input used materials yet. Do you want to cotinue saving?")){
				return;
			}
		}else{
			if (!confirm("Do you want to input this data into GIS database?")){
				return;
			}
		}

		var values = {};
		for (var i = 0 in my.fields){
			var f = my.fields[i];
			if (f.id === 'usedmaterial'){
				values[f.id] = JSON.stringify(usedmaterials);
			}else{
				values[f.id] = $("#" + f.id).val()
			}
		}
		values["geom"] = my.geometry.toString();

		$.ajax({
			url : './rest/Worksheets',
			type : 'POST',
			data : values,
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		my.worksheetLayer.redraw();
    		my.dialog.close();
    	}).fail(function(xhr){
    		console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});


	};

	/**
	 * フィーチャ選択時のイベント定義
	 */
	my.callbacks = {
            "beforefeatureadded": function(e) {
            	if (my.isInit === false){
            		return false;
            	}
            	if (!confirm("Are you sure here is really O&M point?")){
					return false;
				}
            	for (var i = 0 in my.fields){
        			if (my.fields[i].id === 'usedmaterial'){
        				my.objInputUsedMaterial.clear();
        			}else{
        				$("#" + my.fields[i].id).val("");
        			}
        		}
            	var f = e.feature;
            	my.geometry = e.feature.geometry;
            	my.dialog.open();
            	return false;
            }
	};

	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		gistools.objLogin.login(function(isSuccess){
			if (isSuccess === true){
				my.init();
				my.worksheetLayer.setVisibility(true);
				my.editingLayer.events.on(my.callbacks);
			}else{
				that.deactivate();
			}
		});
	};

	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.editingLayer.events.un(my.callbacks);
	};

	that.CLASS_NAME =  "gis.ui.control.inputWorksheet";
	return that;
};
/* ======================================================================
    gis/ui/control/modifyFeature.js
   ====================================================================== */

/**
 * 図形を編集するコントロール
 */
gis.ui.control.modifyFeature = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'modifyFeature';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Modify Feature';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.ModifyFeature(my.editingLayer);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Modify Option',
			close : function(){
				that.deactivate();
			}
		},my.initUI);
	};
	
	my.getHtml = function(){
		var html = "<ul>" +
		"<li>" +
		"<input type='checkbox' name='createVertices' id='createVertices' checked/>" +
		"<label for='createVertices'>Add Node</label>" +
		"</li>" +
		"<li>" +
		"<input type='checkbox' name='rotate' id='rotate'/>" +
		"<label for='rotate'>Rotate</label>" +
		"</li>" +
		"<li>" +
		"<input type='checkbox' name='resize' id='resize'/>" +
		"<label for='resize'>Resize</label>" +
		"<br>" +
		"<input type='checkbox' name='keepAspectRatio' id='keepAspectRatio' checked/>" +
		"<label for='keepAspectRatio'>Keep Aspect Ratio</label>" +
		"</li>" +
		"<li>" +
		"<input type='checkbox' name='drag' id='drag'/>" +
		"<label for='drag'>Drag</label>" +
		"</li>" +
	"</ul>";
		return html;
	};
	
	my.initUI = function(){
		$("#createVertices").click(function(){my.control_update(document.getElementById($( this ).attr('id')));});
		$("#rotate").click(function(){my.control_update(document.getElementById($( this ).attr('id')));});
		$("#resize").click(function(){my.control_update(document.getElementById($( this ).attr('id')));});
		$("#keepAspectRatio").click(function(){my.control_update(document.getElementById($( this ).attr('id')));});
		$("#drag").click(function(){my.control_update(document.getElementById($( this ).attr('id')));});
	};
	
	/**
	 * オプションツール設定変更時の反映
	 */
	my.control_update = function(){
		// reset modification mode
		my.olControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
        var rotate = document.getElementById("rotate").checked;
        if(rotate) {
        	my.olControl.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
        }
        var resize = document.getElementById("resize").checked;
        if(resize) {
        	my.olControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
            var keepAspectRatio = document.getElementById("keepAspectRatio").checked;
            if (keepAspectRatio) {
            	my.olControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
            }
        }
        var drag = document.getElementById("drag").checked;
        if(drag) {
        	my.olControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
        }
        if (rotate || drag) {
        	my.olControl.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
        }
        my.olControl.createVertices = document.getElementById("createVertices").checked;
	};
	
	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.init();
		my.dialog.open();
	};
	
	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.dialog.close();
	};
	
	that.CLASS_NAME =  "gis.ui.control.modifyFeature";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomBox.js
   ====================================================================== */

/**
 * 矩形から表示範囲を変更するコントロール
 */
gis.ui.control.zoomBox = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoombox';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'zoombox';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom Box';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.ZoomBox();
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.zoomBox";
	return that;
};
/* ======================================================================
    gis/ui/control/union.js
   ====================================================================== */

/**
 * 図形を結合するコントロール
 */
gis.ui.control.union = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'union';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'union';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'union';

	/**
	 * 結合処理完了後に削除するフィーチャを一時的に格納する
	 */
	my.removeFeatures = [];

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		if (my.editingLayer.selectedFeatures.length === 0){
			alert('Please choose features.。');
			return;
		}
		if(!window.confirm('Do you want to union your selected features?')){
			return;
		}
		var polygons = [];
		my.removeFeatures = [];
		for (var i = 0 in my.editingLayer.selectedFeatures){
			var f = my.editingLayer.selectedFeatures[i];
			var p = f.geometry.clone();
			p.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);
			polygons.push(p);
			my.removeFeatures.push(f);
		}
		var multiPolygon = new OpenLayers.Geometry.MultiPolygon(polygons);
		$.ajax({
			url : './rest/geometries/union?polygon=' + multiPolygon.toString(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(json){
			if (json.code !== 0){
				alert(json.message);
    			return;
    		}
			var polygon = json.value;
			if (polygon === ""){
				return;
			}

			var olgeom = OpenLayers.Geometry.fromWKT(polygon);
			olgeom.transform(my.editingLayer.map.displayProjection,my.editingLayer.map.projection);
			var feature = gis.geometryOp.toFeature(olgeom);
			my.editingLayer.removeFeatures(my.removeFeatures);
	    	my.editingLayer.addFeatures([feature],{silent : true});
	    	my.editingLayer.events.triggerEvent("afterunion", {
	            add: feature,
	            remove : my.removeFeatures
	        });
		}).fail(function(xhr){
			console.log(xhr);
			alert(xhr.status + ';' + xhr.statusText);
			return;
		});
	};

	that.CLASS_NAME =  "gis.ui.control.union";
	return that;
};
/* ======================================================================
    gis/ui/control/none.js
   ====================================================================== */

/**
 * 何もしないデフォルトのコントロール
 */
gis.ui.control.none = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'none';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'none';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Drag';
	
	/**
	 * デフォルトのチェック状態
	 */
	my.defaultchecked = true;
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.none";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomToExtent/lolgorien.js
   ====================================================================== */

gis.ui.control.zoomToExtent.lolgorien = function(spec,my){
	my = my || {};

	var that = gis.ui.control.zoomToExtent(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoomToLolgorien';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom To Lolgorien';

	my.bounds = gistools.settingObj.getBounds("Lolgorien");

	that.CLASS_NAME =  "gis.ui.control.zoomToExtent.lolgorien";
	return that;
};
/* ======================================================================
    gis/ui/control/regular.js
   ====================================================================== */

/**
 * 正多角形を描画するスーパークラス
 */
gis.ui.control.regular = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Draw Regular Feature Option',
			close : function(){
				that.deactivate();
			}
		},my.initUI);
	};
	
	my.getHtml = function(){
		var html = "<ul" +
		"<li>" +
		"<label for='sides" + my.id + "'>Number of Nodes</label>" +
		"<input id='sides" + my.id + "' type='number' min=3 max=99 name='sides' value='5'/>" +
		"</li>" +
		"<li>" +
		"<input type='checkbox' name='irregular' id='irregular" + my.id + "'/>" +
		"<label for='irregular" + my.id + "'>Create Irregular Feature</label>" +
		"</li>" +
		"</ul>";
		return html;
	};
	
	my.initUI = function(){
		$("#sides" + my.id).change(function(){my.control_update(document.getElementById($( this ).attr('id')));});
		$("#irregular" + my.id).click(function(){my.control_update(document.getElementById($( this ).attr('id')));});
	};
	
	/**
	 * オプションツール設定変更時の反映
	 */
	my.control_update = function(){
		var sides = parseInt(document.getElementById("sides" + my.id).value);
        sides = Math.max(3, isNaN(sides) ? 0 : sides);
        my.olControl.handler.sides = sides;
        var irregular =  document.getElementById("irregular" + my.id).checked;
        my.olControl.handler.irregular = irregular;
	};
	
	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.init();
		my.dialog.open();
	};
	
	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.dialog.close();
	};
	
	that.CLASS_NAME =  "gis.ui.control.regular";
	return that;
};
/* ======================================================================
    gis/ui/dialog.js
   ====================================================================== */

gis.ui.dialog = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);

	my.divid = spec.divid;

	my.dialogId = spec.divid + '-dialog';

	my.isInit = false;

	/**
	 * Dialogを格納するdivを作成しHTMLをセットする
	 * @param html ダイアログのHTML
	 * @param option jquery-ui-dialogのオプション
	 */
	that.create = function(html,option,callback){
		if (my.isInit === true){
			return;
		}

		$(document.body).append("<div id='" + my.dialogId + "'></div>");
		$("#" + my.dialogId).html(html);

		if (!option){
			option = {};
		}
		if (!option.autoOpen){
			option.autoOpen = false;
		}
		if (!option.modal){
			option.modal = false;
		}
		if (!option.position){
			option.position = [0,0];
		}
		$("#" + my.dialogId).dialog(option);

		if (callback){
			callback();
		}

		my.isInit = true;
	};

	/**
	 * ダイアログを開く
	 */
	that.open = function(){
		$("#" + my.dialogId).dialog('open');
	};

	/**
	 * ダイアログを閉じる
	 */
	that.close = function(){
		$("#" + my.dialogId).dialog('close');
	};

	that.CLASS_NAME =  "gis.ui.dialog";
	return that;
};
/* ======================================================================
    gis/setting.js
   ====================================================================== */

gis.setting = function(spec,my){
	var that= {};

	my = my || {};

	my.values = {};

	my.getFromServer = function(){
		$.ajax({
			url : './rest/Setting',
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		my.values = json.value;
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	}

	my.getValue = function(key){
		if (!my.values[key]){
			return null;
		}else{
			return my.values[key];
		}
	};

	that.init = function(){
		my.getFromServer();
	};

	that.getMapServUrl = function(){
		return my.getValue("MapServerUrl");
	}

	that.getBounds = function(name){
		var values = JSON.parse(my.getValue("bounds"));
		if (!values[name]){
			return null;
		}else{
			return new OpenLayers.Bounds(values[name]);
		}
	}

	that.CLASS_NAME =  "gis.setting";
	return that;
};
/* ======================================================================
    gis/ui/control/import.js
   ====================================================================== */

/**
 * WKTを編集レイヤに表示するコントロール
 */
gis.ui.control.import = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'import';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Import Data';
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Import WKT data',
			modal : true,
			height : 350,
			width : 500,
			position : 'center',
			buttons : {
				'View' : my.btnAddWkt_onClick,
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		});
	};
	
	my.getHtml = function(){
		var html = "<textarea id='txtWkt' style='width:90%;height:90%'></textarea>";
		return html;
	};
	
	/**
	 *WKT表示ボタンイベント
	 */
	my.btnAddWkt_onClick = function(){
		var wkt = $("#txtWkt").val();
		if (wkt === ''){
    		return;
    	}
    	WKTformat = new OpenLayers.Format.WKT(
				{
					'internalProjection': my.map.displayProjection,
					'externalProjection': my.map.projection
				}
			);
    	var geometry = new OpenLayers.Geometry.fromWKT(wkt);
    	geometry.transform(my.map.displayProjection,my.map.projection);
    	var feature = gis.geometryOp.toFeature(geometry);
    	my.editingLayer.addFeatures([feature]);
    	my.map.zoomToExtent(feature.geometry.bounds);
	};
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		if (!my.editingLayer){
			return;
		}
		my.dialog.open();

	};
	
	that.CLASS_NAME =  "gis.ui.control.import";
	return that;
};
/* ======================================================================
    gis/geometryOp/polygonOp.js
   ====================================================================== */

gis.geometryOp.polygonOp = function(spec,my){
	my = my || {};

	var that = gis.geometryOp(spec,my);

	/**
	 * ポリゴンを指定ラインが貫いているかチェックする
	 * @param line OpenLayers.Geometry.LineString
	 * @returns {Boolean}
	 */
	that.overlapbdyDisjoint = function(line){
		//ラインがポリゴンと交差しているか
    	var vertices = line.getVertices();
        var intersects = my.geometry.intersects(line);
        if (intersects === true){
        	//ラインの端点がポリゴンの外にあるか
        	if (my.geometry.intersects(vertices[0]) || my.geometry.intersects(vertices[vertices.length-1])) {
                intersects = false;
            }
        }
        return intersects;
	};
	
	/**
	 * ポリゴンをマルチラインストリングに変換する
	 */
	that.toMultiLineString = function(){
		var lines = [];
		for (var iRing = 0 in my.geometry.components){
			var ring = my.geometry.components[iRing];
			for (var iPoint = 0 ; iPoint < ring.components.length -1;iPoint++){
				var from = ring.components[iPoint];
				var to = ring.components[iPoint + 1];
				
				var line = new OpenLayers.Geometry.LineString([from,to]);
				lines.push(line);
			}
		}
		return new OpenLayers.Geometry.MultiLineString(lines);
	};
	
	that.CLASS_NAME =  "gis.geometryOp.polygonOp";
	return that;
};
/* ======================================================================
    gis/ui/control/undo.js
   ====================================================================== */

gis.ui.control.undo = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'undo';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Undo';
	
	my.controller = spec.controller;
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.controller.undo();
	};
	
	that.CLASS_NAME =  "gis.ui.control.undo";
	return that;
};
/* ======================================================================
    gis/ui/control/uploadBillingData.js
   ====================================================================== */

/**
 * The tool for downloading a list of uncaptured meter by GPS
 */
gis.ui.control.uploadBillingData = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'uploadBillingData';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Upload Billing Data';

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Upload Billing Data',
			width : 400,
			modal : true,
			position : 'center',
			buttons : {
				'Upload' : function(){
					my.upload();
				},
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		},function(){
			var now = new Date();
			var nowYear = now.getFullYear();
			var nowMonth = now.getMonth() + 1;
			$("#" + my.id + "-year").val(nowYear);
			$("#" + my.id + "-month").val(nowMonth);
		});
	};

	my.getHtml = function(){
		var now = new Date();
		var nowYear = now.getFullYear();

		var inserthtml = "<select id='" + my.id + "-month' style='width:40%'>";
		for (var i = 1; i <= 12; i++){
			inserthtml += "<option value='" + i + "'>" + i + "</option>";
		}
		inserthtml += "</select>";

		inserthtml += "<select id='" + my.id + "-year' style='width:60%'>";
		for (var i = nowYear; i > nowYear - 5; i--){
			inserthtml += "<option value='" + i + "'>" + i + "</option>";
		}
		inserthtml += "</select>";

		var html = "<table class='dialogstyle' style='width:100%'>" +
		"<tr><td>Month/Year</td><td>" + inserthtml + "</td></tr>" +
		"<tr><td colspan='2'><input type='file' id='" + my.id + "-file' style='width:100%'></td></tr>";

		return html;
	};

	my.upload = function(){
		var year = $("#" + my.id + "-year").val();
		var month = $("#" + my.id + "-month").val();
		var file = $("#" + my.id + "-file").val();

		if (file === ""){
			alert("Choose a csv file from Billing System which you want to upload.");
			return;
		}
		var fileobj = $("#" + my.id + "-file").prop('files')[0];
		var filename = fileobj.name;

		if (!confirm("Would you like to upload " + filename + " of " + month + " / " + year + " ?")){
			return;
		}

		var form = new FormData();
		form.append("file",fileobj);
		form.append("yearmonth",year + ("0" + month).slice(-2));

		$.ajax({
			url : './rest/BillingSync',
			data : form,
			type : 'POST',
			dataType : 'json',
			contentType : false,
			processData : false,
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}

    		alert("It succeeded to insert " + json.value + " records.");

    		my.dialog.close();
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		gistools.objLogin.login(function(isSuccess){
			if (isSuccess === true){
				my.dialog.open();
			}
		});
	};

	that.CLASS_NAME =  "gis.ui.control.uploadBillingData";
	return that;
};
/* ======================================================================
    gis/ui/control/splitLine.js
   ====================================================================== */

gis.ui.control.splitLine = function(spec, my) {
	my = my || {};

	var that = gis.ui.control(spec, my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'splitLine';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'splitLine';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Split Line';

	my.getSplitControl = function() {
		var split = new OpenLayers.Control.Split({
			layer : my.editingLayer,
			// tolerance: 0.0001,
			// deferDelete: true,
			eventListeners : {
				aftersplit : function(event) {
					my.flashFeatures(event.features);
				}
			}
		});
		return split;
	};

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = my.getSplitControl();
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;

	my.snappingControl = new OpenLayers.Control.Snapping({layer: my.editingLayer});
	
	/**
	 * OpenLayers.Mapオブジェクトにコントロールを追加する前の処理
	 */
	my.beforeAddControlInMap = function(map){
		map.addControl(my.snappingControl);
	};
	
	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.snappingControl.activate();
	};
	
	that.CLASS_NAME = "gis.ui.control.splitLine";
	return that;
};
/* ======================================================================
    gis/ui/control/mreadingSheet.js
   ====================================================================== */

/**
 * The tool for downloading a list of Meter Reading Sheets
 */
gis.ui.control.mreadingSheet = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'mreadingSheet';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Meter Reading Sheets';

	my.villages = {};

	my.areas = {};
	my.checkboxIdAndAreaMap = {};

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		my.getVillages();
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Meter Reading Sheets',
			modal : true,
			height : 500,
			width : 500,
			position : 'center',
			buttons : {
				'Download' : function(){
					my.download();
				},
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		});
		my.setEventForCheckbox();
	};

	my.getHtml = function(){
		var html = "";
		my.areas = {};
		for (var i = 0 in my.villages){
			var v = my.villages[i];
			if (!my.areas[v.area]){
				my.areas[v.area] = [];
			}
			my.areas[v.area].push(v);
		}

		html = "<ul>";
		for (var area in my.areas){
			html += "<li><label><input type='checkbox' id='checkAll" + area + "'>" + area + "</label></li>";
			html += "<ul id='checkboxArea" + area + "'>";
			for (var i = 0 in my.areas[area]){
				var v = my.areas[area][i];
				html += "<li><label><input type='checkbox' name='villages' value='" + v.villageid + "' checked>" + v.villageid + ":" + v.name + "</label></li>";
			}
			html += "</ul>";
		}
		html += "</ul>";

		return html;

	};

	my.setEventForCheckbox = function(){
		for (var area in my.areas){
			my.checkboxIdAndAreaMap["checkboxArea" + area] = area
			$("#checkboxArea" + area).click(function () {
				var _id = $(this).attr("id");
				var _area = my.checkboxIdAndAreaMap[_id];
				var checkboxCount = $("#" + _id + " input[type=checkbox]").length;
		        var selectedCount = $("#" + _id + " input[type=checkbox]:checked").length;
		        if (checkboxCount === selectedCount) {
		            $("#checkAll" + _area).prop("indeterminate", false).prop("checked", true );
		        } else if (0 === selectedCount) {
		            $("#checkAll" + _area).prop("indeterminate", false).prop("checked", false);
		        } else {
		            $("#checkAll" + _area).prop("indeterminate", true ).prop("checked", false);
		        }
			}).click();
			my.checkboxIdAndAreaMap["checkAll" + area] = area
			$("#checkAll" + area).click(function () {
				var _id = $(this).attr("id");
				var _area = my.checkboxIdAndAreaMap[_id];
				var checked = $("#" + _id).prop("checked");
				$("#checkboxArea" + _area + "  input[type=checkbox]").each(function(){
					$(this).prop("checked", checked);
				});
			});
		}
	};

	my.getVillages = function(){
		$.ajax({
			url : './rest/Villages/',
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		var villages = json.value
    		my.villages = {};
    		for (var i = 0 in villages){
    			var v = villages[i];
    			my.villages[v.villageid] = v;
    		}
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	}

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		gistools.objLogin.login(function(isSuccess){
			if (isSuccess === true){
				my.dialog.open();
			}
		});
	};

	my.download = function(){
		var villages = [];
		$('[name="villages"]:checked').each(function(){
			villages.push($(this).val());
		});
		if (villages.length === 0){
			alert("Check a village at least.");
			return;
		}
		$.ajax({
			url : './rest/Meters/MReading?villageid=' + JSON.stringify(villages),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}

    		window.open(json.value);
    		my.dialog.close();
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});
	};

	that.CLASS_NAME =  "gis.ui.control.mreadingSheet";
	return that;
};
/* ======================================================================
    gis/ui/control/login.js
   ====================================================================== */

/**
 * WKTを編集レイヤに表示するコントロール
 */
gis.ui.control.login = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'login';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Login';

	my.dialog = gis.ui.dialog({ divid : my.id });

	my.isSuccess = false;

	my.isInit = false;

	my.successCallback = null;

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		if (my.isInit === true){
			return;
		}

		var html = my.getDialogHtml();
		my.dialog.create(html,{
			title : 'Login',
			modal : true,
			position : 'center',
			buttons : {
				'Login' : my.btnLogin_onClick,
				'Cancel' : function(){
					my.dialog.close();
					my.successCallback(my.isSuccess);
				}
			}
		});
		$("#form" + my.id).validationEngine('attach',{
			promptPosition:"inline"
		});
		my.isInit = true;
	};

	my.getDialogHtml = function(){
		var fields = [
		              {id : "password", label : "Password", type : "password", "class" : "validate[required]"}
		              ];

		var html = "<form id='form" + my.id + "' method='post'><table class='dialogstyle'>";
		for (var i = 0 in fields){
			var f = fields[i];
			html += "<tr><th style='width:40%'>" + f.label + "</th>";
			var option = "";
			if (f["class"]){
				option = "class='" + f["class"] + "'";
			}
			var insertHtml = "<input id='" + f.id + "' type='" + f.type + "' style='width:98%' " + option + "/>";
			html += "<td style='width:60%'>" + insertHtml + "</td>";
			html += "</tr>";
		}
		html += "</table></form>"
		return html;
	};

	my.loginToServer = function(){
		$.ajax({
			url : './rest/Login?Password=' + $("#password").val(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		my.isSuccess = json.value;
    		if (my.isSuccess === false){
    			alert("Password is wrong. Please confirm password.");
    			$("#password").val("");
    			return;
    		}
    		my.successCallback(my.isSuccess);
    		my.dialog.close();
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	}

	my.btnLogin_onClick = function(){
		var valid = $("#form" + my.id).validationEngine('validate');
		if (valid !==true){
			return;
		}
		my.loginToServer();
	};

	that.login = function(successCallback){
		if (my.isSuccess === true){
			my.successCallback = successCallback;
			my.successCallback(my.isSuccess);
			return;
		}

		my.init();
		my.dialog.open();
		my.successCallback = successCallback;
	}

	that.CLASS_NAME =  "gis.ui.control.zoomToVillage";
	return that;
};
/* ======================================================================
    gis/ui/control/buffer.js
   ====================================================================== */

/**
 * バッファを作成するコントロール
 */
gis.ui.control.buffer = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'buffer';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'buffer';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Buffer';

	/**
	 * バッファ処理完了後に削除するフィーチャを一時的に格納する
	 */
	my.removeFeatures = [];

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Buffer Option',
			buttons : {
				'OK' : function(){
					my.buffer();
				},
				'Close' : function(){
					my.dialog.close();
				}
			}
		});
	};

	my.getHtml = function(){
		var html = "<label for='distance" + my.id + "'>Distance</label>" +
		"<input id='distance" + my.id + "' type='number' min=0 max=99 name='distance' value='1'/>" +
		"<label for='distance" + my.id + "'>m</label>";
		return html;
	};

	my.buffer = function(){
		if(!window.confirm('Do you want to create buffer of your selected feature?')){
			return;
		}
		var collection = [];
		my.removeFeatures = [];
		for (var i = 0 in my.editingLayer.selectedFeatures){
			var f = my.editingLayer.selectedFeatures[i];
			var p = f.geometry.clone();
			p.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);
			collection.push(p);
			my.removeFeatures.push(f);
		}
		var geomCollection = new OpenLayers.Geometry.Collection(collection);
		var distance = $("#distance" + my.id).val();
		distance = distance / 100000; //メートルに変換
		$.ajax({
			url : './rest/geometries/buffer?geometries=' + geomCollection.toString() + "&distance=" + distance,
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(json){
			if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
			var geometries = json.value;
			if (geometries.length === 0){
				return;
			}
			var addFeatures = [];
			for (var i = 0 in geometries){
				var geometry = geometries[i];
				var olgeom = OpenLayers.Geometry.fromWKT(geometry);
				olgeom.transform(my.editingLayer.map.displayProjection,my.editingLayer.map.projection);
				var feature = gis.geometryOp.toFeature(olgeom);
				addFeatures.push(feature);
			}

			my.editingLayer.removeFeatures(my.removeFeatures);
	    	my.editingLayer.addFeatures(addFeatures,{silent : true});
	    	my.editingLayer.events.triggerEvent("afterbuffer", {
	            add: addFeatures,
	            remove : my.removeFeatures
	        });
	    	my.dialog.close();
		}).fail(function(xhr){
			console.log(xhr);
			alert(xhr.status + ';' + xhr.statusText);
			return;
		});
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		if (my.editingLayer.selectedFeatures.length === 0){
			alert('Please choose feature.');
			return;
		}
		my.init();
		my.dialog.open();
	};


	that.CLASS_NAME =  "gis.ui.control.buffer";
	return that;
};
/* ======================================================================
    gis/geometryOp/pointOp.js
   ====================================================================== */

gis.geometryOp.pointOp = function(spec,my){
	my = my || {};

	var that = gis.geometryOp(spec,my);
	
	/**
	 * 座標精度を指定精度で切り捨てる
	 * @param precision 小数点第何位
	 * @returns {OpenLayers.Geometry.Point}
	 */
	that.floor = function(precision){
		if (!precision){
    		precision = 8;
    	}
    	var __pre = Math.pow(10,precision);
    	var x = my.geometry.x * __pre;
    	var y = my.geometry.y * __pre;
    	
    	my.geometry.x = Math.round(x) / __pre;
    	my.geometry.y = Math.round(y) / __pre;
    	return my.geometry;
	};
	
	that.CLASS_NAME =  "gis.geometryOp.pointOp";
	return that;
};
/* ======================================================================
    gis/ui/control/difference.js
   ====================================================================== */

/**
 * 図形をdifferenceするコントロール
 */
gis.ui.control.difference = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'difference';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'difference';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Difference';

	/**
	 * 処理完了後に削除するフィーチャを一時的に格納する
	 */
	my.removeFeatures = [];

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		if (my.editingLayer.selectedFeatures.length !== 2){
			alert('Please choose 2 features.');
			return;
		}

		var feature1 = my.editingLayer.selectedFeatures[0].clone();
		var feature2 = my.editingLayer.selectedFeatures[1].clone();
		feature1.geometry.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);
		feature2.geometry.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);

		if (!feature1.geometry.intersects(feature2.geometry)){
			alert('These features do not cross each other.');
			return;
		}

		if(!window.confirm('Do you want to create a difference between these 2 features?')){
			return;
		}

		my.removeFeatures = my.editingLayer.selectedFeatures;

		$.ajax({
			url : './rest/geometries/difference?geom1=' + feature1.geometry.toString() + '&geom2=' + feature2.geometry.toString(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(json){
			if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
			var geometries = json.value;
			if (geometries.length === 0){
				return;
			}
			var addFeatures = [];
			for (var i = 0 in geometries){
				var geometry = geometries[i];
				var olgeom = OpenLayers.Geometry.fromWKT(geometry);
				olgeom.transform(my.editingLayer.map.displayProjection,my.editingLayer.map.projection);
				var feature = gis.geometryOp.toFeature(olgeom);
				addFeatures.push(feature);
			}
			my.editingLayer.removeFeatures(my.removeFeatures);
	    	my.editingLayer.addFeatures(addFeatures,{silent : true});
	    	my.editingLayer.events.triggerEvent("afterdifference", {
	            add: addFeatures,
	            remove : my.removeFeatures
	        });
		}).fail(function(xhr){
			console.log(xhr);
			alert(xhr.status + ';' + xhr.statusText);
			return;
		});
	};

	that.CLASS_NAME =  "gis.ui.control.difference";
	return that;
};
/* ======================================================================
    gis/ui/control/differentVillageMeter.js
   ====================================================================== */

/**
 * The tool for downloading a list of uncaptured meter by GPS
 */
gis.ui.control.differentVillageMeter = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'differentVillageMeter';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'List of Meters for Changing Villages';

	my.zones = [{value:"A", display:"A(Narok)"},{value:"B", display:"B(Narok)"},{value:"C", display:"C(Ololulunga)"},{value:"D", display:"D(Kilgoris)"}];

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'List of Meters for Changing Villages',
			modal : true,
			position : 'center',
			buttons : {
				'Download' : function(){
					my.download();
				},
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		});
	};

	my.getHtml = function(){
		var html = "";
		for (var i = i in my.zones){
			var zone = my.zones[i];
			html += "<input type='checkbox' name='zone' value='" + zone.value + "' checked>" + zone.display + "<br>"
		}
		return html;
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		gistools.objLogin.login(function(isSuccess){
			if (isSuccess === true){
				my.dialog.open();
			}
		});
	};

	my.download = function(){
		var zones = [];
		$('[name="zone"]:checked').each(function(){
			zones.push($(this).val());
		});
		if (zones.length === 0){
			alert("Check a zone at least.");
			return;
		}
		$.ajax({
			url : './rest/Meters/VillageChange?zonecd=' + JSON.stringify(zones),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}

    		window.open(json.value);
    		my.dialog.close();
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});
	};

	that.CLASS_NAME =  "gis.ui.control.uncapturedMeter";
	return that;
};
/* ======================================================================
    gis/ui/control/selectWorksheet.js
   ====================================================================== */

/**
 * 図形を選択するコントロール
 */
gis.ui.control.selectWorksheet = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'selectWorksheet';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Select O&M Worksheet';

	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.SelectFeature([my.editingLayer],{
    	clickout: true, toggle: true,
        multiple: false, hover: false
    		});

	/**
	 * ポップアップマネージャ
	 */
	my.popupManager = {};

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		//
	};

	my.getHtml = function(attr){
		var materialhtml = my.getMeterialHtml(attr["UsedMaterials"]);

		var fields = [
		              {id : "workno", label : "Work No"}
		              ,{id : "worktypename", label : "Type of O&M Work"}
		              ,{id : "name", label : "Name of Officer"}
		              ,{id : "designation", label : "Disignation"}
		              ,{id : "inputdate", label : "Date"}
		              ,{id : "roadname", label : "Name of Road"}
		              ,{id : "worklocation", label : "Location"}
		              ,{id : "lekagescale", label : "Scale of Lekage"}
		              ,{id : "dateofwork", label : "Date of Work"}
		              ,{id : "workersno", label : "No. of Workers"}
		              ,{id : "timetaken", label : "Time Taken for Work(minutes)"}
		              ,{id : -1, html : materialhtml}
		              ,{id : "pipe_material", label : "Pipe Material"}
		              ,{id : "pipe_diameter", label : "Pipe Diameter(mm)"}
		              ,{id : "pipe_depth", label : "Pipe Depth(mm)"}
		              ,{id : "land_class", label : "Landownership Classification"}
		              ,{id : "pipe_class", label : "Pipe Classification"}
		              ,{id : "surface", label : "Surface"}
		              ,{id : "work_point", label : "The Point of Works"}
		              ,{id : "comments", label : "Comment"}
		              ];

		var html = "<table class='dialogstyle'>";
		for (var i = 0 in fields){
			var f = fields[i];
			if (f.id === -1){
				html += f.html;
			}else{
				html += "<tr>" +
						"<th style='width:40%'>" + f.label + "</th>" +
						"<td style='width:60%'>" + attr[f.id] + "</td>" +
						"</tr>"
			}
		}

		return html;
	};

	my.getMeterialHtml = function(materials){
		var html = "<table class='dialogstyle' style='width:100%'>" +
				"<tr><th>No.</th>" +
				"<th>Item Description</th>" +
				"<th>Unit</th>" +
				"<th>Quantity</th>" +
				"<th>Remarks</th></tr>";
		for (var i in materials){
			var m = materials[i];
			html += "<tr><td>" + m["seqno"] + "</td>"
				+"<td>" + m["description"] + "</td>"
				+"<td>" + m["unit"] + "</td>"
				+"<td>" + m["quantity"] + "</td>"
				+"<td>" + m["remarks"] + "</td></tr>";
		}
		html += "</table>";
		html = "<tr><th colspan='2'>Material(s) Userd for Work</td></tr>"
						+ "<tr><td colspan='2'>" + html + "</td></tr>";
		return html;
	};

	/**
	 * フィーチャ選択時のイベント定義
	 */
	my.callbacks = {
            "featureselected": function(e) {
            	var f = e.feature;
            	if (my.popupManager[f.id]){
            		my.popupManager[f.id].show();
            		return;
            	}

            	$.ajax({
    				url : './rest/Worksheets/?workno=' + f.attributes.workno,
    				type : 'GET',
    				dataType : 'json',
    				cache : false,
    				async : true
    	    	}).done(function(json){
    	    		if (json.code !== 0){
    	    			alert(json.message);
    	    			return;
    	    		}
    	    		var html = my.getHtml(json.value);
    	    		var map = my.editingLayer.map;
    	    		var popup = new OpenLayers.Popup.FramedCloud(
    	    				f.id,
    	    				f.geometry.getBounds().getCenterLonLat(),
    	        			new OpenLayers.Size(170, 300),
    	        			html,
    	        			null,
    	        			true);

    	    		map.addPopup(popup);
                	my.popupManager[f.id] = popup;
    	    	}).fail(function(xhr){
    				console.log(xhr.status + ';' + xhr.statusText);
    				return false;
    	    	});
            },
            "featureunselected": function(e) {
            	if (my.popupManager[e.feature.id]){
            		my.popupManager[e.feature.id].hide();
            	}
            }
	};

	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.init();
		my.editingLayer.setVisibility(true);
		my.editingLayer.events.on(my.callbacks);
		my.olControl.activate();
	};

	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.editingLayer.events.un(my.callbacks);
		my.olControl.deactivate();
	};

	that.CLASS_NAME =  "gis.ui.control.selectWorksheet";
	return that;
};
/* ======================================================================
    gis/ui/statusbar.js
   ====================================================================== */


gis.ui.statusbar = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);
	
	/**
	 * メニューのID
	 */
	my.menuid = 'controlToggle';
	
	/**
	 * OpenLayers.Mapオブジェクト
	 */
	my.map = spec.map;

	my.olcontrols = [],
    
    /**
     * メニュー初期化
     */
	that.init = function(){
		var controls = [
						gis.ui.control.mousePosition({map : my.map}),
						gis.ui.control.scaleView({map : my.map})
		                ];
		
        var contentid = "statuscontents";
        var html = "<table><tr id='" + contentid + "'></tr></table>";
        $("#" + my.divid).append(html);
        
        for (var i = 0 in controls){
        	var ctrl = controls[i];
        	ctrl.initforStatus(contentid);
        }
	};
	
	
	
	that.CLASS_NAME =  "gis.ui.statusbar";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomToVillage.js
   ====================================================================== */

/**
 * WKTを編集レイヤに表示するコントロール
 */
gis.ui.control.zoomToVillage = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoomToVillage';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom To Village';

	my.dialog = gis.ui.dialog({ divid : my.id });

	my.villages = null;

	my.isInit = false;

	my.comboboxId = 'cmbvillage_' + my.id;

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		if (my.isInit === true){
			return;
		}

		my.getVillages();
		var html = my.getDialogHtml();
		my.dialog.create(html,{
			title : 'Zoom To Village',
			modal : true,
			position : 'center',
			buttons : {
				'View' : my.btnZoomToVillage_onClick,
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		});

		my.isInit = true;
	};

	my.getDialogHtml = function(){
		var html = "<select id='" + my.comboboxId + "' style='width:100%'>";
		for (var i = 0 in my.villages){
			var v = my.villages[i];
			html += "<option value='" + v.villageid + "'>" + v.villageid + ":" + v.name + "</option>";
		}
		html += "</select>";
		return html;
	};

	my.getVillages = function(){
		$.ajax({
			url : './rest/Villages/',
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		var villages = json.value
    		my.villages = {};
    		for (var i = 0 in villages){
    			var v = villages[i];
    			if (v.wkt === null){
    				continue;
    			}
    			v.geom = OpenLayers.Geometry.fromWKT(v.wkt);
    			my.villages[v.villageid] = v;
    		}
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	}

	my.btnZoomToVillage_onClick = function(){
		var id = $("#" + my.comboboxId).val();
		var village = my.villages[id];
		my.map.zoomToExtent(village.geom.getBounds().transform(my.map.displayProjection,my.map.projection));
		my.map.zoomIn();
		my.dialog.close();
	};
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		my.dialog.open()
	}

	that.CLASS_NAME =  "gis.ui.control.zoomToVillage";
	return that;
};
/* ======================================================================
    gis/ui/control/reportLeakage.js
   ====================================================================== */

gis.ui.control.reportLeakage = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'reportLeakage';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'O&M Worksheet';

	/**
	 * OpenLayers.Mapオブジェクト
	 */
	my.map = spec.map;

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		var e = my.map.getExtent().toBBOX();
		$.ajax({
			url : './rest/MapPdf/OM?bbox=' + e,
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}

    		window.open(json.value);
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});
	};

	that.CLASS_NAME =  "gis.ui.control.reportLeakage";
	return that;
};
/* ======================================================================
    gis/ui/control/clearAll.js
   ====================================================================== */

/**
 * 編集レイヤ上のフィーチャを全削除するコントロール
 */
gis.ui.control.clearAll = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'clearAll';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'clearAll';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Clear Features';
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.editingLayer.removeAllFeatures();
	};
	
	that.CLASS_NAME =  "gis.ui.control.clearAll";
	return that;
};
/* ======================================================================
    gis/ui/control/uncapturedMeter.js
   ====================================================================== */

/**
 * The tool for downloading a list of uncaptured meter by GPS
 */
gis.ui.control.uncapturedMeter = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'uncapturedMeter';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'List of Uncaptured Meters';

	my.zones = [{value:"A", display:"A(Narok)"},{value:"B", display:"B(Narok)"},{value:"C", display:"C(Ololulunga)"},{value:"D", display:"D(Kilgoris)"}];

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'List of Uncaptured Meters',
			modal : true,
			position : 'center',
			buttons : {
				'Download' : function(){
					my.download();
				},
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		});
	};

	my.getHtml = function(){
		var html = "";
		for (var i = i in my.zones){
			var zone = my.zones[i];
			html += "<input type='checkbox' name='zone' value='" + zone.value + "' checked>" + zone.display + "<br>"
		}
		return html;
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		gistools.objLogin.login(function(isSuccess){
			if (isSuccess === true){
				my.dialog.open();
			}
		});
	};

	my.download = function(){
		var zones = [];
		$('[name="zone"]:checked').each(function(){
			zones.push($(this).val());
		});
		if (zones.length === 0){
			alert("Check a zone at least.");
			return;
		}
		$.ajax({
			url : './rest/Meters/Uncaptured?zonecd=' + JSON.stringify(zones),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}

    		window.open(json.value);
    		my.dialog.close();
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});
	};

	that.CLASS_NAME =  "gis.ui.control.uncapturedMeter";
	return that;
};
/* ======================================================================
    gis/ui/control/drawPoint.js
   ====================================================================== */

/**
 * ポイントを作成するコントロール
 */
gis.ui.control.drawPoint = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'drawPoint';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'drawPoint';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Draw Point';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawFeature(my.editingLayer,OpenLayers.Handler.Point);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.drawPoint";
	return that;
};
/* ======================================================================
    gis/ui/control/intersection.js
   ====================================================================== */

/**
 * 図形をintersectionするコントロール
 */
gis.ui.control.intersection = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'intersection';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'intersection';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'intersection';

	/**
	 * 処理完了後に削除するフィーチャを一時的に格納する
	 */
	my.removeFeatures = [];

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		if (my.editingLayer.selectedFeatures.length !== 2){
			alert('Please choose 2 features.');
			return;
		}

		var feature1 = my.editingLayer.selectedFeatures[0].clone();
		var feature2 = my.editingLayer.selectedFeatures[1].clone();
		feature1.geometry.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);
		feature2.geometry.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);

		if (!feature1.geometry.intersects(feature2.geometry)){
			alert('These features do not cross each other.');
			return;
		}

		if(!window.confirm('Do you want to create a intersection of your selected features?')){
			return;
		}

		my.removeFeatures = my.editingLayer.selectedFeatures;

		$.ajax({
			url : './rest/geometries/intersection?geom1=' + feature1.geometry.toString() + '&geom2=' + feature2.geometry.toString(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(json){
			if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
			var geometries = json.value;
			if (geometries.length === 0){
				return;
			}
			var addFeatures = [];
			for (var i = 0 in geometries){
				var geometry = geometries[i];
				var olgeom = OpenLayers.Geometry.fromWKT(geometry);
				olgeom.transform(my.editingLayer.map.displayProjection,my.editingLayer.map.projection);
				var feature = gis.geometryOp.toFeature(olgeom);
				addFeatures.push(feature);
			}
			my.editingLayer.removeFeatures(my.removeFeatures);
	    	my.editingLayer.addFeatures(addFeatures,{silent : true});
	    	my.editingLayer.events.triggerEvent("afterintersection", {
	            add: addFeatures,
	            remove : my.removeFeatures
	        });
		}).fail(function(xhr){
			console.log(xhr);
			alert(xhr.status + ';' + xhr.statusText);
			return;
		});
	};

	that.CLASS_NAME =  "gis.ui.control.intersection";
	return that;
};
/* ======================================================================
    gis/ui/control/splitPolygon.js
   ====================================================================== */

/**
 * ポリゴンを分割するコントロール
 */
gis.ui.control.splitPolygon = function(spec, my) {
	my = my || {};

	var that = gis.ui.control(spec, my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'splitPolygon';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'splitPolygon';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Split Polygon';

	my.getSplitPolygonControl = function() {
		var split = new OpenLayers.Control.SplitPolygon(my.editingLayer);
		my.editingLayer.events.register('aftersplit', my.editingLayer,
				function(e) {
					my.flashFeatures(e.add);
				});
		return split;
	};

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = my.getSplitPolygonControl();
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;

	that.CLASS_NAME = "gis.ui.control.splitPolygon";
	return that;
};
/* ======================================================================
    gis/ui/control/export.js
   ====================================================================== */

/**
 * 編集レイヤ上のフィーチャを全削除するコントロール
 */
gis.ui.control.export = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'export';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Export';
	
	my.fomats = ['GML','KML','GeoJSON','GeoRSS','WKT'];
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Export Data',
			modal : true,
			height : 350,
			width : 500,
			position : 'center',
			buttons : {
				'Refresh Map' : function(){
					my.getData();
				},
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		},my.initUI);
	};
	
	my.getHtml = function(){
		var html = "<select id='savecombobox' class='gis-ui-control-save-combobox'></select>";
		html += "<br>";
		html += "<textarea id='txtFormatedData' style='width:90%;height:75%'></textarea>";
		return html;
	};
	
	my.initUI = function(){
		var items = "";
		for (var i = 0 in my.fomats){
			var format = my.fomats[i];
			items += "<option value='" + format + "'>" + format + "</option>";
		}
		$("#savecombobox").append(items);
		
		$("#savecombobox").change(function(){
			my.getData();
		});
	};
	
	/**
	 * ベクタレイヤのフィーチャを指定フォーマットで取得してコンテンツ表示
	 */
	my.getData = function(){
		var content = "";
		if (my.editingLayer.features.length !== 0){
			var selectedFormat = $("#savecombobox").val();
			var objformat = new OpenLayers.Format[selectedFormat]({
				'internalProjection': my.editingLayer.map.projection,
				'externalProjection': my.editingLayer.map.displayProjection
			});
			content = objformat.write(my.editingLayer.features);
		}
		$("#txtFormatedData").text(content);
	};
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		if (!my.editingLayer){
			return;
		}
		my.getData();
		my.dialog.open();

	};
	
	that.CLASS_NAME =  "gis.ui.control.export";
	return that;
};
/* ======================================================================
    gis/ui/controlloader.js
   ====================================================================== */

gis.ui.controlloader = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);

	my.divid = spec.divid;

	my.parent = spec.parent;

	my.controlList = {
			"none" : {"class" : gis.ui.control.none},
			"zoomBox" : {"class" : gis.ui.control.zoomBox},
			"selectFeature" : {"class" : gis.ui.control.selectFeature, editingLayer : my.parent.editingLayer},
			"reportLeakage" : {"class" : gis.ui.control.reportLeakage, isMap : true},
			"selectWorksheet" : {"class" : gis.ui.control.selectWorksheet, editingLayer : my.parent.worksheetLayer},
			"inputWorksheet" : {"class" : gis.ui.control.inputWorksheet, editingLayer : my.parent.editingLayer, worksheetLayer : my.parent.worksheetLayer},
			"drawPoint" : {"class" : gis.ui.control.drawPoint, editingLayer : my.parent.editingLayer},
			"drawLine" : {"class" : gis.ui.control.drawLine, editingLayer : my.parent.editingLayer},
			"drawPolygon" : {"class" : gis.ui.control.drawPolygon, editingLayer : my.parent.editingLayer},
			"regular.exterior" : {"class" : gis.ui.control.regular.exterior, editingLayer : my.parent.editingLayer},
			"drawHole" : {"class" : gis.ui.control.drawHole, editingLayer : my.parent.editingLayer},
			"regular.interior" : {"class" : gis.ui.control.regular.interior, editingLayer : my.parent.editingLayer},
			"splitLine" : {"class" : gis.ui.control.splitLine, editingLayer : my.parent.editingLayer},
			"splitPolygon" : {"class" : gis.ui.control.splitPolygon, editingLayer : my.parent.editingLayer},
			"modifyFeature" : {"class" : gis.ui.control.modifyFeature, editingLayer : my.parent.editingLayer},
			"deleteFeature" : {"class" : gis.ui.control.deleteFeature, editingLayer : my.parent.editingLayer},
			"topology" : {"class" : gis.ui.control.topology, editingLayer : my.parent.editingLayer, isMap : true},
			"snapping" : {"class" : gis.ui.control.snapping, editingLayer : my.parent.editingLayer, isMap : true},
			"clearAll" : {"class" : gis.ui.control.clearAll, editingLayer : my.parent.editingLayer},
			"union" : {"class" : gis.ui.control.union, editingLayer : my.parent.editingLayer},
			"intersection" : {"class" : gis.ui.control.intersection, editingLayer : my.parent.editingLayer},
			"difference" : {"class" : gis.ui.control.difference, editingLayer : my.parent.editingLayer},
			"symdifference" : {"class" : gis.ui.control.symdifference, editingLayer : my.parent.editingLayer},
			"buffer" : {"class" : gis.ui.control.buffer, editingLayer : my.parent.editingLayer},
			"undo" : {"class" : gis.ui.control.undo,controller : my.parent.undoredoController},
			"redo" : {"class" : gis.ui.control.redo,controller : my.parent.undoredoController},
			"graticule" : {"class" : gis.ui.control.graticule ,isMap : true},
			"export" : {"class" : gis.ui.control['export'], editingLayer : my.parent.editingLayer},
			"import" : {"class" : gis.ui.control.import, editingLayer : my.parent.editingLayer, isMap : true},
			"measure.calcDistance" : {"class" : gis.ui.control.measure.calcDistance},
			"measure.calcArea" : {"class" : gis.ui.control.measure.calcArea},
			"uploadBillingData" : {"class" : gis.ui.control.uploadBillingData},
			"uncapturedMeter" : {"class" : gis.ui.control.uncapturedMeter},
			"differentVillageMeter" : {"class" : gis.ui.control.differentVillageMeter},
			"mreadingSheet" : {"class" : gis.ui.control.mreadingSheet},
			"search.customerView" : {"class" : gis.ui.control.search.customerView, isMap : true},
			"search.placeView" : {"class" : gis.ui.control.search.placeView, isMap : true},
			"zoomToExtent.naroktown" : {"class" : gis.ui.control.zoomToExtent.naroktown, isMap : true},
			"zoomToExtent.ololulunga" : {"class" : gis.ui.control.zoomToExtent.ololulunga, isMap : true},
			"zoomToExtent.kilgoris" : {"class" : gis.ui.control.zoomToExtent.kilgoris, isMap : true},
			"zoomToExtent.lolgorien" : {"class" : gis.ui.control.zoomToExtent.lolgorien, isMap : true},
			"menuZoomToVillage" : {"class" : gis.ui.control.zoomToVillage, isMap : true, id : "menuZoomToVillage"},
			"btnZoomToVillage" : {"class" : gis.ui.control.zoomToVillage, isMap : true, id : "btnZoomToVillage"},
			"printMap" : {"class" : gis.ui.control.printMap, isMap : true},
			};

	/**
	 * ダイアログを開く
	 */
	that.getControl = function(name){
		if (!my.controlList[name]){
			alert("Class Name=" + name + " is not registered system.");
			return null;
		}
		var control = my.controlList[name];
		var options = {};
		if (control["isMap"] === true){
			options["map"] = my.parent.map;
		}
		if (control["editingLayer"]){
			options["editingLayer"] = control.editingLayer;
		}
		if (control["worksheetLayer"]){
			options["worksheetLayer"] = control.worksheetLayer;
		}
		if (control["controller"]){
			options["controller"] = control.controller;
		}
		if (control["id"]){
			options["id"] = control.id;
		}
		return control["class"](options);
	};

	that.CLASS_NAME =  "gis.ui.controlloader";
	return that;
};
/* ======================================================================
    gis/ui/control/symdifference.js
   ====================================================================== */

/**
 * 図形をsymdifferenceするコントロール
 */
gis.ui.control.symdifference = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'symdifference';

	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'symdifference';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'symdifference';

	/**
	 * 処理完了後に削除するフィーチャを一時的に格納する
	 */
	my.removeFeatures = [];

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		if (my.editingLayer.selectedFeatures.length !== 2){
			alert('Please choose 2 features.');
			return;
		}

		var feature1 = my.editingLayer.selectedFeatures[0].clone();
		var feature2 = my.editingLayer.selectedFeatures[1].clone();
		feature1.geometry.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);
		feature2.geometry.transform(my.editingLayer.map.projection,my.editingLayer.map.displayProjection);

		if (!feature1.geometry.intersects(feature2.geometry)){
			alert('Thease features do not cross each other.');
			return;
		}

		if(!window.confirm('Do you want to create a symdifference part of your selected features?')){
			return;
		}

		my.removeFeatures = my.editingLayer.selectedFeatures;

		$.ajax({
			url : './rest/geometries/symdifference?geom1=' + feature1.geometry.toString() + '&geom2=' + feature2.geometry.toString(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(json){
			if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
			var geometries = json.value;
			if (geometries.length === 0){
				return;
			}
			var addFeatures = [];
			for (var i = 0 in geometries){
				var geometry = geometries[i];
				var olgeom = OpenLayers.Geometry.fromWKT(geometry);
				olgeom.transform(my.editingLayer.map.displayProjection,my.editingLayer.map.projection);
				var feature = gis.geometryOp.toFeature(olgeom);
				addFeatures.push(feature);
			}
			my.editingLayer.removeFeatures(my.removeFeatures);
	    	my.editingLayer.addFeatures(addFeatures,{silent : true});
	    	my.editingLayer.events.triggerEvent("aftersymdifference", {
	            add: addFeatures,
	            remove : my.removeFeatures
	        });
		}).fail(function(xhr){
			console.log(xhr);
			alert(xhr.status + ';' + xhr.statusText);
			return;
		});
	};

	that.CLASS_NAME =  "gis.ui.control.symdifference";
	return that;
};
/* ======================================================================
    gis/ui/controller.js
   ====================================================================== */

gis.ui.controller = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);
	
	that.CLASS_NAME =  "gis.ui.controller";
	return that;
};
/* ======================================================================
    gis/ui/control/search.js
   ====================================================================== */

/**
 * WKTを編集レイヤに表示するコントロール
 */
gis.ui.control.search = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'search';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Search Data';

	my.dialog = gis.ui.dialog({ divid : my.id });

	my.tableId = "table-" + my.id;
	my.pagerId = "pager-" + my.id;

	my.selectedRow = null;

	//my.height = 510;
	//my.width = 940;
	//my.url = '';
	//my.colModelSettings= [];
	//my.colNames = [];

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : my.label,
			modal : true,
			height : my.height,
			width : my.width,
			position : 'center',
			buttons : {
				'View' : my.btnView_onClick,
				'Close' : function(){
					$(this).dialog('close');
				}
			}
		},my.getData);
	};

	my.getData = function(){
		$.ajax({
			url : my.url,
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
    		//テーブルの作成
           $("#" + my.tableId).jqGrid({
	           data:json.value, //表示したいデータ
	           datatype : "local", //データの種別 他にjsonやxmlも選べます。
	           //しかし、私はlocalが推奨です。
	           colNames : my.colNames, //列の表示名
	           colModel : my.colModelSettings, //列ごとの設定
	           rowNum : 10, //一ページに表示する行数
	           height : 270, //高さ
	           width : 910, //幅
	           pager : my.pagerId, //footerのページャー要素のid
	           viewrecords: true //footerの右下に表示する。
	           });
           $("#" + my.tableId).jqGrid('navGrid','#' + my.pagerId,{
        	   add:false, //おまじない
        	   edit:false, //おまじない
        	   del:false, //おまじない
        	   search:{ //検索オプション
        	   odata : ['equal', 'not equal', 'less', 'less or equal',
        	   'greater','greater or equal', 'begins with',
        	   'does not begin with','is in','is not in','ends with',
        	   'does not end with','contains','does not contain']
        	   } //検索の一致条件を入れられる
        	   });
         //filterバー追加
           $("#" + my.tableId).filterToolbar({
           defaultSearch:'cn' //一致条件を入れる。
           //選択肢['eq','ne','lt','le','gt','ge','bw','bn','in','ni','ew','en','cn','nc']
           });
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return false;
    	});
	};

	my.getHtml = function(){
		var html = "<table id='" + my.tableId + "'></table><div id = '" + my.pagerId + "'></div>";
		return html;
	};

	my.btnView_onClick = function(){
		var selrows = $("#" + my.tableId).getGridParam('selrow');
		if (selrows.length === 0 || selrows.length > 1){
			alert("Please select a record.");
			return;
		}
		var row = $("#" + my.tableId).getRowData(selrows[0]);
		if (row.wkt === ''){
			alert("Your selected record is not yet captured by GPS.")
			return;
		}
		var geom = OpenLayers.Geometry.fromWKT(row.wkt);
		my.map.setCenter(new OpenLayers.LonLat(geom.x,geom.y));
		my.map.zoomTo(10);
		my.dialog.close()
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		my.dialog.open();

	};

	that.CLASS_NAME =  "gis.ui.control.search";
	return that;
};
/* ======================================================================
    gis/ui/control/snapping.js
   ====================================================================== */

/**
 * スナッピングツール
 */
gis.ui.control.snapping = function(spec, my) {
	my = my || {};

	var that = gis.ui.control(spec, my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'snapping';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Snapping Setting';

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.Snapping({
		layer: my.editingLayer,
		targets: [my.editingLayer],
        greedy: false
	});
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Snapping Option',
			close : function(){
				my.olControl.deactivate();
			}
		},my.initUI);
	};
	
	my.getHtml = function(){
		var types = ["node", "vertex", "edge"];
		var typenms = ["node","vertex","edge"];
		
		var html = "<table>";
		for (var i = 0 in types){
			var type = types[i];
			var name = typenms[i];
			var id = my.id + "_" + type;
			html += "<tr>" +
			"<td><input type='checkbox' id='" + id + "'/></td>" +
			"<td><label for='" + id + "'>" + name + "</label>" +
			"<td><input type='number' id='" + id + "Tolerance' class='gis-ui-control-snapping-txtnumber'/></td>" +
			"<td><label for='" + id + "'>px</label></td>" +
			"</tr>";
		}
		html += "</table>";
		return html;
	};
	
	/**
	 * UI設定コントロールの初期化
	 */
	my.initUI = function(){
		that.addControlInMap(my.map);
		
		var types = ["node", "vertex", "edge"];
		for (var i = 0 in my.olControl.targets){
			var target = my.olControl.targets[i];
			for (var j = 0 in types){
				var type = types[j];
				var tog = document.getElementById(my.id + "_" + type);
                tog.checked = target[type];
                tog.onclick = (function(tog, type, target) {
                    return function() {target[type] = tog.checked;};
                })(tog, type, target);
                tol = document.getElementById(my.id + "_" + type + "Tolerance");
                tol.value = target[type + "Tolerance"];
                tol.onchange = (function(tol, type, target) {
                    return function() {
                        target[type + "Tolerance"] = Number(tol.value) || 0;
                    };
                })(tol, type, target);
			};
		};
	};
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		if (!my.editingLayer){
			return;
		}
		my.olControl.activate();
		my.dialog.open();

	};
	
	that.CLASS_NAME = "gis.ui.control.snapping";
	return that;
};
/* ======================================================================
    gis/ui/treeview.js
   ====================================================================== */

gis.ui.treeview = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);
	
	my.id = spec.id;
	
	my.optionId = spec.optionId;
	
	my.map = spec.map;
	
	my.width = spec.width;
	
	my.baselayers = [];
	
	my.nonbaselayers = [];
	
	my.createRoot = function(){
		var html = "<ul id='root' class='filetree'>ルート</ul>";
		$("#" + my.id).html(html);
		$("#" + my.id).width(my.width);
		$("#" + my.optionId).width(my.width);
	};
	
	my.complete = function(){
		$("#" + my.id).treeview();
	};
	
	my.createNode = function(id,name){
		var html = "";
		html += "<li><span class='folder'>" + name + "</span>";
		html += "<ul id='" + id + "'>";
		html += "</ul>";
		html += "</li>";
		
		$("#root").append(html);
	};
	
	my.addChildNode = function(parent,layer){
		if (layer.displayInLayerSwitcher === false){
			return;
		}
		
		var html = "<li>";
		if (layer.isBaseLayer){
			html += "<input type='radio' id='ctrl" + layer.div.id + "' name='ctrl" + parent + "' value=" + layer.div.id + ">";
		}else{
			html += "<input type='checkbox' id='ctrl" + layer.div.id + "' value='" + layer.div.id + "'>";
		}
		html += "<label id='lbl" + layer.div.id + "' data-id='" + layer.div.id + "'>" + layer.name + "</label></li>";
		$("#" + parent).append(html);
		
		$("#ctrl" + layer.div.id).attr("checked",layer.getVisibility());
		
		if (layer.isBaseLayer){
			$("input[name=ctrl" + parent + "]:radio").change(function(e){
				var layer = my.map.getLayer(e.target.value);
				my.map.setBaseLayer(layer);
			});
		}else{
			$("#ctrl" + layer.div.id).click(function(e){
				var layer = my.map.getLayer(e.target.value);
				layer.setVisibility(!layer.getVisibility());
			});
		}
		
		$("#lbl" + layer.div.id).click(function(e){
			var layer = my.map.getLayer($("#" + e.target.id).data("id"));
			my.createOptionalBox(layer);
		});
	};
	
	my.createOptionalBox = function(layer){
		var html = "<table class='gis-ui-tableview-option-table'>" +
				"<tr><th>名前</th><td>" + layer.name + "</td></tr>" +
				"<tr><th>EPSG</th><td>" + layer.projection.projCode + "</td></tr>" +
				"<tr><th>ズーム<br>レベル</th><td>" + layer.numZoomLevels + "</td></tr>" +
				"<tr><th>透過率</th><td><div id='" + layer.div.id + "-slider' data-id='" + layer.div.id + "'></td></tr>" +
				"<tr><td colspan='2'><button id='btn" + layer.div.id + "' value='" + layer.div.id +"' style='width:100%'>全体表示</button></td></tr>" +
				"</table>";
		$("#" + my.optionId).html(html);
		
		$("#" + layer.div.id + "-slider").slider({
			value : layer.opacity * 100,
			min : 0,
			max : 100,
			step : 1,
			range : "min"
		});
		$("#" + layer.div.id + "-slider").on("slidechange",function(e,ui){
			var layer = my.map.getLayer($("#" + e.target.id).data("id"));
			layer.setOpacity(ui.value / 100);
		});
		
		$("#btn" + layer.div.id).click(function(e){
			console.log(e.target.value);
			var layer = my.map.getLayer(e.target.value);
			my.map.zoomToExtent(layer.maxExtent);
		});
	};
	
	that.init = function(){
		
		var layers = my.map.layers;
		my.baselayers = [];
		my.nonbaselayers = [];
		for (var i = 0 in layers){
			var layer = my.map.getLayer(layers[i].div.id);
			if (layer.isBaseLayer){
				my.baselayers.push(layer);
			} else{
				my.nonbaselayers.push(layer);
			}	
		}
		
		my.createRoot();
		
		var list = [
		            {array : my.baselayers,id:'BaseLayer',name:'背景'},
		            {array : my.nonbaselayers,id:'NonBaseLayer',name:'オプション'}
		            ];
		
		for (var i = 0 in list){
			var obj = list[i];
			my.createNode(obj.id,obj.name);
			for (var i = 0 in obj.array){
				var layer = obj.array[i];
				my.addChildNode(obj.id,layer);
			}
		}
		my.complete();
		
	};
	
	that.CLASS_NAME =  "gis.ui.treeview";
	return that;
};
/* ======================================================================
    gis/ui/control/printMap.js
   ====================================================================== */

gis.ui.control.printMap = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'printMap';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Print Map';

	/**
	 * OpenLayers.Mapオブジェクト
	 */
	my.map = spec.map;

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		var e = my.map.getExtent().toBBOX();
		$.ajax({
			url : './rest/MapPdf/A4?bbox=' + e,
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}

    		window.open(json.value);
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});
	};

	that.CLASS_NAME =  "gis.ui.control.printMap";
	return that;
};
/* ======================================================================
    gis/ui/control/scaleView.js
   ====================================================================== */

/**
 * 縮尺を取得するコントロール
 */
gis.ui.control.scaleView = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'scaleView';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'View Scale Bar';

	/**
	 * デフォルトのチェック状態
	 */
	my.defaultchecked = false;

	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.ctrlEnabled();
	};

	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.ctrlEnabled();
	};

	/**
	 * マウス位置表示用のフィーチャオブジェクト
	 */
	my.labelfeature = null;

	/**
	 * 縮尺変更時のコールバック関数
	 */
	my.scale_changed = function(e){
		$("#" + my.id + "_scale").val(parseInt(my.map.getScale()));
	};

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : my.label,
			close : function(){
				my.map.events.unregister("zoomend", my.map, my.scale_changed);
			}
		});
	};

	my.getHtml = function(){
		var html = "<table>" +
		"<tr>" +
				"<td><label class='gis-ui-control-viewscale-label'>Scale</label></td>" +
				"<td><input type='text' class='gis-ui-control-viewscale-txt' id='" + my.id + "_scale'/></td>" +
		"</tr>" +
		"</table>";
		return html;
	};

	my.getHtmlforStatus = function(){
		var html = "" +
				"<td><label class='gis-ui-control-viewscale-label'>Scale</label></td>" +
				"<td><input type='text' class='gis-ui-control-viewscale-txt' id='" + my.id + "_scale' readonly/></td>";
		return html;
	};

	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		my.map.events.register("zoomend", my.map, my.scale_changed);
		my.scale_changed();
		my.dialog.open();
	};

	that.initforStatus = function(divid){
		var html = my.getHtmlforStatus();
		$("#" + divid).append(html);
		my.map.events.register("zoomend", my.map, my.scale_changed);
	};

	that.CLASS_NAME =  "gis.ui.control.scaleView";
	return that;
};
/* ======================================================================
    gis/ui/control/drawPolygon.js
   ====================================================================== */

/**
 * ポリゴンを作成するコントロール
 */
gis.ui.control.drawPolygon = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'drawPolygon';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'drawPolygon';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Draw Polygon';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawFeature(my.editingLayer,OpenLayers.Handler.Polygon);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.drawPolygon";
	return that;
};
/* ======================================================================
    gis/ui/control/graticule.js
   ====================================================================== */

/**
 * 経緯度線の表示非表示を切り替えるコントロール
 */
gis.ui.control.graticule = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'graticule';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'graticule';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Graticule Visble/Unvisible';
	
	/**
	 * デフォルトのチェック状態
	 */
	my.defaultchecked = false;
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.Graticule({
			numPoints: 25,
			labelled: true,
			displayInLayerSwitcher:false
		});
	
	my.isInit = false;
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		if (my.isInit === true){
			return;
		}
		that.addControlInMap(my.map);
		my.isInit = true;
		my.toggleCallback();
	};
	
	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.toggleCallback();
	};
	
	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.toggleCallback();
	};
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		if (my.defaultchecked === true){
			my.olControl.activate();
		}else{
			my.olControl.deactivate();
		}
		my.defaultchecked = !my.defaultchecked;
	};
	
	//コンストラクタ実行
	my.init();
	
	that.CLASS_NAME =  "gis.ui.control.graticule";
	return that;
};
/* ======================================================================
    gis/ui/control/deleteFeature.js
   ====================================================================== */

/**
 * 選択されたフィーチャを削除するコントロール
 */
gis.ui.control.deleteFeature = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'deleteFeature';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'deleteFeature';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Delete Feature';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DeleteFeature(my.editingLayer);
	
	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	that.CLASS_NAME =  "gis.ui.control.deleteFeature";
	return that;
};
/* ======================================================================
    gis/ui/control/topology.js
   ====================================================================== */

gis.ui.control.topology = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'topology';


	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'topology';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Topology Edit';

	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;

	/**
	 * トポロジー編集用のレイヤ
	 */
	my.topologyLayer = null;

	/**
	 * 編集レイヤ上の選択コントロール
	 */
	my.selectCtrlInEdit = null;

	/**
	 * トポロジーレイヤ上の編集コントロール
	 */
	my.modifyCtrlInTopology = null;

	/**
	 * トポロジー修正対象の元ポリゴン
	 */
	my.targetPolygon = null;

	/**
	 * トポロジー修正対象の端点ジオメトリ
	 */
	my.targetVertex = null;

	/**
	 * トポロジー修正前のジオメトリ
	 */
	my.beforeFeature = null;

	my.isInit = false;

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		if (my.isInit === true){
			return;
		}
		var style = {};
		for (var key in OpenLayers.Feature.Vector.style){
			var temp = {};
			for (var name in OpenLayers.Feature.Vector.style[key]){
				temp[name] = OpenLayers.Feature.Vector.style[key][name];
			}
			style[key] = temp;
		}
		style['default'].fillOpacity= 0;
		//style['default'].strokeWidth= 5;
		my.topologyLayer = new OpenLayers.Layer.Vector(my.id,{
			styleMap : new OpenLayers.StyleMap(style)
		});
		my.map.addLayer(my.topologyLayer);

		my.selectCtrlInEdit = new OpenLayers.Control.SelectFeature([my.editingLayer],{
			geometryTypes : ['OpenLayers.Geometry.Polygon'],
			clickout: false, toggle: true,multiple: false, hover: false
		});

		my.modifyCtrlInTopology = new OpenLayers.Control.ModifyFeature(my.topologyLayer,{
			geometryTypes : ['OpenLayers.Geometry.Polygon']
		});

		my.map.addControls([my.selectCtrlInEdit,my.modifyCtrlInTopology]);

		my.isInit = true;
	};

	my.polygonToMultiLineArray = function(polygon){
		var polygonOp = gis.geometryOp.polygonOp({geometry : polygon.clone()});
		var multiline = polygonOp.toMultiLineString();
		var features = [];
		for (var i = 0 in multiline.components){
			var line = multiline.components[i];
			var geomOp = gis.geometryOp({geometry : line});
			features.push(geomOp.toFeature());
		}
		return features;
	};

	my.beforefeatureselected = function(e){
		//選択したポリゴンをラインに変換してトポロジーレイヤに追加
		if (my.targetPolygon === null){
			my.targetPolygon = e.feature.geometry.clone();
		}
		var geomOp = gis.geometryOp({geometry : my.targetPolygon.clone()});
		var selectedFeature = geomOp.toFeature();
		my.topologyLayer.removeAllFeatures({silent : true});
		my.topologyLayer.addFeatures([selectedFeature],{silent : true});
		my.editingLayer.events.unregister('beforefeatureselected',my.editingLayer);
		my.selectCtrlInEdit.deactivate();

		my.topologyLayer.events.register('beforefeaturemodified',my.topologyLayer,my.beforefeaturemodified);
		my.topologyLayer.events.register('afterfeaturemodified',my.topologyLayer,my.afterfeaturemodified);
		my.topologyLayer.events.register('vertexmodified',my.topologyLayer,my.vertexmodified);
		my.modifyCtrlInTopology.activate();
		my.modifyCtrlInTopology.selectFeature(selectedFeature);

		return false;
	};

	my.beforefeaturemodified = function(e){
		if (my.targetVertex === null){
			my.beforeFeature = e.feature.clone();
		}
	};

	/**
	 * ラインの端点が修正されたときのイベント
	 */
	my.vertexmodified = function(e){
		//修正中の端点を対比する
		my.targetVertex = e.vertex;
	};

	/**
	 * トポロジー修正をキャンセルする
	 */
	my.cancelModify = function(){
		my.topologyLayer.removeAllFeatures({silent : true});
		if (my.targetPolygon === null){
			return;
		}
		my.afterActivate();
	};

	/**
	 * トポロジー編集対象及び隣接のフィーチャの退避領域
	 */
	my.removeFeatures = [];

	/**
	 * ライン自体の修正が完了した時のイベント
	 */
	my.afterfeaturemodified  = function(e){
		if (my.beforeFeature === null){
			return;
		}

		//隣接ポリゴンを求める
		var polygons = [];
		for (var i = 0 in my.editingLayer.features){
			var feature = my.editingLayer.features[i];
			if (feature.geometry.equals(my.beforeFeature.geometry)){
				my.removeFeatures.push(feature);
				continue;
			}
			if (feature.geometry.intersects(my.beforeFeature.geometry)){
				polygons.push(feature.geometry);
				my.removeFeatures.push(feature);
			}
		}
		if (polygons.length === 0){
			my.cancelModify();
		}
		var touches = new OpenLayers.Geometry.MultiPolygon(polygons);

		$.ajax({
			url : './rest/geometries/topology?before=' + my.beforeFeature.geometry.toString()
				+ '&after=' + e.feature.geometry.toString()
				+ '&touchedPolygon=' + touches.toString(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(obj){
			if (obj.code !== 0){
    			alert(obj.message);
    			return;
    		}
			var obj = obj.value;
			var target = new OpenLayers.Geometry.fromWKT(obj.target);
			var touches = new OpenLayers.Geometry.fromWKT(obj.touches);
			var addFeatures = [];
			addFeatures.push(gis.geometryOp.toFeature(target));
			for (var i = 0 in touches.components){
				var geometry = touches.components[i];
				var feature = gis.geometryOp.toFeature(geometry);
				addFeatures.push(feature);
			}
			my.editingLayer.removeFeatures(my.removeFeatures);
	    	my.editingLayer.addFeatures(addFeatures,{silent : true});
	    	my.afterDeactivate();
		}).fail(function(xhr){
			console.log(xhr);
			my.cancelModify();
			return;
		});

	};


	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.init();
		my.clearCondition();
		my.modifyCtrlInTopology.deactivate();
		my.selectCtrlInEdit.activate();
		my.editingLayer.events.register('beforefeatureselected',my.editingLayer,my.beforefeatureselected);
	};

	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.editingLayer.events.unregister('beforefeatureselected',my.editingLayer);
		if (my.topologyLayer){
			my.topologyLayer.events.unregister('beforefeaturemodified',my.topologyLayer);
			my.topologyLayer.events.unregister('afterfeaturemodified',my.topologyLayer);
			my.topologyLayer.events.unregister('vertexmodified',my.topologyLayer);
			my.topologyLayer.removeAllFeatures({silent:true});
			my.selectCtrlInEdit.deactivate();
			my.modifyCtrlInTopology.deactivate();
		}
		my.clearCondition();
	};

	my.clearCondition = function(){
		my.targetPolygon = null;
		my.targetVertex = null;
		my.beforeFeature = null;
	};

	that.CLASS_NAME =  "gis.ui.control.topology";
	return that;
};
/* ======================================================================
    gis/ui/control/selectFeature.js
   ====================================================================== */

/**
 * 図形を選択するコントロール
 */
gis.ui.control.selectFeature = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'selectFeature';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Select Feature';

	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;

	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.SelectFeature([my.editingLayer],{
    	clickout: false, toggle: true,
        multiple: true, hover: false
    		});

	/**
	 * ポップアップマネージャ
	 */
	my.popupManager = {};

	my.dialog = gis.ui.dialog({ divid : my.id });

	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : 'Select Option',
			close : function(){
				that.deactivate();
			}
		});
	};

	my.getHtml = function(){
		var html = "<ul>" +
			"<li>" +
			"<input type='checkbox' name='chkGetWkt' id='chkGetWkt'/>" +
			"<label for='chkGetWkt'>Show WKT</label>" +
			"</li>" +
		"</ul>";
		return html;
	};

	/**
	 * フィーチャ選択時のイベント定義
	 */
	my.callbacks = {
            "featureselected": function(e) {
            	var isChecked = $("#chkGetWkt").is(':checked');
            	if (isChecked === false){
            		return;
            	}
            	if (my.popupManager[e.feature.id]){
            		my.popupManager[e.feature.id].show();
            		return;
            	}
            	var map = my.editingLayer.map;
            	var geom = e.feature.geometry.clone().transform(map.projection,map.displayProjection);
            	var html = "<table><tr><td class='gis-ui-control-selectfeature-popup'>" + geom.toString() + "</td></tr></table>";
            	var popup = new OpenLayers.Popup.FramedCloud(
            			e.feature.id,
            			e.feature.geometry.getBounds().getCenterLonLat(),
            			new OpenLayers.Size(100,100),
            			html,
            			null,
            			true
            	);
            	map.addPopup(popup);
            	my.popupManager[e.feature.id] = popup;
            },
            "featureunselected": function(e) {
            	if (my.popupManager[e.feature.id]){
            		my.popupManager[e.feature.id].hide();
            	}
            }
	};

	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.init();
		my.editingLayer.events.on(my.callbacks);
		my.dialog.open();
	};

	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.editingLayer.events.un(my.callbacks);
		my.dialog.close();
	};

	that.CLASS_NAME =  "gis.ui.control.selectFeature";
	return that;
};
/* ======================================================================
    gis/ui/control/inputUsedMaterial.js
   ====================================================================== */

gis.ui.control.inputUsedMaterial = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'inputUsedMaterial';

	my.dialog = gis.ui.dialog({ divid : my.id });

	my.unitValues = [{label : 'No.', value:'No.'}];

	my.label = "Material(s) Userd for Work";
	my.header = ["No.","Item Description","Unit","Quantity","Remarks","Edit","Delete"];
	my.columnid = ["seqno","description","unit","quantity","remarks","edit","delete"];
	my.classes = ["","validate[required,max[100]","validate[required]","validate[required,custom[integer]]","validate[max[200]","",""];
	my.width = ['10%','25%','15%','20%','20%',"10%","10%"];
	my.inputtypes = ['text','text','combobox','text','text','button','button'];
	my.comboData = [,,my.unitValues,,,,];
	my.isseq = [true,false,false,false,false];
	my.dialogvisible = [true,true,true,true,true,false,false];

	my.btnAddId = my.id + 'AddRow';

	my.fieldValues = [];

	my.isInit = false;

	my.getDialogHtml = function(){
		var html = "<form id='subform" + my.id + "' method='post'><table class='dialogstyle'>";
		for (var i = 0 in my.header){
			if (my.dialogvisible[i] === false){
				continue;
			}
			html += "<tr><th style='width:40%'>" + my.header[i] + "</th>";
			var option = ""
			if (my.isseq[i] === true){
				option += "readonly";
			}
			var insertHtml = "";
			if (my.inputtypes[i] === 'combobox'){
				insertHtml = "<select id='" + my.columnid[i] + "' style='width:100%' class='" + my.classes[i] + "'>";
				var data = my.comboData[i];
				for (var j = 0 in data){
					if (j == 0){
						insertHtml += "<option value=''>Please choose from select</option>";
					}
					insertHtml += "<option value='" + data[j].value + "'>" + data[j].label + "</option>";
				}
				insertHtml += "</select>";
			}else{
				insertHtml = "<input id='" + my.columnid[i] + "' type='" + my.inputtypes[i] + "' style='width:98%' class='" + my.classes[i] + "' " + option + "/>";
			}
			html += "<td style='width:60%'>" + insertHtml + "</td>";
			html += "</tr>";
		}
		html += "</table></form>";
		return html;
	};

	my.btnAdd_onClick = function(){
		if (my.isInit === false){
			my.dialog.create(my.getDialogHtml(),{
				title : 'Input Used Material',
				modal : true,
				position : 'center',
				width : 400,
				buttons : {
					'Update' : my.btnAddMaterial_onClick,
					'Close' : function(){
						$(this).dialog('close');
					}
				}
			});
			$("#subform" + my.id).validationEngine('attach',{
				promptPosition:"inline"
			});
			my.isInit = true;
		};
		for (var i = 0 in my.columnid){
			$("#" + my.columnid[i]).val("");
		}
		$("#" + my.columnid[0]).val(my.fieldValues.length + 1);

		my.dialog.open();

	};

	my.btnAddMaterial_onClick = function(){
		var valid = $("#subform" + my.id).validationEngine('validate');
		if (valid !==true){
			return;
		}
		var currentRowId = $("#seqno").val()
		if (currentRowId > my.fieldValues.length){
			//add
			var values = [];
			for (var i = 0 in my.columnid){
				var fid = my.columnid[i];
				values.push({id:fid,value:$("#" + fid).val()});
			}
			my.fieldValues.push(values);
		}else{
			//update
			var values = my.fieldValues[currentRowId - 1];
			for (var i = 0 in my.columnid){
				var fid = my.columnid[i];
				values[i].id = fid;
				values[i].value = $("#" + fid).val();
			}
		}

		that.makeMatrix();
		my.dialog.close();
	};

	my.btnEditMaterial_onClick = function(e){
		var rowid = $("#" + e.target.id).val();
		var values = my.fieldValues[rowid];
		for (var i = 0 in values){
			var id = values[i].id;
			var val = values[i].value;
			$("#" + id).val(val)
		}
		my.dialog.open();
	};

	my.btnDeleteMaterial_onClick = function(e){
		var rowid = $("#" + e.target.id).val();
		my.fieldValues.splice(rowid,1);
		for (var i = 0 in my.fieldValues){
			var values = my.fieldValues[i];
			for (var j = 0 in values){
				if (values[j].id === 'seqno'){
					values[j].value = Number(i) + 1;
				}
			}
		}
		that.makeMatrix();
	};

	that.makeMatrix = function(){
		var html = "<table class='dialogstyle' style='width:100%'>";
		html += "<tr><th colspan='" + my.header.length + "'><label>" + my.label + "</label><button id='" + my.btnAddId + "'>Add</button></th></tr>";
		html += "<tr>";
		for (var i = 0 in my.header){
			html += "<th style='width:" + my.width[i] + "'>" + my.header[i] + "</th>";
		}
		html += "</tr>";

		for (var i = 0 in my.fieldValues){
			html += "<tr>";
			var values = my.fieldValues[i];
			for (var j = 0 in values){
				var val = values[j].value;
				if (my.inputtypes[j] === 'button'){
					html += "<td><button id='" + my.columnid[j] + i + "' value='" + i + "'>...</button></td>";
				}else{
					html += "<td>" + val + "</td>";
				}
			}
			html += "</tr>";
		}
		html += "</table>";
		$("#" + my.divid).html(html);
		$("#" + my.btnAddId).click(my.btnAdd_onClick);
		for (var i = 0 in my.fieldValues){
			var values = my.fieldValues[i];
			for (var j = 0 in values){
				var id = my.columnid[j] + i;
				if (my.columnid[j] === 'edit'){
					$("#" + id).click(my.btnEditMaterial_onClick);
				}else if (my.columnid[j] === 'delete'){
					$("#" + id).click(my.btnDeleteMaterial_onClick);
				}
			}
		}
	};

	that.getMatrixValues = function(){
		var resValues = [];
		for (var i = 0 in my.fieldValues){
			var resVal = {};
			var values = my.fieldValues[i];
			for (var j = 0 in values){
				var id = values[j].id;
				if (id === 'edit'){
					continue;
				}else if (id === 'delete'){
					continue;
				}
				resVal[id] = values[j].value;
			}
			resValues.push(resVal);
		}
		return resValues;
	}

	that.clear = function(){
		my.fieldValues = [];
		for (var i = 0 in my.columnid){
			$("#" + my.columnid[i]).val("");
		}
		that.makeMatrix();
	}

	that.CLASS_NAME =  "gis.ui.control.inputUsedMaterial";
	return that;
};
/* ======================================================================
    gis/ui/control/mousePosition.js
   ====================================================================== */

/**
 * マウスの表示位置座標を取得するコントロール
 */
gis.ui.control.mousePosition = function(spec,my){
	my = my || {};

	var that = gis.ui.control(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'mousePosition';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Mouse Position';
	
	/**
	 * デフォルトのチェック状態
	 */
	my.defaultchecked = false;
	
	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.ctrlEnabled();
	};
	
	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		my.ctrlEnabled();
	};
	
	/**
	 * マウス位置表示用のフィーチャオブジェクト
	 */
	my.labelfeature = null;
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		var html = my.getHtml();
		my.dialog.create(html,{
			title : my.label,
			close : function(){
				my.map.events.unregister("mousemove", my.map, my.positionCallback);
			}
		});
	};
	
	my.getHtml = function(){
		var types = {"x" : "X","y" : "Y" , "lon" : "Longitude", "lat" : "Latitude"};
		var html = "<table>";
		for (var id in types){
			var name = types[id];
			html += "<tr><td><label class='gis-ui-control-mouseposition-label'>" + name + "</label></td>" +
			"<td><input type='text' class='gis-ui-control-mouseposition-txt' id='" + my.id + "_" + id + "' readonly/></td></tr>";
		}
		html += "</table>";
		return html;
	};
	
	my.getHtmlforStatus = function(){
		var types = {"x" : "X","y" : "Y" , "lon" : "Longitude", "lat" : "Latitude"};
		var html = "";
		for (var id in types){
			var name = types[id];
			html += "<td><label class='gis-ui-control-mouseposition-label'>" + name + "</label>" +
			"<td><input type='text' class='gis-ui-control-mouseposition-txt' id='" + my.id + "_" + id + "' readonly/></td>";
		}
		return html;
	};
	
	my.positionCallback = function(e){
		var position = this.events.getMousePosition(e);
		var lonlat =  my.map.getLonLatFromViewPortPx(position);
		
		$("#" + my.id + "_x").val(position.x);
		$("#" + my.id + "_y").val(position.y);
		
		var point = new OpenLayers.Geometry.Point(lonlat.lon,lonlat.lat);
		point = point.transform(my.map.projection,my.map.displayProjection);
		var ptop = gis.geometryOp.pointOp({geometry:point});
		var point = ptop.floor();
		
		$("#" + my.id + "_lon").val(point.x);
		$("#" + my.id + "_lat").val(point.y);
	};
	
	/**
	 * コントロールクリック・チェック時のコールバック関数
	 */
	my.toggleCallback = function(element){
		my.init();
		my.map.events.register("mousemove", my.map, my.positionCallback);
		my.dialog.open();
	};
	
	that.initforStatus = function(divid){
		var html = my.getHtmlforStatus();
		$("#" + divid).append(html);
		my.map.events.register("mousemove", my.map, my.positionCallback);
	};	
	
	that.CLASS_NAME =  "gis.ui.control.mousePosition";
	return that;
};
/* ======================================================================
    gis/ui/layer.js
   ====================================================================== */

/**
 * uiコントロールの最上位クラス
 */
gis.ui.layer = function(spec,my){
	var that= {};

	my = my || {};

	my.map = spec.map;
	my.defineurl = spec.defineurl;
	my.mapservurl = spec.mapservurl;

	that.init = function(){
		$.ajax({
			url : my.defineurl,
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(layers) {
			var layerarray = [];
			for (var i = 0 in layers){
				var layer = layers[i];
				var isBaseLayer = layer.isBaseLayer;
				var transparent = false;
				if (layer.isBaseLayer !== true){
					isBaseLayer = false;
					transparent = true;
				}
				var visible = layer.visible;
				if (layer.visible !== false){
					visible = true;
				}
				var obj = null;
				if (layer.type === "WMS"){
					obj = new OpenLayers.Layer.WMS(
							layer.name,
							my.mapservurl + 'map=' + layer.file,
							{
								layers: layer.layers,
								srs:"EPSG:4326",
								format:'image/png',
								transparent : transparent
							},
							{
								isBaseLayer : isBaseLayer,
								singleTile: true
							});
				} else if (layer.type === "WFS"){
					var vector_style_map = new OpenLayers.StyleMap();
					if (layer['rules']){
						var fieldname = layer.rules["fieldname"];
						var stylerules = layer.rules["styles"];
						var rules = [];
						for (var j in stylerules){
							rules.push(new OpenLayers.Rule({
			                    // a rule contains an optional filter
			                    filter: new OpenLayers.Filter.Comparison({
			                        type: OpenLayers.Filter.Comparison.LIKE,
			                        property: fieldname, // the "foo" feature attribute
			                        value: j
			                    }),
			                    // if a feature matches the above filter, use this symbolizer
			                    symbolizer: stylerules[j]
			                }));
						}
						var vector_style = new OpenLayers.Style();
						vector_style.addRules(rules);
		                //Create a style map object
		                vector_style_map = new OpenLayers.StyleMap({
		                    'default' : vector_style
		                });
					}

					obj = new OpenLayers.Layer.Vector(layer.name,{
						styleMap : vector_style_map,
						strategies: [new OpenLayers.Strategy.BBOX()],
						 protocol: new OpenLayers.Protocol.WFS({
		                      "url": my.mapservurl + 'map=' + layer.file,
		                      "featureType": layer.layers
		                  })
					});
				}else{
					continue;
				}
				obj.setVisibility(visible);
				layerarray.push(obj);
			}
			my.map.addLayers(layerarray);
		});
	};

	that.CLASS_NAME =  "gis.ui.layer";
	return that;
};
/* ======================================================================
    gis/ui/controller/undoredo.js
   ====================================================================== */

gis.ui.controller.undoredo = function(spec,my){
	my = my || {};
	var that = gis.ui.controller(spec,my);
	
	/**
	 * undo/redo対象のベクタレイヤオブジェクト
	 */
	my.layer = spec.layer;
	
	/**
	 * undo用のスタック
	 */
	my.undostack = [];
	
	/**
	 * redo用のスタック
	 */
	my.redostack = [];
	
	/**
	 * Menuオブジェクト
	 */
	my.menuObj = null;
	
	/**
	 * レイヤ内のフィーチャを全てクローンする
	 */
	my.getFeatureClone = function(features){
		var temp = [];
		for (var i = 0 in features){
			var feature = features[i];
			temp.push(feature.clone());
		}
		return temp;
	};
	
	/**
	 * undo/redoを行う
	 */
	my.undoRedo = function(pushstack,popstack){
		if (my.menuObj !== null){
			my.menuObj.allDeactivate();
		}
		
		var latest = my.getFeatureClone(my.layer.features);
		var poped = popstack.pop();
		if (latest.length > 0){
			pushstack.push(latest);
		}
		my.layer.removeAllFeatures({silent : true});
		my.layer.addFeatures(poped,{silent : true});
	};
	
	/**
	 * Menuオブジェクトを設定
	 */
	that.setMenuObj = function(obj){
		my.menuObj = obj;
	};
	
	/**
	 * 初期化
	 */
	that.init = function(){
		var types = ['beforefeaturesadded','beforefeaturesremoved','beforefeaturemodified'];
		for (var i = 0 in types){
			var type = types[i];
			my.layer.events.register(type,my.layer,that.doStack);
		}
	};
	
	/**
	 * レイヤのフィーチャ全体をスタックに格納する
	 */
	that.doStack = function(isredoclear){
		var features = my.getFeatureClone(my.layer.features);
		my.undostack.push(features);
		my.redostack = [];
	};
	
	/**
	 * レイヤの状態を一つ前に戻す
	 */
	that.undo = function(){
		my.undoRedo(my.redostack,my.undostack);
	};
	
	/**
	 * レイヤの状態を一つ後に進める
	 */
	that.redo = function(){
		my.undoRedo(my.undostack,my.redostack);
	};
	
	that.init();
	
	that.CLASS_NAME =  "gis.ui.controller.undoredo";
	return that;
};
/* ======================================================================
    gis/ui/menu.js
   ====================================================================== */

gis.ui.menu = function(spec,my){
	my = my || {};

	var that = gis.ui(spec,my);

	/**
	 * メニューのID
	 */
	my.menuid = spec.menuid;

	my.defineurl = spec.defineurl;

	/**
	 * OpenLayers.Mapオブジェクト
	 */
	my.map = spec.map;

	my.controlloader = gis.ui.controlloader({parent : my});

	my.getMenuList = function(){
		var menulist = [];
    	$.ajax({
			url : my.defineurl,
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
		}).done(function(menus) {
			menulist = menus;
		});
    	return menulist;
	};

    /**
     * メニュー初期化
     */
	that.init = function(){
		alert("Please overwrite this method in sub class.")
	};

	that.CLASS_NAME =  "gis.ui.menu";
	return that;
};
/* ======================================================================
    gis/ui/menu/dropdown.js
   ====================================================================== */

/**
 * 編集メニューを管理するクラス
 */
gis.ui.menu.dropdown = function(spec,my){
	my = my || {};

	var that = gis.ui.menu(spec,my);

	/**
	 * メニューのID
	 */
	my.menuid = 'menu.dropdown';

	/**
	 * メニューの幅
	 */
	my.menuwidth = spec.width;

	my.layerMap = spec.layerMap;

	/**
	 * 編集用のOpenLayers.Layer.Vectorオブジェクト
	 */
	my.editingLayer = new OpenLayers.Layer.Vector( "Editable" );

	my.worksheetLayer = my.map.getLayersByName("O&M Worksheets")[0];

	my.controlloader = gis.ui.controlloader({parent : my});

	/**
	 * コントロールチェック時のコールバック関数
	 */
	my.toggleControl = function(element) {
		for (var i = 0 in my.ctrlObjArray){
        	var obj = my.ctrlObjArray[i];
        	obj.changeActivate(element);
        }
    },

    /**
     * undoredo管理用のコントローラ
     */
    my.undoredoController = gis.ui.controller.undoredo({layer : my.editingLayer});

    /**
	 * 地図編集コントロールの配列
	 */
	my.olcontrols = [],

    my.createCallback = function(id){;
		for (var j = 0 in my.olcontrols){
			var temp = my.olcontrols[j];
			if (temp.getId() === id){
				temp.activate();
			}else{
				temp.deactivate();
			}
		}
    };

    /**
     * メニュー初期化
     */
	that.init = function(){
		my.map.addLayer(my.editingLayer);

		var menulist = my.getMenuList();
		var controlObjList = [];
		var menuhtml = "";
		for (var i = 0 in menulist){
			var menu = menulist[i];
			menuhtml += "<li class='dropdown_item'>" ;
			menuhtml += "<a href='#' id='" + menu.id + "'>" + menu.name + "</a>" ;
			if (menu.controls){
				var itemhtml = "";
				for (var j = 0 in menu.controls){
					var item = my.controlloader.getControl(menu.controls[j]);
					itemhtml += "<li>" ;
					itemhtml += item.createHtml() ;
					itemhtml += "</li>";
					controlObjList.push(item);
				}
				menuhtml += "<ul>" + itemhtml + "</ul>";
			}
			menuhtml += "</li>";
		}
		menuhtml = "<ul class='dropdown'>" + menuhtml + "</ul><div style='clear:both;'></div>";
		$("#" + my.divid).html(menuhtml);

		$('ul.dropdown li.dropdown_item').hover(
				function(){
					$(this).find('ul').slideDown(200);
				},
				function(){
					$(this).find('ul').hide();
				}
			);
		$("#" + my.divid).addClass('ui-widget-content ui-corner-all');
		$('li.dropdown_item > ul').addClass('ui-widget-content ui-corner-all');
		$('li.dropdown_item > ul').hide();

		my.olcontrols = [];
		for (var i = 0 in controlObjList){
			var control = controlObjList[i];
			if (!control.isOlControl()){
				continue;
			}
			my.olcontrols.push(control);
		}

		for (var i = 0 in my.olcontrols){
			var ctrl = my.olcontrols[i];
			ctrl.addControlInMap(gistools.map);
			$("#" + ctrl.getId()).click(function(obj){
				my.createCallback(obj.target.id);
			});
		}

		for (var i = 0 in controlObjList){
			var item = controlObjList[i];
			if (!item.isOlControl()){
				$("#" + item.getId()).click(item.execute);
			}
		}

		my.undoredoController.setMenuObj(this);
	};

	/**
	 * 地図編集メニューをすべて非アクティブにする
	 */
	that.allDeactivate = function(){
		for (var i = 0 in my.olcontrols){
			var ctrl = my.olcontrols[i];
			ctrl.deactivate();
		}
	};


	that.CLASS_NAME =  "gis.ui.menu.dropdown";
	return that;
};
/* ======================================================================
    gis/ui/menu/button.js
   ====================================================================== */

gis.ui.menu.button = function(spec,my){
	my = my || {};

	var that = gis.ui.menu(spec,my);

	/**
	 * メニューのID
	 */
	my.menuid = '.menu.button';

	my.controlloader = gis.ui.controlloader({parent : my});

    /**
     * メニュー初期化
     */
	that.init = function(){
		var menulist = my.getMenuList();
		var html = "";
		var ctrlList = [];
		for (var i = 0 in menulist){
			var menu = menulist[i];
			var control = my.controlloader.getControl(menu);
			html += "<td>" + control.createButtonHtml() + "</td>";
			ctrlList.push(control);
		};
		html = "<table><tr>" + html + "</tr></table>";
		$("#" + my.divid).html(html);

		for (var i = 0 in ctrlList){
			var item = ctrlList[i];
			$("#" + item.getId()).click(item.execute)
		};
	};

	that.CLASS_NAME =  "gis.ui.menu.button";
	return that;
};
/* ======================================================================
    gis/ui/control/measure.js
   ====================================================================== */

/**
 * 計測コントロールのスーパークラス
 */
gis.ui.control.measure = function(spec, my) {
	my = my || {};

	var that = gis.ui.control(spec, my);

	my.txtOutputId = "";

	/**
	 * 地図関係の編集コントロールかどうか
	 */
	my.isOlControl = true;
	
	my.sketchSymbolizers = spec.sketchSymbolizers || {
		"Point" : {
			pointRadius : 4,
			graphicName : "square",
			fillColor : "white",
			fillOpacity : 1,
			strokeWidth : 1,
			strokeOpacity : 1,
			strokeColor : "#333333"
		},
		"Line" : {
			strokeWidth : 3,
			strokeOpacity : 1,
			strokeColor : "#666666",
			strokeDashstyle : "dash"
		},
		"Polygon" : {
			strokeWidth : 2,
			strokeOpacity : 1,
			strokeColor : "#666666",
			fillColor : "white",
			fillOpacity : 0.3
		}
	};

	my.getStyleMap = function() {
		var style = new OpenLayers.Style();
		style.addRules([ new OpenLayers.Rule({
			symbolizer : my.sketchSymbolizers
		}) ]);
		var styleMap = new OpenLayers.StyleMap({
			"default" : style
		});
		return styleMap;
	};

	my.getRendrer = function() {
		var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
		renderer = (renderer) ? [ renderer ]
				: OpenLayers.Layer.Vector.prototype.renderers;
		return renderer;
	};

	/**
	 * 計測結果を反映するためのハンドラ
	 */
	my.handleMeasurements = function(event) {
		// var geometry = event.geometry;
		var units = event.units;
		var order = event.order;
		var measure = event.measure;
		var out = "";
		if (order == 1) {
			out += measure.toFixed(3) + " " + units;
		} else {
			out += measure.toFixed(3) + " " + units + "2";
		}
		$("#" + my.txtOutputId).val(out);
	};

	/**
	 * OpenLayers.Mapオブジェクトにコントロールを追加する前の処理
	 */
	my.beforeAddControlInMap = function(map) {
		my.olControl.events.on({
			"measure" : my.handleMeasurements,
			"measurepartial" : my.handleMeasurements
		});
	};

	my.isInit = false;
	
	/**
	 * コンストラクタ
	 */
	my.init = function(){
		if (my.isInit === true){
			return;
		}
		var html = "<div id='" + my.value + "dialog'></div>";
		$("#" + my.id).after(html);
		my.initDialog();
		my.isInit = true;
	};
	
	/**
	 * ダイアログ初期化
	 */
	my.initDialog = function(){
		my.txtOutputId = my.value + "_output";
		var html = "<ul id='" + my.value + "_option'>"
			+ "<li>"
			+ "<input type='checkbox' name='geodesic' id='" + my.value + "_geodesicToggle'/>" 
			+ "<label for='" + my.value + "_geodesicToggle'>Use Geodesic</label>"
			+ "</li>" 
			+ "<li>"
			+ "<input type='checkbox' name='immediate' id='" + my.value + "_immediateToggle'/>" 
			+ "<label for='" + my.value + "_immediateToggle'>Realtime Calculating</label>"
			+ "</li>"
			+ "<li>"
		+ "Value：" + "<br>" 
		+ "<input type='text' id='" + my.txtOutputId + "' style='width:150px'>"
		+ "</li>"
		+ "</ul>";
		$("#" + my.value + "dialog").html(html);
		$("#" + my.value + "_geodesicToggle").click(function() {
			my.control_update(document.getElementById($(this).attr('id')));
		});
		$("#" + my.value + "_immediateToggle").click(function() {
			my.control_update(document.getElementById($(this).attr('id')));
		});
		$("#" + my.value + "dialog").dialog({
			title : 'Measure Option',
			autoOpen : false,
			modal : false,
			position : [0,0],
			close : function(){
				that.deactivate();
			}
		});
	};
	
	/**
	 * オプションツール設定変更時の反映
	 */
	my.control_update = function(){
		var geodesicToggle = document.getElementById(my.value + "_geodesicToggle");
        var immediateToggle = document.getElementById(my.value + "_immediateToggle");
        my.olControl.geodesic = geodesicToggle.checked;
        my.olControl.setImmediate(immediateToggle.checked);
	};
	
	/**
	 * コントロールがアクティブになった後の処理（オプション用）
	 */
	my.afterActivate = function(){
		my.init();
		$("#" + my.value + "dialog").dialog('open');
	};
	
	/**
	 * コントロールが非アクティブになった後の処理
	 */
	my.afterDeactivate = function(){
		$("#" + my.value + "dialog").dialog('close');
	};

	that.CLASS_NAME = "gis.ui.control.measure";
	return that;
};
/* ======================================================================
    gis/ui/control/measure/calcArea.js
   ====================================================================== */

/**
 * 面積計算を行うコントロール
 */
gis.ui.control.measure.calcArea = function(spec,my){
	my = my || {};

	var that = gis.ui.control.measure(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'calcArea';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'calcArea';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Measure Area';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.Measure(
            OpenLayers.Handler.Polygon, {
                persist: true,
                handlerOptions: {
                    layerOptions: {
                        renderers: my.getRendrer(),
                        styleMap: my.getStyleMap()
                    }
                }
            }
        );
	
	that.CLASS_NAME =  "gis.ui.control.measure.calcArea";
	return that;
};
/* ======================================================================
    gis/ui/control/measure/calcDistance.js
   ====================================================================== */

/**
 * 距離計算を行うコントロール
 */
gis.ui.control.measure.calcDistance = function(spec,my){
	my = my || {};

	var that = gis.ui.control.measure(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'calcDistance';
	
	/**
	 * inputタグのvalue属性
	 */
	my.value = spec.value || 'calcDistance';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Measure Distance';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.Measure(
            OpenLayers.Handler.Path, {
                persist: true,
                handlerOptions: {
                    layerOptions: {
                        renderers: my.getRendrer(),
                        styleMap: my.getStyleMap()
                    }
                }
            }
        );
	
	that.CLASS_NAME =  "gis.ui.control.measure.calcDistance";
	return that;
};
/* ======================================================================
    gis/ui/control/regular/exterior.js
   ====================================================================== */

/**
 * 正多角形を追加するコントロール
 */
gis.ui.control.regular.exterior = function(spec,my){
	my = my || {};

	var that = gis.ui.control.regular(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'drawRegularExt';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Draw Regular Feature';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawFeature(my.editingLayer,
    		OpenLayers.Handler.RegularPolygon,
    		{handlerOptions: {sides: 5}});
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	that.CLASS_NAME =  "gis.ui.control.regular.exterior";
	return that;
};
/* ======================================================================
    gis/ui/control/regular/interior.js
   ====================================================================== */

/**
 * 正多角形の穴あきポリゴンを作成するコントロール
 */
gis.ui.control.regular.interior = function(spec,my){
	my = my || {};

	var that = gis.ui.control.regular(spec,my);
	
	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'drawRegularInt';
	
	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Draw Regular feature with hole';
	
	/**
	 * OpenLayersの地図コントロールオブジェクト
	 */
	my.olControl = new OpenLayers.Control.DrawHole(my.editingLayer,
    		OpenLayers.Handler.RegularPolygon,
    		{handlerOptions: {sides: 5}});
	
	my.dialog = gis.ui.dialog({ divid : my.id });
	
	that.CLASS_NAME =  "gis.ui.control.regular.interior";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomToExtent/naroktown.js
   ====================================================================== */

gis.ui.control.zoomToExtent.naroktown = function(spec,my){
	my = my || {};

	var that = gis.ui.control.zoomToExtent(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoomToNaroktown';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom To Narok';

	my.bounds = gistools.settingObj.getBounds("Narok");

	that.CLASS_NAME =  "gis.ui.control.zoomToExtent.naroktown";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomToExtent/ololulunga.js
   ====================================================================== */

gis.ui.control.zoomToExtent.ololulunga = function(spec,my){
	my = my || {};

	var that = gis.ui.control.zoomToExtent(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoomToOlolulunga';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom To Ololulunga';

	my.bounds = gistools.settingObj.getBounds("Ololulunga");

	that.CLASS_NAME =  "gis.ui.control.zoomToExtent.ololulunga";
	return that;
};
/* ======================================================================
    gis/ui/control/zoomToExtent/kilgoris.js
   ====================================================================== */

gis.ui.control.zoomToExtent.kilgoris = function(spec,my){
	my = my || {};

	var that = gis.ui.control.zoomToExtent(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'zoomToKilgoris';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Zoom To Kilgoris';

	my.bounds = gistools.settingObj.getBounds("Kilgoris");

	that.CLASS_NAME =  "gis.ui.control.zoomToExtent.kilgoris";
	return that;
};
/* ======================================================================
    gis/ui/control/search/customerView.js
   ====================================================================== */

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
/* ======================================================================
    gis/ui/control/search/placeView.js
   ====================================================================== */

/**
 * WKTを編集レイヤに表示するコントロール
 */
gis.ui.control.search.placeView = function(spec,my){
	my = my || {};

	var that = gis.ui.control.search(spec,my);

	/**
	 * コントロールのID
	 */
	my.id = spec.id || 'placeView';

	/**
	 * コントロールの表示名
	 */
	my.label = spec.label || 'Search Place';

	my.dialog = gis.ui.dialog({ divid : my.id });

	my.tableId = "table-" + my.id;
	my.pagerId = "pager-" + my.id;

	my.height = 510;
	my.width = 930;
	my.url = './rest/Places/';
	my.colModelSettings= [
       {name:"placeid",index:"placeid",width:15,align:"right",classes:"placeid_class"},
       {name:"name",index:"name",width:40,align:"left",classes:"name_class"},
       {name:"category",index:"category",width:30,align:"left",classes:"category_class"},
       {name:"wkt",index:"wkt",width:40,align:"left",classes:"wkt_class"}
   ]
	my.colNames = ["Place ID","Place Name","Category","Location"];

	that.CLASS_NAME =  "gis.ui.control.search.customerView";
	return that;
};
/* ======================================================================
    OpenLayers/Control/DeleteFeature.js
   ====================================================================== */

/**
 * フィーチャ削除コントロール
 */
OpenLayers.Control.DeleteFeature = OpenLayers.Class(OpenLayers.Control, {

	/**
	 * 削除対象のジオメトリタイプ
	 * {Array(String)} 指定した場合は対象のジオメトリに対してのみ削除を行う。
	 * geometryTypesにはOpenLayers.Geometry以下の名前空間を配列で列挙する。
	 */
	geometryTypes : null,

	/**
	 * コンストラクタ
	 * @param layer 操作対象となるレイヤ名
	 * @param options オプション。displassClass,titleなどのキーと値のマップ。
	 * options.geometryTypesを指定した場合は対象のジオメトリに対してのみ削除を行う。
	 */
	initialize : function(layer, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
		this.layer = layer;
		this.handler = new OpenLayers.Handler.Feature(this, layer, {
			click : this.clickFeature
		});
		if (options && options.geometryTypes){
			this.geometryTypes = options.geometryTypes;
		}
	},

	/**
	 * フィーチャクリック時のイベント
	 * @param feature クリックしたフィーチャ
	 */
	clickFeature : function(feature) {
		if (this.geometryTypes){
			//オプションとしてジオメトリタイプが指定されていたら削除対象のフィーチャにフィルタをかける
			if(OpenLayers.Util.indexOf(this.geometryTypes,feature.geometry.CLASS_NAME) == -1) {
				return;
			}
		}

		// if feature doesn't have a fid, destroy it
		if (feature.fid == undefined) {
			this.layer.destroyFeatures([ feature ]);
		} else {
			this.layer.events.triggerEvent("beforefeaturemodified", {
				feature : feature
			});
			feature.state = OpenLayers.State.DELETE;
			this.layer.events.triggerEvent("afterfeaturemodified", {
				feature : feature
			});
			feature.renderIntent = "select";
			this.layer.drawFeature(feature);
		}
	},

	/**
	 * OpenLayers.Mapオブジェクトの設定
	 * @param map OpenLayers.Mapオブジェクト
	 */
	setMap : function(map) {
		this.handler.setMap(map);
		OpenLayers.Control.prototype.setMap.apply(this, arguments);
	},
	CLASS_NAME : "OpenLayers.Control.DeleteFeature"
});
/* ======================================================================
    OpenLayers/Control/DrawHole.js
   ====================================================================== */

OpenLayers.Control.DrawHole = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
	
	/**
     * Property: minArea
     * {Number} Minimum hole area.
     */
    minArea: 0,
	
	/**
     * Constructor: OpenLayers.Control.DrawHole
     * Create a new control for deleting features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * handler - {<OpenLayers.Handler>} OpenLayers.Handler.PolygonかRegularを指定
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer,handler, options) {
        this.callbacks = OpenLayers.Util.extend(this.callbacks, {
            point: function(point) {
                this.layer.events.triggerEvent('pointadded', {point: point});
            }
        });
        
        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, handler, options]);

    },
    
    /**
     * Method: drawFeature
     * Cut hole only if area greater than or equal to minArea and all
     *     vertices intersect the targeted feature.
     * @param {OpenLayers.Geometry} geometry The hole to be drawn
     */
    drawFeature: function (geometry) {

        var feature = new OpenLayers.Feature.Vector(geometry);
        feature.state = OpenLayers.State.INSERT;
        // Trigger sketchcomplete and allow listeners to prevent modifications
        var proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});
        
        if (proceed !== false && geometry.getArea() >= this.minArea) {
            var vertices = geometry.getVertices(), intersects;
            
            features: for (var i = 0, li = this.layer.features.length; i < li; i++) {
                var layerFeature = this.layer.features[i];
                
                intersects = true;
                for (var j = 0, lj = vertices.length; j < lj; j++) {
                    if (!layerFeature.geometry.intersects(vertices[j])) {
                        intersects = false;
                    }
                }
                if (intersects) {
                    layerFeature.state = OpenLayers.State.UPDATE;
                    // Notify listeners that a feature is about to be modified
                    this.layer.events.triggerEvent("beforefeaturemodified", {
                        feature: layerFeature
                    });
                    layerFeature.geometry.components.push(geometry.components[0]);
                    this.layer.drawFeature(layerFeature);
                    // More event triggering but documentation is not clear how the following 2 are distinguished
                    // Notify listeners that a feature is modified
                    this.layer.events.triggerEvent("featuremodified", {
                        feature: layerFeature
                    });
                    // Notify listeners that a feature was modified
                    this.layer.events.triggerEvent("afterfeaturemodified", {
                        feature: layerFeature
                    });
                    break features;
                }
            }
        }
    },
	
	CLASS_NAME: 'OpenLayers.Control.DrawHole'
});
/* ======================================================================
    OpenLayers/Control/SplitPolygon.js
   ====================================================================== */

OpenLayers.Control.SplitPolygon = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

	/**
     * Constructor: OpenLayers.Control.DrawHole
     * Create a new control for deleting features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer, options) {
        this.callbacks = OpenLayers.Util.extend(this.callbacks, {
            point: function(point) {
                this.layer.events.triggerEvent('pointadded', {point: point});
            }
        });

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.Path, options]);

    },

    /**
     * Method: drawFeature
     * Cut hole only if area greater than or equal to minArea and all
     *     vertices intersect the targeted feature.
     * @param {OpenLayers.Geometry} geometry The hole to be drawn
     */
    drawFeature: function (geometry) {

    	if (geometry.CLASS_NAME !== 'OpenLayers.Geometry.LineString'){
    		return;
    	}

    	if (this.layer.features.length === 0){
    		return;
    	}

    	var removeFeatures = [];
    	var addFeatures = [];
    	var polygons = [];
    	for (var i = 0 in this.layer.features) {
            var layerFeature = this.layer.features[i];
            if (layerFeature.geometry.CLASS_NAME !== 'OpenLayers.Geometry.Polygon'){
            	continue;
            }
            var targetPolygonOp = gis.geometryOp.polygonOp({geometry : layerFeature.geometry.clone()});
            if (targetPolygonOp.overlapbdyDisjoint(geometry)){
            	polygons.push(targetPolygonOp.getGeometry());
            	removeFeatures.push(layerFeature);
            }
        }
    	if (polygons.length === 0){
    		//分割ラインと交差するポリゴンがない場合
    		return;
    	}
    	var multiPolygon = new OpenLayers.Geometry.MultiPolygon(polygons);
    	$.ajax({
			url : './rest/geometries/split?polygon=' + multiPolygon.toString() + '&line=' + geometry.toString(),
			type : 'GET',
			dataType : 'json',
			cache : false,
			async : false
    	}).done(function(json){
    		if (json.code !== 0){
    			alert(json.message);
    			return;
    		}
			var polygons = json.value;
			for (var i = 0 in polygons){
				var polygon = polygons[i];
				var feature = gis.geometryOp.toFeature(OpenLayers.Geometry.fromWKT(polygon));
				addFeatures.push(feature);
			}
    	}).fail(function(xhr){
			console.log(xhr.status + ';' + xhr.statusText);
			return;
    	});

    	if (addFeatures.length === 0){
    		return;
    	}
    	this.layer.removeFeatures(removeFeatures);
    	this.layer.addFeatures(addFeatures,{silent : true});
    	this.layer.events.triggerEvent("aftersplit", {
            add: addFeatures,
            remove : removeFeatures
        });
    },

	CLASS_NAME: 'OpenLayers.Control.SplitPolygon'
});
