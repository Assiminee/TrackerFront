import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {NgClass, NgStyle} from '@angular/common';
import {MockDataService} from '../../services/mock-data.service';
import {ReportData} from '../../interfaces/report-data.interface';

@Component({
  selector: 'app-spreadsheets',
  imports: [
    MainComponent,
    NgStyle,
    NgClass
  ],
  templateUrl: './spreadsheets.component.html',
  styleUrl: './spreadsheets.component.css'
})
export class SpreadsheetsComponent {
  constructor(mockDataService: MockDataService) {
    this.getArr(this.cols).forEach((i) => {
      this.letters.push(this.getLetter(i + 1));
    });

    this.data = mockDataService.getMockReports();
    console.log(this.data);
  }

  getRow(i: number) {
    let data : string[] | ReportData;

    if (i === 0) {
      data = this.letters;
      console.log('Letters: ', data);
      return data;
    }

    if (i > this.data.length)
      return [...Array(this.cols).keys()].map((i) => '');

    i = i - 1;
    data = this.data[i]

    if (i === 0) {
      data = Object.keys(data)
      if (data.length < this.cols) {
        const tst = [...Array(this.cols - data.length).keys()].map(key => '');
        data.push(...tst);
      }
      console.log('Keys: ', data);
      return data;
    }

    data = Object.values(data)
    if (data.length < this.cols) {
      const tst = [...Array(this.cols - data.length).keys()].map(key => '');
      data.push(...tst);
    }
    console.log('Values:', data);
    return data;
  }

  getTh() {
    return Object.keys(this.data[0]);
  }

  cols: number = 50;
  rows: number = 200;
  letters: string[] = [];
  data !: ReportData[];

  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('cellEl', { read: ElementRef }) cellEls!: QueryList<ElementRef<HTMLTableCellElement>>;

  // drag state
  dragging = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  selectionBox: Record<string, string> = {};
  containerRect!: DOMRect;

  // selection store as "r,c"
  private selected = new Set<string>();

  ngAfterViewInit(): void {
    // nothing special here, but QueryList will be ready
  }

  /** public helper for template */
  isCellSelected(row: number, col: number) {
    return this.selected.has(this.key(row, col));
  }

  // mouse handlers
  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return; // left click only
    // start drag in container coords
    this.containerRect = this.gridContainer.nativeElement.getBoundingClientRect();
    const { x, y } = this.toContainerCoords(event);
    this.dragging = true;
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
    this.updateBox();
    // optional: clear previous selection unless Ctrl/Meta for additive
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
      this.selected.clear();
    }
    // prevent text selection
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.dragging) return;
    const { x, y } = this.toContainerCoords(event);
    this.currentX = x;
    this.currentY = y;
    this.updateBox();
    this.applyHitTest(event);
  }

  onMouseUp(_event: MouseEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    // keep final box for a beat or clear immediately:
    this.selectionBox = {};
  }

  // --- utils ---

  private toContainerCoords(evt: MouseEvent) {
    // position inside the scrollable container viewport
    const rect = this.containerRect ?? this.gridContainer.nativeElement.getBoundingClientRect();
    const x = evt.clientX - rect.left + this.gridContainer.nativeElement.scrollLeft;
    const y = evt.clientY - rect.top + this.gridContainer.nativeElement.scrollTop;
    return { x, y };
  }

  private updateBox() {
    // style object for the marquee rectangle (absolute inside container, uses scroll offsets)
    const left = Math.min(this.startX, this.currentX);
    const top = Math.min(this.startY, this.currentY);
    const width = Math.abs(this.currentX - this.startX);
    const height = Math.abs(this.currentY - this.startY);
    this.selectionBox = {
      left: `${left - this.gridContainer.nativeElement.scrollLeft}px`,
      top: `${top - this.gridContainer.nativeElement.scrollTop}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }

  private applyHitTest(event: MouseEvent) {
    const add = event.ctrlKey || event.metaKey || event.shiftKey; // additive selection
    const hits = this.hitCellsInCurrentBox();
    // if not additive, start from cleared set each move
    const base = add ? new Set(this.selected) : new Set<string>();
    hits.forEach((k) => base.add(k));
    this.selected = base;
  }

  private hitCellsInCurrentBox(): string[] {
    const container = this.gridContainer.nativeElement;
    const cRect = container.getBoundingClientRect();

    // selection box in viewport coordinates (like getBoundingClientRect)
    const boxViewport = {
      left:
        Math.min(this.startX, this.currentX) - container.scrollLeft + cRect.left,
      top:
        Math.min(this.startY, this.currentY) - container.scrollTop + cRect.top,
      right:
        Math.max(this.startX, this.currentX) - container.scrollLeft + cRect.left,
      bottom:
        Math.max(this.startY, this.currentY) - container.scrollTop + cRect.top,
    };

    const hits: string[] = [];
    this.cellEls.forEach((ref: { nativeElement: any; }) => {
      const td = ref.nativeElement;
      const rect = td.getBoundingClientRect();

      // quick reject if outside container viewport entirely
      if (
        rect.right < cRect.left ||
        rect.left > cRect.right ||
        rect.bottom < cRect.top ||
        rect.top > cRect.bottom
      ) {
        return;
      }

      // intersect selection box vs cell in viewport coords
      const intersect =
        rect.left < boxViewport.right &&
        rect.right > boxViewport.left &&
        rect.top < boxViewport.bottom &&
        rect.bottom > boxViewport.top;

      if (intersect) {
        const r = Number(td.dataset['row']);
        const c = Number(td.dataset['col']);
        hits.push(this.key(r, c));
      }
    });
    return hits;
  }

  private key(r: number, c: number) {
    return `${r},${c}`;
  }

  getLetter(n: number) : string {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("n must be a positive integer (1-based).");
    }

    let result = "";

    while (n > 0) {
      n--; // shift to 0-based
      const rem = n % 26;
      result = String.fromCharCode(65 + rem) + result; // 65 = 'A'
      n = Math.floor(n / 26);
    }

    return result;
  }

  getArr(len: number) {
    return [...Array(len).keys()];
  }

  incrementCols() {
    this.cols += 1;
  }

  incrementRows() {
    this.rows += 1;
  }

  protected readonly Object = Object;
}
