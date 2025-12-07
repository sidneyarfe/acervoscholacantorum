import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeView } from "@/components/HomeView";
import { LibraryView } from "@/components/LibraryView";
import { SearchView } from "@/components/SearchView";
import { CelebrationsView } from "@/components/CelebrationsView";
import { ProfileView } from "@/components/ProfileView";
import { SongDetail } from "@/components/SongDetail";
import { MOCK_SONGS } from "@/lib/data";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const selectedSong = selectedSongId
    ? MOCK_SONGS.find((s) => s.id === selectedSongId)
    : null;

  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
  };

  const handleBackFromSong = () => {
    setSelectedSongId(null);
  };

  // If viewing a song detail, show that instead of the tab view
  if (selectedSong) {
    return <SongDetail song={selectedSong} onBack={handleBackFromSong} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {activeTab === "home" && (
        <HomeView
          onSelectVoice={setSelectedVoice}
          onNavigate={setActiveTab}
          onSelectSong={handleSelectSong}
        />
      )}
      {activeTab === "library" && (
        <LibraryView onSelectSong={handleSelectSong} />
      )}
      {activeTab === "search" && (
        <SearchView onSelectSong={handleSelectSong} />
      )}
      {activeTab === "calendar" && <CelebrationsView />}
      {activeTab === "profile" && <ProfileView />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
