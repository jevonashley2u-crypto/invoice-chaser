'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    throw new Error('Not authenticated')
  }

  // Get the business_id for this user
  // In a real app, this should handle multiple businesses
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('business_id')
    .eq('user_id', userData.user.id)
    .single()

  if (!userRole) {
    throw new Error('No business found for user')
  }

  const newClient = {
    business_id: userRole.business_id,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string,
  }

  const { error } = await supabase.from('clients').insert(newClient)

  if (error) {
    console.error('Error creating client:', error)
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/clients')
  return { success: true }
}
