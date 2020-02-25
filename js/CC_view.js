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
$.get('models/data.json').done(function (data) {
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
function intensityDataURL(index, upload, callback) {
    //你原有的逻辑
    if (index.substr(0, 5) === 'S1200') {
        //第一中情况返回一个URL，如果是固定的值，不需要用callback，存在异步才需要callback
        //先按照你的思路来写
        callback(upload + index)


// /*        // //下面只是思路，请求你的express服务获取路径的方法
//         // /!* $.ajax('请求后台服务地址',function (res) {
//         //      //一般请求的后台都是异步请求，所以这里等着后台返回地址后回调结果返回
//         //      //res 假如后台的结果就是你要的路径 res 等同你手写的这个 uoload+index 路径
//         //      callback(res)
//         //  })*!/*/
    } else {
        let homoSelect = $("[name=homoSelect]:checked").val();
        let weightSelect = $("[name=weightSelect]:checked").val();
        if (weightSelect === "mask") {
            let options = $("#threshold_select option:selected");
            let th = options.val();
        } else {
            let th = "000";
        }
        let template = $("[name=template]:checked").val();
        let returnUrl = ''
        if (template === "vertice") {
            returnUrl  = upload + "part2_result_" + template + "/" + index + "_" + weightSelect + "_" + th + ".tex.gii";
        } else {
            returnUrl = upload + "part2_result_" + template + "_" + homoSelect + "/" + index + "_" + weightSelect + "_" + th + ".tex.gii";
        }
        callback(returnUrl)
    }
}


var loading_div = $("#loading");
function showLoading() { loading_div.show(); }
function hideLoading() { loading_div.hide(); }

myChart.on('dblclick', function (params) {
    $.get('models/data.json').done(function (data) {
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
    window.viewer.loadIntensityDataFromURL(intensityDataURL(PrefixInteger(params.data[0],3) + "_" + PrefixInteger(params.data[1],3),'models/',function(){
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
    else if(fileName.substr(0,7)==='uploadF'){
        return ''
    }
    else{
        return fileName.substr(0,7);
    }
}
function reload(upload){
    intensityDataURL(IntensityDataName(),upload,function (res) {
        console.log('test: ',res)
        window.viewer.loadIntensityDataFromURL(res,{format:'gifti',complete:hideLoading})
    });
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
    reload('models/');
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
    reload('models/');
});

$("[name=th]").change(function() {
    reload('models/');
});
$("[name=template]").change(function() {
    reload('models/');
});
$("[name=homoSelect]").change(function() {
    reload('models/');
});
function getuserdata(callback){

    // $.ajax({
    //     url: "/upload",
    //     type: "POST",
    //     success: function (res) {
    //         console.log(res)
    //         callback(res)
    //     }
    // })
    $.get( "/upload", function(data) {
        alert(data);
    });


}
$("#volume-file-nifti1-submit").click(function() {
    //setInterval(function() {
    getuserdata(function(res){
        reload(res)
    })
//},10000);
});