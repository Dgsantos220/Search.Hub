import { Moon, Sun } from "lucide-react"
import { Button } from "@/Components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ModeToggle() {
    const [theme, setTheme] = useState("dark")

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            setTheme(savedTheme)
            applyTheme(savedTheme)
        } else {
            // Default to dark if nothing saved, or system?
            // Project seems to prefer dark default.
            setTheme("dark")
            applyTheme("dark")
        }
    }, [])

    const applyTheme = (t) => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        if (t === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            root.classList.add(systemTheme)
        } else {
            root.classList.add(t)
        }
    }

    const setAndSaveTheme = (t) => {
        setTheme(t)
        applyTheme(t)
        localStorage.setItem("theme", t)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 border border-border bg-background/50 backdrop-blur-sm hover:bg-muted/50">
                    {/* Sun icon shows when Light (rotate-0 scale-100) and hides when Dark (rotate-90 scale-0) */}
                    {/* BUT logic: If class is dark, sun should be hidden. */}
                    {/* In Tailwind dark mode: 'dark:...' applies when .dark class is present on html. */}

                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAndSaveTheme("light")}>
                    Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAndSaveTheme("dark")}>
                    Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAndSaveTheme("system")}>
                    Sistema
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
