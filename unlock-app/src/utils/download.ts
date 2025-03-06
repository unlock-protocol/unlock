import FileSaver from 'file-saver'
import { buildCSV } from '~/utils/csv'

interface DownloadOptions {
  fileName?: string
  cols: string[]
  metadata: any[]
}

export function downloadAsCSV({
  cols,
  metadata,
  fileName = 'members.csv',
}: DownloadOptions) {
  const csv = buildCSV(cols, metadata)

  const blob = new Blob([csv], {
    type: 'data:text/csv;charset=utf-8',
  })
  FileSaver.saveAs(blob, fileName)
}
