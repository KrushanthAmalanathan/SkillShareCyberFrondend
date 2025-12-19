// src/pages/courses/EditCourse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import {
  AiOutlineArrowLeft,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { logActivity } from "../../utils/logActivity";
import { CourseEndPoint } from "../../utils/ApiRequest";
import ImageCropper from "../../components/ImageCropper";

const officeViewer = (url) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

/** ---------- Inline Modal for Adding/Editing One MCQ ---------- */
function QuestionModal({ open, initial, onClose, onSave }) {
  const [text, setText] = useState(initial?.text || "");
  const [options, setOptions] = useState(initial?.options || ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(
    typeof initial?.correctIndex === "number" ? initial.correctIndex : -1
  );
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setText(initial?.text || "");
      setOptions(initial?.options || ["", "", "", ""]);
      setCorrectIndex(
        typeof initial?.correctIndex === "number" ? initial.correctIndex : -1
      );
      setErr("");
    }
  }, [open, initial]);

  if (!open) return null;

  const handleOptionChange = (i, v) => {
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
        <h3 className="mb-4 text-xl font-semibold">
          {initial ? "Edit Question" : "Add Question"}
        </h3>

        {err && <div className="mb-3 rounded bg-red-100 p-2 text-red-700">{err}</div>}

        <label className="mb-1 block text-sm font-medium">Question *</label>
        <textarea
          rows={3}
          className="mb-4 w-full rounded border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt, i) => (
            <div key={i} className="rounded border p-2">
              <label className="mb-1 block text-xs font-medium">Option {i + 1}</label>
              <input
                className="w-full rounded border p-2"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              <label className="mt-2 inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                />
                Mark as correct
              </label>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/** ----------------------- Edit Course Page ----------------------- */
export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  // loading & error
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Base form
  const [courseName, setCourseName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Existing URLs (for preview)
  const [existing, setExisting] = useState({
    thumbnailUrl: "",
    videoUrl: "",
    pptUrl: "",
    certificateTemplateUrl: "",
  });

  // Files (new uploads are optional)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  // Image cropper for thumbnail
  const [cropping, setCropping] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [previewThumb, setPreviewThumb] = useState("");

  // Questions (view-only by default; opt-in to edit)
  const [editQuestions, setEditQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQModal, setShowQModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const ACCEPT_PPT =
    "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
  const ACCEPT_DOCS = `${ACCEPT_PPT},application/pdf`;
  const ACCEPT_IMG = "image/*";

  // Load course
  useEffect(() => {
    if (!isAuthenticated) {
      setFetching(false);
      return;
    }
    (async () => {
      try {
        setFetching(true);
        setError("");
        const { data } = await axios.get(`${CourseEndPoint}/${id}/manage`);
        // data.questions here are SAFE (no correctIndex). Keep as preview only.
        setCourseName(data.courseName || "");
        setPrice(
          data.price != null && data.price !== ""
            ? String(Number(data.price))
            : ""
        );
        setDescription(data.description || "");
        setExisting({
          thumbnailUrl: data.thumbnailUrl || "",
          videoUrl: data.videoUrl || "",
          pptUrl: data.pptUrl || "",
          certificateTemplateUrl: data.certificateTemplateUrl || "",
        });
        // Prepare a questions view list
        const fullQs = Array.isArray(data.questions) ? data.questions : [];
        setQuestions(
          fullQs.map((q) => ({
            text: q.text || "",
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : ["", "", "", ""],
            correctIndex:
              Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3
                ? q.correctIndex
                : -1,
          }))
        );
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load course");
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Dashboard>
        <div className="p-6">
          <p className="text-gray-700">Please log in to edit a course.</p>
        </div>
      </Dashboard>
    );
  }

  // thumbnail selection -> cropper
  const handleThumbPick = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageSrc(reader.result);
        setCropping(true);
      };
      reader.readAsDataURL(f);
    }
  };

  const handleCropComplete = (croppedFile) => {
    setThumbnailFile(croppedFile);
    setCropping(false);
    const url = URL.createObjectURL(croppedFile);
    setPreviewThumb(url);
  };

  // MCQ helpers
  const addQuestion = (q) => {
    setQuestions((prev) => [...prev, q]);
  };
  const saveEditedQuestion = (q) => {
    setQuestions((prev) => prev.map((item, idx) => (idx === editingIndex ? q : item)));
    setEditingIndex(-1);
  };
  const handleEditQ = (idx) => {
    setEditingIndex(idx);
    setShowQModal(true);
  };
  const handleDeleteQ = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateQuestionsIfEditing = () => {
    if (!editQuestions) return true; // not modifying questions → skip validation
    if (!questions.length) {
      setError("Add at least one question or turn off 'Edit Questions'.");
      return false;
    }
    const ok = questions.every(
      (q) =>
        q.text?.trim() &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o) => o.trim()) &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
    );
    if (!ok) {
      setError("Each question must have text, 4 options, and a selected correct answer.");
    }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!courseName.trim()) return setError("Course name is required.");
    if (!validateQuestionsIfEditing()) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("courseName", courseName);

      // price: normalize to non-negative number if provided
      if (price !== "") {
        fd.append("price", String(Math.max(0, Number(price) || 0)));
      } else {
        // Explicitly send empty to clear? If you want to keep old when empty, omit.
        // Here we omit to "keep".
      }

      // description
      fd.append("description", description ?? "");

      // files (append only when new chosen)
      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
      if (videoFile) fd.append("video", videoFile);
      if (pptFile) fd.append("ppt", pptFile);
      if (certificateFile) fd.append("certificateTemplate", certificateFile);

      // MCQs (append only when editing turned on; otherwise keep server copy unchanged)
      if (editQuestions) {
        fd.append("questions", JSON.stringify(questions));
      }

      await axios.patch(`${CourseEndPoint}/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      logActivity("Course Updated", `Updated Course "${courseName}" by ${user?.email || "me"}`);
      navigate(-1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update course");
    } finally {
      setSubmitting(false);
    }
  };

  const priceDisplay = useMemo(() => {
    const n = Number(price);
    if (!Number.isFinite(n)) return "";
    return String(n);
  }, [price]);

  return (
    <Dashboard>
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-600 hover:underline"
        >
          <AiOutlineArrowLeft className="mr-2" />
          Back
        </button>

        <div className="rounded bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold">Edit Course</h1>

          {fetching ? (
            <div className="text-gray-600">Loading course…</div>
          ) : (
            <>
              {error && <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                {/* Basic Info */}
                <div className="rounded border p-4">
                  <h2 className="mb-4 text-xl font-semibold">Course Information</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Course Name *</label>
                      <input
                        className="w-full rounded border p-2"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Price (Rs.)</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          Rs.
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded border p-2 pl-10 text-sm"
                          value={priceDisplay}
                          onChange={(e) => setPrice(e.target.value)}
                          onBlur={(e) => {
                            const v = e.target.value;
                            if (v !== "") setPrice((Math.max(0, Number(v)) || 0).toFixed(2));
                          }}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">Description</label>
                      <textarea
                        rows={3}
                        className="w-full rounded border p-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Thumbnail (cropped) */}
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">Thumbnail (image)</label>

                      {/* Existing preview */}
                      {existing.thumbnailUrl && !previewThumb && !cropping && (
                        <div className="mb-2">
                          <img
                            src={existing.thumbnailUrl}
                            alt="current thumbnail"
                            className="h-32 w-auto rounded object-contain border bg-white"
                            onError={(e) => (e.currentTarget.src = "/altImage.png")}
                          />
                        </div>
                      )}

                      {!cropping ? (
                        <>
                          <input
                            type="file"
                            accept={ACCEPT_IMG}
                            onChange={handleThumbPick}
                            className="w-full rounded border p-2"
                          />
                          {previewThumb && (
                            <div className="mt-2">
                              <img
                                src={previewThumb}
                                alt="new thumbnail preview"
                                className="h-32 w-auto rounded object-contain"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <ImageCropper imageSrc={selectedImageSrc} onCropComplete={handleCropComplete} />
                      )}
                    </div>

                    {/* Video */}
                    <div>
                      <label className="mb-1 block text-sm font-medium">Course Video</label>
                      {existing.videoUrl && !videoFile && (
                        <video
                          className="mt-2 w-full max-w-md"
                          controls
                          src={existing.videoUrl}
                        />
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="w-full rounded border p-2 mt-2"
                      />
                      {videoFile && (
                        <video
                          className="mt-2 w-full max-w-md"
                          controls
                          src={URL.createObjectURL(videoFile)}
                        />
                      )}
                    </div>

                    {/* PPT / PDF */}
                    <div>
                    <label className="mb-1 block text-sm font-medium">Slides (PPT/PPTX/PDF)</label>

                    {/* Existing preview (if there is a URL and no new file selected) */}
                    {existing.pptUrl && !pptFile && (
                        <div className="mt-2">
                        {existing.pptUrl.toLowerCase().endsWith(".pdf") ? (
                            <object
                            data={existing.pptUrl}
                            type="application/pdf"
                            width="100%"
                            height="480"
                            >
                            <iframe
                                title="slides-pdf"
                                src={existing.pptUrl}
                                width="100%"
                                height="480"
                                style={{ border: 0 }}
                            />
                            </object>
                        ) : (
                            <iframe
                            title="slides"
                            src={officeViewer(existing.pptUrl)}
                            width="100%"
                            height="480"
                            />
                        )}
                        </div>
                    )}

                    {/* Uploader */}
                    <input
                        type="file"
                        accept={ACCEPT_DOCS}
                        onChange={(e) => setPptFile(e.target.files?.[0] || null)}
                        className="w-full rounded border p-2 mt-2"
                    />

                    {/* New file chosen (local) — we can't preview with Office viewer until it's uploaded */}
                    {pptFile && (
                        <>
                        <p className="mt-2 truncate text-sm text-gray-700">{pptFile.name}</p>
                        <p className="text-xs text-gray-500">
                            Preview for newly selected files isn’t available until you save (they need a public URL).
                        </p>
                        </>
                    )}
                    </div>

                    {/* Certificate Template (image) */}
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium">
                        Certificate Template (image)
                      </label>
                      {existing.certificateTemplateUrl && !certificateFile && (
                        <div className="mb-2">
                          <img
                            src={existing.certificateTemplateUrl}
                            alt="current certificate template"
                            className="h-32 w-auto rounded object-contain border bg-white"
                            onError={(e) => (e.currentTarget.src = "/altImage.png")}
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept={ACCEPT_IMG}
                        onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                        className="w-full rounded border p-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="rounded border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Questions (MCQ)</h2>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editQuestions}
                        onChange={(e) => setEditQuestions(e.target.checked)}
                      />
                      Edit Questions
                    </label>
                  </div>

                  {!editQuestions ? (
                    <>
                      {questions.length === 0 ? (
                        <p className="text-sm text-gray-500">No questions added yet.</p>
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
                      <p className="mt-2 text-xs text-gray-500">
                        Existing questions are shown read-only. Turn on <b>Edit Questions</b> to modify them.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndex(-1);
                            setShowQModal(true);
                          }}
                          className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        >
                          <AiOutlinePlus /> Add Question
                        </button>
                        <span className="text-xs text-gray-600">
                          Tip: You must choose a correct answer for each question.
                        </span>
                      </div>

                      {questions.length === 0 ? (
                        <p className="text-sm text-gray-500">No questions yet. Add one to begin.</p>
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
                                        <li key={i}>{o}</li>
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
                                        onClick={() => handleEditQ(idx)}
                                      >
                                        <AiOutlineEdit size={18} />
                                      </button>
                                      <button
                                        type="button"
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete"
                                        onClick={() => handleDeleteQ(idx)}
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
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Modal for MCQ add/edit */}
      <QuestionModal
        open={showQModal}
        initial={editingIndex >= 0 ? questions[editingIndex] : undefined}
        onClose={() => {
          setShowQModal(false);
          setEditingIndex(-1);
        }}
        onSave={(q) => {
          if (editingIndex >= 0) return saveEditedQuestion(q);
          return addQuestion(q);
        }}
      />
    </Dashboard>
  );
}
