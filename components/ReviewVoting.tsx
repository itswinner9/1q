'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReviewVotingProps {
  reviewId: string
  reviewType: 'neighborhood' | 'building'
  helpfulCount: number
  notHelpfulCount: number
}

export default function ReviewVoting({ reviewId, reviewType, helpfulCount, notHelpfulCount }: ReviewVotingProps) {
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null)
  const [helpful, setHelpful] = useState(helpfulCount)
  const [notHelpful, setNotHelpful] = useState(notHelpfulCount)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkUserVote()
  }, [])

  const checkUserVote = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setUserId(session.user.id)

    const { data } = await supabase
      .from('review_votes')
      .select('vote_type')
      .eq('user_id', session.user.id)
      .eq('review_id', reviewId)
      .eq('review_type', reviewType)
      .maybeSingle()

    if (data) {
      setUserVote(data.vote_type as 'helpful' | 'not_helpful')
    }
  }

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('Please login to vote on reviews')
      return
    }

    setLoading(true)

    try {
      // If same vote, remove it (toggle off)
      if (userVote === voteType) {
        await removeVote()
        return
      }

      // If different vote, update it
      if (userVote) {
        await updateVote(voteType)
        return
      }

      // If no vote, create new
      await createVote(voteType)
    } finally {
      setLoading(false)
    }
  }

  const createVote = async (voteType: 'helpful' | 'not_helpful') => {
    const { error } = await supabase
      .from('review_votes')
      .insert({
        user_id: userId,
        review_id: reviewId,
        review_type: reviewType,
        vote_type: voteType,
      })

    if (!error) {
      // Update counts
      if (voteType === 'helpful') {
        setHelpful(helpful + 1)
        updateReviewCount('helpful', 1)
      } else {
        setNotHelpful(notHelpful + 1)
        updateReviewCount('not_helpful', 1)
      }
      setUserVote(voteType)
    }
  }

  const updateVote = async (newVoteType: 'helpful' | 'not_helpful') => {
    const { error } = await supabase
      .from('review_votes')
      .update({ vote_type: newVoteType })
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .eq('review_type', reviewType)

    if (!error) {
      // Decrease old vote count, increase new vote count
      if (userVote === 'helpful') {
        setHelpful(helpful - 1)
        setNotHelpful(notHelpful + 1)
        updateReviewCount('helpful', -1)
        updateReviewCount('not_helpful', 1)
      } else {
        setNotHelpful(notHelpful - 1)
        setHelpful(helpful + 1)
        updateReviewCount('not_helpful', -1)
        updateReviewCount('helpful', 1)
      }
      setUserVote(newVoteType)
    }
  }

  const removeVote = async () => {
    const { error } = await supabase
      .from('review_votes')
      .delete()
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .eq('review_type', reviewType)

    if (!error) {
      // Decrease count
      if (userVote === 'helpful') {
        setHelpful(helpful - 1)
        updateReviewCount('helpful', -1)
      } else {
        setNotHelpful(notHelpful - 1)
        updateReviewCount('not_helpful', -1)
      }
      setUserVote(null)
    }
  }

  const updateReviewCount = async (field: 'helpful' | 'not_helpful', delta: number) => {
    const table = reviewType === 'neighborhood' ? 'neighborhood_reviews' : 'building_reviews'
    const column = field === 'helpful' ? 'helpful_count' : 'not_helpful_count'

    await supabase
      .from(table)
      .update({ 
        [column]: field === 'helpful' ? helpful + delta : notHelpful + delta,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-xs text-gray-500 font-medium">Was this helpful?</div>
      
      <button
        onClick={() => handleVote('helpful')}
        disabled={loading}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold ${
          userVote === 'helpful'
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
        } disabled:opacity-50`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>{helpful}</span>
      </button>

      <button
        onClick={() => handleVote('not_helpful')}
        disabled={loading}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold ${
          userVote === 'not_helpful'
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
        } disabled:opacity-50`}
      >
        <ThumbsDown className="w-4 h-4" />
        <span>{notHelpful}</span>
      </button>
    </div>
  )
}


