import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useLeads, useCreateLead, useUpdateLead, useConvertLead } from "@/hooks/use-leads";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, UserPlus, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

function LeadForm({ lead, open, onOpenChange }: { lead?: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: lead || {
      name: "",
      email: "",
      phone: "",
      interest: "",
      notes: "",
      callbackRequested: false,
    },
  });

  const onSubmit = async (data: InsertLead) => {
    try {
      if (lead) {
        await updateMutation.mutateAsync({ id: lead.id, ...data });
        toast({ title: "Success", description: "Lead updated" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Success", description: "Lead added" });
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "New Lead / Enquiry"}</DialogTitle>
          <DialogDescription>Capture enquiry and product interest.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product / Service interest</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. iPhone repair, MacBook" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="callbackRequested"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Callback requested</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Notes" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const { data: leads, isLoading } = useLeads();
  const convertMutation = useConvertLead();
  const { toast } = useToast();
  const { canWrite, isCustomer } = usePermissions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const filtered = leads?.filter(
    (l) =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConvert = async (id: string) => {
    try {
      await convertMutation.mutateAsync(id);
      toast({ title: "Converted", description: "Lead converted to customer" });
    } catch {
      toast({ title: "Error", description: "Failed to convert", variant: "destructive" });
    }
  };

  return (
    <Layout title={isCustomer ? "Submit Enquiry" : "Leads & Enquiries"} description={isCustomer ? "Submit an enquiry or request a callback" : "Capture and convert leads"}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        {!isCustomer && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        {canWrite("leads") && (
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> {isCustomer ? "Submit Enquiry" : "New Lead"}
          </Button>
        )}
      </div>

      {isCustomer ? (
        <div className="max-w-lg">
          <p className="text-sm text-muted-foreground mb-4">Submit your enquiry and we&apos;ll get back to you soon.</p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline" size="lg" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Submit Enquiry
          </Button>
        </div>
      ) : (
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-sm">
                      {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                      {!lead.email && !lead.phone && "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lead.interest || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={lead.status === "Converted" ? "default" : "secondary"}>{lead.status || "New"}</Badge>
                    {lead.callbackRequested && <Badge variant="outline" className="ml-1">Callback</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canWrite("leads") && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setEditingLead(lead)}>Edit</Button>
                          {lead.status !== "Converted" && (
                            <Button size="sm" onClick={() => handleConvert(lead.id)}>
                              <UserPlus className="h-4 w-4 mr-1" /> Convert
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      )}
      <LeadForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {editingLead && (
        <LeadForm lead={editingLead} open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)} />
      )}
    </Layout>
  );
}
