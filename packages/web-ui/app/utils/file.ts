import axios from 'axios'

export const formatFileUrl = (filename?: string) => `/api/download/${filename}`

export function getOriginalFilename(filename: string) {
  filename = decodeURIComponent(filename)
  return filename.slice(filename.indexOf('-') + 1)
}

export function getFileExtension(filename: string) {
  return filename.slice(filename.lastIndexOf('.') + 1)
}

export async function readFileStatus(file: string) {
  try {
    const res = await fetch(formatFileUrl(file), { method: 'HEAD' })
    return {
      file,
      download: res.ok
    }
  } catch {
    return {
      file,
      download: false
    }
  }
}

export async function readFileContent(url: string) {
  return await fetch(url).then(res => res.text())
}

export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export function downloadMsgFile(msg: Message) {
  const url = formatFileUrl(msg.content)
  const filename = getOriginalFilename(msg.content)
  downloadFile(url, filename)
}

export async function uploadFile(file: File, onProgress?: (e: any) => void) {
  const formData = new FormData()
  formData.append('file', file)
  const { data: res } = await axios.post<UploadFileResult>('/api/upload', formData, {
    onUploadProgress(e) {
      onProgress?.({ ...e, percent: (e.progress ?? 0) * 100 })
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res
}
