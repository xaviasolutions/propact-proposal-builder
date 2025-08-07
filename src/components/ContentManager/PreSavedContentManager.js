import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi';
import {
  addPreSavedContent,
  updatePreSavedContent,
  deletePreSavedContent
} from '../../store/slices/preSavedContentSlice';

const PreSavedContentManager = () => {
  const dispatch = useDispatch();
  const preSavedItems = useSelector(state => state.preSavedContent?.items || []);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  const categories = ['Company Info', 'Timeline', 'Legal', 'Technical', 'Pricing', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updatePreSavedContent({ id: editingId, ...formData }));
      setEditingId(null);
    } else {
      dispatch(addPreSavedContent(formData));
      setIsAddingNew(false);
    }
    setFormData({ title: '', content: '', category: '' });
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category
    });
    setEditingId(item.id);
    setIsAddingNew(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      dispatch(deletePreSavedContent(id));
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ title: '', content: '', category: '' });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pre-saved Content</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus size={16} />
          Add New Content
        </button>
      </div>

      {isAddingNew && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Content' : 'Add New Content'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FiSave size={16} />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {preSavedItems && preSavedItems.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                  {item.category}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
            <div className="text-xs text-gray-400 mt-2">
              Created: {item.createdAt}
            </div>
          </div>
        ))}
      </div>

      {(!preSavedItems || preSavedItems.length === 0) && !isAddingNew && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pre-saved content yet.</p>
          <p className="text-gray-400">Click "Add New Content" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default PreSavedContentManager;