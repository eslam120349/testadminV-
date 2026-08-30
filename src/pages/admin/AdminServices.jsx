import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Layers } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

import { uploadImage } from '../../lib/cloudinary.js'

export default function AdminServices({ onToast }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // service object or null
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const emptyForm = { number: '', title: '', description: '', image_url: '', sort_order: 0 }
  const [form, setForm] = useState(emptyForm)

  const fetchServices = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching services:', error)
      onToast?.('Failed to load services', 'error')
    } else {
      setServices(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      number: String(services.length + 1).padStart(2, '0'),
      sort_order: services.length + 1,
    })
    setPreview(null)
    setShowModal(true)
  }

  const openEdit = (service) => {
    setEditing(service)
    setForm({
      number: service.number,
      title: service.title,
      description: service.description || '',
      image_url: service.image_url || '',
      sort_order: service.sort_order,
    })
    setPreview(service.image_url)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(emptyForm)
    setPreview(null)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadImage(file, 'services')
      setForm(prev => ({ ...prev, image_url: url }))
      setPreview(url)
    } catch (err) {
      console.error('Upload error:', err)
      onToast?.(err.message || 'Failed to upload image', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title) {
      onToast?.('Please enter a title', 'error')
      return
    }

    if (editing) {
      const { error } = await supabase
        .from('services')
        .update({
          number: form.number,
          title: form.title,
          description: form.description,
          image_url: form.image_url,
          sort_order: form.sort_order,
        })
        .eq('id', editing.id)

      if (error) {
        onToast?.('Failed to update service', 'error')
      } else {
        onToast?.('Service updated', 'success')
        closeModal()
        fetchServices()
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert({
          number: form.number,
          title: form.title,
          description: form.description,
          image_url: form.image_url,
          sort_order: form.sort_order,
        })

      if (error) {
        onToast?.('Failed to add service', 'error')
      } else {
        onToast?.('Service added', 'success')
        closeModal()
        fetchServices()
      }
    }
  }

  const handleDelete = async (service) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id)

    if (error) {
      onToast?.('Failed to delete service', 'error')
    } else {
      onToast?.('Service deleted', 'success')
      fetchServices()
    }
    setConfirm(null)
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="admin-page-title">Services</h2>
          <p className="admin-page-desc">Add, edit or remove services shown on the website</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}>
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          Loading services...
        </div>
      ) : services.length === 0 ? (
        <div className="admin-empty">
          <Layers size={40} />
          <p>No services yet. Add your first one.</p>
        </div>
      ) : (
        <div className="admin-services-grid">
          {services.map((s) => (
            <div key={s.id} className="admin-service-card">
              <div className="admin-service-card-image">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--mist-dim)'
                  }}>
                    <Layers size={32} />
                  </div>
                )}
              </div>

              <div className="admin-service-card-body">
                <div className="admin-service-card-number">#{s.number}</div>
                <h3 className="admin-service-card-title">{s.title}</h3>
                <p className="admin-service-card-desc">{s.description}</p>
                <div className="admin-service-card-actions">
                  <button
                    className="admin-action-btn"
                    title="Edit"
                    onClick={() => openEdit(s)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="admin-action-btn danger"
                    title="Delete"
                    onClick={() => setConfirm(s)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={closeModal}>
              <X size={16} />
            </button>

            <h3 className="admin-modal-title">
              {editing ? 'Edit Service' : 'Add Service'}
            </h3>
            <p className="admin-modal-desc">
              {editing
                ? 'Update the service details below'
                : 'Fill in the details for the new service'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Number</label>
                  <input
                    className="admin-form-input"
                    type="text"
                    value={form.number}
                    onChange={(e) => setForm(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="01"
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

              <div className="admin-form-group">
                <label className="admin-form-label">Title</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Service title"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-input admin-form-textarea"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the service..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Image</label>
                <div className="admin-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Upload size={28} className="admin-upload-icon" />
                  <p className="admin-upload-text">
                    {uploading ? 'Uploading...' : 'Click or drag to upload an image'}
                  </p>
                  <p className="admin-upload-hint">PNG, JPG, WEBP up to 5MB</p>
                </div>

                {preview && (
                  <img src={preview} alt="Preview" className="admin-upload-preview" />
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

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={uploading}>
                  {editing ? 'Save Changes' : 'Add Service'}
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

            <h3 className="admin-modal-title">Delete Service</h3>
            <p className="admin-confirm-text">
              Are you sure you want to delete{' '}
              <span className="admin-confirm-highlight">"{confirm.title}"</span>?
              This action cannot be undone.
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
