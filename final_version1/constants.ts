import { Role, RoleName } from './types';

export const ROLES: Record<RoleName, Role> = {
  "Admin": { level: -1, name: "System Admin" },
  "CEO": { level: 0, name: "CEO" },
  "PM": { level: 1, name: "Program Manager" },
  "SME": { level: 1, name: "Subject Matter Expert" },
  "L&D Manager": { level: 1, name: "L&D Manager" },
  "Campus Manager": { level: 2, name: "Campus Manager" },
  "Campus In-charge": { level: 3, name: "Campus In-charge" },
  "Mentor": { level: 4, name: "Mentor" },
};
