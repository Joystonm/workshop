import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

// Generate a simple anonymous user ID based on session
function getOrCreateUserId(): string {
  let userId = sessionStorage.getItem('workshop_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('workshop_user_id', userId)
  }
  return userId
}

export function useConvexUser() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [initComplete, setInitComplete] = useState(false)

  const createUser = useMutation(api.workshop.createUser)
  const user = useQuery(api.workshop.getUserBySession, { sessionId: userId || '' })

  useEffect(() => {
    const id = getOrCreateUserId()
    setUserId(id)
    setInitComplete(true)
  }, [])

  useEffect(() => {
    if (userId && !user && !isCreating) {
      setIsCreating(true)
      createUser({ sessionId: userId })
        .then(() => {
          setIsCreating(false)
        })
        .catch(() => {
          setIsCreating(false)
        })
    }
  }, [userId, user, isCreating, createUser])

  return {
    user: user || (userId ? { _id: userId as any, sessionId: userId } : null),
    loading: !initComplete || isCreating,
  }
}
