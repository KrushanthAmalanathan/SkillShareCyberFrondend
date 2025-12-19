// src/pages/courses/CreateCourse.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../../components/Dashboard";
import { AiOutlineArrowLeft, AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { logActivity } from "../../utils/logActivity";
import { CourseEndPoint } from "../../utils/ApiRequest";
import ImageCropper from "../../components/ImageCropper";

/** ---------- Inline Modal for Adding/Editing One MCQ ---------- */
function QuestionModal({ open, initial, onClose, onSave }) {
  const [text, setText] = useState(initial?.text || "");
  const [options, setOptions] = useState(initial?.options || ["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(
    typeof initial?.correctIndex === "number" ? initial.correctIndex : -1
  );
  const [err, setErr] = useState("");

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

/** ----------------------- Create Course Page ----------------------- */
export default function CreateCourse() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Base form
  const [courseName, setCourseName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Files
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  // Image cropper for thumbnail
  const [cropping, setCropping] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [previewThumb, setPreviewThumb] = useState("");

  // Questions
  const [questions, setQuestions] = useState([]);
  const [showQModal, setShowQModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const ACCEPT_PPT =
    "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
  const ACCEPT_DOCS = `${ACCEPT_PPT},application/pdf`;
  const ACCEPT_IMG = "image/*";

  if (!isAuthenticated) {
    return (
      <Dashboard>
        <div className="p-6">
          <p className="text-gray-700">Please log in to create a course.</p>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!courseName.trim()) return setError("Course name is required.");
    if (!certificateFile) return setError("Certificate template image is required.");
    if (questions.length === 0) return setError("Add at least one question.");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("courseName", courseName);
      if (price !== "") fd.append("price", String(Math.max(0, Number(price) || 0)));
      if (description) fd.append("description", description);

      if (thumbnailFile) fd.append("thumbnail", thumbnailFile); // resource_type: image
      if (videoFile) fd.append("video", videoFile); // resource_type: video
      if (pptFile) fd.append("ppt", pptFile); // resource_type: raw (ppt/pptx/pdf)
      if (certificateFile) fd.append("certificateTemplate", certificateFile); // image

      fd.append("questions", JSON.stringify(questions)); // [{text, options[4], correctIndex}]

      await axios.post(CourseEndPoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      logActivity("Course Created", `Create Course "${courseName}" by ${user?.email || "me"}`);
      navigate(-1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="mb-6 text-2xl font-bold">Create Course</h1>

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
                      value={price}
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
                            alt="thumb preview"
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
                  <label className="mb-1 block text-sm font-medium">Course Video (optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full rounded border p-2"
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
                  <input
                    type="file"
                    accept={ACCEPT_DOCS}
                    onChange={(e) => setPptFile(e.target.files?.[0] || null)}
                    className="w-full rounded border p-2"
                  />
                  {pptFile && (
                    <p className="mt-2 truncate text-sm text-gray-700">{pptFile.name}</p>
                  )}
                </div>

                {/* Certificate Template (image) */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Certificate Template (image) *
                  </label>
                  <input
                    type="file"
                    accept={ACCEPT_IMG}
                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="rounded border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Questions (MCQ)</h2>
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
              </div>

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
                          <td className="border px-2 py-2 align-top">{q.correctIndex + 1}</td>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Course"}
            </button>
          </form>
        </div>
      </div>

      {/* Modal */}
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
