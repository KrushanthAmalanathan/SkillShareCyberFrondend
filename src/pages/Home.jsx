// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import Dashboard from "../components/Dashboard";
import { CourseEndPoint } from "../utils/ApiRequest";

import {
  FiShield,
  FiLock,
  FiKey,
  FiAlertTriangle,
  FiWifi,
  FiRefreshCw,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiInbox,
} from "react-icons/fi";

const TIPS = [
  "Use a password manager and make every password unique.",
  "Enable 2-Factor Authentication (2FA) everywhere you can.",
  "Keep your OS, browser, and apps auto-updated.",
  "Think before you click: hover links and check the sender.",
  "Back up important data with the 3-2-1 rule (3 copies, 2 media, 1 off-site).",
  "Lock your devices with PIN/biometrics and encrypt storage.",
  "Avoid public Wi-Fi or use a trusted VPN when you must.",
  "Limit app permissions—only what’s necessary.",
  "Separate work and personal accounts/browsers.",
  "Review account activity and revoke unused sessions regularly.",
];

// helper
const priceLabel = (p) => {
  const n = Number(p);
  if (!Number.isFinite(n) || n === 0) return "Free";
  const t = n.toFixed(2).replace(/\.00$/, "");
  return `Rs. ${t}`;
};

const Home = () => {
  const navigate = useNavigate();

  // latest courses (optional showcase)
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        setLoadingCourses(true);
        const { data } = await axios.get(CourseEndPoint);
        if (stop) return;
        const list = Array.isArray(data) ? data : [];
        // newest first if createdAt exists
        const sorted = [...list].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setCourses(sorted.slice(0, 4));
      } catch {
        setCourses([]);
      } finally {
        if (!stop) setLoadingCourses(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  // deterministic “tip of the day”
  const dailyTip = useMemo(() => {
    const idx = new Date().getDate() % TIPS.length;
    return TIPS[idx];
  }, []);

  return (
    <Dashboard>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1536] via-[#0b1f56] to-[#001439] text-white">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          {/* subtle grid overlay */}
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="md:w-2/3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
                <FiShield className="text-green-300" />
                <span className="text-green-100">Cyber Security Skill Share</span>
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight">
                Learn. Practice. Defend.
              </h1>
              <p className="mt-3 text-blue-100 max-w-2xl">
                Build job-ready cyber skills—phishing defense, network hardening, incident
                response, cloud security and more—with hands-on courses and guided labs.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/courses")}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-[#001439] hover:bg-green-400 transition"
                >
                  <FiBookOpen />
                  Browse Courses
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 hover:bg-white/10 transition"
                >
                  Learn about us <FiArrowRight />
                </button>
              </div>
            </div>

            <div className="md:w-1/3 w-full">
              <div className="rounded-xl bg-white/5 p-4 shadow-lg ring-1 ring-white/10">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <FiAlertTriangle className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Daily Security Tip</p>
                    <p className="mt-1 font-medium">{dailyTip}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-white/10 p-3">
                    <FiLock className="mx-auto" />
                    <p className="mt-1 text-xs text-blue-100">2FA First</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <FiRefreshCw className="mx-auto" />
                    <p className="mt-1 text-xs text-blue-100">Auto-Update</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <FiWifi className="mx-auto" />
                    <p className="mt-1 text-xs text-blue-100">Safe Wi-Fi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick wins */}
      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <FiKey className="w-5 h-5" />,
              title: "Passwords & 2FA",
              desc: "Use a password manager, unique passwords, and enable 2FA on all critical accounts.",
            },
            {
              icon: <FiInbox className="w-5 h-5" />,
              title: "Phishing Defense",
              desc: "Verify senders, hover links, be skeptical of ‘urgent’ requests, and report suspicious emails.",
            },
            {
              icon: <FiRefreshCw className="w-5 h-5" />,
              title: "Patch & Backup",
              desc: "Turn on automatic updates and follow the 3-2-1 backup rule for critical data.",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-blue-700">
                {c.icon}
                <span className="text-sm font-semibold">{c.title}</span>
              </div>
              <p className="mt-2 text-gray-700">{c.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-sm text-blue-700">
                Learn more <FiArrowRight />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Courses */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Latest Courses</h2>
          <button
            onClick={() => navigate("/courses")}
            className="text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            View all <FiArrowRight />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {loadingCourses
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white">
                  <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-100 mt-3 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-100 mt-2 rounded animate-pulse" />
                </div>
              ))
            : courses.map((c) => {
                const id = c._id || c.id;
                return (
                  <div
                    key={id}
                    className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={c.thumbnailUrl || "/altImage.png"}
                        alt={c.courseName}
                        onError={(e) => (e.currentTarget.src = "/altImage.png")}
                        className="h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900 line-clamp-2">
                      {c.courseName || "Untitled Course"}
                    </h3>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
                        {priceLabel(c.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/courses/${id}`)}
                      className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white h-9 text-sm hover:bg-blue-700 transition"
                    >
                      View Course
                    </button>
                  </div>
                );
              })}
          {!loadingCourses && courses.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-gray-500">
              No courses available yet.
            </div>
          )}
        </div>
      </section>

      {/* Self-check list */}
      <section className="mt-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Quick Security Self-Check</h2>
          <p className="text-gray-600 mt-1">
            See how many you already do—great habits compound quickly.
          </p>
          <ul className="mt-4 grid sm:grid-cols-2 gap-3">
            {[
              "I use a password manager for all accounts.",
              "I enable 2FA on email, banking, and socials.",
              "My system and apps auto-update.",
              "I regularly back up important files.",
              "I verify unexpected links/attachments.",
              "I avoid public Wi-Fi or use a trusted VPN.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <FiCheckCircle className="mt-1 text-green-600 shrink-0" />
                <span className="text-gray-800">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Dashboard>
  );
};

export default Home;
