'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionHeader from './SectionHeader';

interface Company {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

export default function CompaniesPreview() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/companies?limit=4');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Get short tagline from description (first 100 characters)
  const getTagline = (description?: string): string => {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Companies"
          actionLabel="View all companies"
          actionHref="/companies"
        />

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No companies available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer block overflow-hidden transform hover:-translate-y-1 p-4 sm:p-6 flex flex-col items-center text-center"
              >
                {/* Company Logo */}
                <div className="w-full h-24 sm:h-32 mb-4 flex items-center justify-center bg-gray-50 rounded-lg p-3 relative">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 120px, 160px"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm text-center">
                      <div className="text-2xl mb-1">🏢</div>
                      <div className="text-xs">No Logo</div>
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>

                {/* Tagline */}
                {company.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mt-auto">
                    {getTagline(company.description)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

