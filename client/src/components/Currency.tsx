export function Currency({ amount }: { amount: number }) {
  // Amount is in cents
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  return <span className="font-medium font-mono tracking-tight">{formatted}</span>;
}
