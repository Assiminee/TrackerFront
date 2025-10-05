export interface TeamInfo {
  id: string;
  name: string;
}

export function isTeamInfo(obj: any): obj is TeamInfo {
  return (
    obj && typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj
  );
}
