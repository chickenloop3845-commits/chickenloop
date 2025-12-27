'use client';
// Force Vercel rebuild

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JobSelectionModal from '../components/JobSelectionModal';

interface CV {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  experienceAndSkill?: string[];
  languages?: string[];
  lookingForWorkInAreas?: string[];
  professionalCertifications?: string[];
  pictures?: string[];
  jobSeeker: {
    _id: string;
    name: string;
    email: string;
    lastOnline?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Helper function to format time ago
function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

// Component to handle time ago display (prevents hydration mismatch)
function TimeAgoDisplay({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeAgo(getTimeAgo(date));

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <span className="text-xs text-gray-500">Loading...</span>;
  }

  return <span className="text-xs text-gray-500">{timeAgo}</span>;
}

export default function CVsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [allCvs, setAllCvs] = useState<CV[]>([]); // Store all CVs for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedCertification, setSelectedCertification] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterOptions, setFilterOptions] = useState<{
    languages: string[];
    workAreas: string[];
    sports: string[];
    certifications: string[];
  }>({
    languages: [],
    workAreas: [],
    sports: [],
    certifications: [],
  });
  const [contactedCandidates, setContactedCandidates] = useState<Set<string>>(new Set());
  const [contactingCandidate, setContactingCandidate] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [pendingCandidateId, setPendingCandidateId] = useState<string | null>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const cvsPerPage = 20;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'recruiter' && user.role !== 'admin') {
      router.push(`/${user.role === 'job-seeker' ? 'job-seeker' : ''}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'recruiter' || user.role === 'admin')) {
      loadCVs();
      loadContactedCandidates();
    }
  }, [user]);

  const loadContactedCandidates = async () => {
    try {
      const response = await fetch('/api/applications', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const contacted = new Set<string>();
        (data.applications || []).forEach((app: any) => {
          // Handle both populated object and ObjectId formats
          let candidateId: string | null = null;
          if (app.candidateId) {
            if (typeof app.candidateId === 'object' && app.candidateId._id) {
              candidateId = String(app.candidateId._id);
            } else {
              candidateId = String(app.candidateId);
            }
          }
          if (candidateId) {
            contacted.add(candidateId);
          }
        });
        setContactedCandidates(contacted);
      }
    } catch (err: any) {
      // Silently fail - not critical
      console.error('Failed to load contacted candidates:', err);
    }
  };

  const handleContactCandidate = async (e: React.MouseEvent, candidateId: string, jobId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (contactingCandidate || contactedCandidates.has(candidateId)) return;

    setContactingCandidate(candidateId);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ candidateId, jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setContactedCandidates((prev) => new Set(prev).add(candidateId));
        alert('Candidate contacted successfully!');
        setShowJobModal(false);
        setPendingCandidateId(null);
        setAvailableJobs([]);
      } else if (data.jobs && Array.isArray(data.jobs)) {
        // Multiple jobs available - show selection modal
        setAvailableJobs(data.jobs);
        setPendingCandidateId(candidateId);
        setShowJobModal(true);
        setContactingCandidate(null);
      } else {
        alert(data.error || 'Failed to contact candidate. Please try again.');
      }
    } catch (err: any) {
      alert('Failed to contact candidate. Please try again.');
    } finally {
      if (!showJobModal) {
        setContactingCandidate(null);
      }
    }
  };

  const handleJobSelect = (jobId: string) => {
    if (pendingCandidateId) {
      handleContactCandidate(
        { preventDefault: () => { }, stopPropagation: () => { } } as React.MouseEvent,
        pendingCandidateId,
        jobId
      );
    }
  };

  useEffect(() => {
    // Filter CVs when any filter changes
    let filtered = allCvs;

    // Filter by language
    if (selectedLanguage) {
      filtered = filtered.filter((cv) => {
        if (!cv.languages || cv.languages.length === 0) return false;
        return cv.languages.includes(selectedLanguage);
      });
    }

    // Filter by work area
    if (selectedWorkArea) {
      filtered = filtered.filter((cv) => {
        if (!cv.lookingForWorkInAreas || cv.lookingForWorkInAreas.length === 0) return false;
        return cv.lookingForWorkInAreas.includes(selectedWorkArea);
      });
    }

    // Filter by sport/experience
    if (selectedSport) {
      filtered = filtered.filter((cv) => {
        if (!cv.experienceAndSkill || cv.experienceAndSkill.length === 0) return false;
        return cv.experienceAndSkill.includes(selectedSport);
      });
    }

    // Filter by professional certification
    if (selectedCertification) {
      filtered = filtered.filter((cv) => {
        if (!cv.professionalCertifications || cv.professionalCertifications.length === 0) return false;
        return cv.professionalCertifications.includes(selectedCertification);
      });
    }

    setCvs(filtered);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [selectedLanguage, selectedWorkArea, selectedSport, selectedCertification, allCvs]);

  const loadCVs = async () => {
    try {
      const response = await fetch('/api/candidates-list', {
        credentials: 'include',
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to load CVs';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAllCvs(data.cvs || []);
      setCvs(data.cvs || []);
      // Set filter options from backend (pre-computed, more efficient)
      if (data.filters) {
        setFilterOptions(data.filters);
      }
    } catch (err: any) {
      console.error('Error loading CVs:', err);
      setError(err.message || 'Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  // Use filter options from backend (pre-computed, no need to iterate)
  const getUniqueLanguages = (): string[] => filterOptions.languages;
  const getUniqueWorkAreas = (): string[] => filterOptions.workAreas;
  const getUniqueSports = (): string[] => filterOptions.sports;
  const getUniqueCertifications = (): string[] => filterOptions.certifications;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          We have {cvs.length} {cvs.length === 1 ? 'candidate' : 'candidates'} meeting these criteria
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center sm:justify-end mb-8 gap-3 flex-wrap">
          {/* Language Filter */}
          <select
            id="language-filter"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
          >
            <option value="">All Languages</option>
            {getUniqueLanguages().map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>

          {/* Work Area Filter */}
          <select
            id="workarea-filter"
            value={selectedWorkArea}
            onChange={(e) => setSelectedWorkArea(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
          >
            <option value="">All Work Areas</option>
            {getUniqueWorkAreas().map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Sports Experiences Filter */}
          <select
            id="sport-filter"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
          >
            <option value="">All Sports</option>
            {getUniqueSports().map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>

          {/* Professional Certifications Filter */}
          <select
            id="certification-filter"
            value={selectedCertification}
            onChange={(e) => setSelectedCertification(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
          >
            <option value="">All Certifications</option>
            {getUniqueCertifications().map((cert) => (
              <option key={cert} value={cert}>
                {cert}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(selectedLanguage || selectedWorkArea || selectedSport || selectedCertification) && (
            <button
              onClick={() => {
                setSelectedLanguage('');
                setSelectedWorkArea('');
                setSelectedSport('');
                setSelectedCertification('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(selectedLanguage || selectedWorkArea || selectedSport || selectedCertification) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            Showing candidates
            {selectedLanguage && (
              <span> with language: <strong>{selectedLanguage}</strong></span>
            )}
            {selectedWorkArea && (
              <span>
                {selectedLanguage ? ',' : ''} work area: <strong>{selectedWorkArea}</strong>
              </span>
            )}
            {selectedSport && (
              <span>
                {(selectedLanguage || selectedWorkArea) ? ',' : ''} sports experience: <strong>{selectedSport}</strong>
              </span>
            )}
            {selectedCertification && (
              <span>
                {(selectedLanguage || selectedWorkArea || selectedSport) ? ',' : ''} certification: <strong>{selectedCertification}</strong>
              </span>
            )}
            {' '}({cvs.length} {cvs.length === 1 ? 'candidate' : 'candidates'})
          </div>
        )}

        {cvs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No CVs available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for new candidates!</p>
          </div>
        ) : (
          <>
            {/* Calculate pagination */}
            {(() => {
              const totalPages = Math.ceil(cvs.length / cvsPerPage);
              const indexOfLastCv = currentPage * cvsPerPage;
              const indexOfFirstCv = indexOfLastCv - cvsPerPage;
              const currentCvs = cvs.slice(indexOfFirstCv, indexOfLastCv);

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentCvs.map((cv) => {
                      // Get the first picture, or use a placeholder
                      const firstPicture = cv.pictures && cv.pictures.length > 0
                        ? cv.pictures[0]
                        : null;

                      // Get user's last online date
                      const lastOnlineDate = cv.jobSeeker?.lastOnline;

                      return (
                        <Link
                          key={cv._id}
                          href={`/candidates/${cv._id}`}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                        >
                          {/* CV Picture */}
                          <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                            {firstPicture ? (
                              <Image
                                src={firstPicture}
                                alt={cv.fullName}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                                <span className="text-gray-500 text-sm">No Image</span>
                              </div>
                            )}
                          </div>

                          {/* CV Info */}
                          <div className="p-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {cv.fullName}
                            </h2>

                            {/* Summary Preview */}
                            {cv.summary && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {cv.summary}
                              </p>
                            )}

                            {/* Skills Preview */}
                            {cv.experienceAndSkill && cv.experienceAndSkill.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {cv.experienceAndSkill.slice(0, 3).map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {cv.experienceAndSkill.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{cv.experienceAndSkill.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Work Areas Preview */}
                            {cv.lookingForWorkInAreas && cv.lookingForWorkInAreas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {cv.lookingForWorkInAreas.slice(0, 2).map((area, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                                  >
                                    {area}
                                  </span>
                                ))}
                                {cv.lookingForWorkInAreas.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{cv.lookingForWorkInAreas.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Languages Preview */}
                            {cv.languages && cv.languages.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {cv.languages.slice(0, 2).map((lang, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                                  >
                                    {lang}
                                  </span>
                                ))}
                                {cv.languages.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{cv.languages.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Location and Last Online */}
                            <div className="flex flex-col gap-1 mt-2">
                              {cv.address && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <span>📍</span>
                                  <span className="font-medium text-gray-800">{cv.address}</span>
                                </p>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Last logged in:</span>
                                {lastOnlineDate ? (
                                  <TimeAgoDisplay date={lastOnlineDate} />
                                ) : (
                                  <span className="text-xs text-gray-500">Never</span>
                                )}
                              </div>
                            </div>

                            {/* Contact Candidate Button */}
                            {user && (user.role === 'recruiter' || user.role === 'admin') && cv.jobSeeker && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                {(() => {
                                  const candidateId = cv.jobSeeker?._id ? String(cv.jobSeeker._id) : null;
                                  if (!candidateId) return null;

                                  return contactedCandidates.has(candidateId) ? (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                                      <span>✓</span>
                                      <span>Contacted</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => handleContactCandidate(e, candidateId)}
                                      disabled={contactingCandidate === candidateId}
                                      className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {contactingCandidate === candidateId
                                        ? 'Contacting...'
                                        : 'Contact Candidate'}
                                    </button>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md font-medium ${currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        Previous
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-md font-medium ${currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                  }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 py-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md font-medium ${currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {/* Page info */}
                  {totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                      Showing {indexOfFirstCv + 1} to {Math.min(indexOfLastCv, cvs.length)} of {cvs.length} candidates
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </main>
      <JobSelectionModal
        isOpen={showJobModal}
        jobs={availableJobs}
        onSelect={handleJobSelect}
        onClose={() => {
          setShowJobModal(false);
          setPendingCandidateId(null);
          setAvailableJobs([]);
          setContactingCandidate(null);
        }}
        candidateName={
          pendingCandidateId
            ? cvs.find((cv) => cv.jobSeeker?._id === pendingCandidateId)?.fullName
            : undefined
        }
      />
    </div>
  );
}

