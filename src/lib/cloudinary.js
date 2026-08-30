import { supabase } from './supabase.js'

/**
 * Uploads an image file to Cloudinary (with fallback to Supabase Storage).
 * @param {File} file - The file selected by the user
 * @param {string} folder - Destination folder name (e.g., 'services', 'projects', 'logos')
 * @returns {Promise<string>} Secure URL of the uploaded image
 */
export async function uploadImage(file, folder = 'easygroup') {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'accom0gz'
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY

  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', folder)

      if (apiKey) {
        formData.append('api_key', apiKey)
      }

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.secure_url) {
        return data.secure_url
      }

      console.warn('Cloudinary upload error:', data.error?.message)
    } catch (err) {
      console.warn('Cloudinary request failed, attempting fallback to Supabase Storage...', err)
    }
  }

  // Fallback to Supabase Storage
  const ext = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file)

  if (error) {
    throw new Error(error.message || 'Storage upload failed')
  }

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
