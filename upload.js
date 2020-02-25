//引入express模块
var express = require('express');
//引入multer模块
var multer = require ('multer');
var path = require('path');
//引入formidable
var formidable = require('formidable');
//引入fs
var fs = require('fs');
//引入child_process
var cp=require('child_process');

var fileName = require('./genFileName');
//设置上传的目录，
var upload = multer({ dest:  path.join(__dirname,'upload-single')});
var app = express();

app.use(express.static(path.join(__dirname, '/public/')));

app.get('/', function(req,res){
    console.log(req);
    res.render('./public/index.html');
});


app.post('/upload', upload.single('nifti1-file'), function (req, res, next) {
    //TODO:need consider .nii.gz
    console.log(req.file);
    console.log(req.body);
    var file = req.file;
    // var fileInfo = {};
    //
    // // 获取文件信息
    // fileInfo.mimetype = file.mimetype;
    // fileInfo.originalname = file.originalname;
    // fileInfo.size = file.size;
    // fileInfo.path = file.path;
    // console.log(fileInfo);
    res.set({
        'content-type': 'string; charset=utf-8'
    });
    console.log("Request handler 'upload' was called.");
    var r = Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4);
    var upload_file = "upload-single/" + r.toUpperCase() + path.extname(file.originalname);
    fs.rename(file.path, upload_file,function(){
        var arg1 = upload_file;
        var arg2 = path.join(__dirname, '/public/models/',r.toUpperCase());
        var arg3 = path.join(__dirname, '/public/models');
        cp.exec('python genResult.py '+arg1+' '+arg2+' '+arg3, (err, stdout, stderr)=>{
            if (err) console.log('stderr', err);
            if (stdout) console.log('stdout', stdout);
            //res.redirect('../')
            res.send(arg2)
            //res.render('./public/index.html');
            res.end();

        });



    });

});

app.listen(88)