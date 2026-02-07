import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Header title={title} description={description} />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
