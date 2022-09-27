interface ImageBarProps {
  description: React.ReactNode
  src: string
  alt?: string
}

export const ImageBar = ({ description, src, alt }: ImageBarProps) => {
  return (
    <div className="text-center">
      <div className="overflow-hidden rounded-2xl">
        <img className="object-cover w-full h-24 md:h-80" src={src} alt={alt} />
      </div>
      <span className="block mt-4 text-xl font-bold">{description}</span>
    </div>
  )
}
