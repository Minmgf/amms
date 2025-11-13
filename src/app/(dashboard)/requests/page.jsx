import { redirect } from 'next/navigation'

const page = () => {
  // Redirección inmediata del lado del servidor
  redirect('/requests/clients')
}

export default page