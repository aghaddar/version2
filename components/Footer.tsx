import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <Link href="/" className="flex items-center justify-center">
              <Image src="/animeplus-logo.png" alt="ANIMEPLUS" width={140} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6">
            <Link href="/feedback" className="text-gray-400 hover:text-white text-sm">
              Feedback
            </Link>
            <Link href="/help" className="text-gray-400 hover:text-white text-sm">
              Help
            </Link>
            <Link href="/faq" className="text-gray-400 hover:text-white text-sm">
              FAQ
            </Link>
          </div>

          <div className="flex space-x-4 mb-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
          </div>

          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} AnimePlus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
