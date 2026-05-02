'use server'
import { revalidatePath } from 'next/cache'
import { patchQueueItem } from '@/lib/api'

export async function updateQueueStatus(id: string, status: string, notes?: string) {
  await patchQueueItem(id, status, notes)
  revalidatePath('/')
  revalidatePath(`/review/${id}`)
}
