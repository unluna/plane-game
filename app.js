// 元素
var container = document.getElementById('game');//最外面的外壳
var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
var myPlaneCoordinate = 0;//飞机坐标
var oScore = document.querySelector('#score');//显示分数的那个标签
/**
 * 整个游戏对象
 */
var GAME = {
    /**
     * 初始化函数,这个函数只执行一次
     * @param  {object} opts
     * @return {[type]}      [description]
     */
    init: function (opts) {
        this.status = 'start';
        this.bindEvent();
    },
    bindEvent: function () {
        var self = this;
        var playBtn = document.querySelector('.js-play');
        var nextBtn = document.querySelector('#gameOver');
        var replayBtn = document.querySelector('#js-replay');
        // 开始游戏按钮绑定
        playBtn.onclick = function () {
            self.play();
            playing();
        };
        nextBtn.onclick = function () {
            self.play();
            playing();
        };
        replayBtn.onclick = function () {
            self.play();
            playing();
        };
    },
    /**
     * 更新游戏状态，分别有以下几种状态：
     * start  游戏前
     * playing 游戏中
     * failed 游戏失败
     * success 游戏成功
     * all-success 游戏通过
     * stop 游戏暂停（可选）
     */
    setStatus: function (status) {
        this.status = status;
        container.setAttribute("data-status", status);
    },
    play: function () {
        this.setStatus('playing');
    },
    failed: function () {
        this.setStatus('failed');
    },
    success: function () {
        this.setStatus('all-success');
    }
};
// 初始化
GAME.init();

//游戏场景
function playing() {
    //画布显示
    canvas.style.display = 'block';
    var bulletList = new Array(); //存储我方飞机子弹的数组列表
    var enemyList = new Array(); //存储敌人的数组列表
    var theRight = 6;//最右侧碰壁下移
    var theLeft = 0;//最左侧碰壁下移
    var CONFIG = {
        score: 0//分数
    };

    //怪兽、飞机和子弹的继承的对象
    function Common(x, y, width, height, speed) {
        this.x = x;//num
        this.y = y;//num
        this.width = width;//num
        this.height = height;//num
        this.speed = speed;//num
    }

    //敌人的对象
    function Enemy(x, y, width, height, speed, isLife, imgSrc, boomImgSrc, direction) {

        Common.call(this, x, y, width, height, speed);

        this.isLife = isLife;//0是存在，1是爆炸图片，2是死亡
        this.imgSrc = imgSrc;//string
        this.boomImgSrc = boomImgSrc;//string
        this.direction = direction;//string

        this.spaceBetween = 10;//num
        this.number = 7;//num
    }

    //把每一个敌人推进整个敌人的函数，只执行一次
    function oneEnemyToEnemy() {
        for (var i = 0; i < 7; i++) {
            var oEnemy = new Enemy(30 + (10 + 50) * i, 30, 50, 50, 2, 0, './img/enemy.png', './img/boom.png', 'right');
            enemyList.push(oEnemy);
        }
    }

    //推进去
    oneEnemyToEnemy();

    //画敌人
    Enemy.prototype.draw = function () {
        //怪兽图片
        var enemyImg = new Image();
        enemyImg.src = this.imgSrc;
        //爆炸图片
        var boomImg = new Image();
        boomImg.src = this.boomImgSrc;
        //生命值判断0->1->2   0是正常显示，1是爆炸，2是不显示
        if (this.isLife == 0) {
            context.drawImage(enemyImg, this.x, this.y, this.width, this.height);
        } else if (this.isLife == 1) {
            context.drawImage(boomImg, this.x, this.y, this.width, this.height);
            this.isLife = 2;
            //爆炸结束后，分数加1
            CONFIG.score += 1;
        }
        //碰撞数目函数
        this.hit();
    };
    //左右碰撞数目检测函数
    Enemy.prototype.hit = function () {
        if (enemyList[theLeft].isLife == 2 && theLeft !== 5) {
            theLeft += 1;
        }
        if (enemyList[theRight].isLife == 2 & theRight !== 1) {
            theRight -= 1;
        }
    };
    //敌人的运动
    Enemy.prototype.move = function () {
        //向右时
        if (this.direction == 'right') {
            this.x += this.speed;
        } else if (this.direction == 'left') {//向左时
            this.x -= this.speed;
        }
        //运动后把它画出来
        this.draw();
    };

//我的飞机
    function MyPlane(x, y, width, height, speed, left, right, imgSrc) {

        Common.call(this, x, y, width, height, speed);
        this.left = left;//string
        this.right = right;//string
        this.imgSrc = imgSrc;//string
    }

    //画我的飞机
    MyPlane.prototype.draw = function () {
        var myImg = new Image();
        myImg.src = this.imgSrc;
        context.drawImage(myImg, this.x, this.y, this.width, this.height);
    };

    //我的飞机的keyPress事件
    MyPlane.prototype.keyPress = function () {
        //keypress函数->避免键盘按下后短暂的时间开出去好多炮弹
        document.addEventListener('keypress', function (ev) {
            var ev = ev || event;
            var keyCode = ev.keyCode;
            switch (keyCode) {
                case 32:
                    //这里没有向左右动那么写->避免键盘按下后短暂的时间开出去好多炮弹
                    this.fire();
                    break;
            }
        }.bind(myPlane1));//绑定为我的飞机的那个事例
    };

    //我的飞机的onKeyDown事件
    MyPlane.prototype.onKeyDown = function () {

        document.addEventListener('keydown', function (ev) {
            var ev = ev || event;
            var keyCode = ev.keyCode;
            //这里只改变方向，避免了键盘按下后短时间内飞机不动
            switch (keyCode) {
                case 37:
                    this.left = true;
                    break;
                case 39:
                    this.right = true;
                    break;
            }
        }.bind(myPlane1));//同理
    };

    //我的飞机的onKeyUp事件
    MyPlane.prototype.onKeyUp = function () {

        document.addEventListener('keyup', function (ev) {
            var ev = ev || event;
            var keyCode = ev.keyCode;
            //同理
            switch (keyCode) {
                case 37:
                    this.left = false;
                    break;
                case 39:
                    this.right = false;
                    break;
            }
        }.bind(myPlane1));//同理
    };
    //我的飞机的移动函数
    MyPlane.prototype.move = function () {
        //判断边界
        if (this.left && this.x >= 30) {//左边框
            this.x -= this.speed;
        } else if (this.right && this.x <= 610) {//总宽度-右边框-飞机的宽度
            this.x += this.speed;
        }
        //判断后画出来
        this.draw();
    };

    //我的飞机的射击函数
    MyPlane.prototype.fire = function () {
        //每次开火都把一个新的对象推进数组
        var bullet1 = new Bullet(this.x, this.y, 1, 10, 10);
        //把子弹存放在数组中
        bulletList.push(bullet1);
    };
    //new一个飞机的实例
    var myPlane1 = new MyPlane(320, 470, 60, 100, 5, false, false, './img/plane.png');
    /***********************************************************************************/

    //子弹对象
    function Bullet(x, y, width, height, speed) {
        Common.call(this, x, y, width, height, speed);
    }

    //画我的飞机的子弹
    Bullet.prototype.draw = function () {

        context.beginPath();
        context.strokeStyle = 'white';
        context.moveTo(this.x + 30, this.y);
        context.lineTo(this.x + 30, this.y + this.height);
        context.stroke();
        context.closePath();
    };
    //我的子弹的运动
    Bullet.prototype.move = function () {
        //子弹打出去后，如果该子弹存在，才画出来
        if (this.y !== null) {
            this.y -= this.speed;
            this.draw();
        }
        if (this.y <= -10) {
            this.y = null;
        }
    };

    //子弹和敌人的碰撞检测
    function bulletFly() {
        //先把子弹数组里的每一个子弹循环一遍
        for (var i = 0; i < bulletList.length; i++) {
            //再把敌人数组里的每一个敌人循环一遍
            for (var j = 0; j < enemyList.length; j++) {
                //如果碰撞了
                if (bulletList[i].x + 30 >= enemyList[j].x && bulletList[i].x + 30 <= enemyList[j].x + 50 && bulletList[i].y == enemyList[j].y + 30) {
                    if (enemyList[j].isLife == 0) {
                        //该子弹生命为空
                        bulletList[i].y = null;
                        //该子敌人图片变为爆炸
                        enemyList[j].isLife = 1;
                    }
                }
            }
            //调用子弹节点移动方法  让子弹移动
            bulletList[i].move();
        }
    }

    //敌人左或者右触碰边界后的函数->写在Enemy对象外防止做外侧触碰后其他敌人还没来得及向左/右平移就下移了
    function enemyRightOrLeft() {
        //如果最右侧触碰边界，所有敌人下移
        if (enemyList[theRight].x >= 620) {
            for (var k = 0; k < enemyList.length; k++) {
                //没到游戏结束的高度
                if (enemyList[k].y <= 380) {
                    //改变方向
                    enemyList[k].direction = 'left';
                    //下移
                    enemyList[k].y += 50;
                }
            }
        } else if (enemyList[theLeft].x <= 30) {//如果最左侧触碰边界，所有敌人下移
            for (var k = 0; k < enemyList.length; k++) {
                //没到游戏结束的高度
                if (enemyList[k].y <= 380) {
                    //改变方向
                    enemyList[k].direction = 'right';
                    //下移
                    enemyList[k].y += 50;
                }
            }
        }
    }

    //清空数据的函数->在游戏结束时调用
    function clear() {
        canvas.style.display = 'none';
        enemyList = null;
        myPlane1 = null;
        theRight = null;
        theLeft = null;
        CONFIG.score = 0;
    }

//调用的全部函数->三个键盘事件和一个刷新函数
    function calFunction() {
        myPlane1.onKeyDown();
        myPlane1.onKeyUp();
        myPlane1.keyPress();
        flashTankMap();
    }

    //先调用一次
    calFunction();
    /************************************************************************************/

//专门刷新地图的函数
    function flashTankMap() {
        //先清空画布
        context.clearRect(0, 0, canvas.width, canvas.height);
        //我的飞机
        myPlane1.move();
        //全部的敌人
        for (var i = 0; i < enemyList.length; i++) {
            enemyList[i].move();
        }
        //子弹
        bulletFly();
        //分数
        drawScore();
        //定时刷新
        var timer = requestAnimationFrame(flashTankMap);
        //所有敌人都消灭->游戏成功
        if (CONFIG.score == 7) {
            //关掉计时器
            window.cancelAnimationFrame(timer);
            //清空数据
            clear();
            //跳转页面
            GAME.success();
        }
        //敌人数组存在的话执行->避免清空数据后报错
        if (enemyList !== null) {
            //敌人边界检测函数
            enemyRightOrLeft();
            //游戏失败时执行
            if (enemyList[theRight].x >= 620 && enemyList[theRight].y == 430) {
                //关掉计时器
                window.cancelAnimationFrame(timer);
                //记录分数->推给标签里的innerHtml
                oScore.innerHTML = CONFIG.score;
                //清空数据
                clear();
                //跳转页面
                GAME.failed();
            }
        }
    }
//绘制分数
    function drawScore() {
        context.fillStyle = 'white';
        context.font = '18px';
        context.fillText('分 数 : ' + CONFIG.score, 20, 20);
    }

//requestAnimFrame->全称只开这一个“计时器”，提高流畅度
    window.requestAnimFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 30);
        };
}
//关闭requestAnimFrame的函数
window.cancelAnimationFrame = window.cancelAnimationFrame ||
    Window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    function (id) {
        //为了使setTimteout的尽可能的接近每秒60帧的效果
        window.clearTimeout(id);
    }
