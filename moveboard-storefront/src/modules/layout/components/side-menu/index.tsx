"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const SideMenuItems = [
  {
    name: "Home",
    href: "/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    name: "Shop",
    href: "/store",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    name: "Account",
    href: "/account",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    name: "Cart",
    href: "/cart",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center gap-2 transition-all ease-out duration-200 focus:outline-none text-gray-400 hover:text-[#c4956a]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <span className="text-sm font-medium">Menu</span>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 -translate-x-full"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-full"
              >
                <PopoverPanel className="flex flex-col fixed w-[320px] sm:w-[360px] h-screen z-[51] inset-y-0 left-0">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[#0f0f0f] border-r border-white/[0.06] justify-between"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold tracking-tight">
                            <span className="text-white">MOVE</span>
                            <span className="text-[#c4956a]">BOARD</span>
                          </span>
                          <span className="text-[10px] text-gray-500">™</span>
                        </div>
                        <button
                          data-testid="close-menu-button"
                          onClick={close}
                          className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#c4956a]/30 transition-all duration-200"
                        >
                          <XMark className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Navigation links */}
                      <nav className="p-4">
                        <ul className="space-y-1">
                          {SideMenuItems.map((item) => (
                            <li key={item.name}>
                              <LocalizedClientLink
                                href={item.href}
                                className="group flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-300 hover:text-white hover:bg-[#c4956a]/[0.08] transition-all duration-200"
                                onClick={close}
                                data-testid={`${item.name.toLowerCase()}-link`}
                              >
                                <span className="text-gray-500 group-hover:text-[#c4956a] transition-colors duration-200">
                                  {item.icon}
                                </span>
                                <span className="text-base font-medium">{item.name}</span>
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      </nav>

                      {/* Divider + Quick links */}
                      <div className="px-6 pt-2">
                        <div className="h-px bg-white/[0.06] mb-4" />
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.15em] mb-3 px-4">
                          Quick Links
                        </p>
                        <ul className="space-y-0.5">
                          <li>
                            <a
                              href="#story"
                              onClick={close}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:text-[#c4956a] text-sm transition-colors duration-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c4956a]/40" />
                              Our Story
                            </a>
                          </li>
                          <li>
                            <a
                              href="mailto:hello@moveboard.in"
                              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:text-[#c4956a] text-sm transition-colors duration-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c4956a]/40" />
                              Contact Us
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://instagram.com/moveboard.in"
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:text-[#c4956a] text-sm transition-colors duration-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c4956a]/40" />
                              Instagram
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Bottom section */}
                    <div className="p-6 border-t border-white/[0.06]">
                      <div className="flex flex-col gap-y-4">
                        {!!locales?.length && (
                          <div
                            className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:border-[#c4956a]/20 transition-all duration-200 cursor-pointer"
                            onMouseEnter={languageToggleState.open}
                            onMouseLeave={languageToggleState.close}
                          >
                            <LanguageSelect
                              toggleState={languageToggleState}
                              locales={locales}
                              currentLocale={currentLocale}
                            />
                            <ArrowRightMini
                              className={clx(
                                "transition-transform duration-150",
                                languageToggleState.state ? "-rotate-90" : ""
                              )}
                            />
                          </div>
                        )}
                        <div
                          className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:border-[#c4956a]/20 transition-all duration-200 cursor-pointer"
                          onMouseEnter={countryToggleState.open}
                          onMouseLeave={countryToggleState.close}
                        >
                          {regions && (
                            <CountrySelect
                              toggleState={countryToggleState}
                              regions={regions}
                            />
                          )}
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              countryToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                        <Text className="text-gray-600 text-xs text-center mt-2">
                          © {new Date().getFullYear()} Moveboard India. All rights reserved.
                        </Text>
                      </div>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
