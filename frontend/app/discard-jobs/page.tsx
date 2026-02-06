"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, FilterX, Layers, Trash2 } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { getCookie } from "../applied-jobs/page";
import { showToast } from "@/lib/showToast";
import { ToastContainer } from "react-toastify";
import { usePathname } from "next/navigation";

const RejectedJobsPage = () => {
  const [rejectedJobs, setRejectedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRejectedJobs = async () => {
      const userId = getCookie("user_id") as string; // read from cookie
      if (!userId) {
        showToast("User not logged in", 0);
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      const apiUrl = `${backendUrl}/jobs/${userId}/rejected`;

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to fetch rejected jobs");
        }

        const data = await res.json();
        setRejectedJobs(data.jobs?.reverse() || []);
      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Failed to load rejected jobs", 0);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedJobs();
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash; // e.g. "#job_101"
    if (!hash) return;

    const id = hash.substring(1); // remove "#"

    const timeout = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        // Calculate scroll position 80px above the element
        const offset = 60; // px
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });

        clearTimeout(timeout);
      }
    }, 100); // check every 50ms

    return () => clearTimeout(timeout); // cleanup if unmounted
  }, [pathname]);

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

  if (!loading && rejectedJobs.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center py-20 px-6 bg-zinc-100 dark:bg-zinc-950 rounded-xl">
        <div className="flex flex-col items-center text-center max-w-sm rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-10 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-amber-900/30">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-500" />{" "}
          </div>

          <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
            No Discarded Jobs
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            There are currently no jobs that have been discarded. Keep an eye on
            the queue for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen pt-[80px] bg-[#fafafa] dark:bg-zinc-950 text-slate-900 dark:text-zinc-300 font-sans p-6">
        <div className="max-w-5xl mx-auto">
          {/* System Header */}
          <header className="mb-6 flex flex-col gap-4 border-b border-slate-300 dark:border-zinc-800 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <FilterX className="w-6 h-6 text-slate-500 dark:text-zinc-400" />
              <h1 className="text-base md:text-lg font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Model Exclusion Log
              </h1>
            </div>
            <p className="text-[12px] md:text-sm text-slate-500 dark:text-zinc-400 max-w-lg leading-relaxed">
              These opportunities were automatically filtered out by the
              matching engine because they didn’t meet the required
              compatibility or criteria thresholds.
            </p>
          </header>

          {/* List */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-slate-500 dark:text-zinc-400 py-20">
                Loading rejected jobs...
              </p>
            ) : rejectedJobs.length > 0 ? (
              rejectedJobs.map((job) => (
                <RejectedJobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                <p className="text-slate-400">No rejected jobs found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RejectedJobsPage;

const RejectedJobCard = ({ job }: any) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setProgress(job.match_score), 100); // small delay
    return () => clearTimeout(timeout);
  }, [job.match_score]);

  return (
    <section
      id={job.id}
      className="group relative rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Score Indicator */}
          <div className="flex flex-row lg:flex-col items-center justify-center lg:w-20 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800 pb-4 lg:pb-0 ">
            <div className="w-12 h-12 flex justify-center">
              <CircularProgressbar
                value={progress}
                text={`${job.match_score}%`}
                strokeWidth={8}
                styles={buildStyles({
                  pathColor: "rgb(239 68 68)", // red-500
                  trailColor: "rgb(203 213 225)", // slate-200
                  textColor: "rgb(239 68 68)",
                  textSize: "23px",
                  pathTransitionDuration: 1,
                })}
              />
            </div>
            <p className="hidden lg:block text-[10px] whitespace-nowrap font-medium text-slate-500 dark:text-zinc-400 mt-2 tracking-wide">
              Match score
            </p>
          </div>

          {/* Center: Primary Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                  {job.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-500">
                    {job.company}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    Ref: {job.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[12px] font-bold text-slate-500 dark:text-zinc-500 tracking-wide rounded">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                Rejected
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-widest">
                  Location
                </span>
                <span className="text-[12px] font-medium truncate italic">
                  {job.cities[0]}, {job.countries[0]}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-widest">
                  Offered
                </span>
                <span className="text-[12px] font-medium">
                  ₹{(job.salary_offered / 100000).toFixed(1)} LPA
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-widest">
                  Work Mode
                </span>
                <span className="text-[12px] font-medium">
                  {job.is_remote ? "Remote" : "Onsite"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-widest">
                  Required
                </span>
                <span className="text-[12px] font-medium truncate">
                  {job.required_skills.join(", ")}
                </span>
              </div>
            </div>

            {/* Model Logic Output */}
            <div className="bg-[#fcfcfc] dark:bg-zinc-950 p-3 border border-slate-100 dark:border-zinc-800/50 rounded-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  Analysis Feedback
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-zinc-400 tracking-normal">
                {job.match_reason}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          {/* <div className="lg:w-12 flex lg:flex-col justify-end lg:justify-start items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-4">
            <button
              title="View original posting"
              className="p-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
};
