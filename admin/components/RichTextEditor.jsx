import React, { useState, useRef, useEffect } from 'react'
import './RichTextEditor.css'
import axios from 'axios'

const RichTextEditor = ({ value, onChange, token, backendUrl }) => {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const isInitialized = useRef(false)
  const lastExternalValue = useRef(value) // 跟踪外部传入的 value

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      // 更新外部 value，同时更新 lastExternalValue 避免触发 useEffect
      lastExternalValue.current = newContent
      onChange(newContent)
    }
  }

  // 辅助函数：通过 canvas 下载图片（处理跨域）
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
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert canvas to blob'))
            }
          }, 'image/png')
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = url
    })
  }

  const handlePaste = async (e) => {
    const clipboardData = e.clipboardData || window.clipboardData
    
    // 检查是否有图片
    const items = clipboardData.items
    let hasImage = false
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        // 处理粘贴的图片文件
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault()
          hasImage = true
          
          const file = item.getAsFile()
          if (file) {
            await uploadAndInsertImage(file)
          }
          return
        }
      }
    }
    
    // 检查是否有 HTML 内容（包含网页上的图片）
    const htmlData = clipboardData.getData('text/html')
    if (htmlData && !hasImage) {
      e.preventDefault()
      
      // 创建临时 div 来解析 HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlData
      
      // 查找所有图片
      const images = tempDiv.querySelectorAll('img')
      
      if (images.length > 0) {
        // 显示上传提示
        setIsUploading(true)
        console.log(`Processing ${images.length} images from pasted content...`)
        
        // 处理 HTML 中的图片
        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          const src = img.src
          
          try {
            let blob = null
            
            // Base64 图片
            if (src.startsWith('data:image')) {
              blob = await fetch(src).then(r => r.blob())
            } 
            // 网络图片 - 尝试下载并上传
            else if (src.startsWith('http://') || src.startsWith('https://')) {
              try {
                // 尝试通过代理或直接获取图片
                const response = await fetch(src, { mode: 'cors' })
                blob = await response.blob()
              } catch (fetchError) {
                console.warn('Cannot fetch image from URL (CORS?):', src)
                // 如果无法获取，尝试使用 Image 对象转换为 canvas 再转 blob
                try {
                  blob = await downloadImageAsBlob(src)
                } catch (canvasError) {
                  console.error('Failed to download image:', src, canvasError)
                  // 保留原 URL，但添加提示
                  img.setAttribute('data-original-src', src)
                  img.alt = img.alt || 'Image from external source (may not display)'
                  continue
                }
              }
            }
            
            // 如果成功获取 blob，上传到 Cloudinary
            if (blob) {
              const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type || 'image/png' })
              const uploadedUrl = await uploadAndInsertImage(file, true) // 不重复插入
              if (uploadedUrl) {
                img.src = uploadedUrl
                img.removeAttribute('data-original-src')
              }
            }
          } catch (error) {
            console.error('Error processing image:', src, error)
            // 出错时保留原图片
          }
        }
        
        // 完成上传
        setIsUploading(false)
        console.log('All images processed')
        
        // 插入处理后的 HTML
        document.execCommand('insertHTML', false, tempDiv.innerHTML)
      } else {
        // 没有图片，直接插入 HTML 保留格式
        document.execCommand('insertHTML', false, htmlData)
      }
      
      updateContent()
      return
    }
    
    // 如果没有图片也没有 HTML，获取纯文本
    if (!hasImage) {
      e.preventDefault()
      const text = clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
      updateContent()
    }
  }
  
  // 上传图片并插入到编辑器
  const uploadAndInsertImage = async (file, skipInsert = false) => {
    console.log('uploadAndInsertImage called with file:', file?.name)
    
    if (!file.type.startsWith('image/')) {
      console.error('Not an image file:', file.type)
      alert('Please select an image file')
      return null
    }

    setIsUploading(true)
    console.log('Starting upload to:', `${backendUrl}/api/product/upload-description-image`)
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(`${backendUrl}/api/product/upload-description-image`, formData, {
        headers: {
          'token': token,
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Upload response:', response.data)

      if (response.data.success) {
        const imageUrl = response.data.imageUrl
        console.log('Image uploaded successfully:', imageUrl)
        
        // 只在非批量处理时插入图片
        if (!skipInsert) {
          const img = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 800px; height: auto;" />`
          console.log('Inserting image into editor')
          document.execCommand('insertHTML', false, img)
          updateContent()
          console.log('Image inserted')
        }
        
        return imageUrl
      } else {
        console.error('Upload failed:', response.data.message)
        alert('Upload failed: ' + response.data.message)
        return null
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + (error.response?.data?.message || error.message))
      return null
    } finally {
      setIsUploading(false)
      console.log('Upload process finished')
    }
  }

  const handleFocus = () => {
    if (editorRef.current && editorRef.current.innerHTML === '<br>') {
      editorRef.current.innerHTML = ''
    }
  }

  // 初始化和更新编辑器内容
  useEffect(() => {
    if (editorRef.current) {
      // 首次初始化
      if (!isInitialized.current) {
        const initialContent = value || '<p>Start writing your product description here. Use the toolbar above to format text, add images, and create custom layouts...</p>'
        editorRef.current.innerHTML = initialContent
        lastExternalValue.current = value
        isInitialized.current = true
        return
      }
      
      // 检查是否是外部更新（比如从数据库加载）
      // 只有当 value 与上次记录的外部 value 不同时，才认为是外部更新
      if (value !== lastExternalValue.current) {
        lastExternalValue.current = value
        
        // 只有当编辑器内容与新 value 明显不同时才更新
        const currentContent = editorRef.current.innerHTML
        if (value && currentContent !== value) {
          // 检查用户是否正在编辑
          const isEditing = document.activeElement === editorRef.current
          
          if (!isEditing) {
            // 用户没在编辑，可以安全更新
            editorRef.current.innerHTML = value
          }
        }
      }
    }
  }, [value])

  const handleImageUpload = async (e) => {
    console.log('handleImageUpload triggered')
    console.log('Files:', e.target.files)
    
    const file = e.target.files[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name, file.type, file.size)

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    // 使用统一的上传函数
    console.log('Calling uploadAndInsertImage')
    await uploadAndInsertImage(file)
    
    // 重置文件输入，以便可以再次选择相同的文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 点击图片按钮时触发文件选择
  const triggerImageUpload = () => {
    console.log('Image button clicked')
    console.log('fileInputRef.current:', fileInputRef.current)
    if (fileInputRef.current) {
      console.log('Triggering file input click')
      fileInputRef.current.click()
    } else {
      console.error('File input ref is null')
    }
  }

  return (
    <div className='rich-text-editor'>
      {/* Toolbar */}
      <div className='rich-text-editor-toolbar'>
        {/* Text Formatting */}
        <button type='button' onClick={() => execCommand('bold')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Bold'>
          <strong>B</strong>
        </button>
        <button type='button' onClick={() => execCommand('italic')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Italic'>
          <em>I</em>
        </button>
        <button type='button' onClick={() => execCommand('underline')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Underline'>
          <u>U</u>
        </button>
        <button type='button' onClick={() => execCommand('strikeThrough')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Strike'>
          <s>S</s>
        </button>
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Headers */}
        <select onChange={(e) => execCommand('formatBlock', e.target.value)} className='px-2 py-1 border border-gray-300 rounded text-sm'>
          <option value=''>Normal</option>
          <option value='h1'>Heading 1</option>
          <option value='h2'>Heading 2</option>
          <option value='h3'>Heading 3</option>
          <option value='h4'>Heading 4</option>
        </select>
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Font Size */}
        <select onChange={(e) => execCommand('fontSize', e.target.value)} className='px-2 py-1 border border-gray-300 rounded text-sm'>
          <option value=''>Size</option>
          <option value='1'>Small</option>
          <option value='3'>Normal</option>
          <option value='5'>Large</option>
          <option value='7'>Huge</option>
        </select>
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Line Height */}
        <select 
          onChange={(e) => {
            const lineHeight = e.target.value
            if (!lineHeight) return
            
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              
              // 获取包含选区的块级元素（段落）
              let blockElement = range.commonAncestorContainer
              
              // 如果是文本节点，获取其父元素
              if (blockElement.nodeType === 3) {
                blockElement = blockElement.parentNode
              }
              
              // 向上查找块级元素（p, div, h1-h6, li 等）
              while (blockElement && blockElement !== editorRef.current) {
                const tagName = blockElement.tagName?.toLowerCase()
                if (tagName === 'p' || tagName === 'div' || tagName === 'li' || 
                    /^h[1-6]$/.test(tagName)) {
                  break
                }
                blockElement = blockElement.parentNode
              }
              
              // 应用行距
              if (blockElement && blockElement !== editorRef.current) {
                blockElement.style.lineHeight = lineHeight
                updateContent()
                
                // 重置选择器
                e.target.value = ''
              }
            }
          }} 
          className='px-2 py-1 border border-gray-300 rounded text-sm'
          title='Line Height'
        >
          <option value=''>Line Height</option>
          <option value='1'>1.0</option>
          <option value='1.15'>1.15</option>
          <option value='1.5'>1.5</option>
          <option value='1.75'>1.75</option>
          <option value='2'>2.0</option>
          <option value='2.5'>2.5</option>
          <option value='3'>3.0</option>
        </select>
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Alignment */}
        <button type='button' onClick={() => execCommand('justifyLeft')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Align Left'>
          ≡
        </button>
        <button type='button' onClick={() => execCommand('justifyCenter')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Center'>
          ≡
        </button>
        <button type='button' onClick={() => execCommand('justifyRight')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Align Right'>
          ≡
        </button>
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Lists */}
        <button type='button' onClick={() => execCommand('insertUnorderedList')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Bullet List'>
          • List
        </button>
        <button type='button' onClick={() => execCommand('insertOrderedList')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Numbered List'>
          1. List
        </button>
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Link */}
        <button type='button' onClick={() => {
          const url = prompt('Enter URL:')
          if (url) execCommand('createLink', url)
        }} className='px-3 py-1 hover:bg-gray-200 rounded' title='Insert Link'>
          🔗
        </button>
        
        {/* Image */}
        <button 
          type='button' 
          onClick={triggerImageUpload} 
          disabled={isUploading}
          className={`px-3 py-1 rounded font-semibold ${isUploading ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 bg-blue-50'}`}
          title={isUploading ? 'Uploading...' : 'Insert Image'}
        >
          {isUploading ? '⏳ Uploading...' : '📷 Image'}
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleImageUpload}
          className='hidden'
          disabled={isUploading}
        />
        
        <div className='w-px bg-gray-300 mx-1'></div>
        
        {/* Clear */}
        <button type='button' onClick={() => execCommand('removeFormat')} className='px-3 py-1 hover:bg-gray-200 rounded' title='Clear Formatting'>
          🧹
        </button>
      </div>
      
      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onBlur={updateContent}
        onPaste={handlePaste}
        onFocus={handleFocus}
        className='rich-text-editor-content'
        suppressContentEditableWarning
      />
    </div>
  )
}

export default RichTextEditor

