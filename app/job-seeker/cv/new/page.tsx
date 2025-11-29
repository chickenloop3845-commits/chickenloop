'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { cvApi } from '@/lib/api';
import { SPORTS_LIST } from '@/lib/sports';
import { QUALIFICATIONS } from '@/lib/qualifications';
import { OFFICIAL_LANGUAGES } from '@/lib/languages';
import { OCCUPATIONAL_AREAS } from '@/lib/occupationalAreas';

export default function NewCVPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '' }],
    skills: [''],
    certifications: [''],
    professionalCertifications: [] as string[],
    experienceAndSkill: [] as string[],
    languages: [] as string[],
    lookingForWorkInAreas: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPictures, setSelectedPictures] = useState<File[]>([]);
  const [picturePreviews, setPicturePreviews] = useState<string[]>([]);
  const [uploadingPictures, setUploadingPictures] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'job-seeker') {
      router.push(`/${user.role === 'admin' ? 'admin' : 'recruiter'}`);
    }
  }, [user, authLoading, router]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPictures = selectedPictures.length + files.length;
    
    if (totalPictures > 3) {
      setError('Maximum 3 pictures allowed');
      return;
    }

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only images (JPEG, PNG, WEBP, GIF) are allowed.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
    }

    const newPictures = [...selectedPictures, ...files];
    setSelectedPictures(newPictures);
    setError('');

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPicturePreviews([...picturePreviews, ...newPreviews]);
  };

  const removeNewPicture = (index: number) => {
    const newPictures = selectedPictures.filter((_, i) => i !== index);
    const newPreviews = picturePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(picturePreviews[index]);
    
    setSelectedPictures(newPictures);
    setPicturePreviews(newPreviews);
  };

  const uploadPictures = async (): Promise<string[]> => {
    if (selectedPictures.length === 0) return [];

    setUploadingPictures(true);
    try {
      const uploadFormData = new FormData();
      selectedPictures.forEach((file) => {
        uploadFormData.append('pictures', file);
      });

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload pictures');
      }

      return data.paths || [];
    } finally {
      setUploadingPictures(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload pictures first
      const picturePaths = await uploadPictures();

      const data = {
        ...formData,
        experience: formData.experience.filter((exp) => exp.company && exp.position),
        education: formData.education.filter((edu) => edu.institution && edu.degree),
        skills: formData.skills.filter((skill) => skill.trim() !== ''),
        certifications: formData.certifications.filter((cert) => cert.trim() !== ''),
        professionalCertifications: formData.professionalCertifications || [],
        experienceAndSkill: formData.experienceAndSkill || [],
        languages: formData.languages || [],
        lookingForWorkInAreas: formData.lookingForWorkInAreas || [],
        pictures: picturePaths,
      };
      await cvApi.create(data);
      router.push('/job-seeker');
    } catch (err: any) {
      setError(err.message || 'Failed to create CV');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', position: '', startDate: '', endDate: '', description: '' }],
    });
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, experience: updated });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', startDate: '', endDate: '' }],
    });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ''],
    });
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...formData.skills];
    updated[index] = value;
    setFormData({ ...formData, skills: updated });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, ''],
    });
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...formData.certifications];
    updated[index] = value;
    setFormData({ ...formData, certifications: updated });
  };

  if (authLoading) {
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
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Your CV</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address (town, county)
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                Professional Summary
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Looking for work in these areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Looking for work in these areas:
              </label>
              {formData.lookingForWorkInAreas.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.lookingForWorkInAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            lookingForWorkInAreas: formData.lookingForWorkInAreas.filter((a) => a !== area),
                          });
                        }}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                        aria-label={`Remove ${area}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                {OCCUPATIONAL_AREAS.map((area) => {
                  const isSelected = formData.lookingForWorkInAreas.includes(area);
                  return (
                    <label
                      key={area}
                      className="flex items-center py-2 px-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              lookingForWorkInAreas: [...formData.lookingForWorkInAreas, area],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              lookingForWorkInAreas: formData.lookingForWorkInAreas.filter((a) => a !== area),
                            });
                          }
                        }}
                        className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{area}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  + Add Experience
                </button>
              </div>
              {formData.experience.map((exp, index) => (
                <div key={index} className="border p-4 rounded mb-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date (leave blank if current)</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-gray-900"
                  />
                  {formData.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Education</label>
                <button
                  type="button"
                  onClick={addEducation}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  + Add Education
                </button>
              </div>
              {formData.education.map((edu, index) => (
                <div key={index} className="border p-4 rounded mb-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input
                      placeholder="Field of Study"
                      value={edu.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Other Skills (one per field)</label>
                <button
                  type="button"
                  onClick={addSkill}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  + Add Skill
                </button>
              </div>
              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      placeholder="Skill"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-red-600 hover:text-red-700 px-3"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages (Important - Recruiters will filter for it)
              </label>
              {formData.languages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            languages: formData.languages.filter((l) => l !== lang),
                          });
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        aria-label={`Remove ${lang}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                {OFFICIAL_LANGUAGES.map((lang) => {
                  const isSelected = formData.languages.includes(lang);
                  return (
                    <label
                      key={lang}
                      className="flex items-center py-2 px-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              languages: [...formData.languages, lang],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              languages: formData.languages.filter((l) => l !== lang),
                            });
                          }
                        }}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{lang}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Certifications</label>
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  + Add Certification
                </button>
              </div>
              <div className="space-y-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      placeholder="Certification"
                      value={cert}
                      onChange={(e) => updateCertification(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.certifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-700 px-3"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sports Experiences and Skills (Important - Recruiters will filter for it)
              </label>
              {formData.experienceAndSkill.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.experienceAndSkill.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            experienceAndSkill: formData.experienceAndSkill.filter((s) => s !== item),
                          })
                        }
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                        aria-label={`Remove ${item}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="max-h-56 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                {SPORTS_LIST.filter((sport) => sport !== 'Other (see job description)').map((sport) => {
                  const isSelected = formData.experienceAndSkill.includes(sport);

                  return (
                    <label
                      key={sport}
                      className="flex items-center py-2 px-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              experienceAndSkill: [...formData.experienceAndSkill, sport],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              experienceAndSkill: formData.experienceAndSkill.filter((s) => s !== sport),
                            });
                          }
                        }}
                        className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{sport}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select any sport or activity that applies (multiple selections allowed).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Certifications (Important - Recruiters will filter for it)
              </label>
              
              {/* Selected Professional Certifications Display */}
              {formData.professionalCertifications.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.professionalCertifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            professionalCertifications: formData.professionalCertifications.filter((c) => c !== cert),
                          })
                        }
                        className="ml-2 text-green-600 hover:text-green-800"
                        aria-label={`Remove ${cert}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Professional Certifications Checkbox List with Subheaders */}
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                {QUALIFICATIONS.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-4 last:mb-0">
                    {/* Subheader - Non-selectable */}
                    <div className="sticky top-0 bg-gray-100 px-2 py-2 mb-2 rounded font-semibold text-sm text-gray-700 border-b border-gray-200">
                      {category.header}
                    </div>
                    {/* Certification Items */}
                    {category.items.map((qual) => {
                      const isSelected = formData.professionalCertifications.includes(qual);
                      
                      return (
                        <label
                          key={qual}
                          className="flex items-center py-2 px-2 ml-4 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const exists = formData.professionalCertifications.includes(qual);
                              setFormData({
                                ...formData,
                                professionalCertifications: exists
                                  ? formData.professionalCertifications.filter((c) => c !== qual)
                                  : [...formData.professionalCertifications, qual],
                              });
                            }}
                            className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">{qual}</span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {formData.professionalCertifications.length > 0
                  ? `${formData.professionalCertifications.length} certification(s) selected`
                  : 'Select professional certifications (tap to select)'}
              </p>
            </div>

            {/* Pictures Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pictures (up to 3)
              </label>
              <div className="space-y-4">
                {/* New Picture Previews */}
                {picturePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {picturePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPicture(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Input */}
                <div>
                  {selectedPictures.length < 3 ? (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handlePictureChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum 3 pictures. Each file must be less than 5MB.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Maximum of 3 pictures reached. Remove a picture to add a new one.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploadingPictures}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading || uploadingPictures ? 'Creating...' : 'Create CV'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

