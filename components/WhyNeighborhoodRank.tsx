'use client'

import { Shield, Users, Star, Camera, Eye, CheckCircle, Lock, ThumbsUp, Globe } from 'lucide-react'

export default function WhyNeighborhoodRank() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            Why <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">NeighborhoodRank</span>?
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Make informed decisions about where to live with real insights from people who know these neighborhoods best
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20">
          
          {/* Verified Reviews */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">Verified</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Honest Reviews</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Real ratings from actual residents who live there every day
            </p>
          </div>

          {/* 6+ Categories */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">6+ Categories</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Detailed Ratings</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Compare safety, cleanliness, noise, transit access, and more
            </p>
          </div>

          {/* Buildings + Neighborhoods */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">Buildings + Neighborhoods</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Building Reviews</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Rate apartments, condos, and property management quality
            </p>
          </div>

          {/* Multi-User */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-3">Multi-User</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Community Driven</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Multiple reviews per location with aggregated ratings
            </p>
          </div>

          {/* Real Photos */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full mb-3">Real Photos</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Photo Uploads</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              See real photos from residents, not stock images
            </p>
          </div>

          {/* Privacy */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-3">Your Choice</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">100% Privacy Protected</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Choose to post anonymously or show your name - you're in control
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white mb-16 lg:mb-20 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">100%</div>
              <div className="text-base lg:text-lg text-gray-300">Free to Use</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">6+</div>
              <div className="text-base lg:text-lg text-gray-300">Rating Categories</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">∞</div>
              <div className="text-base lg:text-lg text-gray-300">Reviews Per Location</div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
            Your Privacy is Our Priority
          </h2>
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We believe in honest reviews without compromising your privacy
          </p>
        </div>

        {/* Privacy Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Anonymous Reviews */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-green-200 hover:bg-white transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">100% Anonymous Reviews</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Choose to post your reviews completely anonymously. Your identity stays private while your insights help others.
            </p>
            <div className="flex items-center text-green-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Full privacy protection
            </div>
          </div>

          {/* All Users Verified */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-blue-200 hover:bg-white transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">All Users Verified</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Even anonymous reviewers must create an account. This prevents spam and abuse while maintaining your privacy.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified & trusted reviews
            </div>
          </div>

          {/* You Decide */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-purple-200 hover:bg-white transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">You Decide</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Want recognition? Show your name. Prefer privacy? Stay anonymous. Change your preference anytime.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Total control over your identity
            </div>
          </div>

          {/* Abuse Prevention */}
          <div className="group bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-red-200 hover:bg-white transition-all duration-300">
            <div className="flex items-center mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Abuse Prevention</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Each user can only review a location once. Account verification prevents fake reviews and spam.
            </p>
            <div className="flex items-center text-red-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4 mr-2" />
              One review per user per location
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 lg:p-10 border border-gray-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
            Trusted & Secure Platform
          </h3>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            All reviews are from verified accounts. Anonymous users stay private, but everyone is authenticated to ensure quality and prevent abuse.
          </p>
        </div>

      </div>
    </section>
  )
}
