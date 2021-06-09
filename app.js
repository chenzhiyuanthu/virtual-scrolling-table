class VirtualScrollingTable {
  constructor(config) {
    this.containerId = config.containerId;
    this.headerHeight = config.headerHeight;
    this.height = (config && config.h + 'px') || '100%';
    this.items = config.items;
    this.itemHeight = config.itemHeight;
    this.columns = config.columns;
    this.generatorFn = (rowNumber) => {
      const item = this.items[rowNumber];
      const row = document.createElement('div');
      row.className = 'table-row';
      row.style.borderBottom = '1px dotted';
      row.style.lineHeight = config.itemHeight + 'px';
      row.style.height = config.itemHeight + 'px';
      row.style.width = '100%';
      row.style.display = 'flex';
      this.columns.forEach(c => {
        const bodyCell = document.createElement('div');
        bodyCell.style.paddingRight = '12px';
        bodyCell.style.width = 1 / this.columns.length * 100 + '%';
        if (c.style) {
          for (let i of Object.keys(c.style)) {
            bodyCell.style[i] = c.style[i];
          }
        }
        const cellContent = document.createElement('span');
        cellContent.innerHTML = item[c.key];
        bodyCell.appendChild(cellContent);
        row.appendChild(bodyCell);
      });
      return row;
    };

    this.totalRows = config.totalRows || (config.items && config.items.length);
    const totalHeight = this.itemHeight * this.totalRows;
    this.scroller = this.createScroller(totalHeight);
    this.container = document.getElementById(this.containerId);
    this.header = this.createHeader();
    this.tableBody = this.createBody();
    this.container.appendChild(this.header);
    this.container.appendChild(this.tableBody);

    const screenItemsLen =
        Math.ceil((config.h - this.headerHeight) / this.itemHeight);
    const cachedItemsLen = screenItemsLen * 3;
    this.renderChunk(this.tableBody, 0, cachedItemsLen / 2);


    let self = this;
    let lastRepaintY;
    let maxBuffer = screenItemsLen * this.itemHeight;

    function onScroll(e) {
      const scrollTop = e.target.scrollTop;
      let first = parseInt(scrollTop / self.itemHeight) - screenItemsLen;
      first = first < 0 ? 0 : first;
      if (!lastRepaintY || Math.abs(scrollTop - lastRepaintY) > maxBuffer) {
        self.renderChunk(self.tableBody, first, cachedItemsLen);
        lastRepaintY = scrollTop;
      }

      e.preventDefault && e.preventDefault();
    }

    this.tableBody.addEventListener('scroll', onScroll);
  }

  createBody() {
    const tableBody = document.createElement('div');
    tableBody.className = 'vst-body';
    tableBody.style.height = `calc(100% - ${this.headerHeight}px)`;
    tableBody.style.fontSize = '14px';
    tableBody.style.position = 'relative';
    tableBody.style.overflowY = 'overlay';
    return tableBody;
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'vst-header';
    header.style.height = this.headerHeight + 'px';
    header.style.lineHeight = this.headerHeight + 'px';
    header.style.fontWeight = 'bold';
    ;
    header.style.borderBottom = '1px solid black';
    header.style.display = 'flex';
    this.enrichColumn();
    this.columns.forEach(_c => {
      const headerCell = document.createElement('div');
      const headerName = document.createElement('span');
      headerName.innerHTML = _c.name;
      headerCell.appendChild(headerName);
      headerCell.className = 'header-cell';
      headerCell.style.width = 1 / this.columns.length * 100 + '%';
      header.appendChild(headerCell);
    });
    return header;
  }

  createScroller(height) {
    const scroller = document.createElement('div');
    scroller.style.height = height + 'px';
    scroller.style.left = 0;
    scroller.style.opacity = 0;
    scroller.style.position = 'absolute';
    scroller.style.top = 0;
    scroller.style.width = '1px';
    return scroller;
  }

  enrichColumn() {
    this.columns.forEach(c => {
      if (c['key'] == null) {
        c['key'] = c['name'];
      }
    });
    console.log(this.columns);
  }

  renderChunk(node, fromPos, howMany) {
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
}

const items = [];
const totalRows = 10000;

for (let i = 0; i < totalRows; i++) {
  items.push({a: Math.random(), b: Math.random(), c: Math.random()});
}

const list = new VirtualScrollingTable({
  w: 600,
  h: 600,
  itemHeight: 30,
  items: items,
  totalRows: totalRows,
  headerHeight: 50,
  containerId: 'table-container',
  columns: [
    {name: 'A', key: 'a', style: {textAlign: 'right', fontWeight: 'normal'}},
    {name: 'B', key: 'b', style: {textAlign: 'right'}},
    {name: 'C', key: 'c', style: {textAlign: 'right'}}
  ]
});
