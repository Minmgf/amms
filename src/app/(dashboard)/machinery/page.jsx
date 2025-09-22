import { redirect } from 'next/navigation'

const page = () => {
  // Redirección inmediata del lado del servidor
  redirect('/machinery/mainView')
}

export default page