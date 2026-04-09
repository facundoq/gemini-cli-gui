import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MobileNav from './components/MobileNav';
import ToolsSettings from './components/ToolsSettings';
import QuickSettingsPanel from './components/QuickSettingsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import VersionUpgradeModal from './components/VersionUpgradeModal';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAppLogic } from './hooks/useAppLogic';

function AppContent() {
  const {
    updateAvailable, latestVersion, currentVersion,
    showVersionModal, setShowVersionModal,
    projects, selectedProject, selectedSession,
    activeTab, setActiveTab,
    isMobile, sidebarOpen, setSidebarOpen,
    isLoadingProjects, isInputFocused, setIsInputFocused,
    showToolsSettings, setShowToolsSettings,
    showQuickSettings, setShowQuickSettings,
    autoExpandTools, setAutoExpandTools,
    showRawParameters, setShowRawParameters,
    autoScrollToBottom, setAutoScrollToBottom,
    ws, sendMessage, messages,
    sessionProtection,
    handleProjectSelect, handleSessionSelect, handleSessionDelete, handleProjectDelete,
    fetchProjects,
    navigate
  } = useAppLogic();

  return (
    <div className="fixed inset-0 flex bg-background">
      {/* Sidebar - Desktop or Mobile */}
      {(!isMobile || sidebarOpen) && (
        <div className={`${isMobile ? 'fixed inset-0 z-50 flex' : 'w-80 flex-shrink-0 border-r border-border bg-card'}`}>
          {isMobile && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className={`${isMobile ? 'relative w-[85vw] max-w-sm h-full shadow-2xl animate-in slide-in-from-left duration-200' : 'h-full'} bg-card border-r border-border`}>
            <Sidebar
              projects={projects}
              selectedProject={selectedProject}
              selectedSession={selectedSession}
              onProjectSelect={handleProjectSelect}
              onSessionSelect={handleSessionSelect}
              onNewSession={(p) => { handleProjectSelect(p); setActiveTab('chat'); }}
              onSessionDelete={handleSessionDelete}
              onProjectDelete={handleProjectDelete}
              isLoading={isLoadingProjects}
              onRefresh={fetchProjects}
              onShowSettings={() => setShowToolsSettings(true)}
              updateAvailable={updateAvailable}
              onShowVersionModal={() => setShowVersionModal(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <MainContent
          selectedProject={selectedProject}
          selectedSession={selectedSession}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ws={ws}
          sendMessage={sendMessage}
          messages={messages}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
          isLoading={isLoadingProjects}
          onInputFocusChange={setIsInputFocused}
          onSessionActive={sessionProtection.markSessionAsActive}
          onSessionInactive={sessionProtection.markSessionAsInactive}
          onReplaceTemporarySession={sessionProtection.replaceTemporarySession}
          onNavigateToSession={(sid) => navigate(`/session/${sid}`)}
          onShowSettings={() => setShowToolsSettings(true)}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          autoScrollToBottom={autoScrollToBottom}
        />
      </div>

      {/* Overlays & Modals */}
      {isMobile && <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} isInputFocused={isInputFocused} />}
      
      {activeTab === 'chat' && (
        <QuickSettingsPanel
          isOpen={showQuickSettings}
          onToggle={setShowQuickSettings}
          autoExpandTools={autoExpandTools}
          onAutoExpandChange={(v) => { setAutoExpandTools(v); localStorage.setItem('autoExpandTools', JSON.stringify(v)); }}
          showRawParameters={showRawParameters}
          onShowRawParametersChange={(v) => { setShowRawParameters(v); localStorage.setItem('showRawParameters', JSON.stringify(v)); }}
          autoScrollToBottom={autoScrollToBottom}
          onAutoScrollChange={(v) => { setAutoScrollToBottom(v); localStorage.setItem('autoScrollToBottom', JSON.stringify(v)); }}
          isMobile={isMobile}
        />
      )}

      <ToolsSettings isOpen={showToolsSettings} onClose={() => setShowToolsSettings(false)} />
      
      <VersionUpgradeModal 
        isOpen={showVersionModal} 
        onClose={() => setShowVersionModal(false)}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ProtectedRoute>
            <Router>
              <Routes>
                <Route path="/" element={<AppContent />} />
                <Route path="/session/:sessionId" element={<AppContent />} />
              </Routes>
            </Router>
          </ProtectedRoute>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;