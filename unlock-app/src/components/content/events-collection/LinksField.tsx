import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Input } from '@unlock-protocol/ui'

export interface Links {
  farcaster?: string
  x?: string
  website?: string
  youtube?: string
  github?: string
}

export const LinksField: React.FC = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<{ links: Links }>()

  return (
    <div className="space-y-4 w-full">
      <Controller
        control={control}
        name="links.website"
        rules={{
          pattern: {
            value:
              /^https?:\/\/(?!(?:www\.)?(?:github\.com|youtube\.com|farcaster\.xyz|twitter\.com|x\.com)).+\..+/,
            message: 'Invalid URL format',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="url"
            placeholder="https://yourwebsite.com"
            label="Website"
            description="Your website URL."
            error={errors.links?.website?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="links.farcaster"
        rules={{
          pattern: {
            value:
              /^https?:\/\/(www\.)?(?:farcaster\.xyz|warpcast\.com)\/[a-zA-Z0-9_-]+$/,
            message: 'Invalid Farcaster URL format',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="url"
            placeholder="https://warpcast.com/yourhandle"
            label="Farcaster"
            description="Your Farcaster URL."
            error={errors.links?.farcaster?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="links.x"
        rules={{
          pattern: {
            value:
              /^https?:\/\/(www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+$/,
            message: 'Invalid X (Twitter) URL format',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="url"
            placeholder="https://x.com/yourhandle"
            label="X"
            description="Your X (formerly Twitter) URL."
            error={errors.links?.x?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="links.youtube"
        rules={{
          pattern: {
            value: /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+$/,
            message: 'Invalid YouTube URL format',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="url"
            placeholder="https://www.youtube.com/@yourchannel"
            label="YouTube"
            description="Your YouTube URL."
            error={errors.links?.youtube?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="links.github"
        rules={{
          pattern: {
            value: /^https?:\/\/github\.com\/.+$/,
            message: 'Invalid GitHub URL format',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="url"
            placeholder="https://github.com/yourprofile"
            label="GitHub"
            description="Your GitHub URL."
            error={errors.links?.github?.message}
          />
        )}
      />
    </div>
  )
}
