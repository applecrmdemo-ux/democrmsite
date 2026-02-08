import { useAuth } from "@/contexts/AuthContext";
import {
  canRead,
  canWrite,
  canDelete,
  canEditInventoryStock,
  canTechnicianUpdateRepairField,
  type Resource,
  type Role,
} from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuth();
  const role = (user?.role ?? "Customer") as Role;

  return {
    role,
    canRead: (r: Resource) => canRead(role, r),
    canWrite: (r: Resource) => canWrite(role, r),
    canDelete: (r: Resource) => canDelete(role, r),
    canEditInventoryStock: () => canEditInventoryStock(role),
    canTechnicianUpdateRepairField,
    isCustomer: role === "Customer",
    isTechnician: role === "Technician",
    customerId: user?.customerId,
    username: user?.username,
  };
}
