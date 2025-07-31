import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // 1. Get user by username
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.trim())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // 2. Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // 3. Return success (without sensitive data)
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}