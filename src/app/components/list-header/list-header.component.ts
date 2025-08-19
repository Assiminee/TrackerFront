import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-list-header',
  imports: [],
  templateUrl: './list-header.component.html',
  standalone: true,
  styleUrl: './list-header.component.css'
})
export class ListHeaderComponent {
  @Output() changeDisplayEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() toggleOptionsMenuEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() deleteSelectedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isListDisplay : boolean = false;
  @Input() openOptionsMenu: boolean = false;
  @Input() showDownloadOption: boolean = true;
  @Input() entity: string = '';
  @Input() subTitle: string = '';
  @Output() openModal : EventEmitter<boolean> = new EventEmitter<boolean>();

  formatTitle(): string {
    return this.entity.charAt(0).toUpperCase() + this.entity.slice(1).toLowerCase();
  }

  changeDisplay(list: boolean) {
    this.isListDisplay = list;
    this.changeDisplayEvent.emit(this.isListDisplay);
  }

  toggleOptions(event?: MouseEvent) {
    event?.stopPropagation();
    this.openOptionsMenu = !this.openOptionsMenu;
    this.toggleOptionsMenuEvent.emit(this.isListDisplay);
  }

  deleteAll() {
    this.deleteSelectedEvent.emit(true);
  }

  open() {
    this.openModal.emit(true);
  }
}
