export interface ShiftParameters {
  actionTrigger: SourceTarget;
  actionTarget: SourceTarget;
  operation: Operation;
  orientation: Orientation;
}

export enum SourceTarget {
  Column,
  SubColumn
}

export enum Orientation {
  ToTheLeft,
  ToTheRight
}

export enum Operation {
  ADD,
  REMOVE
}
