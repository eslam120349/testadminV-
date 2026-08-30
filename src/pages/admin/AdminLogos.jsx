
import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Upload,
  Image,
  X,
  Pencil,
} from 'lucide-react'

import { supabase } from '../../lib/supabase.js'
import { uploadImage } from '../../lib/cloudinary.js'

export default function AdminLogos({ onToast }) {
  const [logos, setLogos] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [editingLogo, setEditingLogo] = useState(null)

  const [preview, setPreview] = useState(null)

  const [confirm, setConfirm] = useState(null)

  const [form, setForm] = useState({
    image_url: '',
    alt_text: '',
    sort_order: 0,
  })

  // ============================================
  // FETCH LOGOS
  // ============================================

  const fetchLogos = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('client_logos')
      .select('*')
      .order('sort_order', {
        ascending: true,
      })

    if (error) {
      console.error('Error fetching logos:', error)

      onToast?.(
        'Failed to load logos',
        'error'
      )
    } else {
      setLogos(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchLogos()
  }, [])

  // ============================================
  // RESET FORM
  // ============================================

  const resetForm = () => {
    setForm({
      image_url: '',
      alt_text: '',
      sort_order: 0,
    })

    setPreview(null)
    setEditingLogo(null)
  }

  // ============================================
  // OPEN ADD
  // ============================================

  const openAdd = () => {
    resetForm()

    setForm({
      image_url: '',
      alt_text: '',
      sort_order: logos.length + 1,
    })

    setShowModal(true)
  }

  // ============================================
  // OPEN EDIT
  // ============================================

  const openEdit = (logo) => {
    setEditingLogo(logo)

    setForm({
      image_url: logo.image_url || '',
      alt_text: logo.alt_text || '',
      sort_order: logo.sort_order || 0,
    })

    setPreview(logo.image_url || null)

    setShowModal(true)
  }

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (uploading) return

    setShowModal(false)
    resetForm()
  }

  // ============================================
  // UPLOAD IMAGE TO CLOUDINARY
  // ============================================

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      onToast?.(
        'Please select a valid image file',
        'error'
      )

      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast?.(
        'Image must be smaller than 5MB',
        'error'
      )

      e.target.value = ''
      return
    }

    setUploading(true)

    try {
      const url = await uploadImage(
        file,
        'logos'
      )

      setForm((prev) => ({
        ...prev,
        image_url: url,
      }))

      setPreview(url)

      onToast?.(
        'Logo uploaded to Cloudinary',
        'success'
      )
    } catch (err) {
      console.error(
        'Cloudinary upload error:',
        err
      )

      onToast?.(
        err.message ||
        'Failed to upload logo',
        'error'
      )
    } finally {
      setUploading(false)

      e.target.value = ''
    }
  }

  // ============================================
  // SAVE
  // ADD OR UPDATE
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploading) return

    if (!form.image_url) {
      onToast?.(
        'Please upload a logo',
        'error'
      )

      return
    }

    // ==========================================
    // UPDATE EXISTING LOGO
    // ==========================================

    if (editingLogo) {
      const { error } = await supabase
        .from('client_logos')
        .update({
          image_url: form.image_url,

          alt_text:
            form.alt_text.trim() ||
            'Client logo',

          sort_order:
            Number(form.sort_order) || 0,
        })
        .eq('id', editingLogo.id)

      if (error) {
        console.error(
          'Update logo error:',
          error
        )

        onToast?.(
          'Failed to update logo',
          'error'
        )

        return
      }

      onToast?.(
        'Logo updated successfully',
        'success'
      )
    }

    // ==========================================
    // ADD NEW LOGO
    // ==========================================

    else {
      const { error } = await supabase
        .from('client_logos')
        .insert({
          image_url: form.image_url,

          alt_text:
            form.alt_text.trim() ||
            'Client logo',

          sort_order:
            Number(form.sort_order) || 0,
        })

      if (error) {
        console.error(
          'Add logo error:',
          error
        )

        onToast?.(
          'Failed to add logo',
          'error'
        )

        return
      }

      onToast?.(
        'Logo added successfully',
        'success'
      )
    }

    closeModal()
    fetchLogos()
  }

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async (logo) => {
    if (!logo?.id) return

    const { error } = await supabase
      .from('client_logos')
      .delete()
      .eq('id', logo.id)

    if (error) {
      console.error(
        'Delete logo error:',
        error
      )

      onToast?.(
        'Failed to delete logo',
        'error'
      )
    } else {
      onToast?.(
        'Logo deleted successfully',
        'success'
      )

      fetchLogos()
    }

    setConfirm(null)
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* ========================================
          TOP BAR
      ======================================== */}

      <div className="admin-topbar">
        <div>
          <h2 className="admin-page-title">
            Client Logos
          </h2>

          <p className="admin-page-desc">
            Manage the client logos shown in the
            scrolling marquee
          </p>
        </div>

        <button
          className="admin-btn-add"
          onClick={openAdd}
        >
          <Plus size={16} />

          Add Logo
        </button>
      </div>

      {/* ========================================
          LOGOS
      ======================================== */}

      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />

          Loading logos...
        </div>
      ) : logos.length === 0 ? (
        <div className="admin-empty">
          <Image size={40} />

          <p>
            No client logos yet.
            Add your first one.
          </p>
        </div>
      ) : (
        <div className="admin-logos-grid">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="admin-logo-card"
            >
              {/* EDIT */}

              <button
                className="admin-logo-edit"
                title="Edit logo"
                onClick={() =>
                  openEdit(logo)
                }
              >
                <Pencil size={13} />
              </button>

              {/* DELETE */}

              <button
                className="admin-logo-delete"
                title="Delete logo"
                onClick={() =>
                  setConfirm(logo)
                }
              >
                <Trash2 size={13} />
              </button>

              {/* IMAGE */}

              <img
                src={logo.image_url}
                alt={
                  logo.alt_text ||
                  'Client logo'
                }
                loading="lazy"
              />

              {/* NAME */}

              <span className="admin-logo-card-name">
                {logo.alt_text ||
                  'Client logo'}
              </span>

              {/* ORDER */}

              <span
                style={{
                  fontSize: 11,
                  opacity: 0.5,
                  marginTop: 4,
                }}
              >
                Order: {logo.sort_order}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ========================================
          ADD / EDIT MODAL
      ======================================== */}

      {showModal && (
        <div
          className="admin-modal-backdrop"
          onClick={closeModal}
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="admin-modal-close"
              onClick={closeModal}
              disabled={uploading}
            >
              <X size={16} />
            </button>

            {/* TITLE */}

            <h3 className="admin-modal-title">
              {editingLogo
                ? 'Edit Client Logo'
                : 'Add Client Logo'}
            </h3>

            <p className="admin-modal-desc">
              {editingLogo
                ? 'Update the logo information or replace the image.'
                : 'Upload a new client logo to Cloudinary.'}
            </p>

            <form
              onSubmit={handleSubmit}
            >
              {/* ==================================
                  IMAGE
              ================================== */}

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Logo Image
                </label>

                <div className="admin-upload-area">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={
                      handleImageUpload
                    }
                    disabled={uploading}
                  />

                  <Upload
                    size={28}
                    className="admin-upload-icon"
                  />

                  <p className="admin-upload-text">
                    {uploading
                      ? 'Uploading to Cloudinary...'
                      : editingLogo
                        ? 'Click to replace image'
                        : 'Click or drag to upload'}
                  </p>

                  <p className="admin-upload-hint">
                    PNG, JPG, WEBP, SVG up to
                    5MB
                  </p>
                </div>

                {/* PREVIEW */}

                {preview && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: 16,
                    }}
                  >
                    <img
                      src={preview}
                      alt="Logo Preview"
                      style={{
                        maxHeight: 100,
                        maxWidth: 180,
                        objectFit: 'contain',
                        border:
                          '1px solid var(--line)',
                        borderRadius:
                          'var(--radius-sm)',
                        padding: 12,
                        background:
                          'var(--ink)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ==================================
                  NAME + ORDER
              ================================== */}

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Client Name
                  </label>

                  <input
                    className="admin-form-input"
                    type="text"
                    value={
                      form.alt_text
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        alt_text:
                          e.target.value,
                      }))
                    }
                    placeholder="e.g. Emaar"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Sort Order
                  </label>

                  <input
                    className="admin-form-input"
                    type="number"
                    min="0"
                    value={
                      form.sort_order
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sort_order:
                          Number(
                            e.target.value
                          ) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              {/* ==================================
                  ACTIONS
              ================================== */}

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={closeModal}
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={uploading}
                >
                  {uploading
                    ? 'Uploading...'
                    : editingLogo
                      ? 'Save Changes'
                      : 'Add Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          DELETE CONFIRM
      ======================================== */}

      {confirm && (
        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setConfirm(null)
          }
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: 420,
            }}
          >
            <button
              className="admin-modal-close"
              onClick={() =>
                setConfirm(null)
              }
            >
              <X size={16} />
            </button>

            <h3 className="admin-modal-title">
              Delete Logo
            </h3>

            <p className="admin-confirm-text">
              Are you sure you want to remove{' '}
              <span className="admin-confirm-highlight">
                "{confirm.alt_text}"
              </span>{' '}
              from the client logos?
            </p>

            <div className="admin-form-actions">
              <button
                className="admin-btn admin-btn-ghost"
                onClick={() =>
                  setConfirm(null)
                }
              >
                Cancel
              </button>

              <button
                className="admin-btn admin-btn-primary"
                onClick={() =>
                  handleDelete(confirm)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
