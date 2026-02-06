"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Filter, Search } from "lucide-react";
import AppliedJobCard, { AppliedJob } from "./AppliedJobCard";
import { Footer } from "@/components/landing/footer";
import Navbar from "@/components/Navbar";
import { showToast } from "@/lib/showToast";
import { ToastContainer } from "react-toastify";

// This matches the structure of the JSON you provided
const MOCK_APPLICATIONS = [
  {
    job_id: "job_002",
    name: "Anirban Das",
    email: "dasanirban268@gmail.com",
    phone: "6290375587",
    resume:
      "---\n\n# Anirban Das\n\n## Professional Summary\nHighly motivated and accomplished Full-stack developer with a strong background in competitive programming, leveraging expertise in React and Node.js to deliver scalable and efficient software solutions. Proficient in a range of technologies, including JavaScript, HTML, and CSS, with a passion for building responsive and interactive web applications.\n\n### Technical Skills\n\n* Frontend Development: React.js, Next.js, HTML, CSS\n* Backend Development: Node.js, Express.js\n* Databases: MongoDB, PostgreSQL\n* Version Control: Git\n* Package Management: npm\n* UI/UX: Tailwind CSS, Bootstrap\n* 3D Graphics: Three.js\n* Animation: gsap\n* Cloud Services: Firebase\n\n### Experience\n\n* Frontend Developer Intern, Gofloww (May 2025 - July 2025)\n  - Developed and deployed the Atom Accounting App as the primary frontend developer using React and Tailwind CSS\n  - Collaborated with the backend team to integrate REST APIs and implemented responsive UI components and form handling features\n\n### Featured Projects\n\n#### Code Fusion\nAn online code editor supporting real-time collaboration, multiple languages, and customizable themes. Enables multiple developers to collaborate in real-time with live cursor tracking and integrated in-app chat for seamless communication.\nTechnologies: React.js, Flask, Express.js, MongoDB, Tailwind CSS\nRelevance: Demonstrates expertise in building collaborative web applications using React and Node.js.\n\n#### NoteBridge\nA feature-rich note-taking and sharing platform that enables structured organization through folders, facilitates seamless file sharing with controlled access. Enables interactive engagement through features like likes, comments, and shares.\nTechnologies: React.js, Express.js, MongoDB, Bootstrap\nRelevance: Highlights ability to design and develop scalable and interactive web applications using React and Node.js.\n\n### Achievements\n\n* Secured 4th rank at HaXplore - CodeFest'25, organized by IIT BHU.\n* Winner of Winter Of Code 6.O (Web Development Division) a one-month long hackathon conducted by CyberLabs, IIT(ISM) Dhanbad.\n* Achieved an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023.\n\n### Education\n\n* Indian Institute of Technology (Indian School of Mines), Dhanbad\n\t+ B.Tech in Computer Science and Engineering (2027)\n\n### Social Engagements\n\n* Member, CyberLabs",
    cover_letter:
      "Dear Hiring Manager,\n\nI am thrilled to apply for the Frontend Developer position at Infosys, as I have been following the company's innovative approach to technology and its impact on the industry. The recent advancements in web development, particularly the introduction of Next.js, resonate deeply with my passion for building high-performance and scalable web applications.\n\nAs a seasoned frontend developer with a strong competitive programming background, I possess a unique blend of technical expertise and creative problem-solving skills. My experience in developing and deploying the Atom Accounting App as the primary frontend developer at Gofloww has equipped me with the skills to tackle complex frontend challenges. Additionally, my achievements at CodeFest'25 and Winter Of Code 6.O have demonstrated my ability to work under pressure and deliver high-quality results.\n\nMy proficiency in React, Next.js, and Tailwind CSS will enable me to make a significant contribution to the Infosys team. My experience with Docker and familiarity with Node.js will further enhance the team's capabilities. I am confident that my technical expertise and creative approach will enable me to build responsive and scalable frontend applications that meet the company's high standards.\n\nI would welcome the opportunity to discuss how my skills and experience align with the company's needs and how I can contribute to the team's success. Please feel free to contact me at dasanirban268@gmail.com or 6290375587.\n\nBest regards,\nAnirban Das",
    evidence_points:
      "Based on the raw experience and project descriptions, along with the target job keywords, I have derived the following high-impact 'Evidence Points' using the Google XYZ formula:\n\n* **Developed** the Atom Accounting App as the primary frontend developer, resulting in a **100% deployment rate** with React and Tailwind CSS, within a **6-week development period**, utilizing **React.js** and **Tailwind CSS** technologies.\n* **Improved** the user experience of Code Fusion, an online code editor, by implementing **real-time collaboration features** and **live cursor tracking**, which resulted in a **25% increase in user engagement**, leveraging **React.js**, **Flask**, **Express.js**, **MongoDB**, and **Tailwind CSS** technologies.\n* **Enhanced** the security of NoteBridge, a feature-rich note-taking and sharing platform, by implementing **controlled access features** and **secure file sharing**, which resulted in a **95% reduction in security vulnerabilities**, utilizing **React.js**, **Express.js**, **MongoDB**, and **Bootstrap** technologies.\n* **Secured** 4th rank at HaXplore - CodeFest'25, a national coding competition, organized by IIT BHU, demonstrating expertise in **competitive programming** and **algorithmic problem-solving** skills.\n* **Won** the Winter Of Code 6.O (Web Development Division) hackathon, conducted by CyberLabs, IIT(ISM) Dhanbad, showcasing **web development skills** and **innovation** in a competitive environment.\n* **Achieved** an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023, demonstrating **academic excellence** and **problem-solving skills**.\n* **Represented** IIT Dhanbad at the 37th INTER IIT AQUATICS MEET 2023 held at IIT Gandhinagar and secured 4th place in 200m Individual Medley, showcasing **athletic skills** and **team spirit**.",
    job: {
      id: "job_002",
      title: "Frontend Developer",
      company: "Infosys",
      cities: ["Pune"],
      countries: ["India"],
      is_remote: true,
      is_hybride: false,
      is_onsite: false,
      salary_offered: 900000,
      visa_sponsorship_offered: false,
      start_date: "Immediate",
      required_skills: ["React", "TypeScript", "HTML", "CSS"],
      description: "Building responsive and scalable frontend applications.",
    },
  },
  {
    job_id: "job_002",
    name: "Anirban Das",
    email: "dasanirban268@gmail.com",
    phone: "6290375587",
    resume:
      "---\n\n# Anirban Das\n\n## Professional Summary\nHighly motivated and accomplished Full-stack developer with a strong background in competitive programming, leveraging expertise in React and Node.js to deliver scalable and efficient software solutions. Proficient in a range of technologies, including JavaScript, HTML, and CSS, with a passion for building responsive and interactive web applications.\n\n### Technical Skills\n\n* Frontend Development: React.js, Next.js, HTML, CSS\n* Backend Development: Node.js, Express.js\n* Databases: MongoDB, PostgreSQL\n* Version Control: Git\n* Package Management: npm\n* UI/UX: Tailwind CSS, Bootstrap\n* 3D Graphics: Three.js\n* Animation: gsap\n* Cloud Services: Firebase\n\n### Experience\n\n* Frontend Developer Intern, Gofloww (May 2025 - July 2025)\n  - Developed and deployed the Atom Accounting App as the primary frontend developer using React and Tailwind CSS\n  - Collaborated with the backend team to integrate REST APIs and implemented responsive UI components and form handling features\n\n### Featured Projects\n\n#### Code Fusion\nAn online code editor supporting real-time collaboration, multiple languages, and customizable themes. Enables multiple developers to collaborate in real-time with live cursor tracking and integrated in-app chat for seamless communication.\nTechnologies: React.js, Flask, Express.js, MongoDB, Tailwind CSS\nRelevance: Demonstrates expertise in building collaborative web applications using React and Node.js.\n\n#### NoteBridge\nA feature-rich note-taking and sharing platform that enables structured organization through folders, facilitates seamless file sharing with controlled access. Enables interactive engagement through features like likes, comments, and shares.\nTechnologies: React.js, Express.js, MongoDB, Bootstrap\nRelevance: Highlights ability to design and develop scalable and interactive web applications using React and Node.js.\n\n### Achievements\n\n* Secured 4th rank at HaXplore - CodeFest'25, organized by IIT BHU.\n* Winner of Winter Of Code 6.O (Web Development Division) a one-month long hackathon conducted by CyberLabs, IIT(ISM) Dhanbad.\n* Achieved an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023.\n\n### Education\n\n* Indian Institute of Technology (Indian School of Mines), Dhanbad\n\t+ B.Tech in Computer Science and Engineering (2027)\n\n### Social Engagements\n\n* Member, CyberLabs",
    cover_letter:
      "Dear Hiring Manager,\n\nI am thrilled to apply for the Frontend Developer position at Infosys, as I have been following the company's innovative approach to technology and its impact on the industry. The recent advancements in web development, particularly the introduction of Next.js, resonate deeply with my passion for building high-performance and scalable web applications.\n\nAs a seasoned frontend developer with a strong competitive programming background, I possess a unique blend of technical expertise and creative problem-solving skills. My experience in developing and deploying the Atom Accounting App as the primary frontend developer at Gofloww has equipped me with the skills to tackle complex frontend challenges. Additionally, my achievements at CodeFest'25 and Winter Of Code 6.O have demonstrated my ability to work under pressure and deliver high-quality results.\n\nMy proficiency in React, Next.js, and Tailwind CSS will enable me to make a significant contribution to the Infosys team. My experience with Docker and familiarity with Node.js will further enhance the team's capabilities. I am confident that my technical expertise and creative approach will enable me to build responsive and scalable frontend applications that meet the company's high standards.\n\nI would welcome the opportunity to discuss how my skills and experience align with the company's needs and how I can contribute to the team's success. Please feel free to contact me at dasanirban268@gmail.com or 6290375587.\n\nBest regards,\nAnirban Das",
    evidence_points:
      "Based on the raw experience and project descriptions, along with the target job keywords, I have derived the following high-impact 'Evidence Points' using the Google XYZ formula:\n\n* **Developed** the Atom Accounting App as the primary frontend developer, resulting in a **100% deployment rate** with React and Tailwind CSS, within a **6-week development period**, utilizing **React.js** and **Tailwind CSS** technologies.\n* **Improved** the user experience of Code Fusion, an online code editor, by implementing **real-time collaboration features** and **live cursor tracking**, which resulted in a **25% increase in user engagement**, leveraging **React.js**, **Flask**, **Express.js**, **MongoDB**, and **Tailwind CSS** technologies.\n* **Enhanced** the security of NoteBridge, a feature-rich note-taking and sharing platform, by implementing **controlled access features** and **secure file sharing**, which resulted in a **95% reduction in security vulnerabilities**, utilizing **React.js**, **Express.js**, **MongoDB**, and **Bootstrap** technologies.\n* **Secured** 4th rank at HaXplore - CodeFest'25, a national coding competition, organized by IIT BHU, demonstrating expertise in **competitive programming** and **algorithmic problem-solving** skills.\n* **Won** the Winter Of Code 6.O (Web Development Division) hackathon, conducted by CyberLabs, IIT(ISM) Dhanbad, showcasing **web development skills** and **innovation** in a competitive environment.\n* **Achieved** an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023, demonstrating **academic excellence** and **problem-solving skills**.\n* **Represented** IIT Dhanbad at the 37th INTER IIT AQUATICS MEET 2023 held at IIT Gandhinagar and secured 4th place in 200m Individual Medley, showcasing **athletic skills** and **team spirit**.",
    job: {
      id: "job_002",
      title: "Frontend Developer",
      company: "Infosys",
      cities: ["Pune"],
      countries: ["India"],
      is_remote: true,
      is_hybride: false,
      is_onsite: false,
      salary_offered: 900000,
      visa_sponsorship_offered: false,
      start_date: "Immediate",
      required_skills: ["React", "TypeScript", "HTML", "CSS"],
      description: "Building responsive and scalable frontend applications.",
    },
  },
  {
    job_id: "job_002",
    name: "Anirban Das",
    email: "dasanirban268@gmail.com",
    phone: "6290375587",
    resume:
      "---\n\n# Anirban Das\n\n## Professional Summary\nHighly motivated and accomplished Full-stack developer with a strong background in competitive programming, leveraging expertise in React and Node.js to deliver scalable and efficient software solutions. Proficient in a range of technologies, including JavaScript, HTML, and CSS, with a passion for building responsive and interactive web applications.\n\n### Technical Skills\n\n* Frontend Development: React.js, Next.js, HTML, CSS\n* Backend Development: Node.js, Express.js\n* Databases: MongoDB, PostgreSQL\n* Version Control: Git\n* Package Management: npm\n* UI/UX: Tailwind CSS, Bootstrap\n* 3D Graphics: Three.js\n* Animation: gsap\n* Cloud Services: Firebase\n\n### Experience\n\n* Frontend Developer Intern, Gofloww (May 2025 - July 2025)\n  - Developed and deployed the Atom Accounting App as the primary frontend developer using React and Tailwind CSS\n  - Collaborated with the backend team to integrate REST APIs and implemented responsive UI components and form handling features\n\n### Featured Projects\n\n#### Code Fusion\nAn online code editor supporting real-time collaboration, multiple languages, and customizable themes. Enables multiple developers to collaborate in real-time with live cursor tracking and integrated in-app chat for seamless communication.\nTechnologies: React.js, Flask, Express.js, MongoDB, Tailwind CSS\nRelevance: Demonstrates expertise in building collaborative web applications using React and Node.js.\n\n#### NoteBridge\nA feature-rich note-taking and sharing platform that enables structured organization through folders, facilitates seamless file sharing with controlled access. Enables interactive engagement through features like likes, comments, and shares.\nTechnologies: React.js, Express.js, MongoDB, Bootstrap\nRelevance: Highlights ability to design and develop scalable and interactive web applications using React and Node.js.\n\n### Achievements\n\n* Secured 4th rank at HaXplore - CodeFest'25, organized by IIT BHU.\n* Winner of Winter Of Code 6.O (Web Development Division) a one-month long hackathon conducted by CyberLabs, IIT(ISM) Dhanbad.\n* Achieved an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023.\n\n### Education\n\n* Indian Institute of Technology (Indian School of Mines), Dhanbad\n\t+ B.Tech in Computer Science and Engineering (2027)\n\n### Social Engagements\n\n* Member, CyberLabs",
    cover_letter:
      "Dear Hiring Manager,\n\nI am thrilled to apply for the Frontend Developer position at Infosys, as I have been following the company's innovative approach to technology and its impact on the industry. The recent advancements in web development, particularly the introduction of Next.js, resonate deeply with my passion for building high-performance and scalable web applications.\n\nAs a seasoned frontend developer with a strong competitive programming background, I possess a unique blend of technical expertise and creative problem-solving skills. My experience in developing and deploying the Atom Accounting App as the primary frontend developer at Gofloww has equipped me with the skills to tackle complex frontend challenges. Additionally, my achievements at CodeFest'25 and Winter Of Code 6.O have demonstrated my ability to work under pressure and deliver high-quality results.\n\nMy proficiency in React, Next.js, and Tailwind CSS will enable me to make a significant contribution to the Infosys team. My experience with Docker and familiarity with Node.js will further enhance the team's capabilities. I am confident that my technical expertise and creative approach will enable me to build responsive and scalable frontend applications that meet the company's high standards.\n\nI would welcome the opportunity to discuss how my skills and experience align with the company's needs and how I can contribute to the team's success. Please feel free to contact me at dasanirban268@gmail.com or 6290375587.\n\nBest regards,\nAnirban Das",
    evidence_points:
      "Based on the raw experience and project descriptions, along with the target job keywords, I have derived the following high-impact 'Evidence Points' using the Google XYZ formula:\n\n* **Developed** the Atom Accounting App as the primary frontend developer, resulting in a **100% deployment rate** with React and Tailwind CSS, within a **6-week development period**, utilizing **React.js** and **Tailwind CSS** technologies.\n* **Improved** the user experience of Code Fusion, an online code editor, by implementing **real-time collaboration features** and **live cursor tracking**, which resulted in a **25% increase in user engagement**, leveraging **React.js**, **Flask**, **Express.js**, **MongoDB**, and **Tailwind CSS** technologies.\n* **Enhanced** the security of NoteBridge, a feature-rich note-taking and sharing platform, by implementing **controlled access features** and **secure file sharing**, which resulted in a **95% reduction in security vulnerabilities**, utilizing **React.js**, **Express.js**, **MongoDB**, and **Bootstrap** technologies.\n* **Secured** 4th rank at HaXplore - CodeFest'25, a national coding competition, organized by IIT BHU, demonstrating expertise in **competitive programming** and **algorithmic problem-solving** skills.\n* **Won** the Winter Of Code 6.O (Web Development Division) hackathon, conducted by CyberLabs, IIT(ISM) Dhanbad, showcasing **web development skills** and **innovation** in a competitive environment.\n* **Achieved** an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023, demonstrating **academic excellence** and **problem-solving skills**.\n* **Represented** IIT Dhanbad at the 37th INTER IIT AQUATICS MEET 2023 held at IIT Gandhinagar and secured 4th place in 200m Individual Medley, showcasing **athletic skills** and **team spirit**.",
    job: {
      id: "job_002",
      title: "Frontend Developer",
      company: "Infosys",
      cities: ["Pune"],
      countries: ["India"],
      is_remote: true,
      is_hybride: false,
      is_onsite: false,
      salary_offered: 900000,
      visa_sponsorship_offered: false,
      start_date: "Immediate",
      required_skills: ["React", "TypeScript", "HTML", "CSS"],
      description: "Building responsive and scalable frontend applications.",
    },
  },
  {
    job_id: "job_002",
    name: "Anirban Das",
    email: "dasanirban268@gmail.com",
    phone: "6290375587",
    resume:
      "---\n\n# Anirban Das\n\n## Professional Summary\nHighly motivated and accomplished Full-stack developer with a strong background in competitive programming, leveraging expertise in React and Node.js to deliver scalable and efficient software solutions. Proficient in a range of technologies, including JavaScript, HTML, and CSS, with a passion for building responsive and interactive web applications.\n\n### Technical Skills\n\n* Frontend Development: React.js, Next.js, HTML, CSS\n* Backend Development: Node.js, Express.js\n* Databases: MongoDB, PostgreSQL\n* Version Control: Git\n* Package Management: npm\n* UI/UX: Tailwind CSS, Bootstrap\n* 3D Graphics: Three.js\n* Animation: gsap\n* Cloud Services: Firebase\n\n### Experience\n\n* Frontend Developer Intern, Gofloww (May 2025 - July 2025)\n  - Developed and deployed the Atom Accounting App as the primary frontend developer using React and Tailwind CSS\n  - Collaborated with the backend team to integrate REST APIs and implemented responsive UI components and form handling features\n\n### Featured Projects\n\n#### Code Fusion\nAn online code editor supporting real-time collaboration, multiple languages, and customizable themes. Enables multiple developers to collaborate in real-time with live cursor tracking and integrated in-app chat for seamless communication.\nTechnologies: React.js, Flask, Express.js, MongoDB, Tailwind CSS\nRelevance: Demonstrates expertise in building collaborative web applications using React and Node.js.\n\n#### NoteBridge\nA feature-rich note-taking and sharing platform that enables structured organization through folders, facilitates seamless file sharing with controlled access. Enables interactive engagement through features like likes, comments, and shares.\nTechnologies: React.js, Express.js, MongoDB, Bootstrap\nRelevance: Highlights ability to design and develop scalable and interactive web applications using React and Node.js.\n\n### Achievements\n\n* Secured 4th rank at HaXplore - CodeFest'25, organized by IIT BHU.\n* Winner of Winter Of Code 6.O (Web Development Division) a one-month long hackathon conducted by CyberLabs, IIT(ISM) Dhanbad.\n* Achieved an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023.\n\n### Education\n\n* Indian Institute of Technology (Indian School of Mines), Dhanbad\n\t+ B.Tech in Computer Science and Engineering (2027)\n\n### Social Engagements\n\n* Member, CyberLabs",
    cover_letter:
      "Dear Hiring Manager,\n\nI am thrilled to apply for the Frontend Developer position at Infosys, as I have been following the company's innovative approach to technology and its impact on the industry. The recent advancements in web development, particularly the introduction of Next.js, resonate deeply with my passion for building high-performance and scalable web applications.\n\nAs a seasoned frontend developer with a strong competitive programming background, I possess a unique blend of technical expertise and creative problem-solving skills. My experience in developing and deploying the Atom Accounting App as the primary frontend developer at Gofloww has equipped me with the skills to tackle complex frontend challenges. Additionally, my achievements at CodeFest'25 and Winter Of Code 6.O have demonstrated my ability to work under pressure and deliver high-quality results.\n\nMy proficiency in React, Next.js, and Tailwind CSS will enable me to make a significant contribution to the Infosys team. My experience with Docker and familiarity with Node.js will further enhance the team's capabilities. I am confident that my technical expertise and creative approach will enable me to build responsive and scalable frontend applications that meet the company's high standards.\n\nI would welcome the opportunity to discuss how my skills and experience align with the company's needs and how I can contribute to the team's success. Please feel free to contact me at dasanirban268@gmail.com or 6290375587.\n\nBest regards,\nAnirban Das",
    evidence_points:
      "Based on the raw experience and project descriptions, along with the target job keywords, I have derived the following high-impact 'Evidence Points' using the Google XYZ formula:\n\n* **Developed** the Atom Accounting App as the primary frontend developer, resulting in a **100% deployment rate** with React and Tailwind CSS, within a **6-week development period**, utilizing **React.js** and **Tailwind CSS** technologies.\n* **Improved** the user experience of Code Fusion, an online code editor, by implementing **real-time collaboration features** and **live cursor tracking**, which resulted in a **25% increase in user engagement**, leveraging **React.js**, **Flask**, **Express.js**, **MongoDB**, and **Tailwind CSS** technologies.\n* **Enhanced** the security of NoteBridge, a feature-rich note-taking and sharing platform, by implementing **controlled access features** and **secure file sharing**, which resulted in a **95% reduction in security vulnerabilities**, utilizing **React.js**, **Express.js**, **MongoDB**, and **Bootstrap** technologies.\n* **Secured** 4th rank at HaXplore - CodeFest'25, a national coding competition, organized by IIT BHU, demonstrating expertise in **competitive programming** and **algorithmic problem-solving** skills.\n* **Won** the Winter Of Code 6.O (Web Development Division) hackathon, conducted by CyberLabs, IIT(ISM) Dhanbad, showcasing **web development skills** and **innovation** in a competitive environment.\n* **Achieved** an All India Rank (AIR) 235 among approximately 0.125 million candidates in West Bengal Joint Entrance Examination (WBJEE) 2023, demonstrating **academic excellence** and **problem-solving skills**.\n* **Represented** IIT Dhanbad at the 37th INTER IIT AQUATICS MEET 2023 held at IIT Gandhinagar and secured 4th place in 200m Individual Medley, showcasing **athletic skills** and **team spirit**.",
    job: {
      id: "job_002",
      title: "Frontend Developer",
      company: "Infosys",
      cities: ["Pune"],
      countries: ["India"],
      is_remote: true,
      is_hybride: false,
      is_onsite: false,
      salary_offered: 900000,
      visa_sponsorship_offered: false,
      start_date: "Immediate",
      required_skills: ["React", "TypeScript", "HTML", "CSS"],
      description: "Building responsive and scalable frontend applications.",
    },
  },
];

// Utility function to get a cookie by name
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
};
const AppliedJobsPage = () => {
  const [applications, setApplications] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const userId = getCookie("user_id");
      if (!userId) {
        showToast("User ID not found in cookies", 0);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs/${userId}/applied`,
        );
        const data = await res.json();

        console.log(data);

        if (!res.ok) {
          // FastAPI sends detail in data.detail
          throw new Error(data.detail || "Failed to fetch applied jobs");
        }

        setApplications(data.jobs || []);
      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Failed to load applications", 0);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen pt-[40px] bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-[25px] font-bold text-slate-900 dark:text-zinc-100">
              Application Tracking
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2">
              You have submitted{" "}
              <span className="font-semibold text-slate-900 dark:text-zinc-200">
                {applications.length}
              </span>{" "}
              applications.
            </p>
          </div>

          {/* List of Applications */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <p className="text-center text-slate-500 dark:text-zinc-400">
                Loading applications...
              </p>
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <AppliedJobCard key={app.job_id} application={app} />
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                <p className="text-slate-400">No applications found.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AppliedJobsPage;
