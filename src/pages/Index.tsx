import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { HomeView } from "@/components/HomeView";
import { LibraryView } from "@/components/LibraryView";
import { SearchView } from "@/components/SearchView";
import { CelebrationsView } from "@/components/CelebrationsView";
import { CelebrationDetail } from "@/components/CelebrationDetail";
import { ProfileView } from "@/components/ProfileView";
import { SongDetail } from "@/components/SongDetail";
import { AdminView } from "@/components/admin/AdminView";
import { RehearsalListsView } from "@/components/RehearsalListsView";
import { RehearsalListDetail } from "@/components/RehearsalListDetail";
import { useSong } from "@/hooks/useSongs";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedCelebrationId, setSelectedCelebrationId] = useState<string | null>(null);
  const [selectedRehearsalListId, setSelectedRehearsalListId] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const { isAdmin } = useIsAdmin();
  const { data: profile } = useProfile();

  // Auto-initialize voice from profile preferred_voice
  useEffect(() => {
    if (profile?.preferred_voice && !selectedVoice) {
      setSelectedVoice(profile.preferred_voice);
    }
  }, [profile?.preferred_voice]);

  const { data: selectedSong } = useSong(selectedSongId);

  const handleSelectSong = (songId: string) => {
    setSelectedSongId(songId);
  };

  const handleBackFromSong = () => {
    setSelectedSongId(null);
  };

  const handleSelectCelebration = (celebrationId: string) => {
    setSelectedCelebrationId(celebrationId);
  };

  const handleBackFromCelebration = () => {
    setSelectedCelebrationId(null);
  };

  const handleSelectRehearsalList = (listId: string) => {
    setSelectedRehearsalListId(listId);
  };

  const handleBackFromRehearsalList = () => {
    setSelectedRehearsalListId(null);
  };

  // Show song detail
  if (selectedSong) {
    return <SongDetail song={selectedSong} onBack={handleBackFromSong} initialVoice={selectedVoice} />;
  }

  // Show celebration detail
  if (selectedCelebrationId) {
    return (
      <CelebrationDetail 
        celebrationId={selectedCelebrationId} 
        onBack={handleBackFromCelebration}
        onSelectSong={handleSelectSong}
      />
    );
  }

  // Show rehearsal list detail
  if (selectedRehearsalListId) {
    return (
      <RehearsalListDetail
        listId={selectedRehearsalListId}
        onBack={handleBackFromRehearsalList}
        onSelectSong={handleSelectSong}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            onNavigate={setActiveTab}
            onSelectSong={handleSelectSong}
            onSelectCelebration={handleSelectCelebration}
          />
        );
      case "library":
        return <LibraryView onSelectSong={handleSelectSong} />;
      case "search":
        return <SearchView onSelectSong={handleSelectSong} />;
      case "rehearsals":
        return <RehearsalListsView onSelectList={handleSelectRehearsalList} />;
      case "calendar":
        return <CelebrationsView onSelectCelebration={handleSelectCelebration} />;
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
