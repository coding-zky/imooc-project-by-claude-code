import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-layout-margin py-lg">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}

export const SettingsLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden max-w-[1280px] w-full mx-auto">
        <aside className="hidden md:flex w-64 shrink-0" />
        <main className="flex-1 overflow-y-auto p-layout-margin lg:p-xl">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}