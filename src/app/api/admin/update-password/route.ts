import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  console.log('🔍 [DEBUG] API update-password appelée')
  
  try {
    // Get request body
    const { userId, newPassword } = await request.json()
    console.log('🔍 [DEBUG] Données reçues:', { userId: userId?.substring(0, 8) + '...', hasPassword: !!newPassword })

    // Validate input
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'userId et newPassword sont requis' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Get the Authorization header (MÊME LOGIQUE QUE get-users)
    const authHeader = request.headers.get('authorization')
    console.log('🔍 [DEBUG] Auth header présent:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [DEBUG] Pas de token Bearer dans les headers')
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
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
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    console.log('✅ [DEBUG] Utilisateur authentifié:', user.email)

    // Check if current user is admin (MÊME LOGIQUE QUE get-users)
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
          { error: 'Droits administrateur requis' },
          { status: 403 }
        )
      }
    }

    console.log('✅ [DEBUG] Droits admin confirmés')

    // Check if admin is changing their own password
    const isChangingOwnPassword = user.id === userId
    console.log('🔍 [DEBUG] Changement propre mot de passe:', isChangingOwnPassword)

    // Update user password using admin client
    console.log('🔍 [DEBUG] Mise à jour mot de passe...')
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error('❌ [DEBUG] Erreur mise à jour mot de passe:', error)
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour: ${error.message}` },
        { status: 500 }
      )
    }

    // Log successful update
    console.log(`✅ [DEBUG] Mot de passe mis à jour pour user: ${userId} par admin: ${user.email}`)
    
    const responseData = {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
      updatedUser: {
        id: data.user.id,
        email: data.user.email
      },
      isOwnPassword: isChangingOwnPassword
    }

    if (isChangingOwnPassword) {
      console.log('🔒 [DEBUG] Admin a changé son propre mot de passe')
      responseData.message = 'Mot de passe mis à jour. Votre session va être invalidée.'
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ [DEBUG] Erreur serveur update-password:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    
    return NextResponse.json(
      { error: 'Erreur serveur interne', debug: { message: errorMessage } },
      { status: 500 }
    )
  }
} 