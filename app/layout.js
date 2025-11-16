import '../components/index.css'
import '../components/App.css'

export const metadata = {
  title: 'Marketing Search Tool',
  description: 'Smart internal search tool for marketing documents',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
