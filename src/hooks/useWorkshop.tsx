import { createContext, useContext, ReactNode } from 'react'

interface User {
  _id: string
  sessionId?: string
  name?: string
}

interface WorkshopContextValue {
  user: User | null
}

const WorkshopContext = createContext<WorkshopContextValue>({ user: null })

export function WorkshopProvider({
  children,
  user
}: {
  children: ReactNode
  user: User | null | undefined
}) {
  return (
    <WorkshopContext.Provider value={{ user: user ?? null }}>
      {children}
    </WorkshopContext.Provider>
  )
}

export function useWorkshop() {
  return useContext(WorkshopContext)
}
