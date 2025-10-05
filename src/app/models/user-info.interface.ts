export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export function isUserInfo(obj: any): obj is UserInfo {
  return (
    obj && typeof obj === 'object' &&
    'id' in obj &&
    'firstName' in obj &&
    'lastName' in obj
  );
}
