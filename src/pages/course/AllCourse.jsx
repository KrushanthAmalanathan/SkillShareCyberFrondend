import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { AiOutlineAppstore, AiOutlineSearch } from "react-icons/ai";
import Dashboard from "../../components/Dashboard";
import { CourseEndPoint } from "../../utils/ApiRequest";

const ITEMS_PER_PAGE = 8;

export default function AllCourse() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // NEW: status dropdown filter
  // "All" | "New course" | "Completed course" | "Continue Course"
  const [statusFilter, setStatusFilter] = useState("All");

  // map: courseId -> {attempted:boolean, passed:boolean}
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(CourseEndPoint); // GET /courses
        setCourses(Array.isArray(data) ? data : []);
        setPage(1);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  // Fetch status for any courses we don't have yet (so filtering works)
  useEffect(() => {
    if (!isAuthenticated || courses.length === 0) return;
    const missing = courses
      .map((c) => c._id || c.id)
      .filter((id) => id && statusMap[id] == null);

    if (missing.length === 0) return;

    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const { data } = await axios.get(`${CourseEndPoint}/${id}/status`);
              return [id, { attempted: !!data?.attempted, passed: !!data?.passed }];
            } catch {
              return [id, { attempted: false, passed: false }]; // default if not found/protected
            }
          })
        );
        setStatusMap((prev) => {
          const next = { ...prev };
          results.forEach(([id, st]) => (next[id] = st));
          return next;
        });
      } catch {
        // ignore — we set safe defaults per course above
      }
    })();
  }, [isAuthenticated, courses, statusMap]);

  // Text label for a given status
  const labelFor = (st) =>
    !st?.attempted ? "Get Start" : st.passed ? "Already Completed" : "Continue Course";

  // Price badge text
  const priceLabel = (p) => {
    const n = Number(p);
    if (!Number.isFinite(n) || n === 0) return "Free";
    return `Rs. ${n.toFixed(2).replace(/\.00$/, "")}`;
  };

  // Name search
  const nameFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => (c.courseName || "").toLowerCase().includes(q));
  }, [courses, query]);

  // Status filter
  const fullyFiltered = useMemo(() => {
    if (statusFilter === "All") return nameFiltered;
    return nameFiltered.filter((c) => {
      const id = c._id || c.id;
      const st = statusMap[id] || { attempted: false, passed: false };
      if (statusFilter === "New course") return !st.attempted;
      if (statusFilter === "Completed course") return !!st.passed;
      if (statusFilter === "Continue Course") return st.attempted && !st.passed;
      return true;
    });
  }, [nameFiltered, statusFilter, statusMap]);

  // keep page in range when filter/search changes
  useEffect(() => {
    const totalPages = Math.ceil(fullyFiltered.length / ITEMS_PER_PAGE) || 1;
    if (page > totalPages) setPage(totalPages);
  }, [fullyFiltered.length, page]);

  const totalPages = Math.ceil(fullyFiltered.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const visible = fullyFiltered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (!isAuthenticated) {
    return (
      <Dashboard>
        <div className="p-6">
          <p className="text-gray-700">Please log in to view courses.</p>
        </div>
      </Dashboard>
    );
  }

  if (loading) {
    return (
      <Dashboard>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="border rounded-lg bg-white p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded mt-4 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded mt-2 animate-pulse" />
                  <div className="h-9 w-full bg-gray-100 rounded-lg mt-4 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (err) {
    return (
      <Dashboard>
        <div className="p-6 text-red-600">{err}</div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <AiOutlineAppstore className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600 mt-1">Browse and enroll in available courses</p>
            </div>
          </div>

          {/* Search + Status Filter + count */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search courses…"
                className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* NEW: Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="New course">New course</option>
              <option value="Completed course">Completed course</option>
              <option value="Continue Course">Continue Course</option>
            </select>

            <div className="text-sm text-gray-500 md:ml-2">
              <span className="font-medium">{fullyFiltered.length}</span>
              {query.trim() || statusFilter !== "All" ? (
                <> of <span className="font-medium">{courses.length}</span></>
              ) : null}{" "}
              total courses
            </div>
          </div>
        </div>

        {/* Course Cards */}
        <div className="border border-gray-100 rounded-2xl bg-white shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {visible.map((c) => {
                const id = c._id || c.id;
                const name = c.courseName || "Untitled Course";
                const img = c.thumbnailUrl;
                const price = c.price;
                const st = statusMap[id];
                const buttonText = st ? labelFor(st) : "Get Start";

                return (
                  <div
                    key={id}
                    className="group border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col"
                  >
                    <div className="h-44 bg-gray-50 flex items-center justify-center rounded-t-2xl overflow-hidden">
                      <img
                        src={img || "/altImage.png"}
                        alt={name}
                        onError={(e) => { e.currentTarget.src = "/altImage.png"; }}
                        className="object-contain h-full transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h2 className="font-medium text-gray-900 text-base leading-snug line-clamp-2">
                        {name}
                      </h2>

                      {/* price */}
                      <div className="mt-3">
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                          {priceLabel(price)}
                        </span>
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          onClick={() => navigate(`/courses/${id}`)}
                          className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium h-10 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                          {buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {visible.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-center text-sm text-gray-500 py-12">
                  No courses match your filters.
                </div>
              )}
            </div>
          </div>

          {/* Pagination (footer) */}
          <div className="border-t border-gray-100" />
          <div className="px-6 py-4 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 h-9 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={
                  page === i + 1
                    ? "px-3 h-9 rounded-lg bg-blue-600 text-white text-sm"
                    : "px-3 h-9 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                }
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 h-9 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
