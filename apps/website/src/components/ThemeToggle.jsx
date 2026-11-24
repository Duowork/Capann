import { useEffect, useState } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'

// Dark is the default; a visitor's choice is remembered in this browser. The
// inline script in index.html applies a saved choice before the first paint,
// so a light-mode visitor never sees a dark flash. Keep its key and colours in
// step with these.
export const THEME_KEY = 'capann-theme'
const THEME_COLOR = { dark: '#141417', light: '#F6F5F2' }

function readTheme() {
  return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') root.dataset.theme = 'light'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}

/** The sun/moon button in the nav: a sun while dark (switch to light), a moon while light. */
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(readTheme)

  // Another tab changed it: follow along.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== THEME_KEY) return
      const next = event.newValue === 'light' ? 'light' : 'dark'
      applyTheme(next)
      setTheme(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const next = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon

  function toggle() {
    applyTheme(next)
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      /* storage can be unavailable (private modes); the switch still works for this page */
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`inline-flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full bg-transparent text-muted transition-colors hover:bg-fg/[0.08] hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      <Icon size={20} weight="fill" aria-hidden="true" />
    </button>
  )
}
