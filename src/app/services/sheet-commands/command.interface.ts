export interface Command {
  execute(): boolean;
  undo(): boolean;
  redo(): boolean;
}

export function executeCommand<T extends Command>(CommandClass: new (...args: any[]) => T, undoArray: T[], ...args: any[]
): boolean {
  const commandInstance = new CommandClass(...args);
  if (commandInstance.execute()) {
    undoArray.push(commandInstance);
    return true;
  }
  return false;
}
