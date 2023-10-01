// ==UserScript==
// @name         QQ空间说说删除脚本
// @namespace    none
// @version      1.0.4
// @description  用于一键删除QQ空间的说说，附带空间简约风美化
// @author       gogofishman
// @license      MIT
// @include      *://user.qzone.qq.com/*
// ==/UserScript==

var isStart = false;
var delayTime = 500;
// 已完成数量
var completed = 0;
// 剩余数量
var number = '0';


(function () {
    'use strict';

    Print('QQ空间说说删除脚本');

    //添加删除面板
    window.onload = AddDiv;
})();

//添加控制面板
function AddDiv() {
    let newDiv = document.createElement('div');
    newDiv.id = 'ShuoShuoDeleteMain';

    //内容
    newDiv.innerHTML = `
	<style>
	#ShuoShuoDeleteMain{
        width: 200px;
        height: 200px;
        position: fixed;
        top: 41px;
        right: 0;
        z-index: 499;
        padding: 10px;
        background: white url(https://p.sda1.dev/13/3f9eb408f25616eb024b972f7fd1a70d/忍野忍.png) no-repeat;
        background-size: cover;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        transition: transform 0.5s ease;
	}
	.moving#ShuoShuoDeleteMain {
    	transform: translateY(-180px) translateX(175px);
    	box-shadow:0 0 0;
    	background: rgba(255,255,255,0);
	}
	
	#ShuoShuoDelete_open{
	    width: 18px;
        height: 18px;
        background-color: white;
        border: 1px solid #777;
        border-radius: 50%;
        padding:5px;
        cursor: pointer; /* 鼠标指针样式为手型 */
	}
    #ShuoShuoDelete_open:active{
        background-color: darkgray;
    }
	
	.shuoshuoDelete * {
		margin-top: 5px;
		margin-bottom: 5px;
		font-size: 14px;
	}
	</style>
	<div class="shuoshuoDelete" style="margin: 0 auto; text-align: center">
        <h1 style="font-size: 17px; margin-bottom: 10px">QQ空间说说删除脚本</h1>
        <h2>删除顺序：</h2>
        <input type="radio" name="order" value="正序" checked />正序
        <input type="radio" name="order" value="倒序" />倒序
        <br />
        <div style="margin-top: 20px">
            <button id="shuoshuoDelete_start" style="padding: 5px">启动</button>
            <button id="shuoshuoDelete_end" style="padding: 5px">停止</button>
        </div>
        <p id="shuoshuoDelete_state" style="color: red">未运行</p>
	</div>
    <div title="说说删除" id="ShuoShuoDelete_open">del</div>
  `;

    let div = document.getElementById('layBackground');
    if (div !== null) {
        div.appendChild(newDiv);

        //添加打开隐藏
        document.getElementById('ShuoShuoDelete_open').addEventListener('click', openMain);
        document.getElementById('ShuoShuoDelete_open').click();

        //添加启动停止
        document
            .getElementById('shuoshuoDelete_start')
            .addEventListener('click', start);
        document.getElementById('shuoshuoDelete_end').addEventListener('click', end);

        Beautify();
    }
}

//空间界面美化
async function Beautify() {
    //移除flash悬浮窗
    WaitUntilAction(() => document.getElementById('flowerContainerDiv'));
    //移除开通黄钻
    WaitUntilAction(() => document.getElementById('QM_Container_3').children[1]);
    WaitUntilAction(() => document.getElementById('tb_vip_li'));
    //移除签到
    WaitUntilAction(() => document.getElementById('QM_Container_31'));
    WaitUntilAction(() => document.getElementById('QM_Container_100005'));
    //移除天气
    WaitUntilAction(() => document.getElementById('weatherDiv'));
    //移除小游戏
    WaitUntilAction(() => document.getElementById('leftMenu').children[1]);
    //优化左侧tab栏
    WaitUntilAction(() => document.getElementById('tab_menu_mv'));
    WaitUntilAction(() => document.getElementById('tab_menu_class'));
    WaitUntilAction(() => document.getElementById('tab_menu_app'));
    //移除动态操作栏
    WaitUntilAction(() => document.getElementById('feed_friend').children[0]);
    //移除信息栏
    WaitUntilAction(() => document.getElementById('headContainer').children[0]);
    //移除大拇指
    WaitUntilAction(() => document.getElementById('like_button_pannel'));
    WaitUntilAction(() => document.getElementById('speed_signal_btn'));


    WaitUntil(() => document.querySelectorAll('a[title="QQ空间独立版"]').length > 0, 100)
        .then(() => {
            document.querySelectorAll('a[title="QQ空间独立版"]')
                    .forEach((value) => {
                        value.remove();
                    });
        });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function Print(text) {
    console.log(`[说说脚本] - ${text}`);
}

/**
 * 异步执行当某个元素出现时立马某个动作
 * @param {function} element 返回指定元素的函数
 * @param {string} action 执行动作（可选click、remove、mouseover）
 * @param {number} step 每次检查间隔时间 ms
 * @param {number} timeOut 超时时间 ms
 * @returns {Promise<void>}
 * @constructor
 */
async function WaitUntilAction(element, action = 'remove', step = 50, timeOut = 1000 * 30) {
    let count = 0;
    let outCount = timeOut / step;

    try {
        while (count <= outCount) {
            count++;
            await sleep(step);

            let _c = element();
            if (_c != null) {
                if (action === 'click') {
                    _c.click();
                }
                if (action === 'remove') {
                    _c.remove();
                }
                if (action === 'mouseover') {
                    _c.dispatchEvent(new MouseEvent('mouseover', {
                        bubbles: true,  // 事件是否应该冒泡
                        cancelable: true,  // 事件是否可以取消
                        view: window,  // 事件的视图
                    }));
                }
                break;
            }

        }
    } catch (e) {

    }
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

function openMain() {
    let b = document.getElementById('ShuoShuoDeleteMain');
    if (b.classList.contains('moving')) {
        b.classList.remove('moving');
    } else {
        b.classList.add('moving');
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
            //点击删除
            document.querySelector('.qz_dialog_layer_btn').click();

            Print('删除说说+1');
            completed++;
            ChangeStateText(`正在删除 ${completed}`, 'green');

            await sleep(delayTime);

            // 记录剩余说说数量
            let _n = document.querySelector('.app_canvas_frame').contentDocument
                             .querySelector('.feed_num').firstElementChild.textContent;
            if (_n !== number) {
                number = _n;
            } else {
                alert('由于最近删除过多，说说需要通过验证删除。请等待几小时到几天后再继续！');
                ChangeStateText(`已停止 ${completed}`, 'red');
                Print('无法继续删除，程序已停止');
                end();
            }
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

