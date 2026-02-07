import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "Pending" | "In Progress" | "Completed" | "Low Stock" | "In Stock" | "Draft" | "Published";

const variants: Record<string, string> = {
  "Pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  "Completed": "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  "Low Stock": "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  "In Stock": "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variantClass = variants[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  
  return (
    <Badge 
      variant="outline" 
      className={cn("px-2.5 py-0.5 rounded-full font-medium border text-xs shadow-none transition-colors", variantClass, className)}
    >
      {status}
    </Badge>
  );
}
