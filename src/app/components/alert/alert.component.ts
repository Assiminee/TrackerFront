import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-alert',
  imports: [
    NgClass
  ],
  templateUrl: './alert.component.html',
  standalone: true,
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnChanges {
  @Input() success!: boolean;
  @Input() showMsg!: boolean;
  @Input() msg!: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showMsg']) {
      if (changes['showMsg'].isFirstChange())
        return;

      this.showMsg = changes['showMsg'].currentValue;
    }
  }

}
