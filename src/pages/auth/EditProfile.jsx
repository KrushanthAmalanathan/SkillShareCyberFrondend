import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Dashboard from "../../components/Dashboard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineCamera,
  AiOutlineSave,
  AiOutlineClose,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { UserEndPoint } from "../../utils/ApiRequest";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await axios.get(`${UserEndPoint}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          dateOfBirth: res.data.dateOfBirth?.split("T")[0] || "",
          password: "",
          confirmPassword: "",
        });
        setPreviewImage(res.data.profilePicture || "/default-profile.png");
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 2 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, profilePicture: "Only JPG or PNG files allowed" }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, profilePicture: "File must be <2MB" }));
        return;
      }

      setPreviewImage(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profilePicture: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${UserEndPoint}/update`,
        {
          name: formData.name,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (loading) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                  <p className="text-blue-100">Update your account information</p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-white hover:text-blue-200 transition"
                >
                  <AiOutlineClose size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <AiOutlineUser className="mr-2 text-blue-500" />
                    Personal Information
                  </h3>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative group">
                        <img
                          src={previewImage || "/default-profile.png"}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md">
                          <AiOutlineCamera size={18} />
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleImageChange}
                            accept="image/jpeg,image/png"
                          />
                        </label>
                      </div>
                      {errors.profilePicture && (
                        <p className="text-red-500 text-xs mt-2">{errors.profilePicture}</p>
                      )}
                    </div>

                    <div className="flex-grow space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md`}
                          required
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <AiOutlineCalendar className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <AiOutlineLock className="mr-2 text-blue-500" />
                    Basic Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <AiOutlineMail className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <AiOutlineLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current"
                          className={`w-full pl-10 px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md`}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default EditProfile;
