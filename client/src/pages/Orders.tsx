import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useOrders, useCreateOrder } from "@/hooks/use-orders";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Currency } from "@/components/Currency";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Simplified Order Creation UI
function CreateOrderDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateOrder();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [cart, setCart] = useState<{productId: number, quantity: number}[]>([]);

  // Calculate totals
  const cartTotal = cart.reduce((acc, item) => {
    const product = products?.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  const handleAddToCart = (productId: string) => {
    const id = Number(productId);
    const existing = cart.find(i => i.productId === id);
    if (existing) {
      setCart(cart.map(i => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: id, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: number, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast({ title: "Error", description: "Select a customer", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Error", description: "Cart is empty", variant: "destructive" });
      return;
    }

    try {
      await createMutation.mutateAsync({
        customerId: Number(selectedCustomer),
        items: cart
      });
      toast({ title: "Success", description: "Order created successfully" });
      onOpenChange(false);
      setCart([]);
      setSelectedCustomer("");
    } catch (e) {
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
          <DialogDescription>Create a new sales order.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <Select onValueChange={setSelectedCustomer} value={selectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Add Products</label>
            <Select onValueChange={handleAddToCart}>
              <SelectTrigger>
                <SelectValue placeholder="Add product to cart..." />
              </SelectTrigger>
              <SelectContent>
                {products?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)} disabled={p.stock <= 0}>
                    {p.name} - <Currency amount={p.price} /> {p.stock <= 0 ? '(Out of Stock)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg p-4 bg-muted/20 min-h-[200px]">
             {cart.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-8">
                 <ShoppingCart className="h-8 w-8 opacity-20" />
                 <p>Cart is empty</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {cart.map(item => {
                   const product = products?.find(p => p.id === item.productId);
                   if (!product) return null;
                   return (
                     <div key={item.productId} className="flex items-center justify-between bg-background p-3 rounded-md shadow-sm border">
                       <div className="flex-1">
                         <div className="font-medium">{product.name}</div>
                         <div className="text-xs text-muted-foreground"><Currency amount={product.price} /> per unit</div>
                       </div>
                       <div className="flex items-center gap-3">
                         <Input 
                           type="number" 
                           min="1" 
                           value={item.quantity} 
                           onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                           className="w-16 h-8"
                         />
                         <div className="w-20 text-right font-medium">
                           <Currency amount={product.price * item.quantity} />
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveFromCart(item.productId)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>

          <div className="flex justify-between items-center text-lg font-bold px-2">
            <span>Total Amount:</span>
            <Currency amount={cartTotal} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <Layout title="Orders" description="Sales history and new orders">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
            ) : orders?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">No orders yet.</TableCell></TableRow>
            ) : (
              orders?.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                  <TableCell>{order.customerId}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-medium"><Currency amount={order.total} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateOrderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </Layout>
  );
}
