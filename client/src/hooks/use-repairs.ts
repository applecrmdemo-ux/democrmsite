import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertRepair } from "@shared/routes";
import { apiUrl } from "@/lib/api";

export function useRepairs(status?: string, search?: string) {
  return useQuery({
    queryKey: [api.repairs.list.path, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const url = apiUrl(`${api.repairs.list.path}?${params.toString()}`);
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch repairs");
      return api.repairs.list.responses[200].parse(await res.json());
    },
  });
}

export function useRepair(id: string | null | undefined) {
  return useQuery({
    queryKey: [api.repairs.get.path, id],
    queryFn: async () => {
      const url = apiUrl(buildUrl(api.repairs.get.path, { id: id! }));
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch repair");
      return api.repairs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRepair) => {
      const res = await fetch(apiUrl(api.repairs.create.path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create repair");
      return api.repairs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.repairs.list.path] });
    },
  });
}

export function useUpdateRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InsertRepair>) => {
      const url = apiUrl(buildUrl(api.repairs.update.path, { id }));
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update repair");
      return api.repairs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.repairs.list.path] });
    },
  });
}

export function useDeleteRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = apiUrl(buildUrl(api.repairs.delete.path, { id }));
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete repair");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.repairs.list.path] });
    },
  });
}
