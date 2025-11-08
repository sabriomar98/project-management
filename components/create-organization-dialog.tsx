"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"

type Props = { children: React.ReactNode }

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

export function CreateOrganizationDialog({ children }: Props) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")

  // Auto-generate slug from name (unless user edits slug manually)
  const [touchedSlug, setTouchedSlug] = React.useState(false)
  React.useEffect(() => {
    if (!touchedSlug) setSlug(slugify(name))
  }, [name, touchedSlug])

  const slugValid = /^[a-z0-9-]+$/.test(slug) && slug.length >= 3

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!slugValid) {
      setError("Slug must be at least 3 chars, lowercase letters, numbers, and hyphens only.")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to create organization")
        return
      }
      setOpen(false)
      setName("")
      setSlug("")
      setDescription("")
      setTouchedSlug(false)
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new workspace to group projects and members.
            </DialogDescription>
          </DialogHeader>

          {/* Preview / badge */}
          <Card className="mt-3 border bg-linear-to-r from-primary/10 to-transparent p-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                <span className="font-semibold">{name || "Organization name"}</span>
              </span>
              <span className="text-muted-foreground">@{slug || "your-slug"}</span>
            </div>
          </Card>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corporation"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug</Label>
                <span className={cnSlugHint(slugValid)}>lowercase, numbers, hyphens</span>
              </div>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setTouchedSlug(true) }}
                placeholder="acme-corp"
                required
                disabled={isLoading}
              />
              {!slugValid && touchedSlug && (
                <p className="text-xs text-destructive">Invalid slug format.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of your organization"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || !slugValid}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function cnSlugHint(valid: boolean) {
  return valid
    ? "text-[11px] text-muted-foreground"
    : "text-[11px] text-amber-600 dark:text-amber-300"
}
