import { useEffect, useState } from 'react';
import { api } from '../api';
import { Problem, Solution, User } from '../types';
import { Download, CheckCircle, Clock, AlertCircle, FileArchive, ArrowLeft } from 'lucide-react';

interface ProblemDetailPageProps {
  problemId: string;
  user: User | null;
  onNavigate: (page: string) => void;
  onUserUpdate: (user: User) => void;
}

export default function ProblemDetailPage({
  problemId,
  user,
  onNavigate,
  onUserUpdate,
}: ProblemDetailPageProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit Solution form state
  const [solverName, setSolverName] = useState(user ? user.name : '');
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [submittingSolution, setSubmittingSolution] = useState(false);
  const [solutionSuccessMessage, setSolutionSuccessMessage] = useState<string | null>(null);
  const [solutionFormError, setSolutionFormError] = useState<string | null>(null);

  // Accept solution state
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [probData, solsData] = await Promise.all([
        api.getProblem(problemId),
        api.getSolutions(problemId),
      ]);
      setProblem(probData.problem);
      setSolutions(solsData);
    } catch (err: any) {
      setError(err.message || 'Problem not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [problemId]);

  // Keep solverName synchronized if user changes
  useEffect(() => {
    if (user) {
      setSolverName(user.name);
    }
  }, [user]);

  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSolutionFormError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.zip')) {
        setSolutionFormError('File upload failed. Only ZIP (.zip) files are allowed.');
        setSolutionFile(null);
        e.target.value = '';
        return;
      }
      setSolutionFile(selected);
    }
  };

  // Helper to generate sample fixed zip for quick testing
  const handleGenerateSampleFixedZip = () => {
    const dummyZipBytes = new Uint8Array([
      0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    const sampleFile = new File([dummyZipBytes], 'fixed-solution.zip', { type: 'application/zip' });
    setSolutionFile(sampleFile);
    setSolutionFormError(null);
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSolutionFormError(null);
    setSolutionSuccessMessage(null);

    const effectiveName = user ? user.name : solverName.trim();
    if (!effectiveName) {
      setSolutionFormError('Your Name is required.');
      return;
    }
    if (!solutionFile) {
      setSolutionFormError('Please select a fixed project ZIP file (.zip).');
      return;
    }
    if (!solutionFile.name.toLowerCase().endsWith('.zip')) {
      setSolutionFormError('Only ZIP files (.zip) are accepted.');
      return;
    }

    setSubmittingSolution(true);

    try {
      const formData = new FormData();
      formData.append('name', effectiveName);
      formData.append('fixedZip', solutionFile);

      const res = await api.createSolution(problemId, formData);
      if (res.user) {
        onUserUpdate(res.user);
      }
      setSolutionSuccessMessage('Your solution has been submitted.');
      setSolutionFile(null);
      // Reload solutions
      const sols = await api.getSolutions(problemId);
      setSolutions(sols);
    } catch (err: any) {
      setSolutionFormError(err.message || 'File upload failed. Please upload a ZIP file.');
    } finally {
      setSubmittingSolution(false);
    }
  };

  const handleAcceptFix = async (solutionId: string) => {
    if (!user) {
      setAcceptError('You must be logged in as the problem poster to accept a fix.');
      return;
    }
    setAcceptingId(solutionId);
    setAcceptError(null);

    try {
      await api.acceptSolution(solutionId);
      // Reload problem and solutions to show updated accepted status
      await loadData();
    } catch (err: any) {
      setAcceptError(err.message || 'Failed to accept solution');
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center text-xs text-gray-500">
        Loading problem details...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <p className="text-gray-800 font-semibold text-sm">
          {error || 'Problem not found.'}
        </p>
        <button
          onClick={() => onNavigate('solve')}
          className="px-4 py-2 border border-gray-300 text-xs font-medium rounded hover:bg-gray-50"
        >
          Back to Open Problems
        </button>
      </div>
    );
  }

  const isPoster = user && user.id === problem.posterId;
  const isSolved = problem.status === 'solved';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('solve')}
          className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Open Problems</span>
        </button>
      </div>

      {/* Problem Details */}
      <section className="border border-gray-300 bg-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">
                {problem.title}
              </h1>
            </div>
            <div className="text-xs text-gray-600">
              Posted by: <strong className="text-gray-900">{problem.posterName}</strong>
              <span className="mx-2 text-gray-400">•</span>
              <span>{formatDate(problem.createdAt)}</span>
            </div>
          </div>

          <div>
            {isSolved ? (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-green-700 mr-1.5" />
                Solved
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-300 rounded font-mono">
                <Clock className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
                Open
              </span>
            )}
          </div>
        </div>

        {/* Full problem description */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider text-[11px]">
            Description
          </div>
          <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line bg-gray-50 p-4 border border-gray-200 font-mono">
            {problem.description}
          </p>
        </div>

        {/* Download original ZIP */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 bg-white gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <FileArchive className="w-5 h-5 text-gray-600 shrink-0" />
            <div>
              <div className="font-mono font-medium text-gray-900">
                {problem.originalZipName}
              </div>
              <div className="text-[11px] text-gray-500">
                Size: {Math.max(1, Math.round(problem.originalZipSize / 1024))} KB
              </div>
            </div>
          </div>

          <a
            href={api.getProblemDownloadUrl(problem.id)}
            download
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 rounded shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Original ZIP</span>
          </a>
        </div>

        {/* Poster identity indicator */}
        {isPoster && (
          <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 border border-gray-200">
            ℹ️ You are viewing this problem as the <strong>original author</strong> ({problem.posterName}). You can review submitted replies below and click <strong>Accept This Fix</strong> to award points.
          </div>
        )}
      </section>

      {/* Submit a Solution Section */}
      <section className="border border-gray-300 bg-white p-6 space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h2 className="text-base font-bold text-gray-900">
            Submit a Solution
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Download the project ZIP above, solve the problem locally, and upload the fixed project ZIP.
          </p>
        </div>

        {isSolved ? (
          <div className="p-3 bg-gray-50 border border-gray-200 text-xs text-gray-700">
            This problem has already been solved. No further solutions can be submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmitSolution} className="space-y-4">
            {solutionSuccessMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{solutionSuccessMessage}</span>
              </div>
            )}

            {solutionFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{solutionFormError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={user ? user.name : solverName}
                onChange={(e) => setSolverName(e.target.value)}
                disabled={!!user}
                placeholder="e.g. Alex Solver"
                className="w-full text-xs px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:border-black disabled:bg-gray-100 rounded"
              />
              {user && (
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Submitting as: {user.name}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-800">
                  Fixed Project ZIP (.zip) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSampleFixedZip}
                  className="text-[11px] text-gray-600 underline hover:text-black"
                  title="Auto-attaches a demo fixed ZIP archive for fast testing"
                >
                  Insert demo fixed ZIP
                </button>
              </div>

              <div className="border border-dashed border-gray-300 p-4 text-center bg-gray-50 hover:bg-gray-100/50">
                <input
                  type="file"
                  id="fixedZipInput"
                  accept=".zip,application/zip"
                  onChange={handleSolutionFileChange}
                  className="hidden"
                />
                <label htmlFor="fixedZipInput" className="cursor-pointer block">
                  <FileArchive className="w-6 h-6 mx-auto text-gray-500 mb-1.5" />
                  <div className="text-xs font-medium text-gray-800">
                    {solutionFile ? solutionFile.name : 'Upload fixed project (.zip)'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {solutionFile ? `${(solutionFile.size / 1024).toFixed(1)} KB` : 'Only .zip files up to 25MB'}
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingSolution}
              className="py-2 px-4 bg-black text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50 rounded"
            >
              {submittingSolution ? 'Uploading Fix...' : 'Submit Solution'}
            </button>
          </form>
        )}
      </section>

      {/* Solutions / Replies Section */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Replies / Solutions ({solutions.length})
          </h2>
        </div>

        {acceptError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
            {acceptError}
          </div>
        )}

        {solutions.length === 0 ? (
          <div className="border border-gray-200 bg-white p-8 text-center text-xs text-gray-500">
            No solutions have been submitted yet. Be the first to fix this issue!
          </div>
        ) : (
          <div className="space-y-4">
            {solutions.map((sol) => (
              <div
                key={sol.id}
                className={`p-4 border bg-white ${
                  sol.accepted
                    ? 'border-gray-900 bg-gray-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        Solution by {sol.solverName}
                      </h3>
                      {sol.accepted && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold bg-black text-white rounded">
                          Accepted Solution
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Submitted {formatDate(sol.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-600 font-mono">
                      Status: <strong className={sol.accepted ? 'text-gray-900' : 'text-gray-600'}>
                        {sol.accepted ? 'Accepted' : 'Pending'}
                      </strong>
                    </span>

                    <a
                      href={api.getSolutionDownloadUrl(sol.id)}
                      download
                      className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-900 text-xs font-medium rounded flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Fixed ZIP</span>
                    </a>

                    {/* Accept This Fix Button: only visible to problem poster if problem is not yet solved */}
                    {isPoster && !isSolved && (
                      <button
                        onClick={() => handleAcceptFix(sol.id)}
                        disabled={acceptingId === sol.id}
                        className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 text-xs font-medium rounded"
                      >
                        {acceptingId === sol.id ? 'Accepting...' : 'Accept This Fix'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
