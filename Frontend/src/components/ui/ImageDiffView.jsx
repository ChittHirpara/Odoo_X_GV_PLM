import { useState } from 'react';
import { Eye, CheckCircle, XCircle, MessageSquare, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const borderColors = {
  added: 'ring-success-400 border-success-300',
  removed: 'ring-danger-400 border-danger-300',
  modified: 'ring-warning-400 border-warning-300',
  pending: 'ring-primary-300 border-primary-200',
};

const labelColors = {
  added: 'bg-success-500 text-white',
  removed: 'bg-danger-500 text-white',
  modified: 'bg-warning-500 text-white',
  pending: 'bg-primary-500 text-white',
};

const labelText = {
  added: 'New Image',
  removed: 'Removed',
  modified: 'Updated',
  pending: 'Pending Review',
};

export default function ImageDiffView({ imageChanges = [], canReview = false, onReviewImage, onPreviewImage }) {
  const [commentingId, setCommentingId] = useState(null);
  const [comment, setComment] = useState('');

  if (imageChanges.length === 0) return null;

  const handleReview = (imgId, status) => {
    if (onReviewImage) onReviewImage(imgId, status, comment);
    setComment('');
    setCommentingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon size={16} className="text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wider">Image Changes</h3>
        <span className="text-xs text-surface-400 font-medium">({imageChanges.length})</span>
      </div>

      <div className="space-y-4">
        {imageChanges.map((change, idx) => (
          <motion.div
            key={change.id || idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-surface-200 overflow-hidden"
          >
            {/* Change Header */}
            <div className="px-5 py-3 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${labelColors[change.changeType] || labelColors.pending}`}>
                  {labelText[change.changeType] || 'Image'}
                </span>
                <span className="text-sm font-medium text-surface-700">{change.label || change.newImage?.name || 'Image'}</span>
              </div>
              {change.reviewStatus && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  change.reviewStatus === 'approved' ? 'bg-success-100 text-success-700' :
                  change.reviewStatus === 'rejected' ? 'bg-danger-100 text-danger-700' :
                  'bg-surface-100 text-surface-500'
                }`}>
                  {change.reviewStatus === 'approved' ? '✓ Approved' : change.reviewStatus === 'rejected' ? '✗ Rejected' : '● Pending'}
                </span>
              )}
            </div>

            {/* Side-by-side Comparison */}
            <div className="grid grid-cols-2 gap-0 divide-x divide-surface-200">
              {/* Old Image */}
              <div className="p-4">
                <p className="text-xs font-semibold text-surface-400 uppercase mb-3">Current Version</p>
                {change.oldImage ? (
                  <div
                    onClick={() => onPreviewImage && onPreviewImage([change.oldImage], 0)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group border-2 ${
                      change.changeType === 'removed' ? 'ring-2 ' + borderColors.removed : 'border-surface-200'
                    }`}
                  >
                    <img src={change.oldImage.url} alt="Current" className="w-full h-full object-cover" />
                    {change.changeType === 'removed' && (
                      <div className="absolute inset-0 bg-danger-500/20 flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-danger-600 text-white text-xs font-bold rounded-full">TO BE REMOVED</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-xl bg-surface-50 border-2 border-dashed border-surface-200 flex items-center justify-center">
                    <span className="text-xs text-surface-300 font-medium">No previous image</span>
                  </div>
                )}
              </div>

              {/* New Image */}
              <div className="p-4">
                <p className="text-xs font-semibold text-surface-400 uppercase mb-3">Proposed Version</p>
                {change.newImage ? (
                  <div
                    onClick={() => onPreviewImage && onPreviewImage([change.newImage], 0)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group border-2 ring-2 ${
                      borderColors[change.changeType] || borderColors.pending
                    }`}
                  >
                    <img src={change.newImage.url} alt="Proposed" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-xl bg-surface-50 border-2 border-dashed border-surface-200 flex items-center justify-center">
                    <span className="text-xs text-surface-300 font-medium">Image will be removed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Review Actions */}
            {canReview && !change.reviewStatus && (
              <div className="px-5 py-3 bg-surface-50 border-t border-surface-100">
                {commentingId === (change.id || idx) ? (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                      <div className="relative">
                        <MessageSquare size={14} className="absolute left-3 top-2.5 text-surface-400" />
                        <input
                          type="text"
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="Add review comment..."
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleReview(change.id || idx, 'approved')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-600 text-white text-xs font-medium rounded-lg hover:bg-success-700 transition-colors">
                          <CheckCircle size={14} /> Approve Image
                        </button>
                        <button onClick={() => handleReview(change.id || idx, 'rejected')} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-danger-600 text-white text-xs font-medium rounded-lg hover:bg-danger-700 transition-colors">
                          <XCircle size={14} /> Reject Image
                        </button>
                        <button onClick={() => { setCommentingId(null); setComment(''); }} className="px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <button
                    onClick={() => setCommentingId(change.id || idx)}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Review this image →
                  </button>
                )}
              </div>
            )}

            {/* Review Feedback */}
            {change.reviewComment && (
              <div className="px-5 py-3 border-t border-surface-100 flex items-start gap-2">
                <MessageSquare size={12} className="text-surface-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-surface-600">{change.reviewedBy || 'Reviewer'}</p>
                  <p className="text-xs text-surface-400">{change.reviewComment}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
