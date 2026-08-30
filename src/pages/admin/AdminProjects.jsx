
import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  FolderKanban,
} from 'lucide-react'

import { supabase } from '../../lib/supabase.js'
import { uploadImage } from '../../lib/cloudinary.js'

export default function AdminProjects({ onToast }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const [confirm, setConfirm] = useState(null)

  const emptyForm = {
    title: '',
    category: 'Printing',
    image: '',
  }

  const [form, setForm] = useState(emptyForm)

  // ============================================
  // FETCH PROJECTS
  // ============================================

  const fetchProjects = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Error fetching projects:',
        error
      )

      onToast?.(
        error.message ||
        'Failed to load projects',
        'error'
      )
    } else {
      setProjects(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // ============================================
  // OPEN ADD
  // ============================================

  const openAdd = () => {
    setEditing(null)

    setForm({
      ...emptyForm,
    })

    setPreview(null)

    setShowModal(true)
  }

  // ============================================
  // OPEN EDIT
  // ============================================

  const openEdit = (project) => {
    setEditing(project)

    setForm({
      title: project.title || '',
      category: project.category || '',
      image: project.image || '',
    })

    setPreview(project.image || null)

    setShowModal(true)
  }

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (uploading) return

    setShowModal(false)

    setEditing(null)

    setForm({
      ...emptyForm,
    })

    setPreview(null)
  }

  // ============================================
  // UPLOAD IMAGE TO CLOUDINARY
  // ============================================

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      onToast?.(
        'Please select a valid image file',
        'error'
      )

      e.target.value = ''
      return
    }

    // Max file size = 5MB
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
      // Upload directly to Cloudinary
      const url = await uploadImage(
        file,
        'projects'
      )

      if (!url) {
        throw new Error(
          'Cloudinary did not return an image URL'
        )
      }

      setForm((prev) => ({
        ...prev,
        image: url,
      }))

      setPreview(url)

      onToast?.(
        'Image uploaded successfully',
        'success'
      )
    } catch (err) {
      console.error(
        'Cloudinary upload error:',
        err
      )

      onToast?.(
        err.message ||
        'Failed to upload image',
        'error'
      )
    } finally {
      setUploading(false)

      // Allow selecting the same image again
      e.target.value = ''
    }
  }

  // ============================================
  // SUBMIT
  // ADD / EDIT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploading) {
      onToast?.(
        'Please wait until the image upload finishes',
        'error'
      )

      return
    }

    const title = form.title.trim()
    const category = form.category.trim()
    const image = form.image.trim()

    // Validate title
    if (!title) {
      onToast?.(
        'Please enter a project title',
        'error'
      )

      return
    }

    // Validate category
    if (!category) {
      onToast?.(
        'Please enter a project category',
        'error'
      )

      return
    }

    // Validate image
    if (!image) {
      onToast?.(
        'Please upload a project image',
        'error'
      )

      return
    }

    // ==========================================
    // EDIT EXISTING PROJECT
    // ==========================================

    if (editing) {
      const { error } = await supabase
        .from('projects')
        .update({
          title: title,
          category: category,
          image: image,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', editing.id)

      if (error) {
        console.error(
          'Update project error:',
          error
        )

        onToast?.(
          error.message ||
          'Failed to update project',
          'error'
        )

        return
      }

      onToast?.(
        'Project updated successfully',
        'success'
      )
    }

    // ==========================================
    // ADD NEW PROJECT
    // ==========================================

    else {
      /**
       * Your database schema:
       *
       * id text NOT NULL
       *
       * Therefore we MUST send an ID.
       */

      const newId = String(Date.now())

      const { error } = await supabase
        .from('projects')
        .insert({
          id: newId,
          title: title,
          category: category,
          image: image,
        })

      if (error) {
        console.error(
          'Insert project error:',
          error
        )

        onToast?.(
          error.message ||
          'Failed to add project',
          'error'
        )

        return
      }

      onToast?.(
        'Project added successfully',
        'success'
      )
    }

    // Close modal
    closeModal()

    // Refresh projects
    await fetchProjects()
  }

  // ============================================
  // DELETE PROJECT
  // ============================================

  const handleDelete = async (project) => {
    if (!project?.id) {
      return
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (error) {
      console.error(
        'Delete project error:',
        error
      )

      onToast?.(
        error.message ||
        'Failed to delete project',
        'error'
      )

      return
    }

    onToast?.(
      'Project deleted successfully',
      'success'
    )

    setConfirm(null)

    await fetchProjects()
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
            Projects (Services 2)
          </h2>

          <p className="admin-page-desc">
            Manage portfolio projects and
            categories
          </p>
        </div>

        <button
          className="admin-btn-add"
          onClick={openAdd}
        >
          <Plus size={16} />

          Add Project
        </button>
      </div>

      {/* ========================================
          PROJECT LIST
      ======================================== */}

      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />

          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="admin-empty">
          <FolderKanban size={40} />

          <p>
            No projects yet. Add your first one.
          </p>
        </div>
      ) : (
        <div className="admin-services-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="admin-service-card"
            >
              {/* IMAGE */}

              <div className="admin-service-card-image">
                <img
                  src={project.image}
                  alt={
                    project.title ||
                    'Project'
                  }
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      'none'
                  }}
                />
              </div>

              {/* BODY */}

              <div className="admin-service-card-body">
                {/* CATEGORY */}

                <div className="admin-service-card-number">
                  {project.category}
                </div>

                {/* TITLE */}

                <h3 className="admin-service-card-title">
                  {project.title}
                </h3>

                {/* ACTIONS */}

                <div
                  className="admin-service-card-actions"
                  style={{
                    marginTop: 16,
                  }}
                >
                  {/* EDIT */}

                  <button
                    className="admin-action-btn"
                    title="Edit"
                    onClick={() =>
                      openEdit(project)
                    }
                  >
                    <Pencil size={15} />
                  </button>

                  {/* DELETE */}

                  <button
                    className="admin-action-btn danger"
                    title="Delete"
                    onClick={() =>
                      setConfirm(project)
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
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
            {/* CLOSE */}

            <button
              className="admin-modal-close"
              onClick={closeModal}
              disabled={uploading}
            >
              <X size={16} />
            </button>

            {/* TITLE */}

            <h3 className="admin-modal-title">
              {editing
                ? 'Edit Project'
                : 'Add Project'}
            </h3>

            <p className="admin-modal-desc">
              {editing
                ? 'Update project details below'
                : 'Fill in the details for the new project'}
            </p>

            <form
              onSubmit={handleSubmit}
            >
              {/* ==================================
                  PROJECT TITLE
              ================================== */}

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Title
                </label>

                <input
                  className="admin-form-input"
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title:
                        e.target.value,
                    }))
                  }
                  placeholder="e.g. Brand Identity Run"
                  required
                />
              </div>

              {/* ==================================
                  CATEGORY
              ================================== */}

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Category
                </label>

                <input
                  className="admin-form-input"
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category:
                        e.target.value,
                    }))
                  }
                  placeholder="e.g. Printing, Branding, Outdoor"
                  required
                />
              </div>

              {/* ==================================
                  IMAGE
              ================================== */}

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Project Image
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
                      : editing
                        ? 'Click to replace image'
                        : 'Click or drag to upload image'}
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
                      marginTop: 12,
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="admin-upload-preview"
                    />
                  </div>
                )}
              </div>

              {/* ==================================
                  BUTTONS
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
                    : editing
                      ? 'Save Changes'
                      : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          DELETE CONFIRMATION
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
            {/* CLOSE */}

            <button
              className="admin-modal-close"
              onClick={() =>
                setConfirm(null)
              }
            >
              <X size={16} />
            </button>

            {/* TITLE */}

            <h3 className="admin-modal-title">
              Delete Project
            </h3>

            {/* MESSAGE */}

            <p className="admin-confirm-text">
              Are you sure you want to delete{' '}
              <span className="admin-confirm-highlight">
                "{confirm.title}"
              </span>
              ?
            </p>

            {/* BUTTONS */}

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
