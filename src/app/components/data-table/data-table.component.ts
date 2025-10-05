import {
  Component,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output,
  signal, SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef, WritableSignal
} from '@angular/core';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {TableRowCheckbox} from '../../interfaces/table-row-checkbox.interface';
import {BaseTableData} from '../../interfaces/base-table-data.interface';
import {Overlay, OverlayModule, OverlayRef} from '@angular/cdk/overlay';
import {PortalModule, TemplatePortal} from '@angular/cdk/portal';
import {NgClass} from '@angular/common';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {EntityService} from '../../interfaces/entity-service.interface';
import {Role} from '../../models/roles.enum';
import {SingleActionWithId} from '../../models/single-action.type';

@Component({
  selector: 'app-data-table',
  imports: [
    MatCheckboxModule, OverlayModule, PortalModule, NgClass
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  standalone: true,
})
export class DataTableComponent implements OnInit, OnChanges {
  readonly entityCheckboxes = signal<TableRowCheckbox>(
    {name: 'all-checks', selected: false}
  );
  @ViewChild("menus", { static: false }) menus?: TemplateRef<any>;
  @ViewChild("statusFilter", { static: false }) statusFilter?: TemplateRef<any>;
  @ViewChild("roleFilter", { static: false }) roleFilter?: TemplateRef<any>;
  @Output() menuOpenEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteIds: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() singleActionIdEmitter: EventEmitter<SingleActionWithId> = new EventEmitter<SingleActionWithId>();
  @Input() data: BaseTableData[] = [];
  @Input() openMenuIndex: string = "";
  @Input() thead!: WritableSignal<DataTableColumn[]>;
  @Input() showDownloadOption!: boolean;
  keys!: string[];
  overlayRef: OverlayRef | null = null;
  idsToDelete: string[] = [];

  protected readonly String = String;
  protected readonly Object = Object;
  @Input() page!: number;
  @Input() entityService!: EntityService;

  constructor(
    private overlay: Overlay,
    private vcr: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    this.keys = this.thead().map(e => e.key);

    // console.log(this.keys);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['data'] && Array.isArray(changes?.['data'].currentValue)) {
      this.initCheckboxSignal();
    }
  }

  initCheckboxSignal() {
    const checkboxStates: TableRowCheckbox[] = this.data.map(
      (data: BaseTableData) => ({name: data.id, selected: false})
    );

    this.entityCheckboxes.set({
      name: this.entityCheckboxes.name,
      selected: false,
      childCheckboxes: checkboxStates,
    })
  }

  someUnchecked() {
    const entityCheckboxes = this.entityCheckboxes();
    if (!entityCheckboxes.childCheckboxes)
      return false;

    return entityCheckboxes.childCheckboxes.some(childCheckbox => childCheckbox.selected) &&
      !entityCheckboxes.childCheckboxes.every(childCheckbox => childCheckbox.selected);
  }

  update(selected: boolean, index?: number) {
    this.entityCheckboxes.update(check => {
      // Parent is checked
      if (index === undefined) {
        // Sets everything (parent and children) to selected
        check.selected = selected;
        check.childCheckboxes?.forEach(r => (r.selected = selected));
      } else {
        // Sets the checked sub-report's "selected" property (based on the event)
        check.childCheckboxes![index].selected = selected;
        // Sets the parent's "selected" property based on whether all sub-reports are checked or not
        check.selected = check.childCheckboxes?.every(r => r.selected) ?? true;
      }

      return {...check};
    });

    const selectedChecks = this.entityCheckboxes()
      .childCheckboxes?.filter(check => check.selected) ?? [];

    this.idsToDelete = selectedChecks.map(check => check.name);

    this.deleteIds.emit(this.idsToDelete);
  }

  toggleMenu(menuIndex: string, event?: MouseEvent) {
    event?.stopPropagation();

    this.openMenuIndex = this.openMenuIndex === menuIndex ? "" : menuIndex;
    this.menuOpenEvent.emit(this.openMenuIndex);

    if (this.openMenuIndex === "")
      return;

    const origin = (event?.currentTarget ?? null) as HTMLElement | null;

    if (!origin || !this.menus) return;

    this.applyOverlay(origin, this.menus, menuIndex);
  }

  applyOverlay(origin: HTMLElement | null | undefined, ref?: TemplateRef<any>, menuIndex?: string) {
    if (!ref || !origin)
      return;

    // close any old overlay
    this.overlayRef?.dispose();

    // 1) create a position strategy connected to the origin
    const strategy = this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions([
        {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top', offsetY: 0},
      ])
      .withPush(true);

    // 2) configure scroll/backdrop etc.
    this.overlayRef = this.overlay.create({
      positionStrategy: strategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    // 3) close on backdrop click
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());

    // 4) attach your menu template, passing the entryId as context
    const portal = new TemplatePortal(ref, this.vcr, menuIndex !== undefined ? {$implicit: menuIndex} : undefined);
    this.overlayRef.attach(portal);
  }

  getEntryValue(entry: BaseTableData, key: string): any {
    // console.log(entry)
    if (['createdAt', 'updatedAt'].includes(key)) {
      const date = new Date(entry[key]);

      if (!date)
        return ''

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric',
      };

      return date.toLocaleDateString(undefined, options);
    }

    if (key === 'deleted')
      return entry['deleted'] ? 'Deleted' : 'Active';

    return this.entityService.getEntryValue(key, entry);
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }

  toggleSortOrder(key: string) {
    this.thead.update(col => col.map(c => {
        if (c.sortable && c.sortOrder) {
          if (c.key === key)
            return {...c, sortOrder: c.sortOrder === 'ASC' ? 'DESC' : 'ASC', isEnabled: true};

          return {...c, isEnabled: false};
        }
        return c;
      })
    );
  }

  constructImageSrc(entry: DataTableColumn) {
    if (entry.isDate)
      return `/${entry.sortOrder}.png`;
    else if (entry.isEnum || entry.isFlag)
      return `/dropdown.png`;
    else
      return `/${entry.sortOrder === 'ASC' ? 'Z-A' : 'A-Z'}.png`;
  }

  isBadge(key: string): boolean {
    return this.thead().find(
      entry => entry.key === key && entry.badge !== undefined
    ) !== undefined;
  }

  getCustomCssClass(key: string, row: BaseTableData): string {
    const entry = this.thead().find(
      entry => entry.key === key && entry.customCssClass !== undefined
    );

    if (entry === undefined)
      return '';

    if (entry.customCssClass === undefined)
      return '';

    if (typeof entry.customCssClass === 'string')
      return entry.customCssClass;

    return entry.customCssClass?.[String(row?.[key])];
  }

  openSortMenu(entry: DataTableColumn, event?: MouseEvent) {
    const ref = entry.isFlag ? this.statusFilter : this.roleFilter;
    const origin = (event?.currentTarget ?? null) as HTMLElement | null;

    if (!origin || !ref) return;

    this.applyOverlay(origin, ref);
  }

  setFilter(value: boolean | string | null, key: string): void {
    this.thead.update(cols => cols.map(c => {
        if (c.key === key)
          return {...c, filterBy: value};

        return c;
      })
    );
  }

  emitId(entryId: string, action: number) {
    this.overlayRef?.dispose();
    this.singleActionIdEmitter.emit({id: entryId, action: action});
  }

  protected readonly Role = Role;
}
