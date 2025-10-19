import {Column} from '../../models/report/shared/column.interface';
import {Operation, Orientation, ShiftParameters, SourceTarget} from './shift-parameters.interface';
import {GridCell} from '../../core/utils/sheet-map.types';
import {SubColumn} from '../../models/report/shared/sub-column.interface';
import {Table} from '../../models/report/shared/table.interface';

export function shiftGridCells(
  table: Table, column: Column, shiftParameters: ShiftParameters,
  sourceGridCell: GridCell | null, targetGridCell: GridCell | null
) {
  if (sourceGridCell !== null && !column.subColumns.length) return;
  if (targetGridCell !== null && column.subColumns.length < 1) return;

  const increment = shiftParameters.operation === Operation.ADD ? 1 : -1;
  table.endingColumn += increment;

  const triggerIsColumn = shiftParameters.actionTrigger === SourceTarget.Column;
  const triggerIsSubColumn = shiftParameters.actionTrigger === SourceTarget.SubColumn;
  const toTheLeft = shiftParameters.orientation === Orientation.ToTheLeft;
  const toTheRight = shiftParameters.orientation === Orientation.ToTheRight;

  table.columns.forEach((col: Column) => {
    const skip = (column.columnIndex > col.columnIndex) ||
      (
        sourceGridCell && triggerIsColumn && toTheRight &&
        column.id.toLowerCase() == col.id.toLowerCase()
      );

    if (skip) return;

    col.subColumns.forEach((subCol: SubColumn) => {
      const skip = (
        sourceGridCell && triggerIsSubColumn &&
        (toTheLeft && subCol.subColumnIndex < sourceGridCell.columnIndex ||
          toTheRight && subCol.subColumnIndex <= sourceGridCell.columnIndex)
      )

      if (skip) return;
      if (targetGridCell && subCol.subColumnIndex < targetGridCell.columnIndex) return;
      subCol.subColumnIndex += increment;
    });
    if (column.id.toLowerCase() !== col.id.toLowerCase()) col.columnIndex += increment;
  })
}


export function getShiftParameters(operation: Operation, toTheLeft: boolean, gridCell?: GridCell) : ShiftParameters {
  let trigger = SourceTarget.SubColumn;

  if (gridCell) trigger = gridCell.isHeaderCell ? SourceTarget.Column : SourceTarget.SubColumn;

  return {
    actionTrigger: trigger,
    actionTarget: SourceTarget.SubColumn,
    operation: operation,
    orientation: toTheLeft ? Orientation.ToTheLeft : Orientation.ToTheRight
  }
}
