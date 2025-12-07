import { ReactNode } from "react";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { BottomNav } from "@/components/BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <DesktopSidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:pb-0 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
