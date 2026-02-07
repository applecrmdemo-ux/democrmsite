import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Minimal implementation for brevity, full version would have form similar to others
export default function Appointments() {
  const { data: appointments } = useQuery({
    queryKey: [api.appointments.list.path],
    queryFn: async () => {
      const res = await fetch(api.appointments.list.path);
      return api.appointments.list.responses[200].parse(await res.json());
    }
  });

  return (
    <Layout title="Appointments" description="Scheduled service visits">
      <div className="flex justify-end mb-6">
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No upcoming appointments
          </div>
        ) : (
          appointments?.map(app => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {format(new Date(app.date), "MMMM d, yyyy")}
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold mb-1">{app.time}</div>
                <p className="text-sm text-muted-foreground mb-4">
                  {app.customerName}
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-primary/5">{app.purpose || "General Visit"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
