// 构造函数，构造游戏
function Game(container){
    // console.log(this);
    this.container = document.querySelector(container);     // 获取id为box的div
    this.level = ['简单','中等','困难','噩梦'];         // 创建一个难度等级数组
    this.startLeft = this.container.offsetLeft;
    this.startTop = this.container.offsetTop;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.createEnemySpeed = [500,300,200,100];      // 生成敌军速度调节
    this.score = 0;         // 积分
    this.init();
}
Game.prototype = {
    // inint 函数：初始化游戏界面
    init:function(){
        this.title = document.createElement('h2');  // 创建标题‘18.飞机大战’
        this.title.innerText = '飞机大战';
        // console.log(this);
        this.container.appendChild(this.title);     // 将创建的h2标签添加到div中
        // 创建难度按钮
        this.oUL = document.createElement('ul');
        for(let i=0;i<this.level.length;i++){
            let oli = document.createElement('li');
            oli.innerText = this.level[i];
            this.oUL.appendChild(oli);
        }
        this.container.appendChild(this.oUL);
        // 事件委托，给 li 绑定点击事件
        this.oUL.addEventListener('click',this.handleClick.bind(this),false);
        // 初始化背景
        this.changeBg(1);
    },
    // 事件绑定函数
    handleClick:function(e){    // 对象是键名键值，所以是冒号;
        if(e.target.nodeName === 'UL')return;
        let index = [].indexOf.call(this.oUL.children,e.target);
        this.changeBg(index+1);
        this.gameStart(e,index);
    },
    // 修改背景图片
    changeBg:function(i){
        this.container.style.backgroundImage = 'url(images/bg_'+i+'.jpg)';
    },
    // 开始游戏
    gameStart:function(e,index){
        this.container.innerText = ''; //清除初始化界面
        // 创建生成积分的标签
        this.scoreContainer = document.createElement('span');
        this.scoreContainer.className = 'scoreContainer';
        this.container.appendChild(this.scoreContainer);
        // 生成飞机
        this.createPlane(e);
        // 存放所有生成的子弹
        this.bulletList = [];
        // 存放所有生成的敌军
        this.enemyList = [];
        // 生成子弹
        this.createBulletTimer = setInterval(this.createBullet.bind(this),100);
        // 子弹运动
        this.bulletMoveTimer = setInterval(this.bulletsMove.bind(this),20);
        // 生成敌军
        this.createEnemyTimer = setInterval(this.createEnemy.bind(this),this.createEnemySpeed[index]);
        this.createEnemyMaxTimer = setInterval(this.createEnemyMax.bind(this),this.createEnemySpeed[index]+2500);
        // 敌军运动
        this.enemyMoveTimer = setInterval(this.enemyMove.bind(this),20);

        //移动鼠标控制飞机
        document.addEventListener('mousemove',this.handleMouse.bind(this),false);
    },
    // 创建飞机
    createPlane:function(e){
        this.plane = document.createElement('div');
        this.plane.className = 'plane';
        this.container.appendChild(this.plane);
        //修正飞机的初始位置
        this.plane.style.left = e.clientX - this.startLeft - this.plane.clientWidth/2 + 'px';
        this.plane.style.top = e.clientY - this.startTop - this.plane.clientHeight/2 + 'px';
    },
    // 生成子弹
    createBullet:function(){
        this.bullet = document.createElement('div');
        this.bullet.className = 'bullet';
        this.container.appendChild(this.bullet);
        // 子弹的位置，需要获取 bullet 的宽高需要先将 bullet 添加到 dom 树中
        this.bullet.style.left = this.plane.offsetLeft + this.plane.clientWidth/2 - this.bullet.clientWidth/2 + 'px';
        this.bullet.style.top = this.plane.offsetTop - this.bullet.clientHeight + 'px';
        // 将生成的子弹存放入数组中
        this.bulletList.push(this.bullet);
    },
    // 子弹运动
    bulletsMove:function(){
        for(let i=0;i<this.bulletList.length;i++){
            let bullet = this.bulletList[i];
            bullet.style.top = bullet.offsetTop - 20 + 'px';
            // 清除超出边界的子弹
            if(bullet.offsetTop<0){
                bullet.parentNode.removeChild(bullet);
                this.bulletList.splice(i,1);
                i--;        // 解决数组坍塌
            }
            // this.crash()
            for(let j=0;j<this.enemyList.length;j++){
                let enemy = this.enemyList[j];
                // console.log(this.crash(enemy, bullet));

                // 如果子弹和敌军相撞，则删除相撞的子弹和敌军;
                if(this.crash(enemy,bullet)){
                    // 加分
                    this.score = this.score + 10;
                    this.scoreContainer.innerText = this.score + '分';
                    // 添加爆炸效果
                    this.boom = document.createElement('div');
                    this.boom.className = 'boom';
                    this.container.appendChild(this.boom);
                    this.boom.style.left = enemy.offsetLeft + 'px';
                    this.boom.style.top = enemy.offsetTop + 'px';
                    // 使用 animation 运动框架使得 boom 爆炸图 opacity 为 0;
                    animation(this.boom,{
                        opacity:0,
                    },1,function(){
                        // 将爆炸图从 dom 树中移除;
                        this.parentNode.removeChild(this);
                    });
                    // 清除子弹和敌军，数组中也一样需要清除
                    bullet.parentNode.removeChild(bullet);
                    this.bulletList.splice(i,1);
                    i--;
                    enemy.parentNode.removeChild(enemy);
                    this.enemyList.splice(j,1);
                    j--;

                }
            }
        }
    },
    // 生成敌军
    createEnemy:function(){
        this.enemy = document.createElement('div');
        this.enemy.className = 'enemy';
        this.container.appendChild(this.enemy);
        this.enemy.style.left = (this.width-this.enemy.clientWidth)*Math.random() + 'px ';
        this.enemyList.push(this.enemy);

    },
    createEnemyMax:function(){
        this.enemyMax = document.createElement('div');
        this.enemyMax.className = 'enemyMax';
        this.container.appendChild(this.enemyMax);
        this.enemyMax.style.left = (this.width-this.enemy.clientWidth)*Math.random() + 'px ';
        this.enemyList.push(this.enemyMax);
    },
    // 敌军运动
    enemyMove:function(){
        // console.log('enemyMove',this.enemyList);
        for(let i=0;i<this.enemyList.length;i++){
            let enemy;
            if(this.enemyList[i] === this.enemyMax){
                enemy = this.enemyList[i];
                enemy.style.top = enemy.offsetTop + 5 +'px';
            }else{
                enemy = this.enemyList[i];
                enemy.style.top = enemy.offsetTop + 10 + 'px';
            }
            // 清除超出边界的敌军
            if(enemy.offsetTop>this.height){
                enemy.parentNode.removeChild(enemy);
                this.enemyList.splice(i,1);
                i--;        // 解决数组坍塌
            }
            // 检测敌军和我军的碰撞
            if(this.crash(enemy,this.plane)){
                // 添加飞机爆炸效果
                const boom = document.createElement('div');
                boom.className = 'boom';
                boom.style.backgroundImage = 'url(images/boom_big.png)';
                this.container.appendChild(boom);
                boom.style.top = this.plane.offsetTop + 'px';
                boom.style.left = this.plane.offsetLeft + 'px';
                // 使用 animation 运动框架使得 boom 爆炸图 opacity 变成为0;
                animation(boom,{
                    opacity:0,
                },1,function(){
                    // 将爆炸图从 dom 树中移除;
                    boom.parentNode.removeChild(boom);
                    this.gameOver();
                }.bind(this));
                // 清除相撞的敌军和我军，数组中的也需要清除
                enemy.parentNode.removeChild(enemy);
                this.enemyList.splice(i,1);
                i--;
                this.plane.parentNode.removeChild(this.plane);

            }
        }
    },
    // 控制飞机移动
    handleMouse:function(e){
        // console.log(this);
        let nowLeft = e.clientX - this.startLeft - this.plane.clientWidth/2;
        let nowTop = e.clientY - this.startTop - this.plane.clientHeight/2;
        nowLeft = Math.max(0,nowLeft);
        nowLeft = Math.min(this.width-this.plane.clientWidth,nowLeft);
        nowTop = Math.max(0,nowTop);
        nowTop = Math.min(this.height-this.plane.clientHeight,nowTop);
        this.plane.style.left = nowLeft + 'px';
        this.plane.style.top = nowTop + 'px';
    },
    // 检测两个dom元素是否碰撞
    crash:function(dom1,dom2){

        // var bool = dom1.offsetTop+dom1.clientHeight<dom2.offsetTop||
        //         dom1.offsetTop>dom2.offsetTop+dom2.clientHeight||
        //         dom1.offsetLeft>dom2.offsetLeft+dom2.clientWidth||
        //         dom1.offsetLeft+dom1.clientWidth<dom2.offsetLeft;
        // return bool?false:true;

        return dom1.offsetTop < dom2.offsetTop + dom2.clientHeight &&
            dom2.offsetTop < dom1.offsetTop + dom1.clientHeight &&
            dom1.offsetLeft < dom2.offsetLeft + dom2.clientWidth &&
            dom2.offsetLeft < dom1.offsetLeft + dom1.clientWidth;
    },
    // 游戏结束
    gameOver:function(){
        // 关闭生成子弹和敌军的定时器
        clearInterval(this.createBulletTimer);
        clearInterval(this.createEnemyTimer);
        clearInterval(this.createEnemyMaxTimer);
        // 关闭子弹和敌军运动定时器
        clearInterval(this.bulletMoveTimer);
        clearInterval(this.enemyMoveTimer);
        // 游戏结束两秒后弹窗
        setTimeout(this.alertInterFace(),2000);

    },
    // 游戏结束弹窗
    alertInterFace:function(){
        let interFace = document.createElement('div');
        interFace.className = 'interFace';
        this.container.appendChild(interFace);
        // 创建得分文本
        this.scoreText = document.createElement('span');
        this.scoreText.className = 'scoreText';
        this.scoreText.innerText = 'Your Score：'+ this.scoreContainer.innerText;
        interFace.appendChild(this.scoreText);
        // 创建重新开始按钮
        let bth = document.createElement('button');
        bth.innerText = 'Play Again';
        interFace.appendChild(bth);
        // 给 button 按钮绑定事件处理函数
        bth.addEventListener('click',this.handleBthClick.bind(this),false);
    },
    // 重新开始游戏按钮的事件处理函数
    handleBthClick:function(){
        // 清空 #box 盒子内的所有节点
        this.container.innerText = '';
        // 重新执行 Game 函数
        new Game('#box');
    }
};
new Game('#box');