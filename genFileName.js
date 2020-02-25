function intensityDataURL(index,upload='models/Group_result2',callback) {
    //D:\XYR_visual\echarts_vis\models\Group_result2\part2_result_BN_Atlas\119_118_mask_005.tex.gii
    //"models/Group_result2/part2_result_BN_Atlas/"+PrefixInteger(id_1,3)+"_"+PrefixInteger(id_2,3)+".tex.gii";

    if (index.substr(0, 5) === 'S1200') {
        return upload + index;

    } else {
        var homoSelect = $("[name=homoSelect]:checked").val();
        var weightSelect = $("[name=weightSelect]:checked").val();
        if (weightSelect === "mask") {
            var options = $("#threshold_select option:selected");
            var th = options.val();
        } else {
            var th = "000";
        }
        var template = $("[name=template]:checked").val();
        callback();
        if (template==="vertice"){
            return upload+"/part2_result_" + template +"/" + index + "_" + weightSelect + "_" + th + ".tex.gii";
        }
        else{
            return upload+"/part2_result_" + template + "_" +homoSelect+"/" + index + "_" + weightSelect + "_" + th + ".tex.gii";
        }}

}