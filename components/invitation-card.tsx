'use client'

import { useRef } from 'react'
import { domToPng } from 'modern-screenshot'

export default function InvitationCard() {
  const cardRef = useRef<HTMLDivElement>(null)

  const brands = [
    { name: 'Cadbury', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AyYdn3qQISDbAUZ6HoA0uBnELPGXm2.png' },
    { name: 'Nestlé', logo: '/nestle-logo.jpg' },
    { name: 'Fortune', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IcLMz7zPwTCErIYPwBqXww3zgdaJPk.png' },
    { name: 'Johnson\'s', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KJyNmfIHepKEcNuqQQZw2HuG3rbwG9.png' },
    { name: 'Dabur', logo: '/dabur-logo.jpg' },
    { name: 'Marico', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IIiet8sZ4nMeOxnTr5dUToitUgoZf0.png' },
    { name: 'Mamy Poko', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WnpH08pCkoAeth3Qxpt7PgdJT9qi1f.png' },
    { name: 'Hindustan Unilever Ltd.', logo: 'https://animationvisarts.com/wp-content/uploads/2022/01/Unilever-Logo.jpg' }
  ]

  const handleDownload = async () => {
    if (!cardRef.current) return

    try {
      // Show loading state
      const button = document.querySelector('button')
      if (button) {
        button.textContent = 'Generating Image...'
        button.disabled = true
      }

      // Wait a bit for any images to load
      await new Promise(resolve => setTimeout(resolve, 500))

      // Use modern-screenshot which supports modern CSS including oklch
      const dataUrl = await domToPng(cardRef.current, {
        scale: 2,
        backgroundColor: '#fffbf0',
        quality: 1
      })

      // Download the image
      const link = document.createElement('a')
      link.download = 'MG-Supermart-Invitation.png'
      link.href = dataUrl
      link.click()

      // Reset button
      if (button) {
        button.textContent = '📥 Download Invitation Card'
        button.disabled = false
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to download image. Error: ' + (error as Error).message)

      // Reset button
      const button = document.querySelector('button')
      if (button) {
        button.textContent = '📥 Download Invitation Card'
        button.disabled = false
      }
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">

      <div ref={cardRef} className="w-full max-w-3xl mx-auto">
        <div className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 min-h-screen md:min-h-auto rounded-3xl shadow-2xl overflow-hidden border-4 border-red-700">

          {/* Decorative borders */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 w-full h-2 bg-gradient-to-r from-red-700 via-yellow-500 to-red-700"></div>
            <div className="absolute left-0 bottom-0 w-full h-2 bg-gradient-to-r from-red-700 via-yellow-500 to-red-700"></div>
            <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-red-700 via-yellow-500 to-red-700"></div>
            <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-red-700 via-yellow-500 to-red-700"></div>
          </div>

          {/* Corner decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top left corner */}
            <div className="absolute top-4 left-4 text-6xl text-red-700 opacity-20">🌺</div>
            {/* Top right corner */}
            <div className="absolute top-4 right-4 text-6xl text-amber-600 opacity-20">🌺</div>
            {/* Bottom left corner */}
            <div className="absolute bottom-4 left-4 text-6xl text-amber-600 opacity-20">🌺</div>
            {/* Bottom right corner */}
            <div className="absolute bottom-4 right-4 text-6xl text-red-700 opacity-20">🌺</div>
          </div>

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-20 left-10 text-4xl text-red-700">✦</div>
            <div className="absolute top-40 right-12 text-4xl text-amber-600">✦</div>
            <div className="absolute bottom-40 left-8 text-4xl text-amber-600">✦</div>
            <div className="absolute bottom-20 right-10 text-4xl text-red-700">✦</div>
            <div className="absolute top-1/3 left-6 text-3xl text-red-700">❋</div>
            <div className="absolute top-2/3 right-6 text-3xl text-amber-600">❋</div>
          </div>

          {/* Content wrapper */}
          <div className="relative z-10">
            {/* Header Section with Ganesh */}
            <div className="text-center pt-8 px-6 pb-4">

              {/* Ganesh Image */}
              <div className="flex justify-center mb-4">
                <img
                  src="/images/design-mode/lord-ganesh-deity-symbol-auspicious.jpg"
                  alt="Lord Ganesh - Auspicious Symbol"
                  className="w-28 h-28 rounded-full shadow-lg border-4 border-amber-500"
                />
              </div>

              <p className="text-red-800 text-base font-serif italic mb-2">With immense joy</p>
              <p className="text-red-800 text-base font-serif italic mb-2">and gratitude, we cordially invite</p>
              <p className="text-red-800 text-base font-serif italic mb-6">you to the</p>
            </div>

            {/* Main Title Section */}
            <div className="text-center px-6 pb-6">
              {/* Decorative divider */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-2xl text-red-700">🪔</span>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-red-700 to-transparent"></div>
                <span className="text-2xl text-amber-600">✦</span>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
                <span className="text-2xl text-red-700">🪔</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-serif font-bold text-red-700 mb-1">
                GRAND OPENING
              </h1>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-red-700 mb-6">
                CEREMONY
              </h1>

              <p className="text-amber-700 text-2xl font-serif mb-2">of</p>

              <h2 className="text-6xl md:text-7xl font-serif font-bold text-amber-600 mb-1 drop-shadow-md">
                MG
              </h2>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-amber-600 mb-4 drop-shadow-md">
                SUPERMART
              </h2>

              <p className="text-red-600 text-lg font-serif tracking-wider mb-2">
                FRESH PRODUCE | DAILY ESSENTIALS | PREMIUM QUALITY | BEST PRICES
              </p>
              <p className="text-red-700 text-base font-serif tracking-wide mb-6">
                ताज़ा उत्पाद | दैनिक आवश्यकताएं | प्रीमियम गुणवत्ता | सर्वोत्तम मूल्य
              </p>

              <p className="text-gray-700 font-serif text-base italic mb-6">
                You presence will make this special day even more memorable.
              </p>
            </div>

            {/* Brands Section */}
            <div className="mx-6 my-6 p-6 bg-white rounded-2xl shadow-xl border-4 border-red-700 relative">
              {/* Decorative corner badges */}
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-amber-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-lg">✦</span>
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-700 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-amber-400 text-lg">✦</span>
              </div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-red-700 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-amber-400 text-lg">✦</span>
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-amber-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-white text-lg">✦</span>
              </div>

              {/* Title */}
              <div className="text-center mb-5">
                <div className="inline-block bg-gradient-to-r from-red-700 to-red-800 px-6 py-2 rounded-lg shadow-md">
                  <p className="text-amber-300 font-serif text-sm font-bold tracking-widest">
                    WHOLESALE AVAILABLE
                  </p>
                </div>
              </div>

              {/* Brand logos in clean grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {brands.map((brand) => (
                  <div key={brand.name} className="flex flex-col items-center justify-center p-2 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-20 border border-gray-200">
                    <img
                      src={brand.logo || "/placeholder.svg"}
                      alt={`${brand.name} logo`}
                      className="h-10 w-auto object-contain mb-1"
                    />
                    <p className="text-[9px] text-center text-gray-700 font-sans font-medium">{brand.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Section */}
            <div className="mx-6 my-6 relative">
              {/* Decorative ribbon banner */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-2 rounded-full shadow-xl border-3 border-amber-400 flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span className="text-amber-300 font-serif text-xs font-bold">SAVE THE DATE</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl shadow-xl border-4 border-red-700 p-6 pt-10">
                {/* Simple elegant date display */}
                <div className="flex items-center justify-center gap-3">
                  {/* Day */}
                  <div className="text-center">
                    <div className="bg-white rounded-xl shadow-lg p-3 border-2 border-red-600 min-w-[110px]">
                      <p className="text-red-800 font-serif text-lg font-bold">Wednesday</p>
                    </div>
                  </div>

                  {/* Decorative separator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>

                  {/* Date - Featured */}
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-2xl shadow-2xl p-5 border-4 border-amber-400 transform scale-110">
                      <p className="text-amber-300 font-serif text-5xl font-bold">19</p>
                    </div>
                  </div>

                  {/* Decorative separator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>

                  {/* Month & Year */}
                  <div className="text-center">
                    <div className="bg-white rounded-xl shadow-lg p-3 border-2 border-red-600 min-w-[90px]">
                      <p className="text-red-800 font-serif text-lg font-bold">NOV</p>
                      <p className="text-amber-600 font-serif text-lg font-bold">2025</p>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="mt-4 text-center">
                  <p className="text-red-700 font-serif text-xs italic">Mark your calendar for this special day</p>
                </div>
              </div>
            </div>

            {/* Continue with rest */}
            <div className="hidden">
              <span className="text-xl text-red-700">🎊</span>
              <span className="text-xl text-amber-600">✦</span>
              <span className="text-xl text-red-700">🎊</span>
            </div>
          </div>

          {/* Address and Contact */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Address Column */}
              <div className="text-center">
                <div className="mb-3 text-2xl">📍</div>
                <p className="text-red-800 font-serif text-lg mb-2">Pipra Main Road</p>
                <p className="text-red-800 font-serif text-base">Near Central Bank of India, East Champaran, Bihar</p>
              </div>

              {/* Contact Column */}
              <div className="text-center">
                <div className="mb-3 text-2xl">📞</div>
                <p className="text-amber-600 font-serif text-lg font-bold mb-2">Mob.: 8809979748</p>
                <p className="text-gray-600 font-serif text-sm">Call us for more details</p>
              </div>
            </div>
          </div>

          {/* Other Firm Info */}
          <div className="mx-6 mb-6">
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-amber-400 shadow-md">
              <div className="flex flex-col items-center justify-center gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏪</span>
                  <p className="text-red-700 font-serif text-sm font-bold">आप हमें </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-amber-800 font-serif text-lg font-bold mb-1">Asha Enterprises</p>
                <p className="text-gray-700 font-serif text-sm italic">Authorized Fortune Distributor, Pipra</p>
                <p className="text-red-700 font-serif text-sm font-bold">के नाम से भी जानते है</p>

              </div>
            </div>
          </div>

          {/* Decorative flourish */}
          <div className="text-center px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl text-red-700">🌸</span>
              <p className="text-amber-600 text-2xl">❧</p>
              <span className="text-xl text-red-700">🌸</span>
            </div>
          </div>

          {/* Invitation message */}
          <div className="text-center px-6 pb-8">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="text-xl">🎉</span>
              <span className="text-xl">🎊</span>
              <span className="text-xl">🎁</span>
            </div>
            <p className="text-gray-700 text-base font-serif italic leading-relaxed">
              Please join us for the<br />
              inaugural ceremony and puja<br />
              followed by light refreshments<br />
              & lots of exciting offers.
            </p>
          </div>
        </div>
      </div>
      {/* Download Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleDownload}
          className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-serif font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border-2 border-amber-400"
        >
          <span className="text-xl">📥</span>
          Download Invitation Card
        </button>
      </div>
    </div>
  )
}
