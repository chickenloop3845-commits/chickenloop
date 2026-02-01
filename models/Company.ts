import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  contact?: {
    email?: string;
    officePhone?: string;
    whatsapp?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
  offeredActivities?: string[]; // Array of offered activity strings
  offeredServices?: string[]; // Array of offered service strings
  logo?: string; // Company logo image URL
  pictures?: string[]; // Array of image paths (max 3)
  featured?: boolean; // Featured flag: true if featured, false otherwise
  featuredUntil?: Date | null; // Time-limited featuring: expiry date for paid boost
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        // ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR', 'DE')
        // Stored in uppercase for consistency
      },
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    website: {
      type: String,
      trim: true,
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      officePhone: {
        type: String,
        trim: true,
      },
      whatsapp: {
        type: String,
        trim: true,
      },
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      tiktok: {
        type: String,
        trim: true,
      },
      youtube: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
    },
    offeredActivities: {
      type: [String],
    },
    offeredServices: {
      type: [String],
    },
    logo: {
      type: String,
      trim: true,
    },
    pictures: {
      type: [String],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 3;
        },
        message: 'A company can have at most 3 pictures',
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // unique: true, // Removed to allow users to own multiple companies/centers
    },
  },
  {
    timestamps: true,
  }
);

// Instance method: true if time-limited featuring is active (featuredUntil set and in the future)
CompanySchema.methods.isCurrentlyFeatured = function(): boolean {
  return !!(this as any).featuredUntil && (this as any).featuredUntil > new Date();
};

// Static helper: query filter for "currently featured" (featuredUntil in the future)
CompanySchema.statics.isFeaturedQuery = function(): { featuredUntil: { $gt: Date } } {
  return { featuredUntil: { $gt: new Date() } };
};

// Pre-save hook: unified featured expiry — featuredUntil is source of truth; sync featured for legacy compatibility
CompanySchema.pre('save', function(next) {
  const doc = this as any;
  const until = (doc.featuredUntil != null && doc.featuredUntil !== undefined)
    ? (doc.featuredUntil instanceof Date ? doc.featuredUntil : new Date(doc.featuredUntil))
    : null;
  doc.featured = !!(until && until > new Date());
  next();
});

// Create indexes for efficient querying
// Note: owner field already has unique: true which creates an index automatically
CompanySchema.index({ featured: 1 }); // For featured company filtering
CompanySchema.index({ featuredUntil: 1 }); // For time-limited featuring queries
CompanySchema.index({ createdAt: -1 }); // For sorting by creation date

interface ICompanyModel extends Model<ICompany> {
  isFeaturedQuery(): { featuredUntil: { $gt: Date } };
}
const Company = (mongoose.models.Company as ICompanyModel) || mongoose.model<ICompany, ICompanyModel>('Company', CompanySchema);

export default Company;


