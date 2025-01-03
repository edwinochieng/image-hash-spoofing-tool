"use client";

import { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [hashPrefix, setHashPrefix] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<{
    originalHash: string;
    modifiedHash: string;
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file || !hashPrefix) {
      alert("Please upload a file and enter a hash prefix.");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("hashPrefix", hashPrefix);

    try {
      const response = await axios.post(`/api/process`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Image Hash Spoofing
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Image:
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Hash Prefix:
          </label>
          <input
            type="text"
            value={hashPrefix}
            onChange={(e) => setHashPrefix(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Submit"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Results</h3>
          <p className="text-gray-700 break-words">
            <span className="font-semibold">Original Hash: </span>{" "}
            {result.originalHash}
          </p>
          <p className="text-gray-700 break-words">
            <span className="font-semibold">Modified Hash: </span>
            {result.modifiedHash}
          </p>
        </div>
      )}
    </div>
  );
}
