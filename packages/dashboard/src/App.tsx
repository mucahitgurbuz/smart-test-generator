import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, BarChart3, FileText, Settings, Play, Zap } from "lucide-react";
import Dashboard from "./components/Dashboard";
import TestResults from "./components/TestResults";
import CodeAnalysis from "./components/CodeAnalysis";
import SettingsPanel from "./components/SettingsPanel";

const queryClient = new QueryClient();

function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <Brain className="w-12 h-12 text-white mr-4" />
                <h1 className="text-4xl font-bold text-white">
                  Smart Test Generator
                </h1>
              </div>
              <p className="text-xl text-blue-100">
                AI that writes better tests than you do (and 10x faster)
              </p>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 flex space-x-2">
                {[
                  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                  { id: "analysis", label: "Analysis", icon: FileText },
                  { id: "results", label: "Test Results", icon: Play },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentTab(id)}
                    className={`flex items-center px-4 py-2 rounded-md transition-all ${
                      currentTab === id
                        ? "bg-white text-purple-600 shadow-lg"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentTab === "dashboard" && <Dashboard />}
              {currentTab === "analysis" && <CodeAnalysis />}
              {currentTab === "results" && <TestResults />}
              {currentTab === "settings" && <SettingsPanel />}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="fixed bottom-8 right-8"
            >
              <div className="flex flex-col space-y-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg"
                  title="Generate Tests"
                >
                  <Zap className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
