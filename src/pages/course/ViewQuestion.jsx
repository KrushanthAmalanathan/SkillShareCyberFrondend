// src/pages/courses/ViewQuestion.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import { AiOutlineArrowLeft } from "react-icons/ai";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { CourseEndPoint } from "../../utils/ApiRequest";

export default function ViewQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(`${CourseEndPoint}/${id}/questions`);
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load questions");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated]);

  return (
    <Dashboard>
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-blue-600 hover:underline">
          <AiOutlineArrowLeft className="mr-2" />
          Back
        </button>

        <div className="rounded bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold">Questions</h1>

          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : err ? (
            <div className="text-red-600">{err}</div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-500">No questions found.</p>
          ) : (
            <div className="overflow-auto rounded border">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-2 py-2 text-left">#</th>
                    <th className="border px-2 py-2 text-left">Question</th>
                    <th className="border px-2 py-2 text-left">Options</th>
                    <th className="border px-2 py-2 text-left">Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-2 align-top">{idx + 1}</td>
                      <td className="border px-2 py-2 align-top">{q.text}</td>
                      <td className="border px-2 py-2 align-top">
                        <ol className="list-decimal pl-5">
                          {q.options.map((o, i) => (
                            <li
                              key={i}
                              className={q.correctIndex === i ? "font-semibold text-green-700" : ""}
                            >
                              {o}
                            </li>
                          ))}
                        </ol>
                      </td>
                      <td className="border px-2 py-2 align-top">
                        {q.correctIndex >= 0 ? q.correctIndex + 1 : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
