import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  File,
  Code,
  GitBranch,
  Clock,
  Users,
  Loader,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiService, AnalysisResult } from "../services/api";

interface CodeFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  size: number;
  complexity: number;
  coverage: number;
  lastModified: Date;
  testability: "high" | "medium" | "low";
}

const mockFiles: CodeFile[] = [
  {
    id: "1",
    name: "UserService.js",
    path: "src/services/UserService.js",
    type: "file",
    size: 1250,
    complexity: 8,
    coverage: 85,
    lastModified: new Date("2024-01-15T09:30:00"),
    testability: "high",
  },
  {
    id: "2",
    name: "AuthManager.js",
    path: "src/auth/AuthManager.js",
    type: "file",
    size: 2100,
    complexity: 15,
    coverage: 65,
    lastModified: new Date("2024-01-14T16:45:00"),
    testability: "medium",
  },
  {
    id: "3",
    name: "DatabaseConnector.js",
    path: "src/database/DatabaseConnector.js",
    type: "file",
    size: 3500,
    complexity: 22,
    coverage: 45,
    lastModified: new Date("2024-01-13T11:20:00"),
    testability: "low",
  },
];

const complexityData = [
  { name: "Jan", complexity: 12, coverage: 75 },
  { name: "Feb", complexity: 15, coverage: 78 },
  { name: "Mar", complexity: 18, coverage: 82 },
  { name: "Apr", complexity: 14, coverage: 85 },
  { name: "May", complexity: 16, coverage: 87 },
];

const CodeAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<AnalysisResult | null>(null);

  const { data: analysisResults = [], isLoading } = useQuery({
    queryKey: ["analysisResults"],
    queryFn: () => apiService.getAnalysisResults(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: analysisSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["analysisSummary"],
    queryFn: () => apiService.getAnalysisSummary(),
  });

  if (isLoading || summaryLoading) {
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

  const filteredFiles = analysisResults.filter((file: AnalysisResult) =>
    file.filePath.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTestabilityLevel = (
    complexity: number
  ): "high" | "medium" | "low" => {
    if (complexity <= 5) return "high";
    if (complexity <= 10) return "medium";
    return "low";
  };

  const getTestabilityColor = (testability: "high" | "medium" | "low") => {
    switch (testability) {
      case "high":
        return "text-green-400 bg-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-red-400 bg-red-500/20";
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 10) return "text-green-400";
    if (complexity <= 20) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-white text-2xl font-bold">Code Analysis</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/20 backdrop-blur-md text-white placeholder-blue-300 rounded-lg pl-10 pr-4 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </motion.div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Files",
            value:
              analysisSummary?.totalFiles?.toString() ||
              filteredFiles.length.toString(),
            icon: File,
            color: "text-blue-400",
          },
          {
            label: "Avg Complexity",
            value: analysisSummary?.averageComplexity?.toFixed(1) || "0",
            icon: Code,
            color: "text-purple-400",
          },
          {
            label: "Lines of Code",
            value: analysisSummary?.totalLinesOfCode?.toString() || "0",
            icon: GitBranch,
            color: "text-green-400",
          },
          {
            label: "High Complexity",
            value:
              analysisSummary?.complexityDistribution?.high?.toString() || "0",
            icon: Users,
            color: "text-yellow-400",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/20 backdrop-blur-md rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">{metric.label}</p>
                <p className="text-white text-xl font-bold">{metric.value}</p>
              </div>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <h3 className="text-white text-lg font-semibold mb-4">Files</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredFiles.map((file: AnalysisResult, index: number) => {
              const fileName = file.filePath.split("/").pop() || file.filePath;
              const testability = getTestabilityLevel(file.complexity);
              const mockCoverage = Math.max(
                10,
                Math.min(95, 100 - file.complexity * 3)
              ); // Mock coverage based on complexity

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedFile(file)}
                  className={`p-4 rounded-lg border border-white/20 cursor-pointer transition-all hover:bg-white/10 ${
                    selectedFile?.id === file.id
                      ? "bg-purple-500/20 border-purple-500/50"
                      : "hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-blue-300" />
                      <div>
                        <p className="text-white font-medium">{fileName}</p>
                        <p className="text-blue-200 text-sm">{file.filePath}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getTestabilityColor(testability)}`}
                      >
                        {testability}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-blue-300">
                        {file.linesOfCode} lines
                      </span>
                      <span className={getComplexityColor(file.complexity)}>
                        Complexity: {file.complexity}
                      </span>
                    </div>
                    <span className="text-blue-300">
                      {mockCoverage}% coverage
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* File Details */}
        <div className="space-y-6">
          {/* Complexity Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-md rounded-lg p-6"
          >
            <h3 className="text-white text-lg font-semibold mb-4">
              Complexity Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={complexityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="name" tick={{ fill: "#E5E7EB" }} />
                <YAxis tick={{ fill: "#E5E7EB" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="complexity"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="coverage"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Selected File Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/20 backdrop-blur-md rounded-lg p-6"
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <File className="w-6 h-6 text-blue-300" />
                  <h3 className="text-white text-lg font-semibold">
                    File Analysis
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">
                      File Name
                    </label>
                    <p className="text-white font-mono">
                      {selectedFile.filePath.split("/").pop()}
                    </p>
                  </div>

                  <div>
                    <label className="text-blue-200 text-sm font-medium">
                      Path
                    </label>
                    <p className="text-white font-mono text-sm">
                      {selectedFile.filePath}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-blue-200 text-sm font-medium">
                        Size
                      </label>
                      <p className="text-white">
                        {selectedFile.linesOfCode} lines
                      </p>
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm font-medium">
                        Coverage
                      </label>
                      <p className="text-white">
                        {Math.max(
                          10,
                          Math.min(95, 100 - selectedFile.complexity * 3)
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-blue-200 text-sm font-medium">
                        Complexity
                      </label>
                      <p
                        className={getComplexityColor(selectedFile.complexity)}
                      >
                        {selectedFile.complexity}
                      </p>
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm font-medium">
                        Testability
                      </label>
                      <span
                        className={`px-2 py-1 rounded text-xs capitalize ${getTestabilityColor(getTestabilityLevel(selectedFile.complexity))}`}
                      >
                        {getTestabilityLevel(selectedFile.complexity)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-blue-200 text-sm font-medium">
                      Created At
                    </label>
                    <div className="flex items-center space-x-2 text-white">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(selectedFile.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {selectedFile.recommendations.length > 0 && (
                    <div>
                      <label className="text-blue-200 text-sm font-medium">
                        Recommendations
                      </label>
                      <div className="mt-2 space-y-2">
                        {selectedFile.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="p-2 bg-blue-500/10 rounded border border-blue-500/20"
                          >
                            <p className="text-blue-300 text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedFile.functions.length > 0 && (
                    <div>
                      <label className="text-blue-200 text-sm font-medium">
                        Functions ({selectedFile.functions.length})
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedFile.functions.map((func, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                          >
                            {func}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Generate Tests
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    View Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-blue-200">
                <div className="text-center">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a file to view analysis</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CodeAnalysis;
