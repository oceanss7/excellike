class Excel {
    constructor(container, rowCount, colCount) {
        this.container = container;
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.colWidths = [];
        this.rowHeights = [];
        this.colHeaders = container.querySelector('.col-headers');
        this.rowHeaders = container.querySelector('.row-headers');
        this.cellsContainer = container.querySelector('.cells-container');

        this.cells = []; // 二维数组存储所有Cell实例

        // 选中状态
        this.selectedCell = { row: null, col: null };
        this.selectedRow = null;
        this.selectedCol = null;
        // 初始化
        this.initColWidths();
        this.initRowHeights();
        this.initHeaders();
        this.initCells();
        this.updateGrid();
        this.createContextMenu();  // 创建右键菜单
    }

    // 初始化列宽，默认80
    initColWidths() {
        this.colWidths = Array(this.colCount).fill(80);
    }
    // 初始化行高，默认24
    initRowHeights() {
        this.rowHeights = Array(this.rowCount).fill(24);
    }
    //初始化行头/列头
    initHeaders() {
        for (let i = 0; i < this.rowCount; i++) new RowHeader(this, i).init();
        for (let i = 0; i < this.colCount; i++) new ColHeader(this, i).init();
    }
    //初始化单元格
    initCells() {
        for (let r = 0; r < this.rowCount; r++) {
            this.cells[r] = [];
            for (let c = 0; c < this.colCount; c++) {
                this.cells[r][c] = new Cell(this, r, c);
                this.cells[r][c].init();
            }
        }
    }
    //更新布局
    updateGrid() {
        this.cellsContainer.style.gridTemplateColumns = this.colWidths.map(w => w + 'px').join(' ');
        this.cellsContainer.style.gridTemplateRows = this.rowHeights.map(h => h + 'px').join(' ');
        this.colHeaders.style.gridAutoColumns = this.colWidths.map(w => w + 'px').join(' ');
        this.rowHeaders.style.gridAutoRows = this.rowHeights.map(h => h + 'px').join(' ');
    }

    getColumnLabel(index) {
        let label = '';
        while (index >= 0) {
            label = String.fromCharCode(65 + (index % 26)) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    }

    clearSelection() {
        this.selectedCell = { row: null, col: null };
        this.selectedRow = null;
        this.selectedCol = null;

        this.rowHeaders.querySelectorAll('.row-header').forEach(el => {
            el.classList.remove('highlight-header', 'active-header');
        });
        this.colHeaders.querySelectorAll('.col-header').forEach(el => {
            el.classList.remove('highlight-header', 'active-header');
        });

        this.cellsContainer.querySelectorAll('.cell').forEach(el => {
            el.classList.remove('selected-cell', 'highlight-row', 'highlight-col');
        });
    }
    selectCell(row, col) {
        this.clearSelection();
        this.selectedCell = { row, col };

        // 选中单元格边框变绿
        this.cells[row][col].el.classList.add('selected-cell');

        // 行头和列头变淡绿
        this.rowHeaders.children[row].classList.add('highlight-header');
        this.colHeaders.children[col].classList.add('highlight-header');
    }

    selectRow(row) {
        this.clearSelection();
        this.selectedRow = row;

        // 行头高亮
        this.rowHeaders.children[row].classList.add('active-header');
        // 该行所有单元格：仅上下边变绿
        for (let c = 0; c < this.colCount; c++) {
            this.cells[row][c].el.classList.add('highlight-row');
        }
    }

    selectCol(col) {
        this.clearSelection();
        this.selectedCol = col;

        // 列头高亮
        this.colHeaders.children[col].classList.add('active-header');

        // 该列所有单元格：仅左右边变绿
        for (let r = 0; r < this.rowCount; r++) {
            this.cells[r][col].el.classList.add('highlight-col');
        }
    }
    //插入删除行和列

}

class Cell {
    constructor(excel, row, col) {
        this.excel = excel;
        this.row = row;
        this.col = col;
        this.value = '';
        this.el = null;
    }

    init() {
        this.el = document.createElement('div');
        this.el.className = 'cell';
        this.el.textContent = '';
        this.excel.cellsContainer.appendChild(this.el);
        this.bindEvent();
    }

    bindEvent() {
        this.el.addEventListener('dblclick', () => this.enterEdit());

        this.el.addEventListener('click', () => {
            this.excel.selectCell(this.row, this.col);
        });
    }

    enterEdit() {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.value;
        input.className = 'cell-input';

        this.el.textContent = '';
        this.el.appendChild(input);
        input.focus();
        input.select();

        const exitEdit = () => {
            this.value = input.value;
            this.el.textContent = this.value;
        };

        input.addEventListener('blur', exitEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    }
}

class RowHeader {
    constructor(excel, index) {
        this.excel = excel;
        this.index = index;
        this.el = null;
        this.resizer = null;//拖拽
        this.menu = null;//菜单
    }

    init() {
        this.el = document.createElement('div');
        this.el.className = 'row-header';
        this.el.textContent = this.index + 1;

        this.resizer = document.createElement('div');
        this.resizer.className = 'row-resizer';
        this.el.appendChild(this.resizer);

        this.excel.rowHeaders.appendChild(this.el);
        this.bindEvent();
    }

    bindEvent() {
        let startY = 0;
        let startHeight = 0;

        this.el.addEventListener('click', () => {
            this.excel.selectRow(this.index);
        });

        this.el.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // 阻止默认右键菜单
            this.excel.showContextMenu(e);
        });

        const onMouseMove = (e) => {
            const delta = e.clientY - startY;
            let newHeight = startHeight + delta;
            if (newHeight < 20) newHeight = 20;
            this.excel.rowHeights[this.index] = newHeight;
            this.excel.updateGrid();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        this.resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startY = e.clientY;
            startHeight = this.excel.rowHeights[this.index];
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}

class ColHeader {
    constructor(excel, index) {
        this.excel = excel;
        this.index = index;
        this.el = null;
        this.resizer = null;
    }

    init() {
        this.el = document.createElement('div');
        this.el.className = 'col-header';
        this.el.textContent = this.excel.getColumnLabel(this.index);

        this.resizer = document.createElement('div');
        this.resizer.className = 'col-resizer';
        this.el.appendChild(this.resizer);

        this.excel.colHeaders.appendChild(this.el);
        this.bindEvent();
    }

    bindEvent() {
        let startX = 0;
        let startWidth = 0;

        this.el.addEventListener('click', () => {
            this.excel.selectCol(this.index);
        });

        const onMouseMove = (e) => {
            const delta = e.clientX - startX;
            let newWidth = startWidth + delta;
            if (newWidth < 20) newWidth = 20;
            this.excel.colWidths[this.index] = newWidth;
            this.excel.updateGrid();
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        this.resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startX = e.clientX;
            startWidth = this.excel.colWidths[this.index];
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}

