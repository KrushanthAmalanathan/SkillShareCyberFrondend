// frontend/components/CourseTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  AiOutlineFileSearch, 
  AiOutlineEdit, 
  AiOutlineDelete,
  AiOutlineSnippets,
  AiOutlineAppstoreAdd  
} from "react-icons/ai";

const CourseTable = ({ courses = [], onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 space-y-3">
      {courses.map((course, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 rounded-md bg-gray-200 hover:bg-gray-300 transition-all"
        >
          {/* Show course name */}
          <div className="text-gray-800 font-medium">
            {course.courseName}
          </div>

          <div className="flex items-center gap-4">
            {/* Inspect MCQs / Questions */}
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/courses/${course._id}/questions`)}
              title="View Questions"
            >
              <AiOutlineSnippets size={20} />
            </button>

            {/* Add new questions */}
            <button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate(`/courses/${course._id}/questions/edit`)}
              title="Edit Question"
            >
              <AiOutlineAppstoreAdd size={20} />
            </button>

            {/* View course details */}
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/courses/${course._id}`)}
              title="View Course"
            >
              <AiOutlineFileSearch size={20} />
            </button>

            {/* Edit course */}
            <button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => navigate(`/courses/${course._id}/edit`)}
              title="Edit Course"
            >
              <AiOutlineEdit size={20} />
            </button>

            {/* Delete course */}
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => onDelete(course)}
              title="Delete Course"
            >
              <AiOutlineDelete size={20} />
            </button>
          </div>
        </div>
      ))}

      {courses.length === 0 && (
        <p className="text-gray-500 italic text-center mt-4">
          No courses created yet.
        </p>
      )}
    </div>
  );
};

export default CourseTable;
