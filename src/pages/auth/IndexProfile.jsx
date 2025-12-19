import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "../../components/Dashboard";
import { AiOutlineEdit, AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { UserEndPoint } from "../../utils/ApiRequest";
import AddUser from "./AddUser"; // Adjust path if needed

const IndexProfile = () => {
  const [users, setUsers] = useState([]);
  const [editingRole, setEditingRole] = useState({});
  const [loading, setLoading] = useState(true);
  const { user: me, token, isAuthenticated } = useAuth();
  const [userToDelete, setUserToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(UserEndPoint);
      const visible = res.data.filter(
        (u) =>
          (u.role === "Viewer" || u.role === "Admin" || u.role === "Lecture") &&
            u._id !== me.id
      );
      setUsers(visible);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, [isAuthenticated, token, me]);

  // Real-time search/filter logic
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIdx = (currentPage - 1) * usersPerPage;
  const displayedUsers = filteredUsers.slice(startIdx, startIdx + usersPerPage);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `${UserEndPoint}/${userId}/role`,
        { role: newRole }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      setEditingRole({});
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${UserEndPoint}/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <Dashboard>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          User Management
        </h1>
        <button
          onClick={() => navigate("/profileRoleIndex")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-all text-white px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <span className="font-semibold text-base">Lecture Upgrade</span>
        </button>
      </div>

      {/* AddUser Modal */}
      {showAddUserModal && (
        <AddUser
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={() => {
            setShowAddUserModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email…"
            className="pl-10 w-full py-2 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search users"
          />
        </div>
      </div>

      {loading ? (
              <div className="flex justify-center py-12">
                <span className="text-gray-600 text-lg">Loading users…</span>
              </div>
            ) : (
              <div className="bg-white shadow-xl rounded-xl border">
                {filteredUsers.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">No users found.</div>
                ) : (
                  <>
                    {/* SCROLLABLE TABLE WRAPPER */}
                    <div className="overflow-x-auto">
                      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                              <th className="p-3 text-left">#</th>
                              <th className="p-3 text-left">Name</th>
                              <th className="p-3 text-left">Email</th>
                              <th className="p-3 text-left">Role</th>
                              <th className="p-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedUsers.map((user, idx) => (
                              <tr
                                key={user._id}
                                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                              >
                                <td className="p-3">{startIdx + idx + 1}</td>
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">
                                  {editingRole[user._id] ? (
                                    <select
                                      value={editingRole[user._id]}
                                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                      className="border rounded px-2 py-1 focus:ring-2 focus:ring-green-500 transition-all"
                                    >
                                      <option value="Viewer">Viewer</option>
                                      <option value="Admin">Admin</option>
                                    </select>
                                  ) : (
                                    <span className="capitalize px-2 py-1 rounded bg-gray-100">
                                      {user.role}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="flex justify-center space-x-2">
                                    <button
                                      onClick={() => setEditingRole({ [user._id]: user.role })}
                                      title="Edit Role"
                                      className="p-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all"
                                    >
                                      <AiOutlineEdit />
                                    </button>
                                    <button
                                      onClick={() => navigate("/profile/edit", { state: { user } })}
                                      title="View Profile"
                                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition-all"
                                    >
                                      <AiOutlineEye />
                                    </button>
                                    <button
                                      onClick={() => setUserToDelete(user)}
                                      title="Delete User"
                                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-700 transition-all"
                                    >
                                      <MdOutlineDelete />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
      
                    {/* Pagination Controls */}
                    <div className="flex justify-center space-x-2 py-4">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-all"
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-1 rounded ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                          } transition-all`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Delete User</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-bold">{userToDelete.name}</span>?
            </p>
            <p className="mb-6 text-gray-500 text-sm">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteUser(userToDelete._id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default IndexProfile;
