//整个表格  创建所有的行列单元格 生成整个结构
//初始化结构，清空结构，编辑单元格，Resize 操作
//插入删除行列，获取值/设置值，右键菜单（可选）
class Excel {
    constructor(container, rowcount, colcount) {
        // 根容器 控制整个容器
        this.container = container;
        this.rowcount = rowcount;
        this.colcount = colcount;
        //所有的cell实例
        this.cells = [];
        //所有的行头
        this.Rowheader = [];
        //所有的列头
        this.Colheader = [];
        //清除结构html中
        this.clearstructure();
        //不调用永远执行不了
        this.init()
    }
    //1.因为我设置了html
    clearstructure() {
        this.container.querySelector(".row-headers").innerHTML = "";
        this.container.querySelector(".col-headers").innerHTML = "";
        this.container.querySelector(".cells-container").innerHTML = "";
    }
    //2.初始化整个excel
    init() {
        this.createRowHeaders();
        this.createColHeaders();
        this.createCells();
    }
    //创建行头
    createRowHeaders() {
        const rowHeaderContainer = this.container.querySelector(".row-headers");
        for (let i = 0; i < this.rowcount; i++) {

            const Row = new Rowheader(i);
            this.Rowheader[i] = Row;
            Row.Renderrow(rowHeaderContainer);
        }
        this.container.appendChild(rowHeaderContainer);
    }
    //创建列头
    createColHeaders() {
        const colHeaderContainer = this.container.querySelector(".col-headers");
        for (let i = 0; i < this.colcount; i++) {
            const Col = new Colheader(i)
            this.Colheader[i] = Col;
            Col.Randercol(colHeaderContainer);
        }
        this.container.appendChild(colHeaderContainer);
    }
    //创建单元格
    createCells() {
        const cellsContainer = this.container.querySelector(".cells-container");
        for (let i = 0; i < this.rowcount; i++) {
            this.cells[i] = [];   //初始化每一行数组
            const rowdiv = document.createElement("div")//创建一整行的容器 
            rowdiv.classList.add("row");//给一整行添加样式
            rowdiv.dataset.row = i;     //属于哪一行
            for (let j = 0; j < this.colcount; j++) {
                const cell = new Cell("", i, j);
                this.cells[i][j] = cell;
                cell.Render(rowdiv);
            }
            cellsContainer.appendChild(rowdiv);//把整行追加上去。
        }
        this.container.appendChild(cellsContainer);
    }
    //2.插入行 删除行

}
//行头 
class Rowheader {
    constructor(index, height = 30) {
        this.index = index;
        this.height = height;
        this.el = null;  //行头div盒子
    }
    //1.渲染行数据
    Renderrow(container) {
        //1.1 创建行头元素
        const div = document.createElement("div");
        div.classList.add("row-header");
        div.dataset.row = this.index;
        div.textContent = this.index + 1;
        div.style.height = this.height + "px";
        this.el = div;
        // 1.2 创建顶部拖动句柄装进div
        const topresize = document.createElement("div");
        topresize.classList.add("topresizer");
        div.appendChild(topresize);
        // 1.3 创建底部拖动句柄装进div
        const bottomresize = document.createElement("div");
        bottomresize.classList.add("bottomresizer");
        div.appendChild(bottomresize);
        //1.4 将行头div添加进父容器
        container.appendChild(div);
        //1.5 绑定所有事件
        this.bindEvent();
    }
    //2. 绑定所有事件  
    bindEvent() {
        //2.1 点击行头显示
        this.el.addEventListener("click", () => this.Hightrow())
        //2.2 拖动句柄 进行修改
        //2.2.1 添加事件一定先得获取元素
        const topresize = this.el.querySelector(".topresizer");
        const bottomresize = this.el.querySelector(".bottomresizer");
        //2.2.2 获取元素之后添加事件 鼠标拖动事件
        topresize.addEventListener("mousedown", (e) => this.startResize(e, "top"));
        bottomresize.addEventListener("mousedown", (e) => this.startResize(e, "bottom"));
    }
    //3. 点击变亮
    Hightrow() {
        //1. 清除所有之前的高亮
        document.querySelectorAll(".row-header").forEach(row => {
            row.classList.remove("highlightrow");
        });
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("highlightcell");
        });
        document.querySelectorAll(".col-header").forEach(col => {
            col.classList.remove("highlightcol");
        });
        //2. 点击行头变绿
        this.el.classList.add("highlightrow");
        //3. 找到所有的data-row等于当前index的单元格添加高亮格式
        // `.cell[data-row="1"]` 就是选中“所有 class 是 cell 且 data-row=1 的元素
        const cells = document.querySelectorAll(`.cell[data-row="${this.index}"]`);
        cells.forEach(cell => {
            cell.classList.add("highlightcell");
        })
    }
    //4. 修改行高
    startResize(e, direction) {
        //阻止默认文字变蓝的操作
        e.preventDefault();
        //4.1 拖动的核心是：变化量 = 当前鼠标 Y - 起始鼠标 Y
        const startY = e.clientY//鼠标初始时的y坐标
        const startHeight = this.el.offsetHeight;//起始高度
        //定义鼠标移动时的处理函数（箭头函数）
        const onMouseMove = (moveEvent) => {
            //计算移动的距离
            const delta = moveEvent.clientY - startY;
            //计算新的行高（更改样式）
            //let newheight = direction === "top" ? startHeight - delta : startHeight + delta;

            //限制一下最小的高度？
            if (newheight < 20) newheight = 20;
            //通过样式设置行头的新高度！
            this.el.style.height = newheight + "px";
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
    constructor(index, width = 100) {
        this.index = index;
        this.width = width;
        this.el = null;
    }
    //1.渲染列
    Randercol(container) {
        //1.1 创建div元素
        const div = document.createElement("div");
        div.classList.add("col-header");
        div.dataset.col = this.index;
        div.style.width = this.width + "px";
        div.textContent = String.fromCharCode(65 + this.index);//ABCDEFG
        this.el = div;
        //1.2 创建左右的句柄
        const leftdiv = document.createElement("div");
        leftdiv.classList.add("leftresizer");//
        div.appendChild(leftdiv);
        const rightdiv = document.createElement("div");
        rightdiv.classList.add("rightresizer");//
        div.appendChild(rightdiv);
        //div追加到父容器中
        container.appendChild(div);
        //绑定事件
        this.bindEvent();
    }
    //2.绑定事件
    bindEvent() {
        //2.1 绑定点击事件
        this.el.addEventListener("click", () => this.hightcol());
        //2.2 鼠标拖拽事件 添加事件一定要先获取元素
        const leftresize = this.el.querySelector(".leftresizer");
        const rightsize = this.el.querySelector(".rightresizer");
        //绑定鼠标按下事件
        leftresize.addEventListener("mousedown", (e) => this.startResize(e, "left"));
        rightsize.addEventListener("mousedown", (e) => this.startResize(e, "right"));
    }
    //3.点击变亮
    hightcol() {
        //清除所有之前的绿色
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("highlightcell");
        });
        document.querySelectorAll(".row-header").forEach(row => {
            row.classList.remove("highlightrow");
        });
        document.querySelectorAll(".col-header").forEach(col => {
            col.classList.remove("highlightcol");
        });
        this.el.classList.add("highlightcol");
        //获取所有列名为A的单元格 并给他们添加四边变绿的样式
        const cells = document.querySelectorAll(`.cell[data-col="${this.index}"]`);
        cells.forEach(cell => {
            cell.classList.add("highlightcell");
        });


    }
    //4.设置列宽
    startResize(e, direction) {
        //4.1 阻止默认事件
        e.preventDefault();

        //4.2 起始时的x坐标
        const startX = e.clientX
        //4.3 起始时的宽度
        const startwidth = this.el.offsetWidth;//起始宽度
        //4.4 定义move函数 mousemove时候调函数
        const onMouseMove = (moveEvent) => {
            // 4.4.1 计算宽度  // 拖拽的核心 当前鼠标-起始鼠标
            const dalta = moveEvent.clientX - startX;
            //4.4.2 计算行高
            let newwidth = direction === "left" ? startwidth - dalta : startwidth + dalta;
            // 判断如果小就给一个值
            if (newwidth < 20) newwidth = 20;
            //赋值
            this.el.style.width = newwidth + "px";
        }
        const onmouseup = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onmouseup);
        }
        // 给整个文档绑定鼠标移动事件，确保拖动时鼠标不必局限在行头元素上也能触发
        document.addEventListener("mousemove", onMouseMove);
        // 给整个文档绑定鼠标松开事件，拖动结束时解绑，防止内存泄漏
        document.addEventListener("mouseup", onmouseup);
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
        this.el.addEventListener("click", () => this.Hightlight())
        //双击单元格 进入编辑状态
        this.el.addEventListener("dblclick", () => this.Editcell())
        //3.用户离开单元格 保存修改
        this.el.addEventListener("blur", () => this.Exitedit())
    }
    //2.单元格  高亮
    Hightlight() {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("highlightcell");
        });
        this.el.classList.add("highlightcell");

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