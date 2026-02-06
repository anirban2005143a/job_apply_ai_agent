"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import { showToast } from "@/lib/showToast";
import {
  Play,
  Square,
  Briefcase,
  Clock,
  AlertCircle,
  Trash2,
  Loader,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  PieChartIcon,
} from "lucide-react";
import {
  JobStats,
  RecentJobs,
  UserApplicationStatus,
} from "./dashboard_data_types";

const DashboardPage = () => {
  const router = useRouter();
  const [stats, setStats] = useState<JobStats>({
    applied: 0,
    pending: 0,
    clarify: 0,
    rejected: 0,
    total: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJobs>({
    applied: [],
    pending: [],
    clarify: [],
    rejected: [],
  });
  const [applicationStatus, setApplicationStatus] =
    useState<UserApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processToggleLoading, setProcessToggleLoading] = useState(false);

  // Get user_id from cookies
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  const userId = getCookie("user_id");

  // Fetch job stats and recent jobs
  const fetchJobStats = async () => {
    if (!userId) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const [appliedRes, pendingRes, clarifyRes, rejectedRes] =
        await Promise.all([
          fetch(`${backendUrl}/jobs/${userId}/applied`),
          fetch(`${backendUrl}/jobs/${userId}/pending`),
          fetch(`${backendUrl}/jobs/${userId}/calrify`),
          fetch(`${backendUrl}/jobs/${userId}/rejected`),
        ]);

      const appliedData = await appliedRes.json();
      const pendingData = await pendingRes.json();
      const clarifyData = await clarifyRes.json();
      const rejectedData = await rejectedRes.json();

      const appliedJobs = appliedData.jobs || [];
      const pendingJobs = pendingData.jobs || [];
      const clarifyJobs = clarifyData.jobs || [];
      const rejectedJobs = rejectedData.jobs || [];

      const applied = appliedJobs.length;
      const pending = pendingJobs.length;
      const clarify = clarifyJobs.length;
      const rejected = rejectedJobs.length;
      const total = applied + pending + clarify + rejected;

      setStats({ applied, pending, clarify, rejected, total });

      // Get recent 5 jobs from each category
      setRecentJobs({
        applied: appliedJobs.slice(-5).reverse(),
        pending: pendingJobs.slice(-5).reverse(),
        clarify: clarifyJobs.slice(-5).reverse(),
        rejected: rejectedJobs.slice(-5).reverse(),
      });
    } catch (error) {
      console.error("Error fetching job stats:", error);
      showToast("Failed to load job statistics", 0);
    }
  };

  // Fetch user status and application status
  const fetchUserStatus = async () => {
    if (!userId) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const statusResponse = await fetch(`${backendUrl}/status/${userId}`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();

        if (statusData.status) {
          setApplicationStatus({
            user_id: statusData.user_id,
            email: statusData.email,
            status: statusData.status,
          });
        }
        setIsProcessing(statusData.status?.is_active || false);
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
      showToast("Failed to load application status", 0);
    }
  };

  // Initial load
  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchJobStats(), fetchUserStatus()]);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  // Toggle processing
  const handleToggleProcessing = async () => {
    if (!userId) return;

    setProcessToggleLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const endpoint = isProcessing ? "stop" : "start";
      const response = await fetch(`${backendUrl}/user/${userId}/${endpoint}`, {
        method: "POST",
      });

      if (response.ok) {
        setIsProcessing(!isProcessing);
        showToast(
          isProcessing
            ? "Application processing stopped successfully"
            : "Application processing started successfully",
          1,
        );
      } else {
        showToast("Failed to toggle processing. Please try again.", 0);
      }
    } catch (error) {
      console.error("Error toggling processing:", error);
      showToast("An error occurred. Please try again.", 0);
    } finally {
      setProcessToggleLoading(false);
    }
  };

  console.log(recentJobs);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const appliedPct = stats.total > 0 ? (stats.applied / stats.total) * 100 : 0;
  const pendingPct = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const clarifyPct = stats.total > 0 ? (stats.clarify / stats.total) * 100 : 0;
  const rejectedPct =
    stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <div className="pt-20 px-4 sm:px-6 pb-8 max-w-7xl mx-auto">
          {/* Header Section - More Compact */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your job applications and auto-apply processing
            </p>
          </div>

          {/* Processing Control - Compact */}
          <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isProcessing ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700"}`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isProcessing ? "text-green-600 dark:text-green-400 animate-spin" : "text-gray-600 dark:text-gray-400"}`}
                  />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Auto-Apply Processing
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isProcessing ? "Active - scanning for jobs" : "Paused"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleProcessing}
                disabled={processToggleLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isProcessing
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white"
                    : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processToggleLoading ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : isProcessing ? (
                  <>
                    <Square className="w-3 h-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Start
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Application Outcomes - More Compact */}
          {applicationStatus?.status && (
            <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Application Outcomes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Accepted */}
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-green-800 dark:text-green-300">
                      Accepted
                    </span>
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    {Array.isArray(applicationStatus.status.accepted)
                      ? applicationStatus.status.accepted.length
                      : 0}
                  </p>
                </div>

                {/* In Process */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      In Process
                    </span>
                    <RefreshCw className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    {Array.isArray(applicationStatus.status.onprocess)
                      ? applicationStatus.status.onprocess.length
                      : 0}
                  </p>
                </div>

                {/* Rejected */}
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-red-800 dark:text-red-300">
                      Rejected
                    </span>
                    <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-xl font-bold text-red-700 dark:text-red-400">
                    {Array.isArray(applicationStatus.status.rejected)
                      ? applicationStatus.status.rejected.length
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid - More Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Applied Card */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Applied
                </span>
                <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.applied}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {appliedPct.toFixed(0)}%
                </span>
                <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${appliedPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Pending
                </span>
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.pending}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {pendingPct.toFixed(0)}%
                </span>
                <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full"
                    style={{ width: `${pendingPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Clarify Card */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Clarify
                </span>
                <AlertCircle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.clarify}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {clarifyPct.toFixed(0)}%
                </span>
                <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${clarifyPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Rejected Card */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Discarded
                </span>
                <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.rejected}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {rejectedPct.toFixed(0)}%
                </span>
                <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full"
                    style={{ width: `${rejectedPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications Grid - New Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Recent Applied Jobs */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Recent Applications
                </h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {stats.applied} total
                </span>
              </div>
              <div className="space-y-2">
                {recentJobs.applied.length > 0 ? (
                  recentJobs.applied.map((job, index) => {
                    return (
                      <div
                        key={`applied-${index}`}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                      >
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <CheckCircle
                            className="text-green-500 flex-shrink-0"
                            size={14}
                          />

                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {job.job?.title || "Application"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {job.job?.company || "Company not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 cursor-pointer p-1 hover:bg-slate-300/50 transition-all">
                          <ChevronRight
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/applied-jobs#${job.job.id}`);
                            }}
                            size={20} // size in pixels
                            className="text-gray-400 dark:text-gray-500"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No recent applications
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Rejected Jobs */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Recent Discarded Jobs
                </h3>
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {stats.rejected} total
                </span>
              </div>
              <div className="space-y-2">
                {recentJobs.rejected.length > 0 ? (
                  recentJobs.rejected.map((job, index) => (
                    <div
                      key={`rejected-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {job.title || "Application"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {job.company || "Company not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 cursor-pointer p-1 hover:bg-slate-300/50 transition-all">
                        <ChevronRight
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/discard-jobs#${job.id}`);
                          }}
                          size={20} // size in pixels
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <XCircle className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No recent rejections
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending & Clarify Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Recent Pending Jobs */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Pending Responses
                </h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {stats.pending} total
                </span>
              </div>
              <div className="space-y-2">
                {recentJobs.pending.length > 0 ? (
                  recentJobs.pending.map((job, index) => (
                    <div
                      key={`pending-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />

                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {job.title || "Application"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {job.company || "Company not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 cursor-pointer p-1 hover:bg-slate-300/50 transition-all">
                        <ChevronRight
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/pending-jobs#${job.id}`);
                          }}
                          size={20} // size in pixels
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No pending applications
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Clarify Jobs */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Needs Clarification
                </h3>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {stats.clarify} total
                </span>
              </div>
              <div className="space-y-2">
                {recentJobs.clarify.length > 0 ? (
                  recentJobs.clarify.map((job, index) => (
                    <div
                      key={`clarify-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-purple-500 dark:text-purple-400" />

                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {job.title || "Application"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {job.company || "Company not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 cursor-pointer p-1 hover:bg-slate-300/50 transition-all">
                        <ChevronRight
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/clarify-jobs#${job.id}`);
                          }}
                          size={20} // size in pixels
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No clarification needed
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart - Application Outcomes */}
            <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 shadow-sm backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Outcomes Distribution
                </h2>
              </div>

              {/* No Data Placeholder */}
              {!applicationStatus?.status ||
              ((!Array.isArray(applicationStatus.status.accepted) ||
                applicationStatus.status.accepted.length === 0) &&
                (!Array.isArray(applicationStatus.status.rejected) ||
                  applicationStatus.status.rejected.length === 0) &&
                (!Array.isArray(applicationStatus.status.onprocess) ||
                  applicationStatus.status.onprocess.length === 0)) ? (
                <div className="flex flex-col items-center justify-center h-60 text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center mb-3">
                    <PieChartIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-center text-sm">
                    No outcome data available
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                    Outcomes will appear here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Pie Chart */}
                  <ApplicationOutcomesPieChart
                    accepted={
                      Array.isArray(applicationStatus?.status?.accepted)
                        ? applicationStatus.status.accepted.length
                        : 0
                    }
                    rejected={
                      Array.isArray(applicationStatus?.status?.rejected)
                        ? applicationStatus.status.rejected.length
                        : 0
                    }
                    onprocess={
                      Array.isArray(applicationStatus?.status?.onprocess)
                        ? applicationStatus.status.onprocess.length
                        : 0
                    }
                  />

                  {/* Legend */}
                  <div className="w-full mt-6 space-y-2">
                    {(() => {
                      const acceptedCount = Array.isArray(
                        applicationStatus?.status?.accepted,
                      )
                        ? applicationStatus.status.accepted.length
                        : 0;
                      const rejectedCount = Array.isArray(
                        applicationStatus?.status?.rejected,
                      )
                        ? applicationStatus.status.rejected.length
                        : 0;
                      const onprocessCount = Array.isArray(
                        applicationStatus?.status?.onprocess,
                      )
                        ? applicationStatus.status.onprocess.length
                        : 0;
                      const totalOutcomes =
                        acceptedCount + rejectedCount + onprocessCount;

                      const items = [
                        {
                          label: "Accepted",
                          count: acceptedCount,
                          color: "green",
                        },
                        {
                          label: "In Process",
                          count: onprocessCount,
                          color: "blue",
                        },
                        {
                          label: "Rejected",
                          count: rejectedCount,
                          color: "red",
                        },
                      ];

                      return items.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              item.color === "green"
                                ? "bg-green-600"
                                : item.color === "blue"
                                  ? "bg-blue-600"
                                  : "bg-red-600"
                            }`}
                          />
                          <div className="flex-1 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  item.color === "green"
                                    ? "text-green-600 dark:text-green-400"
                                    : item.color === "blue"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {item.count}
                              </span>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {totalOutcomes > 0
                                  ? (
                                      (item.count / totalOutcomes) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Status Breakdown - Simplified */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 pb-6 shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Status Breakdown
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Applied
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {stats.applied} ({appliedPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${appliedPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Pending
                      </span>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {stats.pending} ({pendingPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${pendingPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Clarify
                      </span>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {stats.clarify} ({clarifyPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${clarifyPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Rejected
                      </span>
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        {stats.rejected} ({rejectedPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full"
                        style={{ width: `${rejectedPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary - Compact */}
              <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-5 shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">
                      Total Applications
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 text-[10px] font-medium text-gray-800 dark:text-gray-200">
                        {stats.applied} Applied
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 text-[10px] font-medium text-gray-800 dark:text-gray-200">
                        {stats.pending} Pending
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 text-[10px] font-medium text-gray-800 dark:text-gray-200">
                        {stats.clarify} Clarify
                      </span>
                      <span className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 text-[10px] font-medium text-gray-800 dark:text-gray-200">
                        {stats.rejected} Rejected
                      </span>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right md:text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">
                      Success Rate
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.applied > 0
                        ? (
                            ((applicationStatus?.status?.accepted?.length ||
                              0) /
                              stats.applied) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      ({applicationStatus?.status?.accepted?.length || 0} /{" "}
                      {stats.applied} accepted)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;

// SVG Pie Chart Component - Application Outcomes
const ApplicationOutcomesPieChart = ({
  accepted,
  rejected,
  onprocess,
}: {
  accepted: number;
  rejected: number;
  onprocess: number;
}) => {
  const total = accepted + rejected + onprocess;
  if (total === 0) return null;

  // Softer, professional colors
  const colors = {
    accepted: "#22c55e", // green-500
    onprocess: "#3b82f6", // blue-500
    rejected: "#ef4444", // red-500
  };

  const radius = 80;
  const center = 100;

  const getCoordinates = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return [
      center + radius * Math.cos(rad - Math.PI / 2),
      center + radius * Math.sin(rad - Math.PI / 2),
    ];
  };

  const slices = [
    { name: "Accepted", value: accepted, color: colors.accepted },
    { name: "In Process", value: onprocess, color: colors.onprocess },
    { name: "Rejected", value: rejected, color: colors.rejected },
  ];

  // Track hover state for tooltip
  const [hoveredSlice, setHoveredSlice] = useState<null | (typeof slices)[0]>(
    null,
  );
  let currentAngle = 0;

  const paths = slices.map((slice) => {
    if (slice.value === 0) return null;

    const sliceAngle = (slice.value / total) * 360;
    const [x1, y1] = getCoordinates(currentAngle);
    const [x2, y2] = getCoordinates(currentAngle + sliceAngle);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    currentAngle += sliceAngle;

    return (
      <path
        key={slice.name}
        d={pathData}
        fill={slice.color}
        onMouseEnter={() => setHoveredSlice(slice)}
        onMouseLeave={() => setHoveredSlice(null)}
        className="transition-transform duration-200 hover:scale-105 hover:opacity-90 cursor-pointer"
      />
    );
  });

  // Tooltip content
  const tooltipContent = hoveredSlice
    ? `${hoveredSlice.name}: ${hoveredSlice.value} (${((hoveredSlice.value / total) * 100).toFixed(1)}%)`
    : "";

  return (
    <div className="relative w-[200px] mx-auto">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="drop-shadow-sm"
      >
        {paths}
        <circle
          cx={center}
          cy={center}
          r="30"
          fill="white"
          className="dark:fill-gray-800"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dy=".3em"
          className="text-sm font-semibold fill-gray-700 dark:fill-gray-300"
        >
          {total}
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredSlice && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium bg-gray-800 text-white rounded shadow-lg pointer-events-none whitespace-nowrap">
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
