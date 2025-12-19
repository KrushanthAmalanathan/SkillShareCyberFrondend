import React from "react";

const TermsCondition = ({ onAccept, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[30rem]">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          Terms and Conditions
        </h3>
        <div className="h-64 overflow-y-auto mb-4 text-gray-700 text-sm">
          {/* Replace the text below with your actual Terms and Conditions */}
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            condimentum tortor sem, in semper nisl bibendum eu. Nunc a facilisis
            eros. Curabitur nec lacinia nisl. Vestibulum ante ipsum primis in
            faucibus orci luctus et ultrices posuere cubilia curae; Integer nec dui
            sit amet lorem tincidunt sodales ut non orci.
          </p>
          <p className="mt-2">
            Duis vestibulum, sem sit amet cursus pharetra, enim elit euismod
            arcu, vel tempus metus lacus sit amet risus. Integer dictum maximus
            felis, in ornare sapien ultrices ut.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Registering..." : "I Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsCondition;
