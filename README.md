# NeighborhoodRank

A modern web application for rating and discovering neighborhoods and apartment buildings. Built with Next.js, Tailwind CSS, and Supabase.

## Features

- 🏘️ **Rate Neighborhoods** - Share your experience about safety, cleanliness, noise, community, transit access, and amenities
- 🏢 **Rate Buildings** - Review apartment buildings and condos based on management, maintenance, rent value, and more
- 🗺️ **Mapbox Autocomplete** - Smart address search with instant suggestions (Canada-only)
- 🔍 **Smart Search** - Find neighborhoods and buildings with instant search
- ⭐ **Top Ratings** - Discover the best-rated places in your city
- 📸 **Photo Upload** - Add up to 5 photos for each rating
- 👤 **User Profiles** - Track all your ratings in one place
- 📱 **Responsive Design** - Beautiful on mobile, tablet, and desktop

## Tech Stack

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Maps & Geocoding:** Mapbox GL JS + Geocoder
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   cd ratemy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   Create a new Supabase project at [supabase.com](https://supabase.com)

4. **Create the database tables**

   In your Supabase SQL Editor, run the following SQL:

   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Create neighborhoods table
   CREATE TABLE neighborhoods (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     city VARCHAR(255) NOT NULL,
     province VARCHAR(255) NOT NULL,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     safety INTEGER NOT NULL CHECK (safety >= 1 AND safety <= 5),
     cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
     noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
     community INTEGER NOT NULL CHECK (community >= 1 AND community <= 5),
     transit INTEGER NOT NULL CHECK (transit >= 1 AND transit <= 5),
     amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
     average_rating DECIMAL(3,2) NOT NULL,
     images TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Create buildings table
   CREATE TABLE buildings (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     address VARCHAR(500) NOT NULL,
     city VARCHAR(255) NOT NULL,
     province VARCHAR(255) NOT NULL,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     management INTEGER NOT NULL CHECK (management >= 1 AND management <= 5),
     cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
     maintenance INTEGER NOT NULL CHECK (maintenance >= 1 AND maintenance <= 5),
     rent_value INTEGER NOT NULL CHECK (rent_value >= 1 AND rent_value <= 5),
     noise INTEGER NOT NULL CHECK (noise >= 1 AND noise <= 5),
     amenities INTEGER NOT NULL CHECK (amenities >= 1 AND amenities <= 5),
     average_rating DECIMAL(3,2) NOT NULL,
     images TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Create indexes for better query performance
   CREATE INDEX idx_neighborhoods_city ON neighborhoods(city);
   CREATE INDEX idx_neighborhoods_rating ON neighborhoods(average_rating DESC);
   CREATE INDEX idx_neighborhoods_user ON neighborhoods(user_id);
   CREATE INDEX idx_buildings_city ON buildings(city);
   CREATE INDEX idx_buildings_rating ON buildings(average_rating DESC);
   CREATE INDEX idx_buildings_user ON buildings(user_id);

   -- Enable Row Level Security
   ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
   ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

   -- Create policies for neighborhoods
   CREATE POLICY "Neighborhoods are viewable by everyone" 
     ON neighborhoods FOR SELECT 
     USING (true);

   CREATE POLICY "Users can insert their own neighborhoods" 
     ON neighborhoods FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own neighborhoods" 
     ON neighborhoods FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own neighborhoods" 
     ON neighborhoods FOR DELETE 
     USING (auth.uid() = user_id);

   -- Create policies for buildings
   CREATE POLICY "Buildings are viewable by everyone" 
     ON buildings FOR SELECT 
     USING (true);

   CREATE POLICY "Users can insert their own buildings" 
     ON buildings FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own buildings" 
     ON buildings FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own buildings" 
     ON buildings FOR DELETE 
     USING (auth.uid() = user_id);
   ```

5. **Create Storage Buckets**

   In Supabase Storage, create two public buckets:
   - `neighborhood-images`
   - `building-images`

   Make both buckets public by adding this policy in the bucket settings:
   ```sql
   -- Allow anyone to read images
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'neighborhood-images' OR bucket_id = 'building-images');

   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'neighborhood-images' OR bucket_id = 'building-images');
   ```

6. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Get these values from your Supabase project settings under API.

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ratemy/
├── app/                    # Next.js 14 App Router
│   ├── explore/           # Browse all ratings
│   ├── login/             # Login page
│   ├── signup/            # Sign up page
│   ├── profile/           # User profile
│   ├── rate/              # Rating pages
│   │   ├── neighborhood/  # Rate neighborhood
│   │   └── building/      # Rate building
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navigation.tsx     # Navigation bar
│   └── RateModal.tsx      # Rating type selector
├── lib/                   # Utilities
│   └── supabase.ts        # Supabase client
├── public/                # Static assets
├── package.json           # Dependencies
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Design Features

- **Color Scheme:** Orange primary (#f97316) with light gray accents
- **Typography:** Inter font family
- **Cards:** Rounded corners (rounded-2xl, rounded-3xl)
- **Shadows:** Layered shadows for depth
- **Animations:** Smooth transitions and hover effects
- **Responsive:** Mobile-first design with breakpoints

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Tailwind CSS, and Supabase

# 2sw
