'use client'

import {
  LayoutDashboard,
  Settings,
  Users,
  UserCircle,
  Menu,
  Home,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  {
    name: '대시보드',
    description: '시스템 전체 현황을 확인하세요',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: '캐릭터 관리',
    description: '캐릭터별 초기 스탯 및 시스템 프롬프트 설정',
    href: '/admin/characters',
    icon: UserCircle,
  },
  {
    name: '회원 관리',
    description: '회원 정보 조회 및 역할 관리',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: '변경 내역',
    description: '앱 업데이트 내역 관리',
    href: '/admin/changelog',
    icon: FileText,
  },
  {
    name: '시스템 설정',
    description: 'AI 모델 및 감정 보너스 계수 설정',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const currentNavigation = useMemo(() => {
    // 정확한 경로 매칭을 위해 대시보드는 정확히 일치할 때만
    if (pathname === '/admin') {
      return '대시보드'
    }
    // 나머지는 경로 시작 부분으로 매칭 (긴 경로부터 확인)
    const sortedNavigation = [...navigation]
      .filter((item) => item.href !== '/admin')
      .sort((a, b) => b.href.length - a.href.length)
    const matchedItem = sortedNavigation.find((item) =>
      pathname.startsWith(item.href),
    )
    return matchedItem ? matchedItem.name : '대시보드'
  }, [pathname])

  const handleNavigate = () => {
    setIsMobileNavOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* 데스크톱 사이드바 */}
      <div
        className={`bg-card sticky top-0 hidden h-screen flex-col border-r transition-all duration-300 md:flex ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* 로고/제목 */}
        <div
          className={`flex items-center justify-between border-b ${
            isSidebarOpen ? 'h-20 px-6' : 'h-16 px-4'
          }`}
        >
          <div className={isSidebarOpen ? 'block' : 'hidden'}>
            <h1 className="text-lg font-bold">Unique Talk</h1>
            <p className="text-muted-foreground text-xs">관리자 시스템</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-muted-foreground hover:bg-muted"
            aria-label="사이드바 토글"
          >
            <Menu className="size-5" />
          </Button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`h-10 w-full gap-3 ${
                        isSidebarOpen ? 'justify-start' : 'justify-center'
                      } ${
                        isActive
                          ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                      title={!isSidebarOpen ? item.name : undefined}
                    >
                      <Icon className="size-5" />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 하단 버튼 */}
        <div className="border-t p-4">
          <Link href="/">
            <Button
              variant="ghost"
              className={`text-muted-foreground hover:bg-muted h-10 w-full gap-3 ${
                isSidebarOpen ? 'justify-start' : 'justify-center'
              }`}
              title={!isSidebarOpen ? '메인으로' : undefined}
            >
              <Home className="size-5" />
              {isSidebarOpen && '메인으로'}
            </Button>
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 헤더 */}
        <header
          className={`bg-card border-b px-4 py-3 ${
            isSidebarOpen ? 'md:h-20 md:px-6' : 'md:h-16 md:px-4'
          }`}
        >
          <div className="flex h-full items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="메뉴 열기"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-card text-card-foreground w-full max-w-screen p-0"
                >
                  <div className="flex h-full flex-col">
                    <SheetHeader className="border-b p-6 text-left">
                      <h1 className="text-lg font-bold">Unique Talk</h1>
                      <SheetTitle className="text-muted-foreground text-xs">
                        관리자 시스템
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex-1 overflow-y-auto p-4">
                      <ul className="space-y-2">
                        {navigation.map((item) => {
                          const isActive =
                            item.href === '/admin'
                              ? pathname === '/admin'
                              : pathname.startsWith(item.href)
                          const Icon = item.icon

                          return (
                            <li key={`${item.name}-mobile`}>
                              <Link
                                href={item.href}
                                onClick={() => {
                                  handleNavigate()
                                }}
                              >
                                <Button
                                  variant={isActive ? 'default' : 'ghost'}
                                  className={`h-10 w-full justify-start gap-3 ${
                                    isActive
                                      ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                                      : 'text-muted-foreground hover:bg-muted/80'
                                  }`}
                                >
                                  <Icon className="size-5" />
                                  <span>{item.name}</span>
                                </Button>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </nav>
                    <div className="border-t p-4">
                      <Link href="/" onClick={handleNavigate}>
                        <Button
                          variant="ghost"
                          className="text-muted-foreground hover:bg-muted h-10 w-full justify-start gap-3"
                        >
                          <Home className="size-5" />
                          <span>메인으로</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <h2 className="text-lg font-semibold md:text-xl">
                {currentNavigation}
              </h2>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
