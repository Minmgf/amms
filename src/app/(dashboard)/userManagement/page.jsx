import React from 'react'
import UserTable from '../../components/userManagement/UserTable'
import PermissionGuard from '@/app/(auth)/PermissionGuard'

const page = () => {
  return (
    <PermissionGuard permission="users.view">
    <div className='w-full h-full bg-surface p-4 parametrization-page'>
      <UserTable />
    </div>
    </PermissionGuard>
  )
}

export default page
