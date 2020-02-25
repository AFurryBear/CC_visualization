var myChart = echarts.init(document.getElementById('volume-viewer-display'), null, {renderer: 'canvas'});

var userpath = 'models/'
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
        show:false
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
$.get(userpath+'data.json').done(function (data) {
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

function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}
function intensityDataURL(index,callback,upload=userpath) {
    //D:\XYR_visual\echarts_vis\models\Group_result2\part2_result_BN_Atlas\119_118_mask_005.tex.gii
    //"models/Group_result2/part2_result_BN_Atlas/"+PrefixInteger(id_1,3)+"_"+PrefixInteger(id_2,3)+".tex.gii";

    if (index.substr(0, 5) === 'S1200') {
        return upload + index;

    } else {
        var homoSelect = $("[name=homoSelect]:checked").val();
        var template = $("[name=template]:checked").val();
        callback();
        if (template==="vertice"){
            return upload+"part2_result_" + template +"/" + index + "_percen_000.tex.gii";
        }
        else{
            return upload+"part2_result_" + template + "_" +homoSelect+"/" + index + "_percen_000.tex.gii";
        }}

}


var loading_div = $("#loading");
function showLoading() { loading_div.show(); }
function hideLoading() { loading_div.hide(); }

myChart.on('dblclick', function (params) {
    $.get(userpath+'data.json').done(function (data) {
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
                    data: data[PrefixInteger(params.data[0],3) + "_" + PrefixInteger(params.data[1],3)]
                }]
        });
    });
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

var colorMap4V = {
    heatmap:['#ffffff', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
    viridis:['#440357','#482374','#344989','#3E5F8D','#2A768E','#228A8D','#1E9B89','#2BB17D','#49C16D','#B5DD2B','#F7E620'],
    inferno:['#000005','#290b54','#570f6D','#892269','#AC2F5C','#C43C4E','#D74B3E','#EC6726','#F8870d','#FBA40a','#F5D644'],
    coolwarm:['#00004F','#0000A2','#0000EC','#4646FF','#D6D6FF','#FFF0F0','#FF9090','#FF0c0c','#FA0000','#C10000','#830000'],
    hsv:['#FF0b00','#FFCE00','#9CFF00','#07FF00','#00FFB6','#00EAFF','#000fFF','#A200FF','#FF00E6','#FF0068','#FF0024']
}

$('#colorMapSelect').change(function() {
    var colorMapSelect = $('#colorMapSelect').val();
    myChart.setOption({
        visualMap: [{
            seriesIndex: 1,
            min: 0,
            max: 1,
            calculable: true,
            orient:"horizontal",
            realtime: false,

            inRange: {

                color: colorMap4V[colorMapSelect]
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
        ]

    })

});


function threshold(show){
    var div = $("#th");
    div.html("");
    if (!show) {
        return;
    }

    var select = $("<select id=\"threshold_select\"></select>");
    var th_option = $("<option value=\"000\">0.00%</option><option value=\"005\">0.05%</option><option value=\"010\">0.10%</option><option value=\"015\">0.15%</option><option value=\"020\">0.20%</option>");
    th_option.appendTo(select);
    select.appendTo(div)
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
        threshold(true)
        $("#volume-file-nifti1").hide()
    }
    else {
        $("#th").hide();
        $("#volume-file-nifti1").show()
    }
    window.viewer.loadIntensityDataFromURL(intensityDataURL(IntensityDataName(),function(){}), {
        format: "gifti",
        complete: hideLoading
    });
});

$("[name=th]").change(function() {
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
$("[name=homoSelect]").change(function() {
    window.viewer.loadIntensityDataFromURL(intensityDataURL(IntensityDataName(),function(){}), {
        format: "gifti",
        complete: hideLoading
    });
});
