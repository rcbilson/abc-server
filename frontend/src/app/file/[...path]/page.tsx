import Image from 'next/image'
import Music from './Music'

export default function Home({ params }: { params: { path: string[] } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <Music path={"file/" + params.path.join("/")}/>
      </div>
    </main>
  )
}
