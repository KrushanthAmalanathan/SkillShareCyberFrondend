// src/pages/courses/EditQuestion.jsx
import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { CourseEndPoint } from "../../utils/ApiRequest";

function QModal({ open, initial, onClose, onSave }) {
  const [text, setText] = useState(initial?.text || "");
  const [options, setOptions] = useState(initial?.options || ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(
    Number.isInteger(initial?.correctIndex) ? initial.correctIndex : -1
  );
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setText(initial?.text || "");
      setOptions(initial?.options || ["", "", "", ""]);
      setCorrectIndex(Number.isInteger(initial?.correctIndex) ? initial.correctIndex : -1);
      setErr("");
    }
  }, [open, initial]);

  if (!open) return null;

  const onChangeOpt = (i, v) => {
    const next = [...options];
    next[i] = v;
    setOptions(next);
  };

  const handleSave = () => {
    if (!text.trim()) return setErr("Question text is required.");
    if (options.some((o) => !o.trim())) return setErr("All 4 options are required.");
    if (correctIndex < 0 || correctIndex > 3) return setErr("Choose the correct option.");
    onSave({ text, options, correctIndex });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold">{initial ? "Edit Question" : "Add Question"}</h3>
        {err && <div className="mb-3 rounded bg-red-100 p-2 text-red-700">{err}</div>}

        <label className="mb-1 block text-sm font-medium">Question *</label>
        <textarea rows={3} className="mb-4 w-full rounded border p-2" value={text} onChange={(e) => setText(e.target.value)} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt, i) => (
            <div key={i} className="rounded border p-2">
              <label className="mb-1 block text-xs font-medium">Option {i + 1}</label>
              <input className="w-full rounded border p-2" value={opt} onChange={(e) => onChangeOpt(i, e.target.value)} />
              <label className="mt-2 inline-flex items-center gap-2 text-sm">
                <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
                Mark as correct
              </label>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={onClose}>Cancel</button>
          <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);

  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);

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

  const addQ = (q) => setQuestions((prev) => [...prev, q]);
  const saveQ = (q) =>
    setQuestions((prev) => prev.map((it, i) => (i === editIdx ? q : it)));

  const onDelete = (i) => setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setErr("");
      await axios.put(`${CourseEndPoint}/${id}/questions`, { questions });
      navigate(-1);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dashboard>
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-blue-600 hover:underline">
          <AiOutlineArrowLeft className="mr-2" />
          Back
        </button>

        <div className="rounded bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Edit Questions</h1>
            <button
              type="button"
              onClick={() => { setEditIdx(-1); setOpen(true); }}
              className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              <AiOutlinePlus /> Add Question
            </button>
          </div>

          {loading ? (
            <div className="text-gray-600">Loading…</div>
          ) : err ? (
            <div className="text-red-600">{err}</div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-500">No questions yet.</p>
          ) : (
            <div className="overflow-auto rounded border">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-2 py-2 text-left">#</th>
                    <th className="border px-2 py-2 text-left">Question</th>
                    <th className="border px-2 py-2 text-left">Options</th>
                    <th className="border px-2 py-2 text-left">Correct</th>
                    <th className="border px-2 py-2 text-left">Actions</th>
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
                            <li key={i} className={q.correctIndex === i ? "font-semibold text-green-700" : ""}>
                              {o}
                            </li>
                          ))}
                        </ol>
                      </td>
                      <td className="border px-2 py-2 align-top">
                        {q.correctIndex >= 0 ? q.correctIndex + 1 : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="border px-2 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                            onClick={() => { setEditIdx(idx); setOpen(true); }}
                          >
                            <AiOutlineEdit size={18} />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={() => onDelete(idx)}
                          >
                            <AiOutlineDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        </div>
      </div>

      <QModal
        open={open}
        initial={editIdx >= 0 ? questions[editIdx] : undefined}
        onClose={() => { setOpen(false); setEditIdx(-1); }}
        onSave={(q) => { if (editIdx >= 0) return saveQ(q); return addQ(q); }}
      />
    </Dashboard>
  );
}
