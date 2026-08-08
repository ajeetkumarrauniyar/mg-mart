'use client'

import { useRef } from 'react'
import { domToPng } from 'modern-screenshot'

export default function InvitationCardA5() {
    const cardRef = useRef<HTMLDivElement>(null)

    const brands = [
        { name: 'Cadbury', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AyYdn3qQISDbAUZ6HoA0uBnELPGXm2.png' },
        { name: 'Nestlé', logo: '/nestle-logo.jpg' },
        { name: 'Fortune', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IcLMz7zPwTCErIYPwBqXww3zgdaJPk.png' },
        { name: 'Johnson\'s', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KJyNmfIHepKEcNuqQQZw2HuG3rbwG9.png' },
        { name: 'Dabur', logo: '/dabur-logo.jpg' },
        { name: 'Marico', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IIiet8sZ4nMeOxnTr5dUToitUgoZf0.png' },
        { name: 'Mamy Poko', logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WnpH08pCkoAeth3Qxpt7PgdJT9qi1f.png' }
    ]

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = async () => {
        if (!cardRef.current) return

        try {
            const dataUrl = await domToPng(cardRef.current, {
                scale: 3,
                backgroundColor: '#fffbf0',
                quality: 1,
                width: 559, // A5 width in pixels at 96 DPI (148mm)
                height: 794  // A5 height in pixels at 96 DPI (210mm)
            })

            const link = document.createElement('a')
            link.download = 'MG-Supermart-Invitation-A5.png'
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error('Error generating image:', error)
            alert('Failed to download image.')
        }
    }

    return (
        <>
            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          @page {
            size: A5;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-card {
            width: 148mm !important;
            height: 210mm !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

            <div className="w-full flex flex-col items-center gap-4 p-4 no-print">
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-serif font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border-2 border-amber-400"
                    >
                        <span className="text-xl">🖨️</span>
                        Print A5 Card
                    </button>
                    <button
                        onClick={handleDownload}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border-2 border-red-700"
                    >
                        <span className="text-xl">📥</span>
                        Download A5 Image
                    </button>
                </div>
                <p className="text-sm text-gray-600">A5 Size: 148mm × 210mm (5.83" × 8.27")</p>
            </div>

            <div className="flex justify-center p-4">
                <div
                    ref={cardRef}
                    className="print-card bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-2xl border-4 border-red-700 relative overflow-hidden"
                    style={{ width: '148mm', height: '210mm' }}
                >
                    {/* Decorative borders */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-red-700 via-yellow-500 to-red-700"></div>
                        <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-red-700 via-yellow-500 to-red-700"></div>
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-700 via-yellow-500 to-red-700"></div>
                        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-red-700 via-yellow-500 to-red-700"></div>
                    </div>

                    {/* Corner decorative elements */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-2 left-2 text-3xl text-red-700">🌺</div>
                        <div className="absolute top-2 right-2 text-3xl text-amber-600">🌺</div>
                        <div className="absolute bottom-2 left-2 text-3xl text-amber-600">🌺</div>
                        <div className="absolute bottom-2 right-2 text-3xl text-red-700">🌺</div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-4">
                        {/* Header with Ganesh */}
                        <div className="text-center mb-2">
                            <div className="flex justify-center mb-2">
                                <img
                                    src="/images/design-mode/lord-ganesh-deity-symbol-auspicious.jpg"
                                    alt="Lord Ganesh"
                                    className="w-16 h-16 rounded-full shadow-lg border-2 border-amber-500"
                                />
                            </div>
                            <p className="text-red-800 text-xs font-serif italic">with immense joy and gratitude, we cordially invite you to the</p>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-2">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-lg text-red-700">🪔</span>
                                <div className="h-px w-8 bg-red-700"></div>
                                <span className="text-lg text-amber-600">✦</span>
                                <div className="h-px w-8 bg-amber-600"></div>
                                <span className="text-lg text-red-700">🪔</span>
                            </div>

                            <h1 className="text-3xl font-serif font-bold text-red-700 mb-1">GRAND OPENING</h1>
                            <h1 className="text-3xl font-serif font-bold text-red-700 mb-2">CEREMONY</h1>
                            <p className="text-amber-700 text-lg font-serif mb-1">of</p>
                            <h2 className="text-4xl font-serif font-bold text-amber-600 mb-0.5 drop-shadow-md">MG</h2>
                            <h2 className="text-3xl font-serif font-bold text-amber-600 mb-2 drop-shadow-md">SUPERMART</h2>

                            {/* Firm Name */}
                            <div className="mb-2 flex items-center justify-center">
                                <div className="bg-white px-4 py-1 rounded-lg shadow-md border-2 border-red-700">
                                    <p className="text-red-800 font-serif text-sm font-semibold">Asha Enterprises</p>
                                </div>
                            </div>

                            {/* Proprietor */}
                            <div className="mb-2 flex items-center justify-center">
                                <div className="bg-gradient-to-r from-red-700 to-red-800 px-4 py-1.5 rounded-full shadow-lg border-2 border-amber-400">
                                    <p className="text-amber-300 font-serif text-[10px]">Proprietor</p>
                                    <p className="text-white font-serif text-base font-bold">Navneet Kumar</p>
                                </div>
                            </div>

                            <p className="text-red-600 text-xs font-serif tracking-wider mb-2">
                                FRESH PRODUCE | DAILY ESSENTIALS | PREMIUM QUALITY
                            </p>
                        </div>

                        {/* Brands */}
                        <div className="mb-2 p-2 bg-white rounded-lg shadow-lg border-2 border-red-700 relative">
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <span className="text-white text-xs">✦</span>
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-700 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <span className="text-amber-400 text-xs">✦</span>
                            </div>

                            <p className="text-center text-red-700 font-serif text-[10px] font-bold mb-1.5">WHOLESALE AVAILABLE</p>
                            <div className="grid grid-cols-7 gap-1">
                                {brands.map((brand) => (
                                    <div key={brand.name} className="flex flex-col items-center justify-center p-1 bg-gradient-to-b from-gray-50 to-white rounded shadow-sm h-12 border border-gray-200">
                                        <img
                                            src={brand.logo || "/placeholder.svg"}
                                            alt={`${brand.name} logo`}
                                            className="h-6 w-auto object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Date */}
                        <div className="mb-2 relative">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                                <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-3 py-1 rounded-full shadow-lg border-2 border-amber-400 flex items-center gap-1">
                                    <span className="text-sm">📅</span>
                                    <span className="text-amber-300 font-serif text-[9px] font-bold">SAVE THE DATE</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg shadow-lg border-2 border-red-700 p-2 pt-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="text-center">
                                        <div className="bg-white rounded-lg shadow-md p-1.5 border border-red-600 min-w-[60px]">
                                            <p className="text-red-800 font-serif text-xs font-bold">Wednesday</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-red-700 rounded-full"></div>
                                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                                    </div>

                                    <div className="text-center">
                                        <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-lg shadow-lg p-2 border-2 border-amber-400">
                                            <p className="text-amber-300 font-serif text-3xl font-bold">19</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-red-700 rounded-full"></div>
                                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                                    </div>

                                    <div className="text-center">
                                        <div className="bg-white rounded-lg shadow-md p-1.5 border border-red-600 min-w-[50px]">
                                            <p className="text-red-800 font-serif text-xs font-bold">NOV</p>
                                            <p className="text-amber-600 font-serif text-xs font-bold">2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="text-center mb-2">
                            <div className="text-base">📍</div>
                            <p className="text-red-800 font-serif text-xs mb-1">Pipra Main Road, Near Central Bank of India</p>
                            <div className="text-base">📞</div>
                            <p className="text-amber-600 font-serif text-xs font-bold">Mob.: 8809979748</p>
                        </div>

                        {/* Footer */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-sm text-red-700">🌸</span>
                                <p className="text-amber-600 text-lg">❧</p>
                                <span className="text-sm text-red-700">🌸</span>
                            </div>
                            <div className="mb-1 flex items-center justify-center gap-1">
                                <span className="text-sm">🎉</span>
                                <span className="text-sm">🎊</span>
                                <span className="text-sm">🎁</span>
                            </div>
                            <p className="text-gray-700 text-[10px] font-serif italic leading-tight">
                                please join us for the inaugural ceremony and puja<br />
                                followed by light refreshments & lots of exciting offers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
