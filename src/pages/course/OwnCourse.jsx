// src/pages/courses/OwnCourse.jsx
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineSearch, AiOutlineExclamationCircle } from "react-icons/ai";
import { BsPlus } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Dashboard from "../../components/Dashboard";
import CourseTable from "../../components/CourseTable";
import { useAuth } from "../../hooks/useAuth";
import { CourseEndPoint } from "../../utils/ApiRequest";
import { logActivity } from "../../utils/logActivity";

export default function OwnCourse() {
  const navigate = useNavigate();
  const { isAuthenticated, user: me } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // search + pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // delete modal state
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // fetch all courses (listCourses is public in your backend)
  useEffect(() => {
    if (!isAuthenticated) return;
    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(CourseEndPoint);
        setCourses(data || []);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isAuthenticated]);

  // only my courses (createdBy me)
  const myCourses = useMemo(() => {
  // try multiple common keys your auth payload may use
  const myId =
    (me?._id || me?.id || me?.userId || me?.sub || "").toString();

  if (!myId) return [];

  const getOwnerId = (createdBy) =>
    (
      createdBy?._id ||
      createdBy?.id ||
      createdBy ||               // could already be a string ObjectId
      ""
    ).toString();

  return (courses || []).filter((c) => getOwnerId(c.createdBy) === myId);
}, [courses, me?._id, me?.id, me?.userId, me?.sub]);

  // search filter
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return myCourses;
    return myCourses.filter(c => (c.courseName || "").toLowerCase().includes(term));
  }, [myCourses, searchTerm]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
  const start = (page - 1) * rowsPerPage;
  const pageItems = filtered.slice(start, start + rowsPerPage);

  // delete
  const onDelete = (course) => {
    setToDelete(course);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`${CourseEndPoint}/${toDelete._id}`);
      setCourses(prev => prev.filter(c => c._id !== toDelete._id));
      logActivity("Course Deleted", `Deleted course "${toDelete.courseName}"`);
      setToDelete(null);
      setDeleteError("");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Delete failed";
      setDeleteError(msg);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dashboard>
        <div className="bg-white p-6 shadow">
          <p className="text-gray-700">Please log in to view your courses.</p>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="bg-white p-6 shadow-md">
        {/* Top bar: search + create */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search course name…"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              className="bg-blue-600 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
              onClick={() => navigate("/courses/create")}
            >
              <BsPlus className="w-5 h-5" />
              <span className="whitespace-nowrap">Create Course</span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {err && (
          <div className="mt-4 rounded bg-red-100 p-3 text-red-700 flex items-center gap-2">
            <AiOutlineExclamationCircle /> {err}
          </div>
        )}

        {/* Table or loading */}
        <div className="mt-4">
          {loading ? (
            <div className="p-6 text-gray-600">Loading…</div>
          ) : (
            <CourseTable courses={pageItems} onDelete={onDelete} />
          )}
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={e => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500">
            {total === 0 ? 0 : start + 1}-{Math.min(start + rowsPerPage, total)} of {total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-3">Delete Course</h2>
            <p className="mb-1">
              Are you sure you want to delete{" "}
              <span className="font-bold">{toDelete.courseName}</span>?
            </p>
            <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
            {deleteError && (
              <div className="flex items-center text-red-600 mb-3">
                <AiOutlineExclamationCircle className="mr-2" />
                <span>{deleteError}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => {
                  setToDelete(null);
                  setDeleteError("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}
