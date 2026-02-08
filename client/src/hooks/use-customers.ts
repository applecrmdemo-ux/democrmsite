import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCustomer } from "@shared/routes";
import { apiUrl } from "@/lib/api";

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: [api.customers.list.path, search],
    queryFn: async () => {
      const url = search
        ? apiUrl(`${api.customers.list.path}?search=${encodeURIComponent(search)}`)
        : apiUrl(api.customers.list.path);
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return api.customers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCustomer(id: string | null | undefined) {
  return useQuery({
    queryKey: [api.customers.get.path, id],
    queryFn: async () => {
      const url = apiUrl(buildUrl(api.customers.get.path, { id: id! }));
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customer");
      return api.customers.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const res = await fetch(apiUrl(api.customers.create.path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create customer");
      return api.customers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InsertCustomer>) => {
      const url = apiUrl(buildUrl(api.customers.update.path, { id }));
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update customer");
      return api.customers.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = apiUrl(buildUrl(api.customers.delete.path, { id }));
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete customer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
    },
  });
}
