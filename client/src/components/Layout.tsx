import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 dark:bg-muted/10 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Header title={title} description={description} />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl space-y-8 animate-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
