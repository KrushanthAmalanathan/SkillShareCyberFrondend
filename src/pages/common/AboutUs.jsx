// src/pages/about/AboutUs.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "../../components/Dashboard";

/** ---------------------- Team Carousel ---------------------- */
function TeamCarousel() {
  const members = useMemo(
    () => [
      { img: "/user1.jpg", name: "Kezothran Gnanapragasam" },
      { img: "/user2.jpg", name: "Mohamed Farhan" },
      { img: "/user3.jpg", name: "Mohamed Farman" },
      { img: "/user4.jpg", name: "Kajan S" },
      { img: "/user5.jpg", name: "Kowshik S.N" },
    ],
    []
  );

  const DEGREE =
    "BSc (Hons) in Information Technology Specializing in Cyber Security";

  const [[index, direction], setIndex] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const current = ((index % members.length) + members.length) % members.length;

  // Auto-cycle
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex(([i]) => [i + 1, 1]), 4000);
    return () => clearInterval(id);
  }, [paused]);

  // Swipe helpers
  const swipeConfidenceThreshold = 8000;
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

  return (
    <div
      className="relative w-full max-w-3xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="h-[360px] sm:h-[380px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.article
            key={current}
            className="absolute inset-0"
            custom={direction}
            variants={{
              enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.97 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.97 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) setIndex(([i]) => [i + 1, 1]);
              else if (swipe > swipeConfidenceThreshold) setIndex(([i]) => [i - 1, -1]);
            }}
          >
            <div className="group h-full rounded-2xl border border-gray-100 bg-blue-50 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex">
              <div className="hidden sm:block sm:w-1/2 bg-gray-50">
                <img
                  src={members[current].img}
                  alt={members[current].name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-full sm:w-1/2 p-6 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
                  <p className="text-xs uppercase tracking-wider text-blue-700">
                    Team Member
                  </p>
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                  {members[current].name}
                </h3>
                <p className="mt-3 text-gray-700">{DEGREE}</p>

                <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700 font-medium">
                    Cyber Security
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 font-medium">
                    Research
                  </div>
                  <div className="rounded-lg bg-purple-50 px-3 py-2 text-purple-700 font-medium">
                    Innovation
                  </div>
                </div>

                <div className="mt-auto pt-6 text-sm text-gray-500">
                  Swipe or wait to see the next teammate.
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {members.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(([_, d]) => [i, d])}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === current ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/** ---------------------- Contact Form ---------------------- */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    const { name, email, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErr("All fields are required.");
      return;
    }
    // Client-side-only success UI
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="rounded-2xl bg-blue-50 p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900">Contact Us</h3>
      <p className="mt-1 text-gray-600 text-sm">
        Questions or feedback? Send us a message.
      </p>

      {sent && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-emerald-700">
          Thanks! Your message has been received.
        </div>
      )}
      {err && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-red-700">{err}</div>
      )}

      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Your message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

/** ---------------------- Page ---------------------- */
export default function AboutUs() {
  const heroRef = useRef(null);

  return (
    <Dashboard>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-2xl shadow-sm"
      >
        <img
          src="/SLIIT-malabe.jpg"
          alt="SLIIT Malabe Campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#001439]/80 via-[#001439]/60 to-transparent" />
        <div className="relative px-6 py-10 md:py-14 lg:py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4 md:col-span-2">
              <img
                src="/SLIITlogo.jpg"
                alt="SLIIT Shield Logo"
                className="h-16 w-auto rounded bg-white/90 p-2 shadow"
              />
              <img
                src="/SLIIT.png"
                alt="SLIIT Wordmark"
                className="h-12 w-auto hidden sm:block"
              />
            </div>

            <div className="md:col-span-3 mt-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Cyber Security Skill Share
              </h1>
              <p className="mt-2 max-w-3xl text-gray-100">
                This platform is hosted by 5 BSc (Hons) in Information Technology
                <span className="whitespace-nowrap"> Specialising in Cyber Security</span>{" "}
                students from Sri Lanka Institute of Information Technology (SLIIT).
                Learn, practice, and grow with curated training resources, labs, and
                peer-to-peer knowledge sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900">Our Team</h2>
        <p className="text-gray-600 mt-1">
          Meet the students who power this platform.
        </p>
        <div className="mt-5">
          <TeamCarousel />
        </div>
      </section>

      {/* SLIIT Info */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 rounded-2xl bg-blue-50 p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">About SLIIT Cyber Security</h3>
          <p className="mt-2 text-gray-700 leading-relaxed">
            The SLIIT Cyber Security programme develops graduates with deep knowledge
            in network defense, ethical hacking, digital forensics, risk management,
            cloud and application security, and secure software engineering.
            Students gain hands-on experience through labs, projects, and industry
            engagement—preparing them for impactful careers safeguarding systems and data.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.sliit.lk/computing/programmes/cyber-security-degree/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
            >
              Cyber Security Degree
            </a>
            <a
              href="https://www.sliit.lk/computing/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-blue-700 hover:bg-blue-50 transition"
            >
              Visit SLIIT
            </a>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="w-11/12 sm:w-5/6 lg:w-4/5">
              <img
                src="/Approve.png"
                alt="Approved Sectare Wordmark"
                loading="lazy"
                className="w-full h-auto object-contain rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        <ContactForm />
      </section>
    </Dashboard>
  );
}
