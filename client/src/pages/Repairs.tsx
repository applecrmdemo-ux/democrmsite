import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRepairs, useCreateRepair, useUpdateRepair } from "@/hooks/use-repairs";
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
  customerId: z.coerce.number().optional().nullable(), // Allow null
});

function RepairForm({ repair, open, onOpenChange }: { repair?: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateRepair();
  const updateMutation = useUpdateRepair();
  const { data: customers } = useCustomers(); // For customer selection

  const form = useForm<z.infer<typeof repairFormSchema>>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: repair ? {
      ...repair,
      amount: repair.amount / 100
    } : {
      deviceName: "",
      serialNumber: "",
      issueDescription: "",
      status: "Pending",
      technicianNotes: "",
      amount: 0,
    }
  });

  const onSubmit = async (data: z.infer<typeof repairFormSchema>) => {
    try {
      const payload = {
        ...data,
        amount: Math.round(data.amount * 100), // dollars to cents
        customerId: data.customerId ? Number(data.customerId) : null,
      };

      if (repair) {
        await updateMutation.mutateAsync({ id: repair.id, ...payload });
        toast({ title: "Updated", description: "Repair ticket updated" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Created", description: "Repair ticket created" });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{repair ? "Update Repair Ticket" : "New Repair Ticket"}</DialogTitle>
          <DialogDescription>Track device issues and status.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

function KanbanColumn({ title, status, repairs, onEdit }: any) {
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
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20"
            onClick={() => onEdit(repair)}
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

  return (
    <Layout title="Repairs" description="Track repair jobs and status">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
        <KanbanColumn 
          title="Pending" 
          status="Pending" 
          repairs={repairs} 
          onEdit={setEditingRepair} 
        />
        <KanbanColumn 
          title="In Progress" 
          status="In Progress" 
          repairs={repairs} 
          onEdit={setEditingRepair} 
        />
        <KanbanColumn 
          title="Completed" 
          status="Completed" 
          repairs={repairs} 
          onEdit={setEditingRepair} 
        />
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
