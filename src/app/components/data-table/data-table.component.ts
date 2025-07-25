import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
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

@Component({
  selector: 'app-data-table',
  imports: [
    MatCheckboxModule, OverlayModule, PortalModule, NgClass
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  standalone: true,
})
export class DataTableComponent implements OnInit {
  readonly entityCheckboxes = signal<TableRowCheckbox>(
    {name: 'all-checks', selected: false}
  );
  @ViewChild("menus") menus: TemplateRef<any> = new TemplateRef();
  @ViewChild("statusFilter") statusFilter: TemplateRef<any> = new TemplateRef();
  @ViewChild("roleFilter") roleFilter: TemplateRef<any> = new TemplateRef();
  @Output() menuOpenEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteIds: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Input() data: BaseTableData[] = [];
  @Input() openMenuIndex: string = "";
  @Input() thead!: WritableSignal<DataTableColumn[]>;
  @Input() showDownloadOption!: boolean;
  keys!: string[];
  values!: string[];
  overlayRef: OverlayRef | null = null;
  roles: Record<string, string> = {
    ROLE_PM: 'Project Manager',
    ROLE_TM: 'Team Member',
    ROLE_SA: 'Administrator'
  }
  idsToDelete: string[] = [];

  protected readonly String = String;
  protected readonly Object = Object;
  @Input() page!: number;

  constructor(
    private overlay: Overlay,
    private vcr: ViewContainerRef,
  ) {
  }

  ngOnInit(): void {
    this.initCheckboxSignal();
    this.keys = this.thead().map(e => e.key);
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
    console.log('Ids to delete from table component', this.idsToDelete);

    this.deleteIds.emit(this.idsToDelete);
  }

  toggleMenu(menuIndex: string, event?: MouseEvent) {
    event?.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === menuIndex ? "" : menuIndex;
    this.menuOpenEvent.emit(this.openMenuIndex);

    if (this.openMenuIndex === "")
      return;

    this.applyOverlay(event?.currentTarget as HTMLElement, this.menus, menuIndex);
  }

  applyOverlay(origin: HTMLElement, ref: TemplateRef<any>, menuIndex?: string) {
    if (origin === null)
      return;

    // close any old overlay
    this.overlayRef?.dispose();

    // 1) create a position strategy connected to the origin
    const strategy = this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions([
        {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top', offsetY: 0},
        // {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 0},
      ]);

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
    if (!entry.hasOwnProperty(key))
      return "";

    if (entry?.[key] instanceof Date)
      return String(entry[key]).split(" GMT")[0];

    if (key === 'deleted')
      return entry['deleted'] ? 'Deleted' : 'Active';

    if (key === 'role')
      return this.roles[entry['role']];

    if (key === 'pm') {
      if (entry['pm'] === null)
        return '';

      return entry?.['pm']?.['lastName'] + " " + entry['pm']?.['firstName'];
    }
    return entry[key];
  }

  viewEntry(id: string) {
    console.log(`Viewing entry ${id}`)
  }

  editEntry(id: string) {
    console.log(`Editing entry ${id}`)
  }

  deleteEntries(id?: string) {
    if (id !== undefined) {
      console.log(`Deleting entry ${id}`);
      return;
    }
  }

  downloadEntries(id?: string) {
    if (id !== undefined) {
      console.log(`Downloading entry ${id}`);
      return;
    }

    const selectedChecks = this.entityCheckboxes()
      .childCheckboxes?.filter(check => check.selected) ?? [];

    console.log("Downloading multiple entries");
    for (const check of selectedChecks) {
      console.log(`Downloading entry ${check.name}`);
    }
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

    if (ref === undefined)
      return;

    this.applyOverlay(event?.currentTarget as HTMLElement, ref);
  }

  setFilter(value: boolean | string | null, key: string): void {
    this.thead.update(cols => cols.map(c => {
        if (c.key === key)
          return {...c, filterBy: value};

        return c;
      })
    );
  }
}
