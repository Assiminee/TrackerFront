export enum Role {
  Admin = 'ROLE_SA',
  TeamMember = 'ROLE_TM',
  ProjectManager = 'ROLE_PM',
}

export const VALID_ROLES = Object.values(Role).map(role => role.toString());

export function getRole(role: string) {
  const entry = Object.entries(Role)
    .find(([_, value]) => value === role.toUpperCase());

  return entry !== undefined ? entry[1] : null;
}

export function isAdmin(role: string) {
  const roleFound = getRole(role);

  if (roleFound === null)
    return null;

  return roleFound === Role.Admin;
}

export function isTmOrPm(role: string) {
  const roleFound = getRole(role);

  if (roleFound === null)
    return null;

  return [Role.ProjectManager, Role.TeamMember].includes(roleFound);
}

export function getRoleName(role: string) {
  if (isAdmin(role))
    return 'Administrator';

  if (isTmOrPm(role)) {
    if (role.toUpperCase().endsWith('_TM'))
      return 'Team Member';

    return 'Project Manager';
  }

  return null;
}

export function isValidRole(role: string) {
  return VALID_ROLES.includes(role.toUpperCase());
}


