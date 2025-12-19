// src/pages/courses/ViewCourse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FiChevronDown } from "react-icons/fi";
import { FaFilePowerpoint, FaFileVideo } from "react-icons/fa";
import axios from "axios";

import Dashboard from "../../components/Dashboard";
import { useAuth } from "../../hooks/useAuth";
import { CourseEndPoint } from "../../utils/ApiRequest";

const officeViewer = (url) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

export default function ViewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [course, setCourse] = useState(null);

  // exam status: attempted/passed for the current user
  const [status, setStatus] = useState({ loading: true, attempted: false, passed: false });

  // dropdowns
  const [open, setOpen] = useState({ video: false, ppt: false });

  // simple poster slideshow (right column, bottom)
  const posters = useMemo(() => ["/Poster1.png", "/Poster2.png", "/Poster3.png"], []);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % posters.length), 3000);
    return () => clearInterval(t);
  }, [posters.length]);

  // load course
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(`${CourseEndPoint}/${id}`);
        setCourse(data);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated]);

  // load my exam status (attempted/passed)
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { data } = await axios.get(`${CourseEndPoint}/${id}/status`);
        // expected: {attempted:boolean, passed:boolean, score?, total?, percent?}
        setStatus({ loading: false, attempted: !!data?.attempted, passed: !!data?.passed });
      } catch {
        // if endpoint not found/unauth, default to "never attempted"
        setStatus({ loading: false, attempted: false, passed: false });
      }
    })();
  }, [id, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Dashboard>
        <div className="p-6 text-gray-700">Please log in to view the course.</div>
      </Dashboard>
    );
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="p-6">Loading…</div>
      </Dashboard>
    );
  }

  if (err || !course) {
    return (
      <Dashboard>
        <div className="p-6 text-red-600">{err || "Not found"}</div>
      </Dashboard>
    );
  }

  const priceLabel =
    typeof course.price === "number" && course.price <= 0
      ? "Free"
      : course.price != null
      ? `Rs. ${Number(course.price).toFixed(2).replace(/\.00$/, "")}`
      : null;

  // --- NEW: status label + exam button text/behavior ---
  const statusLabel = !status.attempted
    ? "Get Start"
    : status.passed
    ? "Already Completed"
    : "Continue Course";

  const statusPillClass = !status.attempted
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : status.passed
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

  const examBtn = (() => {
    if (!status.attempted) return { text: "Take Test", canGo: true };
    if (status.passed) return { text: "Completed", canGo: false };
    return { text: "Try Again", canGo: true };
  })();

  const questionsMissing = (course?.questions?.length || 0) === 0;

  return (
    <Dashboard>
      {/* Hero poster */}
      <div className="w-full mb-4">
        <img
          src="/Training.jpg"
          alt="Training"
          className="w-full h-48 md:h-56 object-cover rounded-xl"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header: name left, image right */}
        <div className="px-4 sm:px-6 py-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="Back"
                >
                  <IoArrowBack className="text-xl text-blue-600" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                    {course.courseName}
                  </h1>

                  {/* NEW: non-clickable status pill just below name */}
                  <div
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mt-1 ${statusPillClass}`}
                    title="Exam status"
                  >
                    {status.loading ? "Checking…" : statusLabel}
                  </div>
                </div>
              </div>

              {priceLabel && (
                <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 mt-2">
                  {priceLabel}
                </div>
              )}
            </div>

            <div className="w-40 sm:w-56 md:w-64 shrink-0">
              <div className="bg-gray-50 rounded-lg overflow-hidden border">
                <img
                  src={course.thumbnailUrl || "/altImage.png"}
                  onError={(e) => (e.currentTarget.src = "/altImage.png")}
                  alt="Course thumbnail"
                  className="w-full h-32 md:h-40 object-contain bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-5 space-y-6">
          {/* Video + PPT dropdowns */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Video */}
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 bg-blue-50"
                onClick={() => setOpen((s) => ({ ...s, video: !s.video }))}
              >
                <span className="flex items-center gap-2 font-semibold text-blue-900">
                  <FaFileVideo />
                  Course Video
                </span>
                <FiChevronDown
                  className={`text-blue-900 transition-transform ${
                    open.video ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open.video && (
                <div className="p-3">
                  {course.videoUrl ? (
                    <video src={course.videoUrl} controls className="w-full max-h-[420px] rounded" />
                  ) : (
                    <p className="text-sm text-gray-600">No video uploaded.</p>
                  )}
                </div>
              )}
            </div>

            {/* PPT */}
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 bg-blue-50"
                onClick={() => setOpen((s) => ({ ...s, ppt: !s.ppt }))}
              >
                <span className="flex items-center gap-2 font-semibold text-blue-900">
                  <FaFilePowerpoint />
                  Slides (PPT/PDF)
                </span>
                <FiChevronDown
                  className={`text-blue-900 transition-transform ${open.ppt ? "rotate-180" : ""}`}
                />
              </button>
              {open.ppt && (
                <div className="p-3">
                  {course.pptUrl ? (
                    course.pptUrl.toLowerCase().endsWith(".pdf") ? (
                      <object data={course.pptUrl} type="application/pdf" width="100%" height="480">
                        <iframe
                          title="slides-pdf"
                          src={course.pptUrl}
                          width="100%"
                          height="480"
                          style={{ border: 0 }}
                        />
                      </object>
                    ) : (
                      <iframe title="slides" src={officeViewer(course.pptUrl)} width="100%" height="480" />
                    )
                  ) : (
                    <p className="text-sm text-gray-600">No slides uploaded.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div className="border rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <pre className="whitespace-pre-wrap text-gray-800">{course.description}</pre>
            </div>
          )}

          {/* Bottom: left Take Test, right slideshow */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Take Test card */}
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="relative">
                <img src="/Test.jpg" alt="Take Test" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Ready to take the test?</h4>
                  <p className="text-sm text-gray-600">
                    Score 80% or higher to pass and receive your certificate.
                  </p>
                </div>
                <button
                  className={`ml-4 whitespace-nowrap px-4 py-2 rounded text-white ${
                    examBtn.canGo && !questionsMissing
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (examBtn.canGo && !questionsMissing) navigate(`/courses/${course._id}/exam`);
                  }}
                  disabled={!examBtn.canGo || questionsMissing}
                  title={
                    questionsMissing
                      ? "No questions available"
                      : examBtn.canGo
                      ? undefined
                      : "You already completed this exam"
                  }
                >
                  {examBtn.text}
                </button>
              </div>
            </div>

            {/* Auto slideshow */}
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="relative w-full h-48 md:h-56 bg-gray-50">
                {posters.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Poster ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
                      slide === idx ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
              <div className="p-3 flex items-center justify-center gap-2">
                {posters.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2.5 w-2.5 rounded-full ${slide === i ? "bg-blue-600" : "bg-gray-300"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
