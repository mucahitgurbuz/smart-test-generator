import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  FileText,
  Filter,
  Loader,
} from "lucide-react";
import { apiService, TestResult } from "../services/api";

const mockTestResults: TestResult[] = [
  {
    id: "1",
    name: "should calculate user age correctly",
    status: "passed",
    duration: 45,
    file: "user.test.js",
    timestamp: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "2",
    name: "should handle invalid email format",
    status: "failed",
    duration: 120,
    file: "validation.test.js",
    error: "Expected validation to fail but it passed",
    timestamp: new Date("2024-01-15T10:29:30"),
  },
  {
    id: "3",
    name: "should authenticate user with valid credentials",
    status: "passed",
    duration: 230,
    file: "auth.test.js",
    timestamp: new Date("2024-01-15T10:29:00"),
  },
  {
    id: "4",
    name: "should render component with props",
    status: "pending",
    duration: 0,
    file: "component.test.jsx",
    timestamp: new Date("2024-01-15T10:28:30"),
  },
  {
    id: "5",
    name: "should handle API timeout gracefully",
    status: "failed",
    duration: 5000,
    file: "api.test.js",
    error: "Timeout exceeded: Expected response within 3000ms",
    timestamp: new Date("2024-01-15T10:28:00"),
  },
];

const TestResults: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "passed" | "failed" | "pending">(
    "all"
  );
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const { data: testResults = [], isLoading } = useQuery({
    queryKey: ["testResults"],
    queryFn: () => apiService.getTestResults(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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

  const filteredResults = testResults.filter((test: TestResult) =>
    filter === "all" ? true : test.status === filter
  );

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBg = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return "bg-green-500/20 border-green-500/30";
      case "failed":
        return "bg-red-500/20 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 border-yellow-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-white text-2xl font-bold">Test Results</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-200" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-white/20 backdrop-blur-md text-white rounded-lg px-3 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Tests</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </motion.div>

      {/* Results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6 max-h-[600px] overflow-y-auto"
        >
          <h3 className="text-white text-lg font-semibold mb-4">
            {filteredResults.length} Tests
          </h3>
          <div className="space-y-3">
            {filteredResults.map((test: TestResult, index: number) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTest(test)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${getStatusBg(
                  test.status
                )} ${selectedTest?.id === test.id ? "ring-2 ring-purple-500" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {test.name}
                      </p>
                      <p className="text-blue-200 text-sm">{test.file}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-blue-300">
                        <span>{test.duration}ms</span>
                        <span>{test.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {test.error && (
                  <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/20">
                    <p className="text-red-300 text-sm">{test.error}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Test details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          {selectedTest ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(selectedTest.status)}
                <h3 className="text-white text-lg font-semibold">
                  Test Details
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-blue-200 text-sm font-medium">
                    Test Name
                  </label>
                  <p className="text-white">{selectedTest.name}</p>
                </div>

                <div>
                  <label className="text-blue-200 text-sm font-medium">
                    File
                  </label>
                  <p className="text-white font-mono text-sm">
                    {selectedTest.file}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-blue-200 text-sm font-medium">
                      Duration
                    </label>
                    <p className="text-white">{selectedTest.duration}ms</p>
                  </div>
                  <div>
                    <label className="text-blue-200 text-sm font-medium">
                      Status
                    </label>
                    <p
                      className={`capitalize ${
                        selectedTest.status === "passed"
                          ? "text-green-400"
                          : selectedTest.status === "failed"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {selectedTest.status}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-blue-200 text-sm font-medium">
                    Timestamp
                  </label>
                  <p className="text-white">
                    {selectedTest.timestamp.toLocaleString()}
                  </p>
                </div>

                {selectedTest.error && (
                  <div>
                    <label className="text-blue-200 text-sm font-medium">
                      Error Details
                    </label>
                    <div className="mt-2 p-3 bg-red-500/10 rounded border border-red-500/20">
                      <p className="text-red-300 text-sm font-mono">
                        {selectedTest.error}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Play className="w-4 h-4" />
                  <span>Re-run Test</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>View Source</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-blue-200">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a test to view details</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestResults;
