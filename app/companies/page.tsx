'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { getCountryNameFromCode } from '@/lib/countryUtils';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  pictures?: string[];
  address?: {
    city?: string;
    country?: string;
  };
  website?: string;
  featured?: boolean;
  createdAt: string;
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

function CompaniesPageContent() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // Store all companies for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const companiesPerPage = 20;

  useEffect(() => {
    // Read query parameters from URL on mount
    const keywordParam = searchParams?.get('keyword');
    const countryParam = searchParams?.get('country');

    if (keywordParam) {
      setKeyword(decodeURIComponent(keywordParam));
    }
    if (countryParam) {
      setSelectedCountry(decodeURIComponent(countryParam));
    }

    // Load companies regardless of authentication status
    loadCompanies();
  }, [searchParams]);

  useEffect(() => {
    // Filter companies when any filter changes
    let filtered = allCompanies;

    // Filter by keyword (searches in name, description)
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      filtered = filtered.filter((company) => {
        const nameMatch = company.name?.toLowerCase().includes(keywordLower);
        const descriptionMatch = company.description?.toLowerCase().includes(keywordLower);
        return nameMatch || descriptionMatch;
      });
    }

    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter((company) => {
        if (!company.address?.country) return false;
        return company.address.country.toUpperCase() === selectedCountry.toUpperCase();
      });
    }

    // Sort: featured companies first, then by creation date (createdAt) descending
    filtered.sort((a, b) => {
      // Featured companies come first
      const aFeatured = Boolean(a.featured);
      const bFeatured = Boolean(b.featured);

      // If one is featured and the other isn't, featured comes first
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      // Within each group (both featured or both non-featured), sort by creation date (createdAt) descending
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending (newest first)
    });

    setCompanies(filtered);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [selectedCountry, keyword, allCompanies]);

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      const companiesList = data.companies || [];

      // Sort companies: featured first, then by creation date descending
      const sortedCompanies = [...companiesList].sort((a, b) => {
        // Featured companies come first
        const aFeatured = Boolean(a.featured);
        const bFeatured = Boolean(b.featured);

        // If one is featured and the other isn't, featured comes first
        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;

        // Within each group (both featured or both non-featured), sort by creation date (createdAt) descending
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending (newest first)
      });

      setAllCompanies(sortedCompanies);
      setCompanies(sortedCompanies);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  // Get unique countries from all companies
  const getUniqueCountries = (): Array<{ code: string; name: string }> => {
    const countryMap = new Map<string, string>();

    allCompanies.forEach((company) => {
      if (company.address?.country && company.address.country.trim()) {
        const code = company.address.country.toUpperCase();
        if (!countryMap.has(code)) {
          countryMap.set(code, getCountryNameFromCode(code));
        }
      }
    });

    // Convert to array and sort by country name
    const countries = Array.from(countryMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  };

  if (loading) {
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
        <div className="flex flex-col mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-900">
            We have {companies.length} {companies.length === 1 ? 'company' : 'companies'} meeting these criteria
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center sm:justify-end gap-3 flex-wrap">
            {/* Keyword Search */}
            <input
              type="text"
              placeholder="Search companies..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
            />

            {/* Country Filter */}
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
            >
              <option value="">All Countries</option>
              {getUniqueCountries().map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {(selectedCountry || keyword) && (
              <button
                onClick={() => {
                  setSelectedCountry('');
                  setKeyword('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(selectedCountry || keyword) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            Showing companies
            {keyword && (
              <span> matching: <strong>{keyword}</strong></span>
            )}
            {selectedCountry && (
              <span>
                {keyword ? ' in' : ''} <strong>{getCountryNameFromCode(selectedCountry)}</strong>
              </span>
            )}
            {' '}({companies.length} {companies.length === 1 ? 'company' : 'companies'})
          </div>
        )}

        {companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No companies available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for new companies!</p>
          </div>
        ) : (
          <>
            {/* Calculate pagination */}
            {(() => {
              const totalPages = Math.ceil(companies.length / companiesPerPage);
              const indexOfLastCompany = currentPage * companiesPerPage;
              const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
              const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentCompanies.map((company) => {
                      // Get the first picture, or use a placeholder
                      const firstPicture = company.pictures && company.pictures.length > 0
                        ? company.pictures[0]
                        : null;

                      // Format location
                      const locationParts = [];
                      if (company.address?.city) {
                        locationParts.push(company.address.city);
                      }
                      if (company.address?.country) {
                        const countryName = getCountryNameFromCode(company.address.country);
                        locationParts.push(countryName || company.address.country);
                      }
                      const locationText = locationParts.length > 0
                        ? locationParts.join(', ')
                        : 'Location not specified';

                      return (
                        <Link
                          key={company.id}
                          href={`/companies/${company.id}`}
                          className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block ${company.featured
                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300'
                            : 'bg-white'
                            }`}
                        >
                          {/* Company Picture */}
                          <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                            {company.featured && (
                              <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold shadow-md">
                                ⭐ Featured
                              </div>
                            )}
                            {firstPicture ? (
                              <Image
                                src={firstPicture}
                                alt={company.name}
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

                          {/* Company Info */}
                          <div className="p-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {company.name}
                            </h2>

                            {/* Location and Time Ago */}
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-gray-600 flex flex-wrap items-center gap-1">
                                <span className="mr-1">📍</span>
                                <span className="font-medium text-gray-800">{locationText}</span>
                              </p>
                              <TimeAgoDisplay date={company.createdAt} />
                            </div>
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
                      Showing {indexOfFirstCompany + 1} to {Math.min(indexOfLastCompany, companies.length)} of {companies.length} companies
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">Loading companies...</div>
        </main>
      </div>
    }>
      <CompaniesPageContent />
    </Suspense>
  );
}
