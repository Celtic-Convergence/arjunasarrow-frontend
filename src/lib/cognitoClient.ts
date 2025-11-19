import { Amplify, type ResourcesConfig } from 'aws-amplify'
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updatePassword as amplifyUpdatePassword,
  type SignInInput,
  type SignUpInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  type UpdatePasswordInput,
  type AuthUser,
  fetchAuthSession
} from 'aws-amplify/auth'

// Get environment variables
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID

// Only log errors in development mode
const isDev = process.env.NODE_ENV === 'development'

// Check if required environment variables are set
if (!userPoolId) {
  if (isDev) console.error('Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID environment variable')
}

if (!userPoolClientId) {
  if (isDev) console.error('Missing NEXT_PUBLIC_COGNITO_CLIENT_ID environment variable')
}

// Configure Amplify with Cognito settings
const cognitoConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: userPoolId || '',
      userPoolClientId: userPoolClientId || ''
    }
  }
}

// Initialize Amplify configuration
if (typeof window !== 'undefined') {
  // Only configure on client side
  try {
    Amplify.configure(cognitoConfig)
    // Amplify configured successfully
  } catch (error) {
    if (isDev) console.error('Error configuring Amplify:', error)
  }
}

// Types for our auth responses to match the existing interface
export interface AuthResponse {
  data?: {
    user?: AuthUser | null
    session?: unknown
  }
  error?: Error | null
}

export interface User {
  id: string
  email?: string
  username?: string
  attributes?: Record<string, unknown>
  groups?: string[]
}

// Auth functions that mirror the Supabase interface
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const signInInput: SignInInput = {
      username: email,
      password: password,
    }
    
    const result = await amplifySignIn(signInInput)
    
    let user: AuthUser | null = null
    if (result.nextStep?.signInStep === 'DONE') {
      user = await amplifyGetCurrentUser()
    }
    
    return {
      data: {
        user,
        session: result
      },
      error: null
    }
  } catch (error) {
    if (isDev) console.error('Sign in error:', error)
    return {
      data: { user: null },
      error: error instanceof Error ? error : new Error('Sign in failed')
    }
  }
}

export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    await amplifySignOut()
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Sign out failed')
    }
  }
}

export const signUp = async (email: string, password: string, attributes?: Record<string, string>): Promise<AuthResponse> => {
  try {
    const signUpInput: SignUpInput = {
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email,
          ...attributes
        }
      }
    }
    
    const result = await amplifySignUp(signUpInput)
    
    return {
      data: {
        user: result.userId ? { userId: result.userId } as AuthUser : null,
        session: result
      },
      error: null
    }
  } catch (error) {
    return {
      data: { user: null },
      error: error instanceof Error ? error : new Error('Sign up failed')
    }
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First check if user is authenticated
    const session = await fetchAuthSession()
    if (!session.tokens) {
      // No tokens means user is not authenticated
      return null
    }
    
    const user = await amplifyGetCurrentUser()
    
    // Get user attributes from the ID token
    const idToken = session.tokens?.idToken
    const payload = idToken?.payload || {}
    
    // Extract groups from the cognito:groups claim in the token
    const groups = (payload['cognito:groups'] as string[]) || []
    
    return {
      id: user.userId,
      email: user.signInDetails?.loginId || (payload.email as string),
      username: user.username,
      groups: groups,
      attributes: {
        given_name: payload.given_name as string,
        family_name: payload.family_name as string,
        email: payload.email as string,
        ...payload
      }
    }
  } catch (error) {
    // Check if it's specifically an authentication error
    if (error instanceof Error) {
      const errorMessage = error.message || error.toString()
      if (errorMessage.includes('UserUnAuthenticatedException') || 
          errorMessage.includes('User needs to be authenticated') ||
          errorMessage.includes('No current user')) {
        // This is expected when user is not logged in
        return null
      }
    }
    
    if (isDev) console.error('Error getting current user:', error)
    return null
  }
}

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const resetInput: ResetPasswordInput = {
      username: email
    }
    
    await amplifyResetPassword(resetInput)
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Reset password failed')
    }
  }
}

export const updatePassword = async (
  oldPassword: string, 
  newPassword: string
): Promise<{ 
  error: Error | null, 
  success: boolean 
}> => {
  try {
    const updateInput: UpdatePasswordInput = {
      oldPassword,
      newPassword
    }
    
    await amplifyUpdatePassword(updateInput)
    return { 
      error: null, 
      success: true 
    }
  } catch (error) {
    return { 
      error: error instanceof Error ? error : new Error('An unknown error occurred'), 
      success: false 
    }
  }
}

export const confirmResetPassword = async (
  username: string, 
  confirmationCode: string, 
  newPassword: string
): Promise<{ error: Error | null }> => {
  try {
    const confirmInput: ConfirmResetPasswordInput = {
      username,
      confirmationCode,
      newPassword
    }
    
    await amplifyConfirmResetPassword(confirmInput)
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Confirm reset password failed')
    }
  }
}

export const getSession = async (): Promise<{
  data: { session: unknown },
  error: Error | null
}> => {
  try {
    const session = await fetchAuthSession()
    return {
      data: { session },
      error: null
    }
  } catch (error) {
    return {
      data: { session: null },
      error: error instanceof Error ? error : new Error('Failed to get session')
    }
  }
}

// Initialize Cognito configuration function for server-side
export const configureCognito = (): void => {
  if (typeof window === 'undefined') {
    // Server-side configuration
    Amplify.configure(cognitoConfig)
  }
} 