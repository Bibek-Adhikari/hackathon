import { useState } from 'react';
import { api } from '../api';
import { User, Problem } from '../types';
import { Upload, CheckCircle2, AlertCircle, FileArchive } from 'lucide-react';

interface ShareProblemPageProps {
  user: User | null;
  onNavigate: (page: string, params?: { problemId?: string }) => void;
  onUserUpdate: (user: User) => void;
}

export default function ShareProblemPage({
  user,
  onNavigate,
  onUserUpdate,
}: ShareProblemPageProps) {
  const [name, setName] = useState(user ? user.name : '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postedProblem, setPostedProblem] = useState<Problem | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.zip')) {
        setError('Only ZIP files (.zip) are accepted.');
        setFile(null);
        e.target.value = '';
        return;
      }
      setFile(selected);
    }
  };

  // Helper to generate a demo sample zip if user doesn't have one handy
  const handleGenerateSampleZip = () => {
    // Generate a minimal valid zip file directly in the browser via Blob
    // Even simpler: create a sample zip blob or let user know
    const dummyZipBytes = new Uint8Array([
      0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    const sampleFile = new File([dummyZipBytes], 'sample-broken-project.zip', { type: 'application/zip' });
    setFile(sampleFile);
    if (!title) setTitle('Node.js API timeout on large payload');
    if (!description) setDescription('When sending a request with 5MB payload, the request hangs until timeout instead of streaming to disk.');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const effectiveName = user ? user.name : name.trim();
    if (!effectiveName) {
      setError('Name is required.');
      return;
    }
    if (!title.trim()) {
      setError('Problem Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!file) {
      setError('Please upload your project ZIP file (.zip).');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Only ZIP files (.zip) are accepted.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', effectiveName);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('projectZip', file);

      const res = await api.createProblem(formData);
      if (res.user) {
        onUserUpdate(res.user);
      }
      setPostedProblem(res.problem);
    } catch (err: any) {
      setError(err.message || 'File upload failed. Please upload a ZIP file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Share Your Problem
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Post your broken project files so peer developers can download, fix, and submit a solution.
        </p>
      </div>

      {postedProblem ? (
        <div className="p-6 border border-gray-300 bg-white space-y-4">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Your problem has been posted.</span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 text-xs space-y-1.5">
            <div className="font-semibold text-gray-900 text-sm">{postedProblem.title}</div>
            <div className="text-gray-600 line-clamp-2">{postedProblem.description}</div>
            <div className="text-gray-500 font-mono text-[11px] pt-1">
              File: {postedProblem.originalZipName} ({Math.round(postedProblem.originalZipSize / 1024)} KB)
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => onNavigate('problem-detail', { problemId: postedProblem.id })}
              className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 rounded"
            >
              View Problem
            </button>
            <button
              onClick={() => {
                setPostedProblem(null);
                setTitle('');
                setDescription('');
                setFile(null);
              }}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 rounded"
            >
              Share Another Problem
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border border-gray-200 bg-white p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={user ? user.name : name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!user}
              placeholder="Your name"
              className="w-full text-xs px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-600 rounded"
            />
            {user && (
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                Posting as logged-in developer: {user.name}
              </span>
            )}
          </div>

          {/* Problem Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Problem Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="React app crashes when submitting form"
              className="w-full text-xs px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:border-black rounded"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly explain what is broken and what you have already tried."
              className="w-full text-xs px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:border-black rounded"
            />
          </div>

          {/* Project ZIP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-800">
                Project ZIP (.zip) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateSampleZip}
                className="text-[11px] text-gray-600 underline hover:text-black"
                title="Generates a sample ZIP archive so you can test quickly without searching for files"
              >
                Insert sample demo project ZIP
              </button>
            </div>

            <div className="border border-dashed border-gray-300 p-4 text-center bg-gray-50 hover:bg-gray-100/50 transition-colors">
              <input
                type="file"
                id="projectZipInput"
                accept=".zip,application/zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="projectZipInput" className="cursor-pointer block">
                <FileArchive className="w-7 h-7 mx-auto text-gray-500 mb-2" />
                <div className="text-xs font-medium text-gray-800">
                  {file ? file.name : 'Upload your project (.zip)'}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Only .zip files up to 25MB'}
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors rounded"
            >
              {loading ? 'Uploading & Posting Problem...' : 'Submit Problem'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
