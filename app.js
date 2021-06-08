class VirtualScrollingTable {
  constructor(config) {
    this.containerId = config.containerId;
    this.generatorFn = config.generatorFn;
    this.headerHeight = config.headerHeight;
    this.height = (config && config.h + 'px') || '100%';
    this.itemHeight = config.itemHeight;
    this.items = config.items;
    this.totalRows = config.totalRows || (config.items && config.items.length);
    this.columns = config.columns;

    const totalHeight = this.itemHeight * this.totalRows;
    this.scroller = this.createScroller(totalHeight);
    this.container = document.getElementById(this.containerId);
    this.header = this.createHeader();
    this.tableBody = this.createBody();
    this.container.appendChild(this.header);
    this.container.appendChild(this.tableBody);
    this.tableBody.appendChild(this.scroller);
  }

  createBody() {
    const tableBody = document.createElement('div');
    tableBody.className = 'vst-body';
    tableBody.style.height = `calc(100% - ${this.headerHeight}px)`;
    tableBody.style.position = 'relative';
    tableBody.style.overflowY = 'overlay';
    return tableBody;
  }

  createHeader() {
    console.log(this.columns);
    const header = document.createElement('div');
    header.className = 'vst-header';
    header.style.height = this.headerHeight + 'px';
    header.style.boxShadow = '0px 3px 6px #00000024';
    header.style.display = 'flex';
  
        
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
}

const list = new VirtualScrollingTable({
  w: 600,
  h: 600,
  itemHeight: 30,
  totalRows: 1000,
  headerHeight: 50,
  generatorFn: row => {},
  containerId: 'table-container',
  columns: [{name: 'A', key: 'a'}, {name: 'B', key: 'b'}, {name: 'C', key: 'c'}]
});
