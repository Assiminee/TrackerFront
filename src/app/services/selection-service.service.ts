import {ElementRef, Injectable} from '@angular/core';
import {getLetter} from '../core/utils/helpers';

type BoxViewport = {
  left: number,
  top: number,
  right: number,
  bottom: number,
}

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  constructor() {
  }

  toContainerCoords(evt: MouseEvent, containerRect: DOMRect, gridContainer: ElementRef) {
    const rect = containerRect ?? gridContainer.nativeElement.getBoundingClientRect();
    const x = evt.clientX - rect.left + gridContainer.nativeElement.scrollLeft;
    const y = evt.clientY - rect.top + gridContainer.nativeElement.scrollTop;

    return {x, y};
  }

  locateSelectedCells(ref: { nativeElement: any; }, cRect: DOMRect, boxViewport: BoxViewport, hits: string[]) {
    const cell = ref.nativeElement;
    const rect = cell.getBoundingClientRect();

    if (
      rect.right < cRect.left || rect.left > cRect.right ||
      rect.bottom < cRect.top || rect.top > cRect.bottom
    ) return;
    const intersect =
      rect.left < boxViewport.right &&
      rect.right > boxViewport.left &&
      rect.top < boxViewport.bottom &&
      rect.bottom > boxViewport.top;
    if (intersect) {
      const r = Number(cell.dataset['row']);
      const c = Number(cell.dataset['col']);
      hits.push(`${r},${c}`);
    }
  }

  getBoxViewport(container: HTMLDivElement, cRect: DOMRect,
                 startX: number, currentX: number,
                 startY: number, currentY: number): BoxViewport {
    return {
      left:
        Math.min(startX, currentX) - container.scrollLeft + cRect.left,
      top:
        Math.min(startY, currentY) - container.scrollTop + cRect.top,
      right:
        Math.max(startX, currentX) - container.scrollLeft + cRect.left,
      bottom:
        Math.max(startY, currentY) - container.scrollTop + cRect.top,
    };
  }
}


