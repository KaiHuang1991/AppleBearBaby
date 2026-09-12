import React, { useState, useRef, useEffect } from 'react'
import './RichTextEditor.css'
import axios from 'axios'

const looksLikeHtml = (text = '') => {
  const trimmed = String(text).trim()
  return /^</.test(trimmed) && /<\/[a-z][\w:-]*>/i.test(trimmed)
}

const sanitizeImageUrl = (url = '') => {
  const trimmed = String(url).trim()
  if (!/^https?:\/\//i.test(trimmed)) return ''
  return trimmed.replace(/"/g, '%22')
}

const wrapImageHtml = (url, alt = '') =>
  `<div class="product-description-image-wrapper"><img src="${url}" alt="${alt.replace(/"/g, '&quot;')}" style="max-width: 100%; height: auto;" /></div>`

const RichTextEditor = ({
  value,
  onChange,
  token,
  backendUrl,
  placeholder = 'Write here, paste HTML, or insert an image URL.',
}) => {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [mode, setMode] = useState('visual')
  const [htmlDraft, setHtmlDraft] = useState(value || '')
  const lastExternalValue = useRef(value)

  const syncFromEditor = () => {
    if (!editorRef.current) return value || ''
    const html = editorRef.current.innerHTML
    lastExternalValue.current = html
    onChange(html)
    setHtmlDraft(html)
    return html
  }

  const execCommand = (command, commandValue = null) => {
    if (mode === 'html') return
    document.execCommand(command, false, commandValue)
    syncFromEditor()
  }

  const switchMode = (nextMode) => {
    if (nextMode === mode) return
    if (nextMode === 'html') {
      const html = editorRef.current ? editorRef.current.innerHTML : htmlDraft
      setHtmlDraft(html)
      lastExternalValue.current = html
      onChange(html)
      setMode('html')
      return
    }
    lastExternalValue.current = htmlDraft
    onChange(htmlDraft)
    setMode('visual')
  }

  const downloadImageAsBlob = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to convert canvas to blob'))
          }, 'image/png')
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = url
    })
  }

  const handlePaste = async (e) => {
    const clipboardData = e.clipboardData || window.clipboardData
    const items = clipboardData.items

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) await uploadAndInsertImage(file)
          return
        }
      }
    }

    const htmlData = clipboardData.getData('text/html')
    if (htmlData) {
      e.preventDefault()
      await insertPastedHtml(htmlData)
      return
    }

    const text = clipboardData.getData('text/plain')
    e.preventDefault()
    if (looksLikeHtml(text)) {
      await insertPastedHtml(text)
      return
    }
    document.execCommand('insertText', false, text)
    syncFromEditor()
  }

  const insertPastedHtml = async (htmlData) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlData
    const images = tempDiv.querySelectorAll('img')

    if (images.length > 0) {
      setIsUploading(true)
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        const src = img.src
        try {
          let blob = null
          if (src.startsWith('data:image')) {
            blob = await fetch(src).then((r) => r.blob())
          } else if (src.startsWith('http://') || src.startsWith('https://')) {
            try {
              const response = await fetch(src, { mode: 'cors' })
              blob = await response.blob()
            } catch {
              try {
                blob = await downloadImageAsBlob(src)
              } catch {
                img.setAttribute('data-original-src', src)
                continue
              }
            }
          }
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type || 'image/png' })
            const uploadedUrl = await uploadAndInsertImage(file, true)
            if (uploadedUrl) {
              img.src = uploadedUrl
              img.removeAttribute('data-original-src')
            }
          }
        } catch (error) {
          console.error('Error processing image:', src, error)
        }
      }
      setIsUploading(false)
    }

    tempDiv.querySelectorAll('img').forEach((img) => {
      if (!img.parentElement || !img.parentElement.classList.contains('product-description-image-wrapper')) {
        const wrapper = document.createElement('div')
        wrapper.className = 'product-description-image-wrapper'
        img.parentNode.insertBefore(wrapper, img)
        wrapper.appendChild(img)
      }
    })

    document.execCommand('insertHTML', false, tempDiv.innerHTML)
    wrapImagesInDiv()
    syncFromEditor()
  }

  const uploadAndInsertImage = async (file, skipInsert = false) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return null
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await axios.post(`${backendUrl}/api/product/upload-description-image`, formData, {
        headers: {
          token,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        const imageUrl = response.data.imageUrl
        if (!skipInsert) insertImageHtml(imageUrl, 'Uploaded image')
        return imageUrl
      }
      alert('Upload failed: ' + response.data.message)
      return null
    } catch (error) {
      alert('Error uploading image: ' + (error.response?.data?.message || error.message))
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const insertImageHtml = (url, alt = '') => {
    const safeUrl = sanitizeImageUrl(url)
    if (!safeUrl) {
      alert('Please enter a valid http(s) image URL')
      return
    }
    const snippet = wrapImageHtml(safeUrl, alt)
    if (mode === 'html') {
      const next = `${htmlDraft || ''}\n${snippet}`
      setHtmlDraft(next)
      lastExternalValue.current = next
      onChange(next)
      return
    }
    document.execCommand('insertHTML', false, snippet)
    wrapImagesInDiv()
    syncFromEditor()
  }

  const handleInsertImageUrl = () => {
    const url = window.prompt('Paste image URL (Cloudinary / product photo):')
    if (!url) return
    insertImageHtml(url.trim())
  }

  const wrapImagesInDiv = () => {
    if (!editorRef.current) return
    let changed = false
    editorRef.current.querySelectorAll('img').forEach((img) => {
      if (!img.parentElement || !img.parentElement.classList.contains('product-description-image-wrapper')) {
        const wrapper = document.createElement('div')
        wrapper.className = 'product-description-image-wrapper'
        img.parentNode.insertBefore(wrapper, img)
        wrapper.appendChild(img)
        changed = true
      }
    })
    if (changed) syncFromEditor()
  }

  useEffect(() => {
    if (mode !== 'visual' || !editorRef.current) return
    const html = (typeof value === 'string' ? value : htmlDraft) || ''
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html
    }
    lastExternalValue.current = html
    setTimeout(() => wrapImagesInDiv(), 0)
  }, [mode])

  useEffect(() => {
    if (mode !== 'visual' || !editorRef.current) return
    if (value === lastExternalValue.current) return
    lastExternalValue.current = value
    setHtmlDraft(value || '')
    if (document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || ''
      setTimeout(() => wrapImagesInDiv(), 0)
    }
  }, [value, mode])

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" size should be less than 5MB`)
        continue
      }
      await uploadAndInsertImage(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className='rich-text-editor'>
      <div className='rich-text-editor-toolbar'>
        <button
          type='button'
          onClick={() => switchMode('visual')}
          className={`px-3 py-1 rounded text-sm font-medium ${mode === 'visual' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
        >
          Visual
        </button>
        <button
          type='button'
          onClick={() => switchMode('html')}
          className={`px-3 py-1 rounded text-sm font-medium ${mode === 'html' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
        >
          HTML
        </button>

        <div className='w-px bg-gray-300 mx-1'></div>

        <button type='button' onClick={() => execCommand('bold')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Bold'>
          <strong>B</strong>
        </button>
        <button type='button' onClick={() => execCommand('italic')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Italic'>
          <em>I</em>
        </button>
        <button type='button' onClick={() => execCommand('underline')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Underline'>
          <u>U</u>
        </button>
        <button type='button' onClick={() => execCommand('strikeThrough')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Strike'>
          <s>S</s>
        </button>

        <div className='w-px bg-gray-300 mx-1'></div>

        <select
          disabled={mode === 'html'}
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className='px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-40'
        >
          <option value=''>Normal</option>
          <option value='h1'>Heading 1</option>
          <option value='h2'>Heading 2</option>
          <option value='h3'>Heading 3</option>
          <option value='h4'>Heading 4</option>
        </select>

        <div className='w-px bg-gray-300 mx-1'></div>

        <button type='button' onClick={() => execCommand('insertUnorderedList')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Bullet List'>
          • List
        </button>
        <button type='button' onClick={() => execCommand('insertOrderedList')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Numbered List'>
          1. List
        </button>
        <button
          type='button'
          disabled={mode === 'html'}
          onClick={() => {
            const url = prompt('Enter URL:')
            if (url) execCommand('createLink', url)
          }}
          className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40'
          title='Insert Link'
        >
          🔗
        </button>

        <div className='w-px bg-gray-300 mx-1'></div>

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`px-3 py-1 rounded font-semibold ${isUploading ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-blue-50'}`}
          title='Upload image'
        >
          {isUploading ? 'Uploading...' : 'Image'}
        </button>
        <button
          type='button'
          onClick={handleInsertImageUrl}
          className='px-3 py-1 rounded font-semibold hover:bg-gray-200 bg-blue-50'
          title='Insert image by URL'
        >
          Image URL
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleImageUpload}
          className='hidden'
          disabled={isUploading}
        />

        <div className='w-px bg-gray-300 mx-1'></div>

        <button type='button' onClick={() => execCommand('removeFormat')} disabled={mode === 'html'} className='px-3 py-1 hover:bg-gray-200 rounded disabled:opacity-40' title='Clear Formatting'>
          Clear
        </button>
      </div>

      {mode === 'html' ? (
        <textarea
          className='rich-text-editor-html'
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value)
            lastExternalValue.current = e.target.value
            onChange(e.target.value)
          }}
          spellCheck={false}
          placeholder='Paste full HTML here, including &lt;p&gt;, &lt;h2&gt;, and &lt;img src="..."&gt;.'
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          data-placeholder={placeholder}
          onInput={() => {
            syncFromEditor()
            setTimeout(() => wrapImagesInDiv(), 100)
          }}
          onBlur={() => {
            wrapImagesInDiv()
            syncFromEditor()
          }}
          onPaste={handlePaste}
          className='rich-text-editor-content'
          suppressContentEditableWarning
        />
      )}
    </div>
  )
}

export default RichTextEditor
