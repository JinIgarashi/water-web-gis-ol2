
(function() {

    /**
     * Before creating the OpenLayers namespace, check to see if
     * gis.singleFile is true.  This occurs if the
     * gis/SingleFile.js script is included before this one - as is the
     * case with old single file build profiles that included both
     * gis.js and justice/singleFile.js.
     */
    var singleFile = (typeof gis == "object" && gis.singleFile);

    /**
     * スクリプトのパス.
     */
    var scriptName = (!singleFile) ? "lib/gis.js" : "gis.js";

    /*
     * If window.justice isn't set when this script (justice.js) is
     * evaluated (and if singleFile is false) then this script will load
     * *all* justice scripts. If window.OpenLayers is set to an array
     * then this script will attempt to load scripts for each string of
     * the array, using the string as the src of the script.
     *
     * Example:
     * (code)
     *     <script type="text/javascript">
     *         window.gis = [
     *             "gis/util.js"
     *         ];
     *     </script>
     *     <script type="text/javascript" src="../lib/gis.js"></script>
     * (end)
     * In this example gis.js will load util.js only.
     */
    var jsFiles = window.gis;

    /**
     * 名前空間: gis
     * The gis object provides a namespace for all things gis
     */
    window.gis = {
    		/**
    		 * このスクリプトのパスを返す
    		 * @returns {function}
    		 */
            _getScriptLocation: (function() {
                var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
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

    /**
     * OpenLayers.singleFile is a flag indicating this file is being included
     * in a Single File Library build of the OpenLayers Library.
     *
     * When we are *not* part of a SFL build we dynamically include the
     * OpenLayers library code.
     *
     * When we *are* part of a SFL build we do not dynamically include the
     * OpenLayers library code as it will be appended at the end of this file.
     */
    if(!singleFile) {
    	//読みこむスクリプトファイルパスを列挙する
        if (!jsFiles) {
            jsFiles = [
                'gis/setting.js',
                'gis/geometryOp.js',
                'gis/geometryOp/pointOp.js',
                'gis/geometryOp/polygonOp.js',
                'gis/ui.js',
                'gis/ui/layer.js',
                'gis/ui/menu.js',
                'gis/ui/menu/dropdown.js',
                'gis/ui/menu/button.js',
                'gis/ui/statusbar.js',
                'gis/ui/controller.js',
                'gis/ui/controller/undoredo.js',
                'gis/ui/dialog.js',
                'gis/ui/control.js',
                'gis/ui/controlloader.js',
                'gis/ui/control/buffer.js',
                'gis/ui/control/clearAll.js',
                'gis/ui/control/deleteFeature.js',
                'gis/ui/control/difference.js',
                'gis/ui/control/differentVillageMeter.js',
                'gis/ui/control/drawHole.js',
                'gis/ui/control/drawLine.js',
                'gis/ui/control/drawPoint.js',
                'gis/ui/control/drawPolygon.js',
                'gis/ui/control/export.js',
                'gis/ui/control/graticule.js',
                'gis/ui/control/import.js',
                'gis/ui/control/intersection.js',
                'gis/ui/control/inputUsedMaterial.js',
                'gis/ui/control/inputWorksheet.js',
                'gis/ui/control/login.js',
                'gis/ui/control/measure.js',
                'gis/ui/control/measure/calcArea.js',
                'gis/ui/control/measure/calcDistance.js',
                'gis/ui/control/modifyFeature.js',
                'gis/ui/control/mousePosition.js',
                'gis/ui/control/mreadingSheet.js',
                'gis/ui/control/none.js',
                'gis/ui/control/printMap.js',
                'gis/ui/control/redo.js',
                'gis/ui/control/regular.js',
                'gis/ui/control/regular/exterior.js',
                'gis/ui/control/regular/interior.js',
                'gis/ui/control/reportLeakage.js',
                'gis/ui/control/scaleView.js',
                'gis/ui/control/selectFeature.js',
                'gis/ui/control/selectWorksheet.js',
                'gis/ui/control/snapping.js',
                'gis/ui/control/splitLine.js',
                'gis/ui/control/splitPolygon.js',
                'gis/ui/control/symdifference.js',
                'gis/ui/control/topology.js',
                'gis/ui/control/undo.js',
                'gis/ui/control/union.js',
                'gis/ui/control/uncapturedMeter.js',
                'gis/ui/control/uploadBillingData.js',
                'gis/ui/control/zoomBox.js',
                'gis/ui/control/zoomToExtent.js',
                'gis/ui/control/zoomToVillage.js',
                'gis/ui/control/zoomToExtent/naroktown.js',
                'gis/ui/control/zoomToExtent/ololulunga.js',
                'gis/ui/control/zoomToExtent/kilgoris.js',
                'gis/ui/control/zoomToExtent/lolgorien.js',
                'gis/ui/control/search.js',
                'gis/ui/control/search/customerView.js',
                'gis/ui/control/search/placeView.js',
                'gis/ui/treeview.js',
                'OpenLayers/Control/DeleteFeature.js',
                'OpenLayers/Control/DrawHole.js',
                'OpenLayers/Control/SplitPolygon.js'
            ]; // etc.
        }

      //スクリプトファイルを読み込む
        var scriptTags = new Array(jsFiles.length);
        var host = gis._getScriptLocation() + '/lib/';
        var date = new Date();
        for (var i=0, len=jsFiles.length; i<len; i++) {
        	var filepath = host + jsFiles[i] + "?version=" + date.getTime();
        	if (jsFiles[i].substr(0,1) === '.'){
        		filepath = jsFiles[i];
        	}
            scriptTags[i] = "<script src='" + filepath + "'></script>";
        }
        if (scriptTags.length > 0) {
            document.write(scriptTags.join(""));
        }
    }

})();

/**
 * Constant: VERSION_NUMBER
 */
gis.VERSION_NUMBER="Release 0.1";