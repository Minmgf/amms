import { redirect } from 'next/navigation'

const page = () => {
  // Redirección inmediata del lado del servidor
  redirect('/maintenance/scheduledMaintenance')
}

export default page