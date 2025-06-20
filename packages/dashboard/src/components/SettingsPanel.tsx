import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Palette,
  Monitor,
  Loader,
} from "lucide-react";
import { apiService } from "../services/api";

interface SettingsConfig {
  general: {
    autoGenerate: boolean;
    saveOnGenerate: boolean;
    notifications: boolean;
  };
  ai: {
    provider: "openai" | "anthropic";
    model: string;
    temperature: number;
    maxTokens: number;
  };
  testing: {
    framework: "jest" | "vitest" | "mocha";
    coverage: boolean;
    timeout: number;
  };
  appearance: {
    theme: "dark" | "light" | "auto";
    animations: boolean;
  };
}

const defaultSettings: SettingsConfig = {
  general: {
    autoGenerate: true,
    saveOnGenerate: true,
    notifications: true,
  },
  ai: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
  },
  testing: {
    framework: "jest",
    coverage: true,
    timeout: 5000,
  },
  appearance: {
    theme: "dark",
    animations: true,
  },
};

const SettingsPanel: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiService.getSettings(),
  });

  // Merge server settings with defaults
  const initialSettings = { ...defaultSettings, ...serverSettings };
  const [settings, setSettings] = useState<SettingsConfig>(initialSettings);

  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: SettingsConfig) =>
      apiService.saveSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Update local settings when server settings change
  React.useEffect(() => {
    if (serverSettings) {
      setSettings({ ...defaultSettings, ...serverSettings });
    }
  }, [serverSettings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (
    section: keyof SettingsConfig,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-purple-400" />
          <h2 className="text-white text-2xl font-bold">Settings</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveSettingsMutation.isPending}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges && !saveSettingsMutation.isPending
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            {saveSettingsMutation.isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Monitor className="w-6 h-6 text-blue-400" />
            <h3 className="text-white text-lg font-semibold">General</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">
                  Auto Generate Tests
                </label>
                <p className="text-blue-200 text-sm">
                  Automatically generate tests when files change
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.autoGenerate}
                  onChange={(e) =>
                    updateSetting("general", "autoGenerate", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">
                  Save on Generate
                </label>
                <p className="text-blue-200 text-sm">
                  Automatically save generated tests
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.saveOnGenerate}
                  onChange={(e) =>
                    updateSetting("general", "saveOnGenerate", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Notifications</label>
                <p className="text-blue-200 text-sm">
                  Show desktop notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.notifications}
                  onChange={(e) =>
                    updateSetting("general", "notifications", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="text-white text-lg font-semibold">
              AI Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">
                AI Provider
              </label>
              <select
                value={settings.ai.provider}
                onChange={(e) =>
                  updateSetting("ai", "provider", e.target.value)
                }
                className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Model</label>
              <select
                value={settings.ai.model}
                onChange={(e) => updateSetting("ai", "model", e.target.value)}
                className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {settings.ai.provider === "openai" ? (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                ) : (
                  <>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                Temperature: {settings.ai.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.ai.temperature}
                onChange={(e) =>
                  updateSetting("ai", "temperature", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-blue-200 text-sm mt-1">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={settings.ai.maxTokens}
                onChange={(e) =>
                  updateSetting("ai", "maxTokens", parseInt(e.target.value))
                }
                className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="100"
                max="8000"
              />
            </div>
          </div>
        </motion.div>

        {/* Testing Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-yellow-400" />
            <h3 className="text-white text-lg font-semibold">
              Testing Framework
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">
                Framework
              </label>
              <select
                value={settings.testing.framework}
                onChange={(e) =>
                  updateSetting("testing", "framework", e.target.value)
                }
                className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="jest">Jest</option>
                <option value="vitest">Vitest</option>
                <option value="mocha">Mocha</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Code Coverage</label>
                <p className="text-blue-200 text-sm">
                  Generate coverage reports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.testing.coverage}
                  onChange={(e) =>
                    updateSetting("testing", "coverage", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                Test Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.testing.timeout}
                onChange={(e) =>
                  updateSetting("testing", "timeout", parseInt(e.target.value))
                }
                className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1000"
                max="30000"
                step="1000"
              />
            </div>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-6 h-6 text-pink-400" />
            <h3 className="text-white text-lg font-semibold">Appearance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">Theme</label>
              <select
                value={settings.appearance.theme}
                onChange={(e) =>
                  updateSetting("appearance", "theme", e.target.value)
                }
                className="w-full bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Animations</label>
                <p className="text-blue-200 text-sm">
                  Enable smooth animations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.appearance.animations}
                  onChange={(e) =>
                    updateSetting("appearance", "animations", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Message */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-200">
              You have unsaved changes. Don't forget to save!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPanel;
