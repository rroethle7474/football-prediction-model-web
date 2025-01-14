import Link from 'next/link'
import { Home } from 'lucide-react'
import './globals.css'  // Don't forget to import your global styles!
import { RouteChangeLoading } from '@/components/route-change-loading'

export const metadata = {
  title: 'NFL Stats Predictor',
  description: 'Predict future NFL game statistics with advanced machine learning models',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      <RouteChangeLoading />
        <div className="flex flex-col min-h-screen">
          <header className="bg-blue-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold flex items-center">
                <Home className="mr-2" />
                NFL Predictor
              </Link>
              <nav>
                <ul className="flex space-x-4">
                  <li><Link href="/predict" className="hover:text-blue-300">Predict</Link></li>
                  <li><Link href="/build-model" className="hover:text-blue-300">Build Model</Link></li>
                  <li><Link href="/train-model" className="hover:text-blue-300">Train Model</Link></li>
                </ul>
              </nav>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-blue-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <p>&copy; 2024 NFL Stats Predictor. All rights reserved.</p>
              </div>
              <div>
                <ul className="flex space-x-4">
                  <li>
                    <a 
                      href="https://www.rotowire.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-blue-300"
                    >
                      Rotowire
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.prizepicks.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-blue-300"
                    >
                      PrizePicks
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://underdogfantasy.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-blue-300"
                    >
                      Underdog
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}