import { Button } from '@unlock-protocol/ui'
import { useList } from 'react-use'
import { AirdropMember, AirdropListItem } from './AirdropElements'
import { useDropzone } from 'react-dropzone'
import { parse } from 'csv/sync'
import { RiCloseLine as ClearIcon } from 'react-icons/ri'

export function AirdropBulkForm() {
  const [list, { set, clear, removeAt }] = useList<AirdropMember>([])
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.csv'],
    },
    onDropAccepted: async ([file]) => {
      const text = await file.text()
      const json: any[] | undefined = parse(text, {
        delimiter: ',',
        columns: true,
      })
      const members = (json || [])
        .map((item) => {
          const result = AirdropMember.safeParse(item)
          if (result.success) {
            return result.data
          }
        })
        // Filter valid members
        .filter((item) => item) as AirdropMember[]
      set(members)
    },
  })

  return (
    <div>
      {list.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between w-full">
            <div>{list.length} records </div>
            <Button
              iconRight={<ClearIcon size={18} key="clear" />}
              size="small"
              onClick={() => {
                clear()
              }}
            >
              Clear
            </Button>
          </div>
          {list.map((value, index) => (
            <AirdropListItem
              key={index}
              value={value}
              onRemove={(event) => {
                event.preventDefault()
                removeAt(index)
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <p>
            Once you upload the csv, you can see all the members. Lock&apos;s
            default expiration will be used in case of no expiration provided.
          </p>
          <div
            className="flex flex-col items-center justify-center bg-white border rounded cursor-pointer group aspect-1 group-hover:border-gray-300"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <p className="text-gray-500 group-hover:text-gray-800">
              Drop your members csv file.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
