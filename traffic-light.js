/**
 * 交通灯类 - 表示单个交通灯
 */
class TrafficLight {
    constructor(id) {
        this.id = id; // 交通灯的ID（如 'north-light'）
        this.currentState = 'red'; // 当前状态：'red', 'yellow', 'green'
        this.element = document.getElementById(id); // DOM 元素
    }

    /**
     * 设置交通灯状态
     * @param {string} state - 状态：'red', 'yellow', 'green'
     */
    setState(state) {
        // 移除所有活动状态的类
        const lights = this.element.querySelectorAll('.light');
        lights.forEach(light => {
            light.classList.remove('active');
        });

        // 根据状态添加对应的活动类
        this.currentState = state;
        const stateMap = {
            'red': '.red',
            'yellow': '.yellow',
            'green': '.green'
        };

        const activeLight = this.element.querySelector(stateMap[state]);
        if (activeLight) {
            activeLight.classList.add('active');
        }
    }

    /**
     * 获取当前状态
     */
    getState() {
        return this.currentState;
    }
}

/**
 * 交叉路口类 - 管理整个交叉路口的交通灯
 */
class Intersection {
    constructor() {
        // 创建四个方向的交通灯对象
        this.lights = {
            north: new TrafficLight('north-light'),
            south: new TrafficLight('south-light'),
            east: new TrafficLight('east-light'),
            west: new TrafficLight('west-light')
        };

        this.currentState = 'green'; // 当前交叉路口的状态（初始为绿色）
        this.activeDirection = 'north-south'; // 当前活跃方向：'north-south' 或 'east-west'
        this.autoModeInterval = null; // 自动模式的定时器
        this.yellowTimeout = null; // 黄色状态的定时器

        // 初始化渲染
        this.render();
    }

    /**
     * 渲染函数 - 更新所有交通灯的显示
     * 规则：一组为绿灯或黄灯时，另外一组为红灯
     */
    render() {
        // 根据当前状态和活跃方向，设置南北和东西的交通灯状态
        if (this.activeDirection === 'north-south') {
            // 南北方向显示当前状态（green/yellow/red）
            this.lights.north.setState(this.currentState);
            this.lights.south.setState(this.currentState);
            // 东西方向始终显示红灯（因为南北是活跃方向）
            this.lights.east.setState('red');
            this.lights.west.setState('red');
        } else {
            // 东西方向显示当前状态（green/yellow/red）
            this.lights.east.setState(this.currentState);
            this.lights.west.setState(this.currentState);
            // 南北方向始终显示红灯（因为东西是活跃方向）
            this.lights.north.setState('red');
            this.lights.south.setState('red');
        }
    }

    /**
     * 切换到绿色
     */
    changeToGreen() {
        this.currentState = 'green';
        this.render();
        const direction = this.activeDirection === 'north-south' ? '南北' : '东西';
        console.log(`${direction}方向交通灯已切换到绿色`);
    }

    /**
     * 切换到黄色（持续3秒后自动切换到红色）
     */
    changeToYellow() {
        this.currentState = 'yellow';
        this.render();
        const direction = this.activeDirection === 'north-south' ? '南北' : '东西';
        console.log(`${direction}方向交通灯已切换到黄色（3秒后将变为红色）`);

        // 清除之前的定时器
        if (this.yellowTimeout) {
            clearTimeout(this.yellowTimeout);
        }

        // 3秒后自动切换到红色
        this.yellowTimeout = setTimeout(() => {
            this.changeToRed();
        }, 3000);
    }

    /**
     * 切换到红色（并切换方向，新方向变为绿色）
     * 逻辑：当一组由黄灯切换成红灯时，另外一组变绿
     * 实现：切换方向，新方向变绿，旧方向自动变红（根据render逻辑）
     */
    changeToRed() {
        const oldDirection = this.activeDirection;
        const oldDirectionName = oldDirection === 'north-south' ? '南北' : '东西';
        
        // 切换方向，让新方向立即变为绿色
        // 根据 render() 的逻辑，旧方向会自动显示红色
        this.activeDirection = this.activeDirection === 'north-south' ? 'east-west' : 'north-south';
        this.currentState = 'green';
        this.render();
        
        const newDirection = this.activeDirection === 'north-south' ? '南北' : '东西';
        console.log(`${oldDirectionName}方向已变为红色，${newDirection}方向已变为绿色`);
    }

    /**
     * 切换到下一个状态（绿色 -> 黄色 -> 红色 -> 绿色）
     */
    nextState() {
        const stateSequence = ['green', 'yellow', 'red'];
        const currentIndex = stateSequence.indexOf(this.currentState);
        const nextIndex = (currentIndex + 1) % stateSequence.length;
        const nextState = stateSequence[nextIndex];

        if (nextState === 'yellow') {
            this.changeToYellow();
        } else if (nextState === 'red') {
            this.changeToRed();
        } else {
            this.changeToGreen();
        }
    }

    /**
     * 启动自动模式
     * 时间设置：黄色3秒，绿色10秒，红色15秒
     */
    startAutoMode() {
        // 如果已经在运行，先停止
        if (this.autoModeInterval) {
            this.stopAutoMode();
        }

        console.log('自动模式已启动');
        this.runAutoCycle();
    }

    /**
     * 运行自动循环
     * 循环逻辑：绿灯(10秒) -> 黄灯(3秒) -> 红灯（切换方向，新方向立即变绿）-> 重复
     * 
     * 流程示例（以南北方向开始）：
     * 1. 南北变绿，东西为红（10秒）
     * 2. 南北变黄，东西为红（3秒）
     * 3. 南北变红，东西变绿（切换方向）
     * 4. 东西变绿，南北为红（10秒）
     * 5. 东西变黄，南北为红（3秒）
     * 6. 东西变红，南北变绿（切换方向，回到步骤1）
     */
    runAutoCycle() {
        // 当前方向：绿色（10秒）
        this.changeToGreen();
        setTimeout(() => {
            // 当前方向：黄色（3秒后自动变红并切换方向）
            this.changeToYellow(); // 内部定时器会在3秒后调用changeToRed()
            
            // 黄色3秒后，changeToRed()会被调用，切换方向，新方向立即变绿
            // 新方向保持绿色10秒 + 黄色3秒 = 13秒后，再次循环
            setTimeout(() => {
                // 循环继续（此时已经是新方向了）
                this.runAutoCycle();
            }, 13000); // 3秒黄色 + 10秒新方向绿色 = 13秒后继续循环
        }, 10000); // 绿色持续10秒
    }

    /**
     * 停止自动模式
     */
    stopAutoMode() {
        if (this.autoModeInterval) {
            clearInterval(this.autoModeInterval);
            this.autoModeInterval = null;
        }
        if (this.yellowTimeout) {
            clearTimeout(this.yellowTimeout);
            this.yellowTimeout = null;
        }
        console.log('自动模式已停止');
    }
}

// 创建交叉路口实例（全局变量，方便在控制台调用）
const intersection = new Intersection();
intersection.startAutoMode();

// 在控制台输出使用说明
console.log('%c交通灯交叉路口系统已加载！', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('可用命令：');
console.log('  intersection.changeToGreen()  - 切换到绿色');
console.log('  intersection.changeToYellow() - 切换到黄色（3秒）');
console.log('  intersection.changeToRed()    - 切换到红色');
console.log('  intersection.nextState()      - 切换到下一个状态');
console.log('  intersection.startAutoMode()  - 启动自动模式');
console.log('  intersection.stopAutoMode()   - 停止自动模式');

