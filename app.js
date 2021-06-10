class Formatter {
  static format(n, precision = 3) {
    return Math.round(n * Math.pow(10, precision)) / Math.pow(10, precision);
  }
}

class VirtualScrollingTable {
  #DEFAULT_THEME = {
    backgroundColor1: '#323232',
    backgroundColor2: '#474747',
    borderColor1: '#636363',
    borderColor2: '#535353',
    fontColor: '#ececec',
    fontSize: '14px'
  };

  constructor(config) {
    this.containerId = config.containerId;
    this.headerHeight = config.headerHeight;
    this.height = (config && config.h + 'px') || '100%';
    this.columns = config.columns;
    this.data = config.items;
    this.columnWidths = this.updateData(this.data);
    console.log(this.columnWidths);
    this.itemHeight = config.itemHeight;
    this.generatorFn = (rowNumber) => {
      const item = this.data[rowNumber];
      const row = document.createElement('div');
      row.style.width = '100%';
      row.className = 'table-row';
      const _tmpLineHeight = Math.ceil(config.itemHeight / 2);
      row.style.height = config.itemHeight + 'px';
      [0, 1].forEach(i => {
        const _row = document.createElement('div');
        _row.className = 'real-table-row';
        _row.style.lineHeight = (_tmpLineHeight + 1) + 'px';
        _row.style.height = _tmpLineHeight + 'px';
        _row.style.width = '100%';
        _row.style.display = 'flex';

        _row.style.backgroundColor = i == 0 ?
            this.#DEFAULT_THEME.backgroundColor1 :
            this.#DEFAULT_THEME.backgroundColor2;

        this.columns.forEach((c, index, arr) => {
          const bodyCell = document.createElement('div');
          bodyCell.style.paddingRight = '12px';
          // bodyCell.style.width = 1 / this.columns.length * 100 + '%';
          bodyCell.style.width = this.columnWidths[c.key] * 100 + '%';
          index != arr.length - 1 &&
              (bodyCell.style.borderRight =
                   `1px solid ${this.#DEFAULT_THEME.borderColor2}`);
          if (c.style) {
            for (let i of Object.keys(c.style)) {
              bodyCell.style[i] = c.style[i];
            }
          }
          const cellContent = document.createElement('span');
          cellContent.innerHTML = i == 0 ? item[c.key] : '';
          bodyCell.appendChild(cellContent);
          _row.appendChild(bodyCell);
        });
        row.append(_row);
      });
      return row;
    };

    this.totalRows = config.totalRows || (config.items && config.items.length);
    const totalHeight = this.itemHeight * this.totalRows;
    this.scroller = this._createScroller(totalHeight);
    this.container = document.getElementById(this.containerId);
    this.container.style.backgroundColor = '#323232';
    this.container.style.color = this.#DEFAULT_THEME.fontColor;
    this.header = this._createHeader();
    this.tableBody = this._createBody();
    this.container.appendChild(this.header);
    this.container.appendChild(this.tableBody);

    const screenItemsLen =
        Math.ceil((config.h - this.headerHeight) / this.itemHeight);
    const cachedItemsLen = screenItemsLen * 3;
    this._renderChunk(this.tableBody, 0, cachedItemsLen / 2);


    let self = this;
    let lastRepaintY;
    let maxBuffer = screenItemsLen * this.itemHeight;

    function onScroll(e) {
      const scrollTop = e.target.scrollTop;
      let first = parseInt(scrollTop / self.itemHeight) - screenItemsLen;
      first = first < 0 ? 0 : first;
      if (!lastRepaintY || Math.abs(scrollTop - lastRepaintY) > maxBuffer) {
        self._renderChunk(self.tableBody, first, cachedItemsLen);
        lastRepaintY = scrollTop;
      }

      e.preventDefault && e.preventDefault();
    }

    this.tableBody.addEventListener('scroll', onScroll);
  }

  _createBody() {
    const tableBody = document.createElement('div');
    tableBody.className = 'vst-body';
    tableBody.style.height = `calc(100% - ${this.headerHeight}px)`;
    tableBody.style.fontSize = '14px';
    tableBody.style.position = 'relative';
    tableBody.style.overflowY = 'overlay';
    return tableBody;
  }

  _createHeader() {
    const header = document.createElement('div');
    header.className = 'vst-header';
    header.style.height = this.headerHeight + 'px';
    header.style.lineHeight = this.headerHeight + 'px';
    header.style.borderTop = '2px solid #636363';
    header.style.display = 'flex';
    this._enrichColumn();
    this.columns.forEach((c, index, arr) => {
      const headerCell = document.createElement('div');
      const headerName = document.createElement('span');
      headerName.innerHTML = c.name;
      headerCell.appendChild(headerName);
      headerCell.className = 'header-cell';
      (index != arr.length - 1) &&
          (headerCell.style.borderRight =
               `1px solid ${this.#DEFAULT_THEME.borderColor2}`);
      headerCell.style.width = (this.columnWidths[c.key] * 100) + '%';
      header.appendChild(headerCell);
    });
    return header;
  }

  _createScroller(height) {
    const scroller = document.createElement('div');
    scroller.style.height = height + 'px';
    scroller.style.left = 0;
    scroller.style.opacity = 0;
    scroller.style.position = 'absolute';
    scroller.style.top = 0;
    scroller.style.width = '1px';
    return scroller;
  }

  _enrichColumn() {
    this.columns.forEach(c => {
      if (c['key'] == null) {
        c['key'] = c['name'];
      }
    });
  }

  _renderChunk(node, fromPos, howMany) {
    let fragment = document.createDocumentFragment();
    fragment.appendChild(this.scroller);

    let finalItem = fromPos + howMany;
    if (finalItem > this.totalRows) finalItem = this.totalRows;

    for (let i = fromPos; i < finalItem; i++) {
      let item;
      if (this.generatorFn) item = this.generatorFn(i)

        item.classList.add('vrow');
      item.style.position = 'absolute';
      item.style.top = i * this.itemHeight + 'px';
      fragment.appendChild(item);
    }

    node.innerHTML = '';
    node.appendChild(fragment);
  }

  updateData(data) {
    this.data = data;
    return this._calculateColumnWidth();
  }

  /**
   * Adjust column width fitting the content length.
   */
  _calculateColumnWidth() {
    const res = {};
    if (this.data) {
      let total = 0;

      this.data.forEach(d => {
        this.columns.forEach(c => {
          const l = d[c.key].toString().length;

          if (res[c.key] == null) {
            res[c.key] = 0;
          }

          if (l > res[c.key]) {
            total -= res[c.key];
            res[c.key] = l;
            total += l;
          };
        });
      });

      Object.keys(res).forEach(k => {
        const v = res[k];
        res[k] = v / total;
      });
    }

    return res;
  }
}

const items = [];
const totalRows = 1000000;

for (let i = 0; i < totalRows; i++) {
  const q = Formatter.format;
  items.push(
      {a: q(Math.random()), b: q(Math.random(), 10), c: q(Math.random(), 5)});
}

const list = new VirtualScrollingTable({
  w: 600,
  h: 600,
  itemHeight: 35,
  items: items,
  totalRows: totalRows,
  headerHeight: 50,
  containerId: 'table-container',
  columns: [
    {name: 'Type', key: 'a', style: {textAlign: 'right', fontWeight: 'normal'}},
    {name: 'Car No.', key: 'b', style: {textAlign: 'right'}},
    {name: 'Destination', key: 'c', style: {textAlign: 'right'}}
  ]
});

