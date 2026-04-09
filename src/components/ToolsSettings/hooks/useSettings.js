import { useState, useEffect } from 'react';

export const useSettings = (isOpen, onClose) => {
  const [allowedTools, setAllowedTools] = useState([]);
  const [disallowedTools, setDisallowedTools] = useState([]);
  const [skipPermissions, setSkipPermissions] = useState(false);
  const [approvalMode, setApprovalMode] = useState('default');
  const [useSandbox, setUseSandbox] = useState(false);
  const [projectSortOrder, setProjectSortOrder] = useState('name');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [enableNotificationSound, setEnableNotificationSound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('gemini-tools-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAllowedTools(settings.allowedTools || []);
        setDisallowedTools(settings.disallowedTools || []);
        setSkipPermissions(settings.skipPermissions || false);
        setApprovalMode(settings.approvalMode || (settings.skipPermissions ? 'yolo' : 'default'));
        setUseSandbox(settings.useSandbox || false);
        setProjectSortOrder(settings.projectSortOrder || 'name');
        setSelectedModel(settings.selectedModel || 'auto');
        setEnableNotificationSound(settings.enableNotificationSound || false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const saveSettings = () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const settings = {
        allowedTools,
        disallowedTools,
        skipPermissions,
        approvalMode,
        useSandbox,
        projectSortOrder,
        selectedModel,
        enableNotificationSound,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem('gemini-tools-settings', JSON.stringify(settings));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'gemini-tools-settings',
        newValue: JSON.stringify(settings),
        storageArea: localStorage,
      }));
      
      setSaveStatus('success');
      setTimeout(onClose, 1000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    allowedTools, setAllowedTools,
    disallowedTools, setDisallowedTools,
    skipPermissions, setSkipPermissions,
    approvalMode, setApprovalMode,
    useSandbox, setUseSandbox,
    projectSortOrder, setProjectSortOrder,
    selectedModel, setSelectedModel,
    enableNotificationSound, setEnableNotificationSound,
    isSaving, saveStatus,
    saveSettings
  };
};
