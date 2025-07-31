import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  console.log('🔍 [DEBUG] API get-users appelée')
  
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔍 [DEBUG] Auth header présent:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [DEBUG] Pas de token Bearer dans les headers')
      return NextResponse.json(
        { 
          error: 'Token d\'authentification manquant',
          debug: { hasAuthHeader: !!authHeader }
        },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔍 [DEBUG] Token extrait:', token.substring(0, 20) + '...')

    // Verify the token using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    console.log('🔍 [DEBUG] Vérification token:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      error: authError?.message 
    })
    
    if (authError || !user) {
      console.log('❌ [DEBUG] Token invalide ou utilisateur non trouvé')
      return NextResponse.json(
        { 
          error: 'Token invalide',
          debug: { authError: authError?.message, hasUser: !!user }
        },
        { status: 401 }
      )
    }

    console.log('✅ [DEBUG] Utilisateur authentifié:', user.email)

    // Check if current user is admin
    console.log('🔍 [DEBUG] Vérification du rôle admin...')
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    console.log('🔍 [DEBUG] Résultat rôle:', { roleData, roleError: roleError?.message })

    if (roleError || roleData?.role !== 'admin') {
      console.log('⚠️ [DEBUG] Pas de rôle admin, vérification email fallback')
      
      // Fallback: check by email if role check fails
      const isAchref = user.email === 'achrefhorri@achrefhorri.local' || 
                       user.email?.includes('achrefhorri')
      
      console.log('🔍 [DEBUG] Vérification email Achref:', { email: user.email, isAchref })
      
      if (!isAchref) {
        console.log('❌ [DEBUG] Pas les droits admin')
        return NextResponse.json(
          { 
            error: 'Droits administrateur requis',
            debug: { 
              email: user.email, 
              roleData, 
              roleError: roleError?.message,
              isAchref 
            }
          },
          { status: 403 }
        )
      }
    }

    console.log('✅ [DEBUG] Droits admin confirmés')

    // Get profiles data
    console.log('🔍 [DEBUG] Récupération des profiles...')
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, created_at')
      .order('created_at', { ascending: false })

    console.log('🔍 [DEBUG] Profiles:', { count: profilesData?.length, error: profilesError?.message })

    if (profilesError) {
      return NextResponse.json(
        { error: `Erreur profiles: ${profilesError.message}` },
        { status: 500 }
      )
    }

    // Get auth users data using admin client
    console.log('🔍 [DEBUG] Récupération des auth users...')
    const { data: authData, error: authDataError } = await supabaseAdmin.auth.admin.listUsers()

    console.log('🔍 [DEBUG] Auth users:', { count: authData?.users?.length, error: authDataError?.message })

    if (authDataError) {
      return NextResponse.json(
        { error: `Erreur auth: ${authDataError.message}` },
        { status: 500 }
      )
    }

    // Combine the data
    const combinedUsers = profilesData?.map(profile => {
      const authUser = authData.users.find(u => u.id === profile.id)
      return {
        id: profile.id,
        username: profile.username,
        email: authUser?.email || 'Email non trouvé',
        created_at: profile.created_at,
        auth_created_at: authUser?.created_at,
        email_confirmed: authUser?.email_confirmed_at ? true : false
      }
    }) || []

    console.log('✅ [DEBUG] Utilisateurs combinés:', combinedUsers.length)

    return NextResponse.json({
      success: true,
      users: combinedUsers,
      total: combinedUsers.length,
      debug: {
        currentUser: user.email,
        profilesCount: profilesData?.length,
        authUsersCount: authData?.users?.length
      }
    })

  } catch (error) {
    console.error('❌ [DEBUG] Erreur serveur get-users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur interne',
        debug: { message: errorMessage, stack: errorStack }
      },
      { status: 500 }
    )
  }
}