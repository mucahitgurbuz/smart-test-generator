import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Loader,
} from "lucide-react";
import { apiService } from "../services/api";

const mockData = [
  { name: "Unit Tests", value: 45, coverage: 85 },
  { name: "Integration", value: 23, coverage: 70 },
  { name: "E2E Tests", value: 12, coverage: 60 },
  { name: "API Tests", value: 18, coverage: 75 },
];

const pieData = [
  { name: "Passed", value: 78, color: "#10B981" },
  { name: "Failed", value: 12, color: "#EF4444" },
  { name: "Pending", value: 8, color: "#F59E0B" },
];

const Dashboard: React.FC = () => {
  const { data: testStats, isLoading: testStatsLoading } = useQuery({
    queryKey: ["testStats"],
    queryFn: () => apiService.getTestStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiService.getProjects(),
  });

  const { data: analysisSummary, isLoading: analysisLoading } = useQuery({
    queryKey: ["analysisSummary"],
    queryFn: () => apiService.getAnalysisSummary(),
  });

  if (testStatsLoading || projectsLoading || analysisLoading) {
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

  // Transform data for charts
  const mockData =
    projects?.map((project, index) => ({
      name: project.name,
      value: Math.floor(Math.random() * 50) + 10,
      coverage: Math.floor(Math.random() * 30) + 70,
    })) || [];

  const pieData = [
    {
      name: "Passed",
      value: Math.floor((testStats?.totalTests || 0) * 0.8),
      color: "#10B981",
    },
    {
      name: "Failed",
      value: Math.floor((testStats?.totalTests || 0) * 0.15),
      color: "#EF4444",
    },
    {
      name: "Pending",
      value: Math.floor((testStats?.totalTests || 0) * 0.05),
      color: "#F59E0B",
    },
  ];
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: CheckCircle,
            label: "Tests Passed",
            value: (testStats?.totalTests
              ? Math.floor(testStats.totalTests * 0.8)
              : 0
            ).toString(),
            change: "+12%",
            color: "text-green-500",
          },
          {
            icon: AlertCircle,
            label: "Tests Failed",
            value: (testStats?.totalTests
              ? Math.floor(testStats.totalTests * 0.15)
              : 0
            ).toString(),
            change: "-5%",
            color: "text-red-500",
          },
          {
            icon: Activity,
            label: "Coverage",
            value: `${Math.round(testStats?.averageCoverage || 0)}%`,
            change: "+3%",
            color: "text-blue-500",
          },
          {
            icon: Clock,
            label: "Active Projects",
            value: (testStats?.activeProjects || 0).toString(),
            change: "+2",
            color: "text-purple-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/20 backdrop-blur-md rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm ${stat.color}`}>
                  {stat.change} from last run
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Test Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockData}>
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
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Test Results Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/20 backdrop-blur-md rounded-lg p-6"
        >
          <h3 className="text-white text-lg font-semibold mb-4">
            Test Results
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-blue-100 text-sm">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/20 backdrop-blur-md rounded-lg p-6"
      >
        <h3 className="text-white text-lg font-semibold mb-4">
          Recent Test Runs
        </h3>
        <div className="space-y-3">
          {[
            {
              time: "5 minutes ago",
              status: "passed",
              tests: "156 tests",
              duration: "2.3s",
            },
            {
              time: "1 hour ago",
              status: "failed",
              tests: "142 tests",
              duration: "3.1s",
            },
            {
              time: "3 hours ago",
              status: "passed",
              tests: "138 tests",
              duration: "2.8s",
            },
          ].map((run, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0"
            >
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    run.status === "passed" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="text-white font-medium">{run.tests}</p>
                  <p className="text-blue-100 text-sm">{run.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white">{run.duration}</p>
                <p
                  className={`text-sm capitalize ${
                    run.status === "passed" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {run.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
