import { redirect } from 'next/navigation'

const page = () => {
  // Redirección inmediata del lado del servidor
  redirect('/maintenance/mainView')
}

export default page