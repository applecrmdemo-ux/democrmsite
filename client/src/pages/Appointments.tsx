import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCustomer } from "@/hooks/use-customers";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useAppointments, useCreateAppointment, useDeleteAppointment } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function CreateAppointmentDialog({ open, onOpenChange, defaultCustomerName }: { open: boolean; onOpenChange: (open: boolean) => void; defaultCustomerName?: string }) {
  const { toast } = useToast();
  const createMutation = useCreateAppointment();
  const [customerName, setCustomerName] = useState(defaultCustomerName ?? "");
  useEffect(() => {
    if (defaultCustomerName) setCustomerName(defaultCustomerName);
  }, [defaultCustomerName]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !date || !time.trim()) {
      toast({ title: "Error", description: "Name, date and time required", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        customerName: customerName.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        purpose: purpose.trim() || "General",
      });
      toast({ title: "Success", description: "Appointment created" });
      onOpenChange(false);
      setCustomerName("");
      setDate("");
      setTime("");
      setPurpose("");
    } catch {
      toast({ title: "Error", description: "Failed to create", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>Book repair or demo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Customer name</Label>
            <Input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="14:00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Input placeholder="Repair, Demo, Consultation" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Appointments() {
  const { data: appointments, isLoading } = useAppointments();
  const deleteMutation = useDeleteAppointment();
  const { toast } = useToast();
  const { canWrite, canDelete, isCustomer, customerId } = usePermissions();
  const { data: customer } = useCustomer(isCustomer ? customerId ?? null : null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (isCustomer && customer?.name) {
      return appointments.filter((a) => a.customerName === customer.name);
    }
    return appointments;
  }, [appointments, isCustomer, customer?.name]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Deleted", description: "Appointment removed" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <Layout title="Appointments" description="Scheduled service visits">
      {canWrite("appointments") && (
        <div className="flex justify-end mb-6">
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-40" /></CardContent>
            </Card>
          ))
        ) : filteredAppointments?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No upcoming appointments
          </div>
        ) : (
          filteredAppointments?.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {format(new Date(app.date), "MMMM d, yyyy")}
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold mb-1">{app.time}</div>
                <p className="text-sm text-muted-foreground mb-4">{app.customerName}</p>
                <div className="flex gap-2 flex-wrap items-center">
                  <Badge variant="outline" className="bg-primary/5">{app.purpose || "General Visit"}</Badge>
                  {canDelete("appointments") && (
                    <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs" onClick={() => handleDelete(app.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateAppointmentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} defaultCustomerName={isCustomer ? customer?.name : undefined} />
    </Layout>
  );
}
