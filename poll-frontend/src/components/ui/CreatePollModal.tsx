'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useToastContext } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useCreatePoll } from '@/hooks/usePolls';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePollModal({ isOpen, onClose }: CreatePollModalProps) {
  const createPollMutation = useCreatePoll();
  const { success, error: showError } = useToastContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
  });

  const handleAddOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      showError('Title required', 'Please enter a poll title.');
      return;
    }
    
    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      showError('Options required', 'Please enter at least 2 poll options.');
      return;
    }
    
    try {
      const pollData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        options: validOptions,
      };
      
      await createPollMutation.mutateAsync(pollData);
      
      success('Poll created!', 'Your poll has been successfully created.');
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
      });
      onClose();
    } catch (error) {
      console.error('Error creating poll:', error);
      showError('Failed to create poll', 'There was an error creating your poll. Please try again.');
    }
  };

  const handleClose = () => {
    if (!createPollMutation.isPending) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Poll">
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
            Poll Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What's your question?"
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add more details..."
            rows={2}
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Options * (2-10)
          </label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {formData.options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                className="w-full"
              >
                <Plus className="mr-2 w-4 h-4" />
                Add Option
              </Button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={createPollMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createPollMutation.isPending}>
            {createPollMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Poll'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

