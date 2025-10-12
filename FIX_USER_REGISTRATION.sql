-- ✅ FIX USER REGISTRATION - Allow normal users to register while keeping admin control

-- Step 1: Drop the overly restrictive admin policies
DROP POLICY IF EXISTS "Admins have full access to user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins have full access to neighborhood_reviews" ON neighborhood_reviews;
DROP POLICY IF EXISTS "Admins have full access to building_reviews" ON building_reviews;
DROP POLICY IF EXISTS "Admins can manage neighborhoods" ON neighborhoods;
DROP POLICY IF EXISTS "Admins can manage buildings" ON buildings;

-- Step 2: Create balanced policies that allow user registration

-- User profiles: Users can read their own, admins can read all
CREATE POLICY "Users can read own profile" 
ON user_profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
ON user_profiles FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Neighborhood reviews: Users can manage their own, admins can manage all
CREATE POLICY "Users can read approved neighborhood reviews" 
ON neighborhood_reviews FOR SELECT 
TO authenticated
USING (status = 'approved');

CREATE POLICY "Users can insert own neighborhood reviews" 
ON neighborhood_reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own neighborhood reviews" 
ON neighborhood_reviews FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all neighborhood reviews" 
ON neighborhood_reviews FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Building reviews: Same pattern as neighborhood reviews
CREATE POLICY "Users can read approved building reviews" 
ON building_reviews FOR SELECT 
TO authenticated
USING (status = 'approved');

CREATE POLICY "Users can insert own building reviews" 
ON building_reviews FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own building reviews" 
ON building_reviews FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all building reviews" 
ON building_reviews FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Neighborhoods: Public read, admin manage
CREATE POLICY "Anyone can read neighborhoods" 
ON neighborhoods FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can manage neighborhoods" 
ON neighborhoods FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Buildings: Public read, admin manage  
CREATE POLICY "Anyone can read buildings" 
ON buildings FOR SELECT 
TO public
USING (true);

CREATE POLICY "Admins can manage buildings" 
ON buildings FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Step 3: Verify the setup
SELECT 'Policies updated successfully' as status;
