import Link from 'next/link';
import Image from 'next/image';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    pictures?: string[];
  };
}

export default function JobCard({ job }: JobCardProps) {
  const thumbnail = job.pictures && job.pictures.length > 0 ? job.pictures[0] : null;

  return (
    <Link
      href={`/jobs/${job._id}`}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer block overflow-hidden transform hover:-translate-y-1 border border-gray-100"
    >
      {/* Thumbnail Image */}
      <div className="w-full h-48 sm:h-56 bg-gray-200 relative overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={job.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Job Info */}
      <div className="p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-2 font-medium">
          {job.company}
        </p>
        <p className="text-sm text-gray-600 flex items-center">
          <span className="mr-1.5">📍</span>
          <span className="line-clamp-1">{job.location}</span>
        </p>
      </div>
    </Link>
  );
}

