/**
 * Upload an image directly to Cloudinary.
 *
 * IMPORTANT:
 * - No Supabase Storage fallback.
 * - Uses an unsigned Cloudinary upload preset.
 * - Never put the Cloudinary API Secret in frontend code.
 */

export async function uploadImage(file, folder = 'easygroup') {
  if (!file) {
    throw new Error('No image file selected.')
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName) {
    throw new Error(
      'Missing VITE_CLOUDINARY_CLOUD_NAME environment variable.'
    )
  }

  if (!uploadPreset) {
    throw new Error(
      'Missing VITE_CLOUDINARY_UPLOAD_PRESET environment variable.'
    )
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file.')
  }

  // 5MB maximum
  const MAX_FILE_SIZE = 5 * 1024 * 1024

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size must be less than 5MB.')
  }

  const formData = new FormData()

  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  // Cloudinary folder
  formData.append('folder', folder)

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  let response

  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
  } catch (error) {
    console.error('Cloudinary network error:', error)

    throw new Error(
      'Could not connect to Cloudinary. Please check your internet connection.'
    )
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'Cloudinary returned an invalid response.'
    )
  }

  if (!response.ok) {
    console.error('Cloudinary upload error:', data)

    throw new Error(
      data?.error?.message ||
      'Cloudinary upload failed.'
    )
  }

  if (!data.secure_url) {
    console.error('Cloudinary response:', data)

    throw new Error(
      'Cloudinary uploaded the image but did not return a URL.'
    )
  }

  return data.secure_url
}