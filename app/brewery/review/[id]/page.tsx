import { redirect } from 'next/navigation'

export default function ReviewRedirect({ params }: { params: { id: string } }) {
  redirect(`/review/${params.id}`)
}
