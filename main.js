// ==UserScript==
// @name         QQ空间说说删除脚本
// @namespace    none
// @version      1.0.1
// @description  用于一键删除QQ空间的说说，大概700毫秒左右删除一条
// @author       gogofishman
// @license      MIT
// @include      *://user.qzone.qq.com/*
// ==/UserScript==

var isStart = false;
var delayTime = 500;
var completed = 0;

(function () {
	'use strict';

	window.onload = AddDiv;
})();

//添加控制面板
function AddDiv() {
	let newDiv = document.createElement('div');
	newDiv.id = 'ShuoShuoDelete';

	//样式
	let style = newDiv.style;
	style.width = '200px';
	style.height = '200px';
	style.position = 'fixed';
	style.top = '41px';
	style.right = '0';
	style.zIndex = '99999';
	style.padding = '10px';
	style.backgroundColor = 'white';
	style.backgroundImage =
		'url(https://p.sda1.dev/13/3f9eb408f25616eb024b972f7fd1a70d/忍野忍.png)';
	style.backgroundRepeat = 'no-repeat';
	style.backgroundSize = 'cover';
	style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.5)';

	//内容
	newDiv.innerHTML =
		'' +
		'    <style>' +
		'       .shuoshuoDelete * {margin-top: 5px;margin-bottom: 5px;font-size: 14px}' +
		'    </style>' +
		'    <div class="shuoshuoDelete" style="margin: 0 auto;text-align: center">\n' +
		'       <h1 style="font-size: 17px;margin-bottom: 10px">QQ空间说说删除脚本</h1>\n' +
		'       <h2>删除顺序：</h2>\n' +
		'       <input type="radio" name="order" value="正序" checked>正序\n' +
		'       <input type="radio" name="order" value="倒序">倒序\n' +
		'       <br>\n' +
		'       <div style="margin-top: 20px">\n' +
		'           <button id="shuoshuoDelete_start" style="padding: 5px">启动</button>\n' +
		'           <button id="shuoshuoDelete_end" style="padding: 5px">停止</button>\n' +
		'       </div>\n' +
		'       <p id="shuoshuoDelete_state" style="color: red">未运行</p>' +
		'    </div>';

	let div = document.getElementById('layBackground');
	if (div !== null) {
		div.appendChild(newDiv);

		//添加启动停止
		document
			.getElementById('shuoshuoDelete_start')
			.addEventListener('click', start);
		document
			.getElementById('shuoshuoDelete_end')
			.addEventListener('click', end);
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function Print(text) {
	console.log(`[说说脚本] - ${text}`);
}

/**
 * 等待直到条件成立
 * @param {function} control 控制条件
 * @param {number} step 每次验证间隔时间 ms
 * @param {number} timeOut 超时时间 ms
 * @returns {Promise<void>}
 * @constructor
 */
async function WaitUntil(control, step = 500, timeOut = 10000) {
	let count = 0;
	let outCount = timeOut / step;

	while (count <= outCount) {
		count++;
		await sleep(step);
		let _c = control();
		if (_c) {
			return;
		}
	}
}

//启动
function start() {
	if (isStart) return;
	if (confirm('是否开始删除说说？')) {
		isStart = true;
		ChangeStateText('正在删除', 'green');
		Print('开始删除...');
		completed = 0;
		DeleteRun().then(() => Print('删除完成'));
	}
}

//停止
function end() {
	if (!isStart) return;
	isStart = false;
	Print('停止删除!');
}

//改变状态文字
function ChangeStateText(text, color) {
	let p = document.getElementById('shuoshuoDelete_state');
	p.innerText = text;
	p.style.color = color;
}

//删除程序
async function DeleteRun() {
	//删除顺序
	let order = document.querySelector('input[name="order"]:checked').value;

	//转到说说页面
	let shushuo = document.querySelector('a[title="说说"]');
	if (shushuo == null) return;
	shushuo.click();

	//等待跳转成功,10秒超时
	await WaitUntil(() => document.querySelector('.app_canvas_frame') != null);
	if (document.querySelector('.app_canvas_frame') == null) {
		Print('跳转超时！');
		return;
	}
	Print('跳转到说说界面');

	//如果倒序，跳转到最后一页
	if (order === '倒序') {
		Print('倒序');

		await WaitUntil(
			() =>
				document
					.querySelector('.app_canvas_frame')
					.contentDocument.querySelector('a[title="末页"]') != null
		);

		let last = document
			.querySelector('.app_canvas_frame')
			.contentDocument.querySelector('a[title="末页"]');
		if (last != null) {
			last.click();
			await sleep(3000);

			Print('跳转到末页...');
			Print('开始删除当前页说说...');
		}
	}

	//开始删除
	DeleteCurrentPage(order);
}

//删除当前页中所有的说说
async function DeleteCurrentPage(order) {
	if (!isStart) {
		alert('已停止删除说说功能！');
		ChangeStateText(`已停止 ${completed}`, 'red');
		return;
	}
	//等待页面加载完成
	if (order !== '倒序') {
		await WaitUntil(
			() =>
				document
					.querySelector('.app_canvas_frame')
					.contentDocument.querySelector('a[title="末页"]') != null
		);
	} else {
		await WaitUntil(
			() =>
				document
					.querySelector('.app_canvas_frame')
					.contentDocument.querySelector('a[title="首页"]') != null
		);
	}

	//获取第一个说说
	let li = document
		.querySelector('.app_canvas_frame')
		.contentDocument.querySelector('.feed');
	if (li == null) {
		Print('当前页删除完成！');
		NextPage(order);
	} else {
		//删除
		let button = li.querySelector('.del_btn');
		if (button != null) {
			button.click();
			await WaitUntil(
				() => document.querySelector('.qz_dialog_layer_btn') != null
			);
			document.querySelector('.qz_dialog_layer_btn').click();

			Print('删除说说+1');
			completed++;
			ChangeStateText(`正在删除 ${completed}`, 'green');

			await sleep(delayTime);
		}

		//往下循环执行
		DeleteCurrentPage(order);
	}
}

async function NextPage(order) {
	let html = document.querySelector('.app_canvas_frame').contentDocument;
	let next =
		order !== '倒序'
			? html.querySelector('a[title="下一页"]')
			: html.querySelector('a[title="上一页"]');

	if (next != null) {
		next.click();
		Print('点击下一页');
		await WaitUntil(
			() =>
				document
					.querySelector('.app_canvas_frame')
					.contentDocument.getElementById('msgList').childElementCount > 0
		);
		DeleteCurrentPage(order);
	} else {
		//全部完成
		ChangeStateText('未运行', 'red');
	}
}
