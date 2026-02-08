import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateOrderRequest } from "@shared/routes";
import { apiUrl } from "@/lib/api";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.orders.list.path), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useOrderInvoice(id: string | null | undefined) {
  return useQuery({
    queryKey: [api.orders.getInvoice.path, id],
    queryFn: async () => {
      const url = apiUrl(buildUrl(api.orders.getInvoice.path, { id: id! }));
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoice");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const res = await fetch(apiUrl(api.orders.create.path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create order");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}
