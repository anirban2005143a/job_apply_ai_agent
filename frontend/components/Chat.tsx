"use client";
import React, { useEffect, useRef, useState } from "react";
import { showToast } from "@/lib/showToast";
import { uuid } from "uuidv4";
export type Message = {
  id: string;
  from: "user" | "bot";
  text: string;
  time?: string;
};

export default function Chat({
  initial = [] as Message[],
}: {
  initial?: Message[];
}) {
  // Try to read user data from localStorage if OnboardingProvider isn't present
  //   const [userData, setUserData] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>(initial);

  const userData = {
    _id: "697f6d8eb213f384185c2f49",
    hasVisa: "yes",
    visaType: "PR",
    visaCountries: [
      {
        value: "United Arab Emirates",
        label: "United Arab Emirates",
      },
      {
        value: "American Samoa",
        label: "American Samoa",
      },
    ],
    workMode: [
      {
        value: "Hybrid",
        label: "Hybrid",
      },
      {
        value: "Onsite",
        label: "Onsite",
      },
    ],
    cityPreference: [
      {
        value: "Aachen",
        label: "Aachen",
      },
      {
        value: "Kolkata",
        label: "Kolkata",
      },
    ],
    countryPreference: [
      {
        value: "Afghanistan",
        label: "Afghanistan",
      },
      {
        value: "United Arab Emirates",
        label: "United Arab Emirates",
      },
      {
        value: "India",
        label: "India",
      },
    ],
    companyPreference: "google , ",
    blacklistedCompanies: "facebook",
    salaryFloor: "50000",
    companyType: {
      value: "Large",
      label: "Large",
    },
    industryPreference: "tech",
    yearsOfExperience: "2",
    applicationsPerDay: "20",
    minConfidence: "50",
    full_name: "Anirban Das",
    email: "dasanirban268@gmail.com",
    phone: "6290375587",
    linkedin_url: "https://www.linkedin.com/in/anirban-das-2014412b9/",
    github_url: "https://github.com/anirban2005143a",
    summary:
      "Highly skilled and dedicated full-stack developer with a strong passion for coding and problem-solving. Proficient in a range of programming languages, including C++, C, HTML, JavaScript, and many more. Excellent teamwork and communication skills, with a proven track record of delivering successful projects on time.",
    skills: [
      {
        name: "C++",
        priority: 1,
      },
      {
        name: "C",
        priority: 2,
      },
      {
        name: "HTML",
        priority: 3,
      },
      {
        name: "JavaScript",
        priority: 4,
      },
      {
        name: "React.js",
        priority: 5,
      },
      {
        name: "Next.js",
        priority: 6,
      },
      {
        name: "Express.js",
        priority: 7,
      },
      {
        name: "Docker",
        priority: 8,
      },
      {
        name: "Tailwind CSS",
        priority: 9,
      },
      {
        name: "Bootstrap",
        priority: 10,
      },
      {
        name: "Node.js",
        priority: 11,
      },
      {
        name: "Three.js",
        priority: 12,
      },
      {
        name: "gsap",
        priority: 13,
      },
      {
        name: "Firebase",
        priority: 14,
      },
      {
        name: "MongoDB",
        priority: 15,
      },
      {
        name: "PostgreSQL",
        priority: 16,
      },
    ],
    experience: [
      {
        company: "Gofloww",
        role: "Frontend Developer Intern",
        dates: "May 2025 – July 2025",
        location: "India",
        responsibilities:
          "Built and deployed the Atom Accounting App as the primary frontend developer using React and Tailwind CSS. Collaborated with the backend team to integrate REST APIs, ensuring seamless user interactions and real-time data updates. Implemented responsive UI components and form handling features, improving overall user experience and reducing bounce rate.",
        priority: 1,
      },
    ],
    education: [
      {
        institution:
          "Indian Institute of Technology (Indian School of Mines), Dhanbad",
        degree: "Bachelor of Technology in Computer Science and Engineering",
        year: "Expected May 2027",
        location: "Dhanbad, Jharkhand",
        responsibilities:
          "Relevant coursework: Data Structures and Algorithms (C++), Computer Organization, Computer Architecture, Operating Systems",
        priority: 1,
      },
    ],
    achievements: [
      {
        description:
          "Winner of Winter Of Code 6.O (in Web Development Division) a one-month long hackathon conducted by CyberLabs IIT(ISM) Dhanbad",
        link: "https://movieflix2005.netlify.app/",
        priority: 1,
      },
      {
        description:
          "Achieved an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023",
        link: "https://drive.google.com/file/d/1y6GgPeiB0iyOHcloUKO0Z1ldLJ8h9iaB/view?usp=sharing",
        priority: 2,
      },
      {
        description:
          "Secured 4th rank at HaXplore Codefest25 Indian Institute of Technology IIT BHU Varanasi 1361248",
        link: "https://docs.google.com/spreadsheets/d/1DGnk_THhh_8MD08PnzT_9JA60gsCexhAZd-H27VzO4s/edit?gid=0#gid=0",
        priority: 3,
      },
      {
        description:
          "Secured 99.14 percentile ranking among the top 0.86% of 1.16 million candidates in JEE Mains 2023",
        link: "https://drive.google.com/file/d/1vw0pPxcRp2NV23bN2RtRHEe4W7ssA_Tu/view?usp=sharing",
        priority: 4,
      },
    ],
    social_engagements: [
      {
        organization: "CyberLabs -Tech society of IIT ISM Dhanbad",
        role: "Member",
        description: "",
        priority: 1,
      },
      {
        organization: "Aquatics Team - Swimming Team of IIT ISM Dhanbad",
        role: "Member",
        description: "",
        priority: 2,
      },
      {
        organization: "",
        role: "",
        description:
          "Represented IIT Dhanbad at the 37th INTER IIT AQUATICS MEET 2023 held at IIT Gandhinagar and secured 4th place in 200m Individual Medley",
        priority: 3,
      },
    ],
    projects: [
      {
        name: "Code Fusion",
        description:
          "An online code editor supporting real-time collaboration, multiple languages, and customizable themes",
        technologies: "React.js, Flask, Express.js, MongoDB, Tailwind CSS",
        deployed_project: "https://code-fusion-code-collab.vercel.app/",
        github: "https://github.com/anirban2005143a/code-Fusion",
        priority: 1,
      },
      {
        name: "NoteBridge",
        description:
          "A feature-rich note-taking and sharing platform that enables structured organization through folders, facilitates seamless file sharing with controlled access",
        technologies: "React.js, Express.js, MongoDB, Bootstrap",
        deployed_project: "https://notebridge.vercel.app/",
        github: "https://github.com/anirban2005143a/note-bridge",
        priority: 2,
      },
    ],
    sport_programming: [
      {
        description:
          "Solved 100+ problems on LeetCode, focusing on data structures and algorithms",
        leetcode: "https://leetcode.com/u/aswU2SZvDg/",
        priority: 1,
      },
      {
        description:
          "Solved 180+ problems on CodeForces, improving competitive programming skills",
        codeforces: "https://codeforces.com/profile/anirban2005",
        priority: 2,
      },
    ],
    portfolio_url: "https://anirban-das-portfolio.vercel.app/",
    password: "$2b$12$0.ZeI6xrtrKHHnIAOZV8V.ySfvTIvA/EQ26GgyhLRKFY4SBb0CyT.",
    created_at: "2026-02-01T15:13:18.175797",
  };

  //   useEffect(() => {
  //     try {
  //       const stored = JSON.parse(localStorage.getItem('onboardingState') || '{}').userData;
  //       if (stored) setUserData(stored);
  //     } catch (e) {
  //       setUserData(null);
  //     }
  //   }, []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [appliedCompanies, setAppliedCompanies] = useState<any[] | null>(null);
  const [listed, setListed] = useState<{ kind: string; items: any[] } | null>(
    null,
  );
  const [currentInterrupt, setCurrentInterrupt] = useState<any | null>(null);

  // Sidebar state: applied & rejected lists (kept in sync via WebSocket)
  const [sidebarData, setSidebarData] = useState<{
    applied: any[];
    rejected: any[];
  }>({ applied: [], rejected: [] });
  const [wsConnected, setWsConnected] = useState(false);

  // Helper to safely render values (strings, numbers, or objects) in UI
  const renderValue = (v: any) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "object") {
      return (
        <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded">
          {JSON.stringify(v, null, 2)}
        </pre>
      );
    }
    return String(v);
  };

  // Helper to process server JSON responses in one place
  const processServerJson = (json: any) => {
    if (!json) return;
    if (json.status === "waiting_for_clarification") {
      const rawQ = json.question || "Can you clarify?";
      const question =
        typeof rawQ === "string" ? rawQ : JSON.stringify(rawQ, null, 2);
      upsertBotMessage(question);
      setCurrentInterrupt(json.interrupt || null);
      // Do not show the 'Applied so far' banner in chat; update sidebar only
      const applied = json.applied_so_far || [];
      if (applied && applied.length > 0) {
        setSidebarData((s) => ({ ...s, applied }));
        setAppliedCompanies(applied);
      }
      setListed(null);
      return;
    }

    if (json.status === "list") {
      const kind = json.kind || json.listed_kind || "list";
      const items = json.items || json.listed_items || [];
      // Only display the assistant message if the backend provided one
      if (json.message) {
        const text = typeof json.message === "string" ? json.message : JSON.stringify(json.message);
        upsertBotMessage(text);
      }
      setListed({ kind, items });
      if (kind === "applied") {
        setSidebarData((s) => ({ ...s, applied: items }));
        setAppliedCompanies(items);
      }
      if (kind === "rejected") {
        setSidebarData((s) => ({ ...s, rejected: items }));
      }
      return;
    }

    if (json.status === "success") {
      // Use the assistant message returned by the backend when available
      const companies = json.companies_applied || json.applied_receipts || json.results || [];

      if (companies && companies.length > 0) {
        setSidebarData((s) => ({ ...s, applied: companies }));
        setAppliedCompanies(companies);
      }

      const serverMsg = json.message || json.msg || null;
      // Only display backend message; do not synthesize a client-side summary
      if (serverMsg) {
        const text = typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg);
        upsertBotMessage(text);
      }

      setCurrentInterrupt(null);
      setListed(null);
      return;
    }

    // Do not synthesize messages. Only display server-provided assistant messages for clarity.
    if (json.message) {
      const text = typeof json.message === "string" ? json.message : JSON.stringify(json.message);
      upsertBotMessage(text);
    }
  };

  // Helper to ensure at most one assistant message is present in the chat.
  // If an assistant message already exists, replace it; otherwise append.
  const upsertBotMessage = (text: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      const msgObj: Message = {
        id: `${Date.now()}-b`,
        from: "bot",
        text,
        time: new Date().toISOString(),
      };
      // Replace last bot message if present
      if (last && last.from === "bot") {
        return [...prev.slice(0, -1), msgObj];
      }
      return [...prev, msgObj];
    });
  };

  //   const [threadId] = useState(() => `t-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom whenever messages change
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Polling: fetch applied/rejected jobs every 30 seconds (and immediately on mount)
  const [polling, setPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const lastCountsRef = useRef({ applied: 0, rejected: 0 });
  const userId = (userData && (userData.email || userData._id)) || "";

  useEffect(() => {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    if (!backend) return;
    if (!userId) return;

    let mounted = true;
    let id: ReturnType<typeof setInterval> | null = null;

    const fetchJobs = async () => {
      try {
        const res = await fetch(
          `${backend.replace(/\/$/, "")}/api/jobs/${encodeURIComponent(userId)}`,
        );
        if (!res.ok) {
          console.warn("Failed to fetch jobs snapshot", res.statusText);
          return;
        }
        const d = await res.json();
        if (!mounted) return;
        const applied = d.applied || [];
        const rejected = d.rejected || [];

        // Update only when things changed to avoid excessive UI churn
        const prev = lastCountsRef.current;
        if (
          applied.length !== prev.applied ||
          rejected.length !== prev.rejected
        ) {
          setSidebarData({ applied, rejected });
          lastCountsRef.current = {
            applied: applied.length,
            rejected: rejected.length,
          };
        }

        setLastUpdated(Date.now());
        setPolling(true);
      } catch (e) {
        console.warn("Jobs polling error", e);
      }
    };

    // Initial fetch + interval
    fetchJobs();
    id = setInterval(fetchJobs, 30 * 1000);
    return () => {
      mounted = false;
      if (id) clearInterval(id);
      setPolling(false);
    };
  }, [userId]);

  const sendUserCommand = async (text: string) => {
    // Add user bubble
    const userMsg: Message = {
      id: `${Date.now()}-u`,
      from: "user",
      text,
      time: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    setIsTyping(true);

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "";

      // Heuristic: mark short greetings as CHAT to avoid accidental action starts
      const greetingWords = [
        "hi",
        "hello",
        "hey",
        "hiya",
        "good morning",
        "good afternoon",
        "good evening",
        "hey there",
      ];
      const words = text.toLowerCase().split(/\s+/).filter(Boolean);
      let user_intent_hint: string | undefined = undefined;
      if (
        words.length <= 2 &&
        words.length > 0 &&
        greetingWords.includes(words[0])
      ) {
        user_intent_hint = "CHAT";
      }

      const payload: any = {
        user_id: (userData && (userData.email || userData._id)) || uuid(),
        thread_id: (userData && (userData.email || userData._id)) || uuid(),
        user_profile: userData || undefined,
        user_response: text,
      };
      if (user_intent_hint) payload.user_intent_hint = user_intent_hint;

      const res = await fetch(`${backend}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        showToast("Error from server: " + txt, 0);
        upsertBotMessage("Server error: " + txt);
      } else {
        const json = await res.json();
        processServerJson(json);
      }
    } catch (err) {
      console.error(err);
      showToast("Error contacting chat server: " + (err as any)?.message, 0);
      upsertBotMessage("Network error: " + (err as any)?.message);
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setAppliedCompanies(null);
    setListed(null);
    await sendUserCommand(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      submit();
    }
  };

  return (
    <div className=" grid grid-cols-5 ">
      <div className="col-span-2 flex flex-col h-full rounded-lg overflow-hidden shadow-lg bg-white">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
            💬
          </div>
          <div>
            <div className="font-semibold">Assistant</div>
            <div className="text-xs opacity-80">
              Ask anything about job applications
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row ">
          {/* Left: Chat (main area) */}
          <div className=" w-full flex flex-col bg-amber-200">
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%)]"
            >
              {messages.length === 0 && (
                <div className="text-center text-zinc-500">
                  <div className="text-lg font-semibold">
                    Start a conversation
                  </div>
                  <div className="mt-2 text-sm">
                    Ask about resume tips, job matches, or application status.
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={` ${m.from === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${m.from === "user" ? "bg-primary text-white" : "bg-gray-100 text-zinc-800"}`}
                  >
                    {typeof m.text === "string" ? (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(m.text, null, 2)}
                      </pre>
                    )}
                  </div>

                  {(() => {
                    const txt = m.text as any;
                    if (typeof txt === "string") {
                      try {
                        const parsed = JSON.parse(txt);
                        if (
                          Array.isArray(parsed) &&
                          parsed.length > 0 &&
                          (parsed[0].company ||
                            parsed[0].company_name ||
                            parsed[0].org)
                        ) {
                          return (
                            <div className="mt-3 p-3 bg-white border rounded shadow-sm text-sm">
                              <div className="font-medium mb-2">
                                Applied Companies
                              </div>
                              <div className="space-y-2">
                                {parsed.map((p: any, idx: number) => (
                                  <div key={idx} className="p-2 border rounded">
                                    <div className="font-semibold">
                                      {p.company || p.company_name || p.org}
                                    </div>
                                    <div className="text-xs text-zinc-600">
                                      {p.title ||
                                        p.job_title ||
                                        p.position ||
                                        ""}
                                    </div>
                                    {p.appId || p.app_id ? (
                                      <div className="text-xs">
                                        App ID: {p.appId || p.app_id}
                                      </div>
                                    ) : null}
                                    {p.receipt ? (
                                      <div className="text-xs">
                                        Receipt:{" "}
                                        {typeof p.receipt === "object" ? (
                                          <pre className="text-xs inline">
                                            {JSON.stringify(p.receipt)}
                                          </pre>
                                        ) : (
                                          p.receipt
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        if (
                          txt.trim().startsWith("[") &&
                          txt.toLowerCase().includes("company")
                        ) {
                          return (
                            <div className="mt-3 p-3 bg-white border rounded shadow-sm text-sm">
                              <div className="font-medium mb-2">
                                Applied Companies
                              </div>
                              <pre className="text-xs overflow-x-auto max-h-40">
                                {txt}
                              </pre>
                            </div>
                          );
                        }
                      }
                    }
                    return null;
                  })()}

                  <div className="text-[10px] mt-1 opacity-60">
                    {new Date(m.time || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mr-auto text-left">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse inline-block" />
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse inline-block delay-75" />
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse inline-block delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input anchored inside left column */}
            <form
              onSubmit={submit}
              className="p-4 border-t bg-white flex items-center gap-3"
            >
              <input
                className="form-control w-full input-focus rounded-lg border border-[var(--card-border)] focus:border-[#4B4BE1] focus:ring-2 focus:ring-[#4B4BE1] transition-all duration-150 px-4 py-2"
                placeholder="Type a message and press Enter..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Message input"
              />
              <button
                type="submit"
                className="btn btn-primary px-4 py-2"
                disabled={sending || input.trim() === ""}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <JobsPanel
        polling={polling}
        lastUpdated={lastUpdated}
        sidebarData={sidebarData}
        renderValue={renderValue}
      />
    </div>
  );
}

const JobsPanel = ({ polling, lastUpdated, sidebarData, renderValue }: any) => {
  return (
    <div className="col-span-3 h-screen overflow-auto flex flex-col h-full bg-slate-50 border-l border-t md:border-t-0 overflow-hidden">
      {/* Header Section */}
      <div className="p-4 bg-white border-b flex items-center justify-between shrink-0">
        <h2 className="font-bold text-slate-800 tracking-tight">
          Jobs Activity
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${polling ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
          />
          <span className="text-[10px] font-medium uppercase text-slate-500 tracking-wider">
            {polling ? "Live Sync" : "Offline"}
            {lastUpdated &&
              ` • ${new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </span>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* --- APPLIED SECTION --- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Applied
            </span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {sidebarData.applied.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-slate-400 text-xs">
              No active applications
            </div>
          ) : (
            <div className="grid gap-3">
              {sidebarData.applied.map((a: any, i: number) => {
                const job = a.job || a;
                return (
                  <div
                    key={i}
                    className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 leading-none">
                          {job.company || job.company_name || "Company"}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1.5 font-medium">
                          {job.title || job.position || "Software Engineer"}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                        {a.status || "Applied"}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.appId && (
                        <span className="text-[10px] text-slate-500 border px-1.5 py-0.5 rounded bg-slate-50">
                          ID: {a.appId}
                        </span>
                      )}
                      {a.submittedAt && (
                        <span className="text-[10px] text-slate-400 italic">
                          Sent {new Date(a.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Receipt Details - Collapsible logic could be added here */}
                    {a.receipt && (
                      <div className="mt-3 pt-3 border-t border-slate-50 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Evidence Summary
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 italic">
                          "{a.receipt.tailoredResume?.substring(0, 100)}..."
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- REJECTED SECTION --- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Rejected
            </span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid gap-3">
            {sidebarData.rejected.map((r: any, i: number) => {
              const job = r.job || r;
              return (
                <div
                  key={i}
                  className="bg-white/60 p-4 rounded-xl border border-red-100 opacity-90"
                >
                  <div className="flex justify-between items-start opacity-70">
                    <div>
                      <h3 className="font-bold text-slate-800 leading-none">
                        {job.company}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{job.title}</p>
                    </div>
                    {job.salary_offered && (
                      <span className="text-xs font-mono text-slate-500">
                        ₹{job.salary_offered.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Context Tags */}
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {job.is_remote
                        ? "Remote"
                        : job.is_hybride
                          ? "Hybrid"
                          : "Onsite"}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {job.company_type}
                    </span>
                  </div>

                  {/* Rejection Reason Box */}
                  <div className="mt-3 p-2.5 bg-red-50/50 border border-red-100 rounded-lg">
                    <p className="text-[11px] leading-relaxed text-red-700">
                      <span className="font-bold uppercase text-[9px] block mb-0.5">
                        Reason for rejection:
                      </span>
                      {typeof r.reason === "object"
                        ? renderValue(r.reason)
                        : r.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
