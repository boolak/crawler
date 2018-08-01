var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var xlsx = require('node-xlsx');
var excelConf = require('./excelConfig');// excel 信息配置


var page = 1, exlObj = [];
getDocInfo();

/**
 * @获取文档
 */
function getDocInfo(){
    var url = 'http://cd.ziroom.com/z/nl/.html?qwd=%E6%96%B0%E4%BC%9A%E5%B1%95&p=' + page;
    http.get(url, function(res){
        var html = '';
        res.on('data', function(data){
            html += data;
        });
    
        res.on('end', function(){
            var sliderData = filterInfos(html);
            printInfo(sliderData);
        })
    }).on('error', (e) => {
        console.error(e);
    });
}


/**
 * @description 过滤信息
 */
function filterInfos(html){
    if(html){
        var $ = cheerio.load(html);
        var slider = $('#houseList'), sliderArr = [];
        slider.find('li').each(function(item){
            var pic = $(this);
            var picHref = pic.find('.img a').attr('href'),
                picSrc = pic.find('.img img').attr('src'),
                name = pic.find('.txt h3 a').text(),
                addr = pic.find('.txt h4 a').text();
            sliderArr.push({
                picHref: picHref,
                picSrc: picSrc,
                name: name,
                addr: addr
            })
        });
        return sliderArr;
    }else{
        console.log('无数据')
    }
}

/**
 * @description 打印、生成信息
 */
function printInfo(data){
    var count = 0;
    var excel = [excelConf.key];
    data.forEach(function(item){
        excel.push([item.name, item.addr, item.picHref, item.picSrc]);
        // console.log('小区:' + item.name + '，地址：' + item.addr + '，详情：' + item.picHref + '，封面图：' + item.picSrc);
        // console.log('\n');
    });
    exlObj.push(
        {
            name: excelConf.sheet + page,
            data: excel
        }
    )
    page === 3 && fs.writeFileSync(excelConf.name +'.xlsx', xlsx.build(exlObj), 'binary');

    if(page < 3){
        page++;
        getDocInfo();
    }
}