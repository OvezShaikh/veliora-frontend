import { createContext, useContext } from 'react'
// Empty means "same address as the website" (the API lives at /api on the same Vercel project).
// Set VITE_API_URL only if you host the API somewhere else.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)
