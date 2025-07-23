//整个表格  创建所有的行列单元格 生成整个结构
class Excel {
    constructor(numbers) {
        this.numbers = numbers;
    }
}
//行头 
class Rowheader {
    constructor(index, height) {
        this.index = index;
        this.height = height;
        this.el = null;  //行头div盒子
    }
    //1.渲染行数据
    Renderrow(container) {
        //1.1 创建行头元素
        const div = document.createElement("div");
        div.classList.add("row-headers");
        div.dataset.row = this.index;
        div.textContent = this.index + 1;
        div.height = this.height + "px";
        this.el = div;
        // 1.2 创建顶部拖动句柄装进div
        const topresize = document.createElement("div");
        topresize.classList.add("top-resizer");
        div.appendChild("topresize");
        // 1.3 创建底部拖动句柄装进div
        const bottomresize = document.createElement("div");
        bottomresize.classList.add("bottom-resizer");
        div.appendChild("bottomresize");
        //1.4 将行头div添加进父容器
        container.appendChild(div);
        //1.5 绑定所有事件
        this.bindEvent();
    }
    //2. 绑定所有事件  
    bindEvent() {
        //2.1 点击行头显示
        this.el.document.addEventListener("click", () => this.Hightrow())
        //2.2 拖动句柄 进行修改
        //2.2.1 添加事件一定先得获取元素
        const topresize = this.el.document.querySelector("top-resizer");
        const bottomresize = this.el.document.querySelector("bottom-resizer");
        //2.2.2 获取元素之后添加事件 鼠标拖动事件
        topresize.addEventListener("mousedown", (e) => this.startResize(e, "top"));
        bottomresize.addEventListener("mousedown", (e) => this.startResize(e, "bottom"));
    }
    //3. 点击变亮
    Hightrow() {
        this.el.classList.add("heighRow");
    }
    //4. 修改行高
    startResize(e, direction) {
        //阻止默认文字变蓝的操作
        e.preventDefault();
        //4.1 拖动的核心是：变化量 = 当前鼠标 Y - 起始鼠标 Y
        const startY = e.client//鼠标初始时的y坐标
        const startHeight = this.el.offsetHeight;//起始高度
        //定义鼠标移动时的处理函数（箭头函数）
        const onMouseMove = (moveEvent) => {
            //计算移动的距离
            const delta = moveEvent.clientY - startY;
            //计算新的行高（更改样式）
            let newheight = direction === "top" ? startHeight - delta : startHeight + delta;
            //限制一下最小的高度？
            if (newheight < 20) newheight = 20;
            //通过样式设置行头的新高度！
            this.el.style.height = newheight;
        };
        //定义鼠标松开时的处理函数 解绑事件 停止拖动
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        // 给整个文档绑定鼠标移动事件，确保拖动时鼠标不必局限在行头元素上也能触发
        document.addEventListener("mousemove", onMouseMove);
        // 给整个文档绑定鼠标松开事件，拖动结束时解绑，防止内存泄漏
        document.addEventListener("mouseup", onMouseUp);
    }
}
//列头
class Colheader {
    constructor(index, width) {
        this.index = index;
        this.width = width;
    }
    //1.渲染列
    Randercol(container) {
        const div = document.createElement("div");
        div.classList.add("col-header");
        div.dataset.col = this.index;
        div.width = this.width();
    }
}
//单元格
class Cell {
    constructor(value, row, col) {
        this.value = value;
        this.row = row;
        this.col = col;
        this.el = null;//成员属性 后面都能用
    }
    //1.页面加载显示单元格（创建dom元素） container父容器 row
    Render(container) {
        //1.1 创建div元素
        const div = document.createElement("div");
        div.classList.add("cell");
        div.dataset.row = this.row;
        div.dataset.col = this.col;
        div.contentEditable = false;
        div.textContent = this.value;
        //1.2 保存到constructor 成员属性 后面都能用
        this.el = div;
        //1.2 追加到父元素中
        container.appendChild(div);
        //1.3 调用下一步函数
        this.bindEvent();
    }
    //2.绑定事件
    bindEvent() {
        //用户点击单元格  高亮
        this.el.document.addEventListener("click", () => this.Hightlight())
        //双击单元格 进入编辑状态
        this.el.document.addEventListener("dblclick", () => this.Editcell())
        //3.用户离开单元格 保存修改
        this.el.document.addEventListener("blur", () => this.Exitedit())
    }
    //2.单元格  高亮
    Hightlight() {
        this.el.classList.add("highlight");
    }
    //2.编辑状态
    Editcell() {
        this.el.contentEditable = true;
        this.el.focus();
    }
    //3.离开单元格 保存修改
    Exitedit() {
        this.el.contentEditable = false;
        this.value = this.el.textContent;
    }
}