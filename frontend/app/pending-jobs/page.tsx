"use client";

import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock3,
  MoreHorizontal,
  ArrowRight,
  Fingerprint,
  Briefcase,
  Globe,
  Sparkles,
  Inbox,
} from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { showToast } from "@/lib/showToast";
import { Job } from "../applied-jobs/AppliedJobCard";
import { getCookie } from "../applied-jobs/page";

const PendingJobsPage = () => {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        const userId = getCookie("user_id");
        if (!userId) {
          showToast("User ID not found in cookies", 0);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${userId}/pending`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pending jobs");
        }

        const data = await response.json();
        setPendingJobs(data.jobs || []);
      } catch (error) {
        console.error(error);
        showToast("Unable to load pending jobs", 0);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen pt-[60px] items-center justify-center  bg-zinc-100  dark:bg-zinc-950 rounded-xl px-6 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Simple CSS Spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary dark:border-zinc-800" />
          <div className="text-center">
            <h3 className="text-base font-medium text-zinc-500 dark:text-zinc-400">
              Loading pending job applications ...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && pendingJobs.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center py-20 px-6 bg-zinc-100 dark:bg-zinc-950 rounded-xl">
        <div className="flex flex-col items-center text-center max-w-sm rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-10 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-amber-900/30">
            <Inbox className="h-6 w-6 text-slate-600 dark:text-slate-500" />
          </div>

          <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
            No Pending Jobs
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            There are currently no jobs waiting for application. Check back
            later or refresh the queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen pt-[70px] bg-[#f9fafb] dark:bg-zinc-950 text-slate-900 dark:text-zinc-300 p-6 font-sans">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Clock3 className="w-5 h-5 text-amber-500 dark:text-amber-600" />
                <h1 className="text-base md:text-lg font-bold uppercase tracking-normal text-slate-700 dark:text-zinc-300">
                  Queue: Pending Review
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 italic max-w-md leading-relaxed">
                Jobs waiting for model validation or manual approval before
                submission.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[12px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                  Status
                </p>
                <p className="text-[11px] font-semibold text-amber-600/80 dark:text-amber-500 uppercase tracking-wide">
                  Awaiting Action
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-zinc-700" />
              <div className="text-right">
                <p className="text-[12px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                  Queue Size
                </p>
                <p className="text-sm font-bold dark:text-zinc-100">
                  {pendingJobs.length}
                </p>
              </div>
            </div>
          </header>

          {/* Pending Jobs List */}
          <div className="space-y-5">
            {!loading &&
              pendingJobs.map((job) => (
                <PendingJobCard key={job.id} job={job} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PendingJobsPage;

const PendingJobCard = ({ job }: any) => {
  return (
    <div className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Animated Status Top Bar */}
      <div className="h-1 w-full bg-amber-100 dark:bg-amber-900/30">
        <div
          className="h-full bg-amber-500 dark:bg-amber-600"
          style={{ width: "33%" }}
        ></div>
      </div>

      <div className="p-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded">
                    {job.id}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight">
                    <Sparkles className="w-3 h-3" /> Ready for Analysis
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
                  {job.title}
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 mt-1">
                  {job.company}
                </p>
              </div>
            </div>

            {/* Metadata Strip */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-slate-50 dark:border-zinc-800/50 py-3">
              <MetadataItem
                icon={<MapPin className="w-4 h-4 opacity-70" />}
                text={`${job.cities[0]}, ${job.countries[0]}`}
              />
              <MetadataItem
                icon={<></>}
                text={`₹${(job.salary_offered / 100000).toFixed(1)} LPA`}
              />
              <MetadataItem
                icon={<Globe className="w-4 h-4 opacity-70" />}
                text={job.is_remote ? "Remote" : "Office"}
              />
              <MetadataItem
                icon={<Calendar className="w-4 h-4 opacity-70" />}
                text={job.start_date}
              />
            </div>

            {/* Skills & Actions */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="text-[12px] font-medium px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-64 shrink-0 bg-slate-50 dark:bg-zinc-950/50 p-4 border border-slate-100 dark:border-zinc-800/50 rounded-lg">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
              <Fingerprint className="w-3 h-3" /> Brief Description
            </h3>
            <p className="text-[13px] text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
              {job.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metadata helper component
const MetadataItem = ({ icon, text }: { icon: JSX.Element; text: string }) => (
  <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-zinc-400">
    {icon}
    <span className="truncate">{text}</span>
  </div>
);
