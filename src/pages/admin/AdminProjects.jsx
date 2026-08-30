import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Upload, X, FolderKanban } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function AdminProjects({ onToast }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const emptyForm = { title: '', category: 'Printing', image: '' }
  const [form, setForm] = useState(emptyForm)

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      onToast?.('Failed to load projects', 'error')
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setPreview(null)
    setShowModal(true)
  }

  const openEdit = (project) => {
    setEditing(project)
    setForm({
      title: project.title,
      category: project.category,
      image: project.image,
    })
    setPreview(project.image)
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

    const ext = file.name.split('.').pop()
    const fileName = `projects/${Date.now()}.${ext}`

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

    setForm(prev => ({ ...prev, image: urlData.publicUrl }))
    setPreview(urlData.publicUrl)
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title || !form.image) {
      onToast?.('Please enter a title and upload an image', 'error')
      return
    }

    if (editing) {
      const { error } = await supabase
        .from('projects')
        .update({
          title: form.title,
          category: form.category,
          image: form.image,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editing.id)

      if (error) {
        onToast?.('Failed to update project', 'error')
      } else {
        onToast?.('Project updated', 'success')
        closeModal()
        fetchProjects()
      }
    } else {
      const newId = String(Date.now())
      const { error } = await supabase
        .from('projects')
        .insert({
          id: newId,
          title: form.title,
          category: form.category,
          image: form.image,
        })

      if (error) {
        onToast?.('Failed to add project', 'error')
      } else {
        onToast?.('Project added', 'success')
        closeModal()
        fetchProjects()
      }
    }
  }

  const handleDelete = async (project) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (error) {
      onToast?.('Failed to delete project', 'error')
    } else {
      onToast?.('Project deleted', 'success')
      fetchProjects()
    }
    setConfirm(null)
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h2 className="admin-page-title">Projects (Services 2)</h2>
          <p className="admin-page-desc">Manage portfolio projects and categories</p>
        </div>
        <button className="admin-btn-add" onClick={openAdd}>
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="admin-empty">
          <FolderKanban size={40} />
          <p>No projects yet. Add your first one.</p>
        </div>
      ) : (
        <div className="admin-services-grid">
          {projects.map((p) => (
            <div key={p.id} className="admin-service-card">
              <div className="admin-service-card-image">
                <img src={p.image} alt={p.title} />
              </div>

              <div className="admin-service-card-body">
                <div className="admin-service-card-number">{p.category}</div>
                <h3 className="admin-service-card-title">{p.title}</h3>
                <div className="admin-service-card-actions" style={{ marginTop: 16 }}>
                  <button
                    className="admin-action-btn"
                    title="Edit"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="admin-action-btn danger"
                    title="Delete"
                    onClick={() => setConfirm(p)}
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
              {editing ? 'Edit Project' : 'Add Project'}
            </h3>
            <p className="admin-modal-desc">
              {editing ? 'Update project details below' : 'Fill in the details for the new project'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Title</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Brand Identity Run"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Category</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Printing, Branding, Outdoor"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Project Image</label>
                <div className="admin-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Upload size={28} className="admin-upload-icon" />
                  <p className="admin-upload-text">
                    {uploading ? 'Uploading...' : 'Click or drag to upload image'}
                  </p>
                  <p className="admin-upload-hint">PNG, JPG, WEBP up to 5MB</p>
                </div>

                {preview && (
                  <img src={preview} alt="Preview" className="admin-upload-preview" />
                )}

                <input
                  className="admin-form-input"
                  type="text"
                  value={form.image}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, image: e.target.value }))
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
                  {editing ? 'Save Changes' : 'Add Project'}
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

            <h3 className="admin-modal-title">Delete Project</h3>
            <p className="admin-confirm-text">
              Are you sure you want to delete{' '}
              <span className="admin-confirm-highlight">"{confirm.title}"</span>?
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
