import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useRepairs, useCreateRepair, useUpdateRepair } from "@/hooks/use-repairs";
import { usePermissions } from "@/hooks/use-permissions";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, CheckCircle2, Circle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertRepairSchema, type InsertRepair } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/components/Currency";
import { z } from "zod";

const repairFormSchema = insertRepairSchema.extend({
  amount: z.coerce.number().min(0),
  customerId: z.union([z.string(), z.number()]).optional().nullable(),
});

function RepairForm({ repair, open, onOpenChange }: { repair?: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateRepair();
  const updateMutation = useUpdateRepair();
  const { data: customers } = useCustomers(); // For customer selection
  const { canWrite, isTechnician } = usePermissions();

  const form = useForm<z.infer<typeof repairFormSchema>>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: repair ? {
      ...repair,
      amount: repair.amount / 100
    } : {
      deviceName: "",
      serialNumber: "",
      issueDescription: "",
      status: "Received",
      technicianNotes: "",
      amount: 0,
    }
  });

  const onSubmit = async (data: z.infer<typeof repairFormSchema>) => {
    try {
      let payload: Record<string, unknown>;
      if (repair && isTechnician) {
        payload = { status: data.status, technicianNotes: data.technicianNotes ?? "" };
      } else {
        payload = {
          ...data,
          amount: Math.round(data.amount * 100),
          customerId: data.customerId != null && data.customerId !== "" ? String(data.customerId) : null,
        };
      }

      if (repair) {
        await updateMutation.mutateAsync({ id: String(repair.id), ...payload } as any);
        toast({ title: "Updated", description: "Repair ticket updated" });
      } else {
        await createMutation.mutateAsync(payload as any);
        toast({ title: "Created", description: "Repair ticket created" });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  };

  const technicianLimited = repair && isTechnician;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{repair ? "Update Repair Ticket" : "New Repair Ticket"}</DialogTitle>
          <DialogDescription>
            {technicianLimited ? "Update status and notes only." : "Track device issues and status."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {!technicianLimited && (
              <>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl><Input placeholder="iPhone 13 Pro" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl><Input placeholder="SN12345678" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
              </>
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Diagnosing">Diagnosing</SelectItem>
                      <SelectItem value="In Repair">In Repair</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!technicianLimited && (
              <FormField
                control={form.control}
                name="issueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Description</FormLabel>
                    <FormControl><Textarea placeholder="Broken screen, won't turn on..." {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!technicianLimited && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Ticket"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function KanbanColumn({ title, status, repairs, onEdit, canEdit }: { title: string; status: string; repairs: any[]; onEdit: (r: any) => void; canEdit: boolean }) {
  const filtered = repairs?.filter((r: any) => r.status === status) || [];
  
  return (
    <div className="flex flex-col gap-4 min-w-[300px] flex-1">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{title}</h3>
        <Badge variant="secondary" className="rounded-full px-2">{filtered.length}</Badge>
      </div>
      
      <div className="flex flex-col gap-3 h-full rounded-xl bg-muted/30 p-2 border-dashed border-2 border-transparent">
        {filtered.map((repair: any) => (
          <Card 
            key={repair.id} 
            className={canEdit ? "cursor-pointer hover:shadow-md transition-all hover:border-primary/20" : ""}
            onClick={canEdit ? () => onEdit(repair) : undefined}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium leading-none">{repair.deviceName}</CardTitle>
                <Currency amount={repair.amount} />
              </div>
              <CardDescription className="text-xs truncate pt-1">
                {repair.serialNumber || "No Serial #"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{repair.issueDescription}</p>
            </CardContent>
            <CardFooter className="px-4 pb-4 pt-0">
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <Clock className="h-3 w-3" />
                 <span>{new Date(repair.createdAt).toLocaleDateString()}</span>
               </div>
            </CardFooter>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/10 text-muted-foreground/50 text-sm">
            No items
          </div>
        )}
      </div>
    </div>
  );
}

export default function Repairs() {
  const { data: repairs, isLoading } = useRepairs();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<any>(null);
  const { canWrite, isTechnician, isCustomer, customerId, username } = usePermissions();

  const filteredRepairs = useMemo(() => {
    if (!repairs) return [];
    if (isTechnician) {
      return repairs.filter((r) => (r.technicianId ?? null) === username);
    }
    if (isCustomer && customerId) {
      return repairs.filter((r) => (r.customerId ?? null) === customerId);
    }
    return repairs;
  }, [repairs, isTechnician, isCustomer, customerId, username]);

  return (
    <Layout title="Repairs" description="Track repair jobs and status">
      {canWrite("repairs") && !isTechnician && (
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
        <KanbanColumn title="Received" status="Received" repairs={filteredRepairs} onEdit={setEditingRepair} canEdit={canWrite("repairs")} />
        <KanbanColumn title="Diagnosing" status="Diagnosing" repairs={filteredRepairs} onEdit={setEditingRepair} canEdit={canWrite("repairs")} />
        <KanbanColumn title="In Repair" status="In Repair" repairs={filteredRepairs} onEdit={setEditingRepair} canEdit={canWrite("repairs")} />
        <KanbanColumn title="Completed" status="Completed" repairs={filteredRepairs} onEdit={setEditingRepair} canEdit={canWrite("repairs")} />
        <KanbanColumn title="Delivered" status="Delivered" repairs={filteredRepairs} onEdit={setEditingRepair} canEdit={canWrite("repairs")} />
      </div>

      <RepairForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      {editingRepair && (
        <RepairForm 
          repair={editingRepair}
          open={!!editingRepair}
          onOpenChange={(open) => !open && setEditingRepair(null)}
        />
      )}
    </Layout>
  );
}
