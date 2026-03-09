"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  inbox: "Inbox",
  products: "Products",
  ideas: "Ideas",
  features: "Features",
  settings: "Settings",
  discover: "Discovery",
  new: "New",
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.length - 1
    const label = routeLabels[segment] || segment

    return { href, label, isLast, key: href }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
