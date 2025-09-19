import { redirect } from 'next/navigation'

const page = () => {
  // Redirección inmediata del lado del servidor
  redirect('/userManagement/mainView')
}

export default page