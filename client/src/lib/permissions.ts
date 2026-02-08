/**
 * Role-Based Access Control (RBAC) for the CRM.
 * Defines read/write/delete permissions per role per resource.
 */

export type Role = "Admin" | "Manager" | "Sales" | "Technician" | "Customer";

export type Resource =
  | "customers"
  | "sales"       // orders
  | "repairs"
  | "inventory"   // products
  | "analytics"   // dashboard
  | "appointments"
  | "leads";

/** Maps nav routes to resources for sidebar visibility */
export const ROUTE_TO_RESOURCE: Record<string, Resource> = {
  "/": "analytics",
  "/dashboard": "analytics",
  "/customers": "customers",
  "/leads": "leads",
  "/products": "inventory",
  "/repairs": "repairs",
  "/orders": "sales",
  "/appointments": "appointments",
};

/** Read permissions by role */
const READ_MATRIX: Record<Role, Resource[]> = {
  Admin: ["customers", "sales", "repairs", "inventory", "analytics", "appointments", "leads"],
  Manager: ["customers", "sales", "repairs", "inventory", "analytics", "appointments"],
  Sales: ["customers", "inventory", "sales", "leads"],
  Technician: ["repairs"],
  Customer: ["repairs", "appointments", "sales", "leads"],
};

/** Write permissions by role (create/update) */
const WRITE_MATRIX: Record<Role, Resource[]> = {
  Admin: ["customers", "sales", "repairs", "inventory", "analytics", "appointments", "leads"],
  Manager: ["customers", "inventory", "repairs", "appointments"],
  Sales: ["customers", "sales", "leads"],
  Technician: ["repairs"],
  Customer: ["appointments", "leads"],
};

/** Delete permissions by role */
const DELETE_MATRIX: Record<Role, Resource[]> = {
  Admin: ["customers", "sales", "repairs", "inventory", "appointments", "leads"],
  Manager: ["customers", "repairs", "appointments"],
  Sales: [],
  Technician: [],
  Customer: [],
};

/** Manager cannot delete financial records (orders) */
function canDeleteFinancial(role: Role): boolean {
  return role === "Admin";
}

/** Technician: limited write - only status + notes on repairs */
export function canTechnicianUpdateRepairField(field: string): boolean {
  return ["status", "technicianNotes"].includes(field);
}

export function canRead(role: Role, resource: Resource): boolean {
  return READ_MATRIX[role]?.includes(resource) ?? false;
}

export function canWrite(role: Role, resource: Resource): boolean {
  return WRITE_MATRIX[role]?.includes(resource) ?? false;
}

export function canDelete(role: Role, resource: Resource): boolean {
  if (resource === "sales" && !canDeleteFinancial(role)) return false;
  return DELETE_MATRIX[role]?.includes(resource) ?? false;
}

/** Sales cannot edit inventory stock directly - only read products */
export function canEditInventoryStock(role: Role): boolean {
  return role === "Admin" || role === "Manager";
}

/** Check if role can access a nav route */
export function canAccessRoute(role: Role, path: string): boolean {
  const resource = ROUTE_TO_RESOURCE[path];
  if (!resource) return false;
  return canRead(role, resource);
}

/** Landing path after login by role (Admin/Owner and Manager → dashboard, Sales → customers, Technician → /) */
export const LANDING_PATH_BY_ROLE: Record<Role, string> = {
  Admin: "/dashboard",
  Manager: "/dashboard",
  Sales: "/customers",
  Technician: "/",
  Customer: "/appointments",
};

/** Customer sees only their own data - filtered client-side by customerId */
export function isCustomerScoped(role: Role): boolean {
  return role === "Customer";
}

/** Technician sees only assigned repairs - filter by technicianId matching username */
export function isTechnicianScoped(role: Role): boolean {
  return role === "Technician";
}
