import { useState, useEffect } from 'react'
import { Plus, Trash2, Upload, Image, X } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function AdminLogos({ onToast }) {
  const [logos, setLogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const [form, setForm] = useState({ image_url: '', alt_text: '', sort_order: 0 })

  const fetchLogos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('client_logos')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching logos:', error)
      onToast?.('Failed to load logos', 'error')
    } else {
      setLogos(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchLogos() }, [])

  const openAdd = () => {
    setForm({
      image_url: '',
      alt_text: '',
      sort_order: logos.length + 1,
    })
    setPreview(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setForm({ image_url: '', alt_text: '', sort_order: 0 })
    setPreview(null)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `logos/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file)

    if (error) {
      onToast?.('Failed to upload image', 'error')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path)

    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }))
    setPreview(urlData.publicUrl)
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.image_url) {
      onToast?.('Please upload or paste a logo image', 'error')
      return
    }

    const { error } = await supabase
      .from('client_logos')
      .insert({
        image_url: form.image_url,
        alt_text: form.alt_text || 'Client logo',
        sort_order: form.sort_order,
      })

    if (error) {
      onToast?.('Failed to add logo', 'error')
    } else {
      onToast?.('Logo added', 'success')
      closeModal()
      fetchLogos()
    }
  }

  const handleDelete = async (logo) => {
    const { error } = await supabase
      .from('client_logos')
      .delete()
      .eq('id', logo.id)

    if (error) {
      onToast?.('Failed to delete logo', 'error')
    } else {
      onToast?.('Logo deleted', 'success')
      fetchLogos()
    }
    setConfirm(null)
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="admin-page-title">Client Logos</h2>
          <p className="admin-page-desc">Manage the client logos shown in the scrolling marquee</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}>
          <Plus size={16} />
          Add Logo
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          Loading logos...
        </div>
      ) : logos.length === 0 ? (
        <div className="admin-empty">
          <Image size={40} />
          <p>No client logos yet. Add your first one.</p>
        </div>
      ) : (
        <div className="admin-logos-grid">
          {logos.map((logo) => (
            <div key={logo.id} className="admin-logo-card">
              <button
                className="admin-logo-delete"
                title="Delete logo"
                onClick={() => setConfirm(logo)}
              >
                <Trash2 size={13} />
              </button>

              <img src={logo.image_url} alt={logo.alt_text} />

              <span className="admin-logo-card-name">
                {logo.alt_text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={closeModal}>
              <X size={16} />
            </button>

            <h3 className="admin-modal-title">Add Client Logo</h3>
            <p className="admin-modal-desc">
              Upload a logo image to display in the client marquee
            </p>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Logo Image</label>
                <div className="admin-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Upload size={28} className="admin-upload-icon" />
                  <p className="admin-upload-text">
                    {uploading ? 'Uploading...' : 'Click or drag to upload'}
                  </p>
                  <p className="admin-upload-hint">PNG, JPG, SVG up to 2MB</p>
                </div>

                {preview && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        maxHeight: 80,
                        maxWidth: 160,
                        objectFit: 'contain',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 12,
                        background: 'var(--ink)',
                      }}
                    />
                  </div>
                )}

                <input
                  className="admin-form-input"
                  type="text"
                  value={form.image_url}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, image_url: e.target.value }))
                    setPreview(e.target.value)
                  }}
                  placeholder="Or paste an image URL"
                  style={{ marginTop: 12 }}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Client Name</label>
                  <input
                    className="admin-form-input"
                    type="text"
                    value={form.alt_text}
                    onChange={(e) => setForm(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="e.g. Emaar"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Sort Order</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={uploading}>
                  Add Logo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <div className="admin-modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button className="admin-modal-close" onClick={() => setConfirm(null)}>
              <X size={16} />
            </button>

            <h3 className="admin-modal-title">Delete Logo</h3>
            <p className="admin-confirm-text">
              Are you sure you want to remove{' '}
              <span className="admin-confirm-highlight">"{confirm.alt_text}"</span>{' '}
              from the client logos?
            </p>

            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => handleDelete(confirm)}
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
