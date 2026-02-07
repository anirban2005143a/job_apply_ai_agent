"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Briefcase,
  Info,
  CheckCircle,
  XCircle,
  Shield,
  Inbox,
} from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import { Job } from "../applied-jobs/AppliedJobCard";
import { getCookie } from "../applied-jobs/page";
import { showToast } from "@/lib/showToast";

// Mock Data
// const mockJobs: Job[] = [
//   {
//     id: "job_001",
//     title: "DevOps Engineer",
//     company: "TechMahindra",
//     cities: ["Bengaluru"],
//     countries: ["India"],
//     is_remote: false,
//     is_hybride: true,
//     is_onsite: false,
//     salary_offered: 1200000,
//     visa_sponsorship_offered: false,
//     start_date: "Within 1 month",
//     required_skills: ["AWS", "Docker", "CI/CD"],
//     description: "Managing cloud infrastructure and deployment pipelines.",
//     clarification: `### JOB MISSION & DOMAIN:\nAs a DevOps Engineer at TechMahindra, the primary mission is to manage cloud infrastructure and deployment pipelines. The day-to-day reality involves working with AWS, Docker, and CI/CD tools to ensure seamless and efficient software deployment. This role demands a strong understanding of cloud computing, containerization, and automation. The DevOps Engineer will be responsible for:\n\n* Designing, implementing, and maintaining cloud infrastructure using AWS.\n* Ensuring the efficient deployment and management of applications using Docker and CI/CD tools.\n* Collaborating with cross-functional teams to identify and resolve infrastructure-related issues.\n* Developing and implementing automation scripts to improve deployment efficiency.\n\nThe technical environment requires expertise in AWS, Docker, and CI/CD tools, with a strong focus on automation and cloud infrastructure management.\n\n### COMPATIBILITY INDEX: 32% | High Risk\nGiven the significant technical gaps between the candidate's skills and the job requirements, the compatibility index is moderately low. However, the presence of critical mismatches, such as the lack of AWS experience and the absence of a relevant work authorization, heavily penalizes the score.\n\n### TECHNICAL DELTA:\n\n| Requirement | Candidate Status | Gap Severity |\n| --- | --- | --- |\n| AWS | Not mentioned | High Severity |\n| Docker | Mentioned, but no experience | Medium Severity |\n| CI/CD | Not mentioned | High Severity |\n| Cloud infrastructure management | Not mentioned | High Severity |\n\n### STRATEGIC MISMATCHES:\nThe following are critical mismatches that significantly impact the candidate's viability for the role:\n\n* **Visa Sponsorship**: The company does not offer visa sponsorship, and the candidate does not have a work authorization. \n* **Salary Expectations**: The candidate's minimum salary expectation of 15,000 is significantly lower than the offered salary of 1,200,000.\n* **Geographical Location**: The company is located in Bengaluru, but the candidate prefers cities like Kolkata, Mumbai, and Delhi, which may not be feasible for relocation.\n\n### SYSTEM ADVISORY:\nBased on the analysis, the following are the hard truths regarding the application:\n\n* **Candidate's skills**: While the candidate has a strong background in competitive programming, their skills and experience are not directly applicable to the DevOps Engineer role.\n* **Location and Visa**: The candidate's geographical preferences and lack of work authorization significantly impact their viability for the role.\n* **Salary expectations**: The candidate's minimum salary expectation is not aligned with the offered salary, which may  `,
//   },
//   {
//     id: "job_002",
//     title: "DevOps Engineer",
//     company: "TechMahindra",
//     cities: ["Bengaluru"],
//     countries: ["India"],
//     is_remote: false,
//     is_hybride: true,
//     is_onsite: false,
//     salary_offered: 1200000,
//     visa_sponsorship_offered: false,
//     start_date: "Within 1 month",
//     required_skills: ["AWS", "Docker", "CI/CD"],
//     description: "Managing cloud infrastructure and deployment pipelines.",
//     clarification:
//       "### JOB MISSION & DOMAIN:\nAs a DevOps Engineer at TechMahindra, the primary mission is to manage cloud infrastructure and deployment pipelines. The day-to-day reality involves working with AWS, Docker, and CI/CD tools to ensure seamless and efficient software deployment. This role demands a strong understanding of cloud computing, containerization, and automation. The DevOps Engineer will be responsible for:\n\n* Designing, implementing, and maintaining cloud infrastructure using AWS.\n* Ensuring the efficient deployment and management of applications using Docker and CI/CD tools.\n* Collaborating with cross-functional teams to identify and resolve infrastructure-related issues.\n* Developing and implementing automation scripts to improve deployment efficiency.\n\nThe technical environment requires expertise in AWS, Docker, and CI/CD tools, with a strong focus on automation and cloud infrastructure management.\n\n### COMPATIBILITY INDEX: 32% | High Risk\nGiven the significant technical gaps between the candidate's skills and the job requirements, the compatibility index is moderately low. However, the presence of critical mismatches, such as the lack of AWS experience and the absence of a relevant work authorization, heavily penalizes the score.\n\n### TECHNICAL DELTA:\n\n| Requirement | Candidate Status | Gap Severity |\n| --- | --- | --- |\n| AWS | Not mentioned | High Severity |\n| Docker | Mentioned, but no experience | Medium Severity |\n| CI/CD | Not mentioned | High Severity |\n| Cloud infrastructure management | Not mentioned | High Severity |\n\n### STRATEGIC MISMATCHES:\nThe following are critical mismatches that significantly impact the candidate's viability for the role:\n\n* **Visa Sponsorship**: The company does not offer visa sponsorship, and the candidate does not have a work authorization. \n* **Salary Expectations**: The candidate's minimum salary expectation of 15,000 is significantly lower than the offered salary of 1,200,000.\n* **Geographical Location**: The company is located in Bengaluru, but the candidate prefers cities like Kolkata, Mumbai, and Delhi, which may not be feasible for relocation.\n\n### SYSTEM ADVISORY:\nBased on the analysis, the following are the hard truths regarding the application:\n\n* **Candidate's skills**: While the candidate has a strong background in competitive programming, their skills and experience are not directly applicable to the DevOps Engineer role.\n* **Location and Visa**: The candidate's geographical preferences and lack of work authorization significantly impact their viability for the role.\n* **Salary expectations**: The candidate's minimum salary expectation is not aligned with the offered salary, which may  ",
//   },
// ];

const JobClarificationPage: React.FC = () => {
  const [activeJobIndex, setActiveJobIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<"yes" | "no" | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [clarifyJobs, setClarifyJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentJob = clarifyJobs[activeJobIndex];

  const handleActionInitiation = (choice: "yes" | "no") => {
    setPendingSelection(choice);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!pendingSelection || !currentJob) return;
    
    setIsSubmitting(true);
    try {
      const userId = getCookie("user_id");
      const decision = pendingSelection === "yes" ? "yes" : "no";
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clarify/${userId}/submit?job_id=${currentJob.id}&decision=${decision}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit clarification");
      }
      
      const result = await response.json();
      
      // Show success toast
      showToast(
        `Job ${decision === "yes" ? "approved and moved to pending" : "discarded"}!`,
        1
      );
      
      // Remove current job from list
      const updatedJobs = clarifyJobs.filter((job) => job.id !== currentJob.id);
      setClarifyJobs(updatedJobs);
      
      setShowModal(false);
      setPendingSelection(null);
      
      // Move to next job if available, otherwise go back to first
      if (updatedJobs.length > 0) {
        if (activeJobIndex >= updatedJobs.length) {
          setActiveJobIndex(updatedJobs.length - 1);
        }
      } else {
        setActiveJobIndex(0);
      }
      
    } catch (error) {
      console.error("Error submitting clarification:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to submit clarification",
        0
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchClarifyJobs = async () => {
      try {
        const userId = getCookie("user_id");
        if (!userId) {
          showToast("User ID not found in cookies", 0);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${userId}/calrify`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch clarification jobs");
        }

        const data = await response.json();
        const jobs = data.jobs?.reverse() || [];
        setClarifyJobs(jobs);

        // --- NEW: check hash after jobs are loaded ---
        const hash = window.location.hash; // e.g. "#job_101"
        if (hash) {
          const jobId = hash.substring(1); // remove "#"
          const index = jobs.findIndex((job: Job) => job.id === jobId);
          if (index !== -1) {
            setActiveJobIndex(index);
          }
        }
        // ---------------------------------------------
      } catch (error) {
        console.error(error);
        showToast("Unable to load clarification jobs", 0);
      } finally {
        setLoading(false);
      }
    };

    fetchClarifyJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen pt-[60px] items-center justify-center  bg-zinc-100  dark:bg-zinc-950 rounded-xl px-6 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Simple CSS Spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary dark:border-zinc-800" />
          <div className="text-center">
            <h3 className="text-base font-medium text-zinc-500 dark:text-zinc-400">
              Loading job applications that need your clarification ...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && clarifyJobs.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950 px-6">
        <div className="flex flex-col items-center text-center max-w-md rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-10 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-amber-900/30">
            <Inbox className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </div>

          <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
            All clear 🎉
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            No jobs needing clarification right now. You’re good to go!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="h-screen pt-[60px] bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-200 font-sans p-6">
        <div className="h-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Scrollable */}
          <aside className="lg:w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col">
            {/* Sidebar Header with Job Details */}
            <div className="p-4 border-b border-slate-300 dark:border-zinc-800 space-y-3">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                Pending Jobs
              </h2>

              {/* Current Job Details */}
              <div className="pt-2">
                <h1 className="text-sm font-bold truncate">
                  {currentJob.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                  {currentJob.company} • {currentJob.cities.join(", ")}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                  ID: {currentJob.id}
                </p>
                <div className="flex justify-end items-center mt-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase  tracking-wide text-slate-500 dark:text-zinc-400 block">
                      Salary
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      ₹{currentJob.salary_offered.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {clarifyJobs.map((job, index) => (
                <button
                  key={job.id}
                  onClick={() => setActiveJobIndex(index)}
                  className={`w-full text-left p-3 rounded-lg cursor-pointer transition-all ease-in-out border ${
                    activeJobIndex === index
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-zinc-900 shadow"
                      : "border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <p className="text-[11px] font-bold truncate uppercase">
                    {job.title}
                  </p>
                  <p className="text-[10px] opacity-70 truncate">
                    {job.company}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-slate-500 dark:text-zinc-400">
                      {job.cities.length} location
                      {job.cities.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[9px] font-bold text-slate-700 dark:text-zinc-300">
                      ₹{job.salary_offered.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content - Only Markdown and Actions */}
          <main className="flex-1 flex flex-col min-h-0">
            {/* Clarification - Scrollable with flex-1 */}
            <div className="flex-1 min-h-0">
              <div className="h-full pb-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                    Job Clarification
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto  px-2">
                  {/* reason */}
                  <div className="flex flex-col p-4 mt-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-sm max-w-3xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                          Reason
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                          {currentJob.match_reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* clarification - summary , mismatches , advice */}
                  <div className="h-full p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 ">
                    <div className="markdown-body h-full">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {currentJob.clarification}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Only - Fixed at bottom */}
            <div className="mt-6 flex justify-end">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Discard */}
                <button
                  onClick={() => handleActionInitiation("no")}
                  className="
        inline-flex items-center justify-center gap-2
        px-5 py-2.5
        rounded-md cursor-pointer
        border border-slate-300 dark:border-zinc-700
        text-slate-600 dark:text-zinc-400
        bg-white dark:bg-zinc-900
        text-[11px] font-semibold uppercase tracking-widest
        hover:border-red-400 hover:text-red-600
        dark:hover:border-red-500 dark:hover:text-red-500
        transition-all
      "
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>

                {/* Approve */}
                <button
                  onClick={() => handleActionInitiation("yes")}
                  className="
        inline-flex items-center justify-center gap-2
        px-6 py-2.5
        rounded-md cursor-pointer
        bg-slate-900 dark:bg-zinc-100
        text-white dark:text-zinc-900
        text-[11px] font-bold uppercase tracking-widest
        hover:bg-slate-800 dark:hover:bg-white
        shadow-sm hover:shadow
        transition-all
      "
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <ConfirmationModal
            showModal={showModal}
            setShowModal={setShowModal}
            pendingSelection={pendingSelection}
            currentJob={currentJob}
            confirmAction={confirmAction}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
};

export default JobClarificationPage;

const ConfirmationModal = ({
  showModal,
  setShowModal,
  pendingSelection,
  currentJob,
  confirmAction,
  isSubmitting,
}: any) => {
  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
          </motion.div>

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 400,
                duration: 0.3,
              }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="p-6 pb-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        delay: 0.1,
                        damping: 15,
                        stiffness: 200,
                      }}
                      className={`flex-shrink-0 p-3 rounded-lg ${
                        pendingSelection === "yes"
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                      }`}
                    >
                      {pendingSelection === "yes" ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <AlertTriangle className="w-6 h-6" />
                      )}
                    </motion.div>

                    {/* Title and Description */}
                    <div className="flex-1">
                      <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-base font-semibold text-slate-900 dark:text-zinc-100"
                      >
                        {pendingSelection === "yes"
                          ? "Approve Job Posting"
                          : "Discard Job Posting"}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-slate-500 dark:text-zinc-400 mt-1"
                      >
                        {currentJob.title} • {currentJob.company}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>

                {/* Modal Body */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="px-6 pb-2"
                >
                  <div
                    className={`text-sm p-4 rounded-lg ${
                      pendingSelection === "yes"
                        ? "bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200"
                        : "bg-zinc-100 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{
                          type: "spring",
                          delay: 0.3,
                          damping: 15,
                          stiffness: 200,
                        }}
                        className={`mt-0.5 p-1 rounded ${
                          pendingSelection === "yes"
                            ? "bg-zinc-100 dark:bg-zinc-800/50"
                            : "bg-zinc-200 dark:bg-zinc-900/60"
                        }`}
                      >
                        {pendingSelection === "yes" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </motion.div>
                      <div>
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="font-medium"
                        >
                          {pendingSelection === "yes"
                            ? "This job posting will be published immediately."
                            : "This job posting will be permanently removed."}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-xs mt-1 opacity-90"
                        >
                          {pendingSelection === "yes"
                            ? "Applicants will be able to view and apply for this position."
                            : "This action cannot be undone. All associated data will be deleted."}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Modal Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="p-6 pt-4 border-t border-slate-200 dark:border-zinc-800"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors duration-150 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmAction}
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                        pendingSelection === "yes"
                          ? "bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-sm disabled:opacity-50"
                          : "bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white dark:text-zinc-200 shadow-sm disabled:opacity-50"
                      }`}
                    >
                      {isSubmitting ? (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Processing...
                        </motion.span>
                      ) : pendingSelection === "yes" ? (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve & Publish
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Discard Permanently
                        </motion.span>
                      )}
                    </motion.button>
                  </div>

                  {/* Audit Trail Note */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-center text-xs text-slate-400 dark:text-zinc-500">
                      <motion.div
                        animate={{
                          rotate: [0, 10, 0],
                          transition: {
                            delay: 0.7,
                            duration: 0.5,
                            repeat: 0,
                          },
                        }}
                      >
                        <Shield className="w-3 h-3 mr-1.5" />
                      </motion.div>
                      This action will be logged in the audit trail.
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
