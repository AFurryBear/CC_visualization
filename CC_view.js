var myChart = echarts.init(document.getElementById('volume-viewer-display'), null, {renderer: 'canvas'});

// 显示标题，图例和空的坐标轴
option = {
    tooltip: {
        trigger: 'item',
        formatter: function (params) {
            return ' j: ' + params.data[0] + ' k:' + params.data[1] + ' value: ' + params.data[2]
        }
    },
    legend: {
        top: '10%'
    },
    dataZoom:[
        {
            type: 'inside',
            xAxisIndex: [0]
        },
        {
            type: 'inside',
            yAxisIndex: [0]
        }
    ],
    legend : {
        data: ['MNI','CC'],
        left: 10
    },
    xAxis: {
        type: 'category',
        data: [],
        show:false
    },
    yAxis: {
        type: 'category',
        data: [],
        show:false
    },
    visualMap: [{
        seriesIndex: 1,
        min: 0,
        max: 1,
        calculable: true,
        orient:"horizontal",
        realtime: false,

        inRange: {

            color: ['#ffffff', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
    },
        {
            seriesIndex: 0,
            min: 0,
            max: 255,
            calculable: true,
            orient:"horizontal",
            realtime: false,
            show:false,
            inRange: {

                color: ['#17202A', '#424949', '#616A6B', '#707B7C', '#B2BABB', '#D5DBDB', '#F2F3F4', '#FFFFFF']
            }
        },
    ],

    series: [{
        name: 'MNI',
        type: 'heatmap',
        data: [],
        progressive : 30000,
        progressiveThreshold : 30000,
    },
        {
            name: 'CC',
            type: 'heatmap',
            data: [],

        }]
};

myChart.setOption(option);
myChart.showLoading();
// 异步加载数据
$.get('data.json').done(function (data) {
    // 填入数据
    myChart.setOption({
        xAxis: {
            data: data.x_data
        },
        yAxis: {
            data: data.y_data
        },
        series: [
            {
                // 根据名字对应到相应的系列
                data: data.data_MNI
            },
            {
                data: data.data_CC
            }]
    });

});

myChart.hideLoading();
// function setCookie(name, value_j, value_k)
// {
//     var minutes = 5; //此 cookie 将被保存 30 天
//     var exp　= new Date();
//     exp.setTime(exp.getTime() +minutes*60*1000);
//     document.cookie = name +"="+ decodeURI(value_j) + "+" + decodeURI(value_k) +  ";expires=" + exp.toGMTString();
//     var view = window.viewer;
//     viewer.loadIntensityDataFromURL()
//     //location.href = "XYR_surf2CC.html";//接收页面.
// }
//
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}
function intensityDataURL(index,callback) {
    //D:\XYR_visual\echarts_vis\models\Group_result2\part2_result_BN_Atlas\119_118_mask_005.tex.gii
    //"models/Group_result2/part2_result_BN_Atlas/"+PrefixInteger(id_1,3)+"_"+PrefixInteger(id_2,3)+".tex.gii";
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
    return "models/Group_result2/part2_result_" + template + "/" + index + "_" + weightSelect + "_" + th + ".tex.gii";

}


var loading_div = $("#loading");
function showLoading() { loading_div.show(); }
function hideLoading() { loading_div.hide(); }

myChart.on('dblclick', function (params) {
    window.viewer.loadIntensityDataFromURL(intensityDataURL(PrefixInteger(params.data[0],3) + "_" + PrefixInteger(params.data[1],3),function(){
        window.viewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps")[0].url);
    }), {
        format: "gifti",
        complete: hideLoading
    })
});
function IntensityDataName(){
    var info = window.viewer.model_data.get();
    var fileName = info.intensity_data[0].name;
    if (fileName.substr(0,5)==='S1200'){
        return fileName;
    }
    else{
        return fileName.substr(0,7);
    }
}

$("[name=homoSelect]").change(function() {
    var homoSelect = $("[name=homoSelect]:checked").val();

    window.viewer.loadIntensityDataFromURL(intensityDataURL(IntensityDataName(),function(){}), {
        format: "gifti",
        complete: hideLoading
    });
});

$("[name=weightSelect]").change(function() {
    var weightSelect = $("[name=weightSelect]:checked").val();
    if (weightSelect==="mask") {
        $("#th").show();
    }
    else {
        $("#th").hide();
    }
    window.viewer.loadIntensityDataFromURL(intensityDataURL(IntensityDataName(),function(){}), {
        format: "gifti",
        complete: hideLoading
    });
});

$("[name=template]").change(function() {
    var template = $("[name=template]:checked").val();

    window.viewer.loadIntensityDataFromURL(intensityDataURL(IntensityDataName(),function(){}), {
        format: "gifti",
        complete: hideLoading
    });
});