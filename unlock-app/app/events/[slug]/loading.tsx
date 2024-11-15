'use client'

import { Placeholder } from '@unlock-protocol/ui'

export default function EventsCollectionDetailLoading() {
  return (
    <div>
      <div className="flex flex-col-reverse px-4 md:px-0 md:flex-row-reverse gap-2 "></div>
      <div className="pt-4">
        <div className="relative">
          <div className="w-full hidden sm:block sm:overflow-hidden bg-slate-200 max-h-80 sm:rounded-3xl">
            <Placeholder.Root>
              <Placeholder.Image className="object-cover w-[1400px] h-[350px]" />
            </Placeholder.Root>
          </div>

          <div className="sm:absolute flex sm:flex-col w-full gap-6 sm:pl-10 -bottom-12">
            <section className="flex justify-between flex-col sm:flex-row w-full">
              <div className="flex p-1 bg-white sm:p-2 sm:w-48 sm:h-48 sm:rounded-3xl rounded-xl border mb-4 sm:mb-0">
                <Placeholder.Root>
                  <Placeholder.Image className="h-full object-cover w-full m-auto aspect-1 sm:rounded-2xl rounded-lg" />
                </Placeholder.Root>
              </div>
            </section>
          </div>
        </div>

        <section className="grid items-start grid-cols-1 md:gap-4 md:grid-cols-3 md:mt-16 mt-8">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="text-3xl font-bold md:text-6xl">
              <Placeholder.Root>
                <Placeholder.Line size="sm" />
              </Placeholder.Root>
            </h1>

            <Placeholder.Root>
              <Placeholder.Line size="sm" />
            </Placeholder.Root>

            <div className="flex space-x-6">
              <Placeholder.Root>
                <Placeholder.Line size="sm" />
              </Placeholder.Root>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-14 mt-5">
            <div className="flex flex-col gap-6 lg:col-span-10 px-10">
              <Placeholder.Root>
                <Placeholder.Card />
              </Placeholder.Root>
            </div>
            <div className="lg:col-span-1"></div>
          </div>
        </section>
      </div>
    </div>
  )
}
