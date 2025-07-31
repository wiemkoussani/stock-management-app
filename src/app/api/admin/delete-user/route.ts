import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  console.log('🔍 [DEBUG] API delete-user appelée')
  
  try {
    // Get request body
    const { userId } = await request.json()
    console.log('🔍 [DEBUG] Données reçues:', { userId: userId?.substring(0, 8) + '...' })

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      )
    }

    // Get the Authorization header
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
          { error: 'Droits administrateur requis' },
          { status: 403 }
        )
      }
    }

    console.log('✅ [DEBUG] Droits admin confirmés')

    // Check if admin is trying to delete themselves
    const isDeletingSelf = user.id === userId
    console.log('🔍 [DEBUG] Suppression de son propre compte:', isDeletingSelf)

    if (isDeletingSelf) {
      console.log('❌ [DEBUG] Tentative de suppression de son propre compte')
      return NextResponse.json(
        { error: 'Un administrateur ne peut pas supprimer son propre compte' },
        { status: 403 }
      )
    }

    // Delete user profile first
    console.log('🔍 [DEBUG] Suppression du profile...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('⚠️ [DEBUG] Erreur suppression profile:', profileError)
      // Continue même si erreur profile (peut ne pas exister)
    }

    // Delete auth user
    console.log('🔍 [DEBUG] Suppression auth user...')
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('❌ [DEBUG] Erreur suppression auth:', authDeleteError)
      return NextResponse.json(
        { error: `Erreur lors de la suppression: ${authDeleteError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ [DEBUG] Utilisateur supprimé: ${userId} par admin: ${user.email}`)
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('❌ [DEBUG] Erreur serveur delete-user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    
    return NextResponse.json(
      { error: 'Erreur serveur interne', debug: { message: errorMessage } },
      { status: 500 }
    )
  }
} 