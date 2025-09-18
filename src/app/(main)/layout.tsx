import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
