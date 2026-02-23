import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-white/[0.06] w-full bg-[#0a0a0a]">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between py-20">
          {/* Brand column */}
          <div className="max-w-xs">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-1 mb-4"
            >
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">MOVE</span>
                <span className="text-[#c4956a]">BOARD</span>
              </span>
              <span className="text-[10px] text-gray-500 font-light">™</span>
            </LocalizedClientLink>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The active standing board that makes movement intuitive. Designed in India, crafted for the modern workspace.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/moveboard.in" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-[#c4956a] hover:border-[#c4956a]/30 transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="mailto:hello@moveboard.in" className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-[#c4956a] hover:border-[#c4956a]/30 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-white text-sm font-semibold mb-2">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-gray-500 txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-[#c4956a] transition-colors duration-200",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-[#c4956a] transition-colors duration-200"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-white text-sm font-semibold mb-2">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-gray-500 txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-[#c4956a] transition-colors duration-200"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="text-white text-sm font-semibold mb-2">Company</span>
              <ul className="grid grid-cols-1 gap-y-2 text-gray-500 txt-small">
                <li>
                  <a href="#story" className="hover:text-[#c4956a] transition-colors duration-200">Our Story</a>
                </li>
                <li>
                  <a href="mailto:hello@moveboard.in" className="hover:text-[#c4956a] transition-colors duration-200">Contact</a>
                </li>
                <li>
                  <LocalizedClientLink href="/store" className="hover:text-[#c4956a] transition-colors duration-200">
                    Shop
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-12 justify-between text-gray-600 border-t border-white/[0.06] pt-8">
          <Text className="txt-compact-small text-gray-600">
            © {new Date().getFullYear()} Moveboard India. All rights reserved.
          </Text>
          <Text className="txt-compact-small text-gray-600">
            Made with ♥ in India
          </Text>
        </div>
      </div>
    </footer>
  )
}
