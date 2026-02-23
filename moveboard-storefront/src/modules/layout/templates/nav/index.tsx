import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-[#0a0a0a]/80 backdrop-blur-xl border-white/[0.06]">
        <nav className="content-container txt-xsmall-plus flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">MOVE</span>
                <span className="text-[#c4956a]">BOARD</span>
              </span>
              <span className="text-[10px] text-gray-500 font-light tracking-wider hidden small:inline">™</span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="text-gray-400 hover:text-[#c4956a] transition-colors duration-200 text-sm"
                href="/store"
              >
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink
                className="text-gray-400 hover:text-[#c4956a] transition-colors duration-200 text-sm"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-gray-400 hover:text-[#c4956a] flex gap-2 transition-colors duration-200 text-sm"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
