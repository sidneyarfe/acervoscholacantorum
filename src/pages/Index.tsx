import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { HomeView } from "@/components/HomeView";
import { LibraryView } from "@/components/LibraryView";
import { SearchView } from "@/components/SearchView";
import { CelebrationsView } from "@/components/CelebrationsView";
import { ProfileView } from "@/components/ProfileView";
import { SongDetail } from "@/components/SongDetail";
import { AdminView } from "@/components/admin/AdminView";
import { useSong } from "@/hooks/useSongs";
import { useIsAdmin } from "@/hooks/useUserRole";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const { isAdmin } = useIsAdmin();

  const { data: selectedSong } = useSong(selectedSongId);

  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
  };

  const handleBackFromSong = () => {
    setSelectedSongId(null);
  };

  if (selectedSong) {
    return <SongDetail song={selectedSong} onBack={handleBackFromSong} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            onSelectVoice={setSelectedVoice}
            onNavigate={setActiveTab}
            onSelectSong={handleSelectSong}
          />
        );
      case "library":
        return <LibraryView onSelectSong={handleSelectSong} />;
      case "search":
        return <SearchView onSelectSong={handleSelectSong} />;
      case "calendar":
        return <CelebrationsView />;
      case "profile":
        return <ProfileView />;
      case "admin":
        return isAdmin ? <AdminView /> : null;
      default:
        return null;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin}>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
