import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-list-header',
  imports: [],
  templateUrl: './list-header.component.html',
  styleUrl: './list-header.component.css'
})
export class ListHeaderComponent {
  @Output() changeDisplayEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() toggleOptionsMenuEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isListDisplay : boolean = false;
  @Input() openOptionsMenu: boolean = false;

  changeDisplay(list: boolean) {
    this.isListDisplay = list;
    this.changeDisplayEvent.emit(this.isListDisplay);
  }

  toggleOptions(event?: MouseEvent) {
    event?.stopPropagation();
    this.openOptionsMenu = !this.openOptionsMenu;
    this.toggleOptionsMenuEvent.emit(this.isListDisplay);
  }
}
