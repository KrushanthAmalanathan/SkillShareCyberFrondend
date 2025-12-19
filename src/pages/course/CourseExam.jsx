// src/pages/courses/CourseExam.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from "axios";

import Dashboard from "../../components/Dashboard";
import { useAuth } from "../../hooks/useAuth";
import { CourseEndPoint } from "../../utils/ApiRequest";

export default function CourseExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState(null);
  const [err, setErr] = useState("");

  // answers[i] = selected option index (0..3) or null
  const [answers, setAnswers] = useState([]);
  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null && a !== undefined).length,
    [answers]
  );

  // results modal
  const [result, setResult] = useState(null); // {score, total, percent, passed, certificateTemplateUrl}
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(`${CourseEndPoint}/${id}`);
        setCourse(data);
        setAnswers(Array((data?.questions || []).length).fill(null));
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load exam");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated]);

  const selectAnswer = (qIdx, optIdx) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const submit = async () => {
    if (!course) return;
    // Validate all answered
    if (answers.some((a) => a === null || a === undefined)) {
      setErr("Please answer all questions before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      setErr("");
      const { data } = await axios.post(`${CourseEndPoint}/${course._id}/attempt`, {
        answers,
      });
      setResult(data);
      setShowModal(true);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = async () => {
    const url = result?.certificateTemplateUrl;
    if (!url) return;
    try {
      const resp = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([resp.data], { type: resp.headers["content-type"] || "application/octet-stream" });
      const fileNameGuess =
        url.split("/").pop()?.split("?")[0] || `${course.courseName || "certificate"}.png`;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileNameGuess;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    } catch (e) {
      // Fallback: open in new tab if direct blob blocked
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (!isAuthenticated) {
    return (
      <Dashboard>
        <div className="p-6 text-gray-700">Please log in to take the test.</div>
      </Dashboard>
    );
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="p-6 flex items-center gap-2">
          <AiOutlineLoading3Quarters className="animate-spin" />
          Loading exam…
        </div>
      </Dashboard>
    );
  }

  if (err && !course) {
    return (
      <Dashboard>
        <div className="p-6 text-red-600">{err}</div>
      </Dashboard>
    );
  }

  const total = course?.questions?.length || 0;

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Back"
          >
            <IoArrowBack className="text-xl text-blue-600" />
          </button>
          <div className="text-sm text-gray-600">
            Answered <span className="font-semibold">{answeredCount}</span> / {total}
          </div>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                {course.courseName} — Exam
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Choose one answer for each question and submit.
              </p>
            </div>
            <img
              src={course.thumbnailUrl || "/altImage.png"}
              alt="thumb"
              className="w-24 h-24 object-contain bg-white border rounded-lg self-start sm:self-auto"
              onError={(e) => (e.currentTarget.src = "/altImage.png")}
            />
          </div>
        </div>

        {/* Error banner */}
        {err && (
          <div className="mb-4 rounded bg-red-100 text-red-700 p-3">{err}</div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {course.questions?.map((q, qi) => (
            <div key={qi} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-3">{q.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const sel = answers[qi] === oi;
                      return (
                        <label
                          key={oi}
                          className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition ${
                            sel ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={sel}
                            onChange={() => selectAnswer(qi, oi)}
                          />
                          <span className="text-gray-800">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {total === 0 && (
            <div className="text-gray-600">No questions were added for this course.</div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => setAnswers(Array(total).fill(null))}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Reset
          </button>
          <button
            onClick={submit}
            className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting || total === 0}
          >
            {submitting ? "Submitting…" : "Submit Answers"}
          </button>
        </div>
      </div>

      {/* Results Modal */}
      {showModal && result && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
            {/* Celebration header */}
            <div
              className={`px-5 py-4 ${
                result.passed ? "bg-green-600" : "bg-yellow-600"
              } text-white`}
            >
              <div className="text-lg font-semibold">
                {result.passed ? "🎉 Great job!" : "Almost there!"}
              </div>
              <div className="text-sm opacity-90">
                {result.passed
                  ? `You passed the ${course.courseName} exam.`
                  : "You can retake the test anytime."}
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold text-gray-900">
                  {result.score} / {result.total}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Percent</span>
                <span className="font-semibold text-gray-900">{result.percent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    result.passed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {result.passed ? "Passed" : "Not Passed"}
                </span>
              </div>

              {result.passed && result.certificateTemplateUrl && (
                <div className="mt-2">
                  <button
                    onClick={downloadCertificate}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 text-white h-10 font-medium hover:bg-blue-700"
                  >
                    Get Certificate
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    (Downloads the certificate image provided by your instructor)
                  </p>
                </div>
              )}

              {!result.passed && (
                <div className="text-xs text-gray-600">
                  Tip: review the slides/video and try again to hit 80%+
                </div>
              )}
            </div>

            <div className="px-5 pb-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {!result.passed && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    // reset for another attempt
                    setAnswers(Array(total).fill(null));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Retake Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}
