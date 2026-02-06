"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Award,
  User,
  CheckCircle2,
  Clock,
  Globe,
  CheckCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export interface Job {
  id: string;
  title: string;
  company: string;
  cities: string[];
  countries: string[];
  is_remote: boolean;
  is_hybride: boolean;
  is_onsite: boolean;
  salary_offered: number;
  visa_sponsorship_offered: boolean;
  start_date: string;
  required_skills: string[];
  description: string;
  [key: string]: any;
}

export interface AppliedJob {
  job_id: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  cover_letter: string;
  evidence_points: string;
  job: Job;
}

const AppliedJobCard = ({ application }: { application: AppliedJob }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id={application.job.id} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md shadow-sm transition-all duration-200 hover:border-slate-400 dark:hover:border-zinc-600">
      {/* Header Section */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded">
              <Building2 className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-none">
                {application.job.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                  {application.job.company}
                </p>
                <span className="text-[10px] text-slate-300 dark:text-zinc-600">
                  •
                </span>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
                  <Globe className="w-3 h-3" />
                  {application.job.is_remote
                    ? "Remote"
                    : application.job.is_hybride
                      ? "Hybrid"
                      : "Onsite"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-2 py-1 
                  bg-emerald-50 dark:bg-emerald-950/40 
                  border border-emerald-200 dark:border-emerald-900 
                  rounded text-[11px] font-bold tracking-wide 
                  text-zinc-600 dark:text-zinc-400"
            >
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Applied
            </div>
          </div>
        </div>

        {/* Dense Info Bar */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 border-t border-slate-100 dark:border-zinc-900 pt-4">
          <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 opacity-70" />
            <span>
              {application.job.cities[0]}, {application.job.countries[0]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
            {/* <DollarSign className="w-3.5 h-3.5 opacity-70" /> */}
            <span className="font-medium">
              ₹ {(application.job.salary_offered / 100000).toFixed(1)} LPA
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>Starts: {application.job.start_date}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-zinc-400">
            <Briefcase className="w-3.5 h-3.5 opacity-70" />
            <span>ID: {application.job_id}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-between items-center">
          <div className="flex gap-1.5">
            {application.job.required_skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[12px] font-medium text-slate-500 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-1 cursor-pointer text-[13px] font-bold tracking-normal text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isExpanded ? "Collapse" : "Details"}
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <div className="px-5 pb-6 pt-0 bg-slate-50/50 dark:bg-zinc-900/30 border-t border-slate-100 dark:border-zinc-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
            {/* Left side: Textual content */}
            <div className="space-y-5">
              <section>
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase tracking-[0.15em]">
                  <FileText className="w-3 h-3" /> Cover Letter
                </h3>
                <div className="p-3 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 leading-relaxed max-h-[200px] overflow-y-auto ">
                  <div className="markdown-body h-full overflow-y-auto">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {application.cover_letter}
                    </ReactMarkdown>
                  </div>
                </div>
              </section>

              <section
                className="px-2 py-4 bg-slate-200/70 dark:bg-zinc-900/60 
                    border border-slate-200 dark:border-zinc-800 rounded-lg overflow-auto max-h-[250px] overflow-y-auto"
              >
                <h3
                  className="flex items-center ml-2 gap-2 
                 text-[11px] font-bold 
                 text-slate-600 dark:text-zinc-300 
                 mb-2 uppercase tracking-[0.15em]"
                >
                  <Award className="w-3.5 h-3.5" />
                  System Evaluation
                </h3>

                <div
                  className="text-sm max-w-none p-2 rounded-lg
                  text-slate-700 dark:text-zinc-200 
                  dark:prose-invert markdown-body"
                >
                  <div className="markdown-body">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {application.evidence_points}
                    </ReactMarkdown>
                  </div>
                </div>
              </section>
            </div>

            {/* Right side: Meta and Preview */}
            <div className="space-y-5">
              <section>
                <h3 className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase tracking-[0.15em]">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded">
                    <p className="text-[8px] text-slate-400 dark:text-zinc-600 uppercase font-bold">
                      Email
                    </p>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 truncate tracking-wide">
                      {application.email}
                    </p>
                  </div>
                  <div className="p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded">
                    <p className="text-[8px] text-slate-400 dark:text-zinc-600 uppercase font-bold">
                      Phone
                    </p>
                    <p className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 tracking-wide">
                      {application.phone}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-2 uppercase tracking-[0.15em]">
                  Resume Attachment
                </h3>

                <div className="relative group overflow-hidden border border-slate-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 ">
                  {/* Resume preview */}
                  <div className="p-3 text-sm font-sans text-zinc-500 dark:text-zinc-300 leading-[1.3] max-h-[380px] overflow-y-auto h-full">
                    <div className="markdown-body max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {application.resume}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  {/* <div
                    className="absolute inset-0 flex items-center justify-center 
                    bg-white/80 dark:bg-zinc-950/90 
                    opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 
                         bg-slate-800 dark:bg-zinc-200 
                         text-white dark:text-zinc-900 
                         rounded text-[10px] font-bold uppercase tracking-wider
                         hover:bg-slate-950 dark:hover:bg-white transition-all"
                    >
                      Review PDF <ExternalLink className="w-3 h-3" />
                    </button>
                  </div> */}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AppliedJobCard;
