var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
var url = 'http://read.qidian.com/chapter/6c2rfcBKnxY1/hpfLIO4i120ex0RJOkJclQ2';  //初始地址
function fetchPage(url) {     //封装了一层函数
	startRequest(url);
}
function startRequest(url) {
	http.get(url, function (res) {
		var html = '';
		res.setEncoding = 'utf-8';
		res.on('data', function (chunk) {  //拿到当前页面
			html += chunk;
		});
		res.on('end', function () {
			var $ = cheerio.load(html); //采用cheerio模块解析html
			var length = 5;  //要爬的数量
			var title = $('.main-text-wrap .text-head h3').text().trim();  //标题
			var content = $('.main-text-wrap .read-content').eq(0).text().trim();  //内容
			content = content.replace(/\s/g, '\n     ');
			var nextLink = $('#j_chapterNext').attr('href');  //下一张地址
			savedContent(title, content);  //存储每篇文章的内容
			// savedImg($, word, i);    //存储每篇文章的图片
			// //下一篇文章的url
			// var nextLink = "http://read.qidian.com/chapter" + $("li.next a").attr('href');
			// str1 = nextLink.split('-');  //去除掉url后面的中文
			// str = encodeURI(str1[0]);
			// //这是亮点之一，通过控制I,可以控制爬取多少篇文章
			if (i < length - 1) {  //要爬数量 length - 1
				fetchPage('http:' + nextLink);
				i++;
			}
		});
	}).on('error', function (err) {
		console.log(err);
	});
}

//该函数的作用：在本地存储所爬取的新闻内容资源
function savedContent(title, content) {
	fs.appendFile('./data/' + title + '.txt', content, 'utf-8', function (err) {
		if (err) {
			console.log(err);
		}
	});
	// request.get(link, function (err, res, body) {  //link-链接  body-html内容
	// 	var $ = cheerio.load(body);
	// 	var text = $('#article_content').text();
	// 	fs.appendFile('./data/' + news_title + '.txt', text, 'utf-8', function (err) {
	// 		if (err) {
	// 			console.log(err);
	// 		}
	// 	});
	// });
}
//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($, news_title, i) {
	var img_title = $('.blog_list_wrap .head').eq(i).parent().next().text().trim();  //获取图片的标题
	if (img_title.length > 35 || img_title == "") {
		img_title = "Null";
	}
	var img_filename = img_title + '.jpg';
	var img_src = $('.blog_list_wrap .head').eq(i).attr('src'); //获取图片的url
	// console.log(img_src);
//采用request模块，向服务器发起一次请求，获取图片资源
	request.get(img_src, function (err, res, body) {
		if (err) {
			console.log(err);
		}
	});
	request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '---' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
}
fetchPage(url);      //主程序开始运行