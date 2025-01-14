import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative h-screen">
      <Image
        src="/football-field.svg"
        alt="Football field"
        fill  // Replace layout="fill"
        className="object-cover"  // Replace objectFit="cover"
        quality={100}
        priority  // Optional: add this if it's your hero image
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">NFL Stats Predictor</h1>
          <p className="text-xl mb-8">Predict future NFL game statistics with advanced machine learning models</p>
          <Link href="/predict" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Start Predicting
          </Link>
        </div>
      </div>
    </div>
  )
}