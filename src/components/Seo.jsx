import { useEffect } from 'react'

export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = title

    const setMeta = (name, content, property = false) => {
      if (!content) return
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (property) {
          el.setAttribute('property', name)
        } else {
          el.setAttribute('name', name)
        }
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    if (description) setMeta('description', description)
    if (title) setMeta('og:title', title, true)
    if (description) setMeta('og:description', description, true)
  }, [title, description])

  return null
}
