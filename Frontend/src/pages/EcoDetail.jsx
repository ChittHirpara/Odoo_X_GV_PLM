import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import DiffView from '../components/ui/DiffView';
import StageProgress from '../components/ui/StageProgress';
import ImageDiffView from '../components/ui/ImageDiffView';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { ArrowLeft, User, Calendar, FileText, Clock, CheckCircle, XCircle, Send, AlertCircle, MessageSquare, ImageIcon, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function EcoDetail() {
  const { id } = useParams();
  const { ecoList, updateEcoStage, rejectEco, reviewEcoImage, canApprove, canEditDraft, currentUser, isReadOnly } = useApp();
  const eco = ecoList.find(e => e.id === id);
  const [comment, setComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [previewImages, setPreviewImages] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (!eco) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-400">ECO not found.</p>
      </div>
    );
  }

  const imageChanges = eco.imageChanges || [];
  const attachedImages = eco.attachedImages || [];
  // Operations users can only see approved image changes
  const visibleImageChanges = isReadOnly
    ? imageChanges.filter(ic => ic.reviewStatus === 'approved')
    : imageChanges;

  const handleSubmitForApproval = () => {
    updateEcoStage(eco.id, 'Approval', comment || 'Submitted for approval review.');
    setComment('');
    setShowConfirm(null);
  };

  const handleApprove = () => {
    updateEcoStage(eco.id, 'Done', comment || 'Approved. Changes applied to production.');
    setComment('');
    setShowConfirm(null);
  };

  const handleReject = () => {
    rejectEco(eco.id, comment || 'Rejected. Changes need revision.');
    setComment('');
    setShowConfirm(null);
  };

  const handleReviewImage = (imageChangeId, status, imageComment) => {
    reviewEcoImage(eco.id, imageChangeId, status, imageComment);
  };

  const handlePreviewImage = (images, index) => {
    setPreviewImages(images);
    setPreviewIndex(index);
  };

  return (
    <div className="space-y-6">
      <Link to="/eco" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <ArrowLeft size={16} /> Back to ECOs
      </Link>

      {/* ECO Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-surface-400">{eco.ecoNumber}</span>
              <StatusBadge status={eco.type} />
              <StatusBadge status={eco.priority} />
              {attachedImages.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-inset ring-indigo-500/20">
                  <Paperclip size={10} /> {attachedImages.length} image{attachedImages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-surface-800">{eco.title}</h1>
          </div>
          <StatusBadge status={eco.stage} size="lg" />
        </div>
        {eco.description && (
          <p className="text-sm text-surface-600 leading-relaxed mb-6">{eco.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <User size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Created By</p>
              <p className="text-sm font-medium text-surface-700">{eco.createdByName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Created</p>
              <p className="text-sm font-medium text-surface-700">{eco.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Effective Date</p>
              <p className="text-sm font-medium text-surface-700">{eco.effectiveDate || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Product</p>
              <Link to={`/products/${eco.productId}`} className="text-sm font-medium text-primary-600 hover:underline">{eco.productName}</Link>
            </div>
          </div>
        </div>

        {eco.versionUpdate && eco.newVersion && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
            <span className="text-xs text-primary-600 font-medium">Version update:</span>
            <span className="text-xs font-bold text-primary-700">→ v{eco.newVersion}</span>
          </div>
        )}
      </motion.div>

      {/* Stage Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-surface-200 p-6">
        <h2 className="text-base font-semibold text-surface-800 mb-6">Approval Workflow</h2>
        <StageProgress currentStage={eco.stage} />
      </motion.div>

      {/* Diff View */}
      {eco.changes && eco.changes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-surface-200 p-6">
          <DiffView changes={eco.changes} />
        </motion.div>
      )}

      {/* Image Changes - Diff View */}
      {visibleImageChanges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl border border-surface-200 p-6">
          <ImageDiffView
            imageChanges={visibleImageChanges}
            canReview={canApprove && eco.stage === 'Approval'}
            onReviewImage={handleReviewImage}
            onPreviewImage={handlePreviewImage}
          />
        </motion.div>
      )}

      {/* Attached Images Gallery (if no image changes but has attachments) */}
      {visibleImageChanges.length === 0 && attachedImages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={16} className="text-surface-400" />
            <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wider">Attached Images</h3>
            <span className="text-xs text-surface-400 font-medium">({attachedImages.length})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {attachedImages.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => handlePreviewImage(attachedImages, idx)}
                className="group relative aspect-square bg-surface-50 rounded-xl border border-surface-200 overflow-hidden cursor-pointer hover:border-primary-300 transition-colors"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Preview</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-[10px] text-white font-medium truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {eco.stage !== 'Done' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-base font-semibold text-surface-800 mb-4">Actions</h2>

          {/* Comment Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Comment (optional)</label>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-3 top-3 text-surface-400" />
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment for the approval log..."
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Submit for Approval (Engineering/Admin, stage is New or In Review) */}
            {canEditDraft && (eco.stage === 'New' || eco.stage === 'In Review') && (
              <button
                onClick={() => setShowConfirm('submit')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Send size={16} /> Submit for Approval
              </button>
            )}

            {/* Approve / Reject (Approver/Admin, stage is Approval) */}
            {canApprove && eco.stage === 'Approval' && (
              <>
                <button
                  onClick={() => setShowConfirm('approve')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 transition-colors shadow-sm"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => setShowConfirm('reject')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-danger-600 text-white text-sm font-medium rounded-lg hover:bg-danger-700 transition-colors shadow-sm"
                >
                  <XCircle size={16} /> Reject
                </button>
              </>
            )}

            {/* No action available info */}
            {!canEditDraft && !canApprove && (
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <AlertCircle size={16} />
                <span>You do not have permission to perform actions on this ECO.</span>
              </div>
            )}
          </div>

          {/* Confirmation Modal Inline */}
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-surface-50 rounded-lg border border-surface-200"
            >
              <p className="text-sm font-medium text-surface-700 mb-3">
                {showConfirm === 'submit' && 'Are you sure you want to submit this ECO for approval?'}
                {showConfirm === 'approve' && 'Are you sure you want to approve this ECO? Changes (including images) will be applied to production.'}
                {showConfirm === 'reject' && 'Are you sure you want to reject this ECO? It will be returned to draft and images will be sent back for revision.'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (showConfirm === 'submit') handleSubmitForApproval();
                    else if (showConfirm === 'approve') handleApprove();
                    else if (showConfirm === 'reject') handleReject();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    showConfirm === 'reject' ? 'bg-danger-600 hover:bg-danger-700' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Approval Logs */}
      {eco.approvalLogs && eco.approvalLogs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="text-base font-semibold text-surface-800">Approval Log</h2>
          </div>
          <div className="px-6 py-4 space-y-0">
            {eco.approvalLogs.map((log, idx) => {
              const isApproved = log.action === 'Approved' || log.action.includes('Applied');
              const isRejected = log.action === 'Rejected';
              return (
                <div key={idx} className="flex gap-3 relative pb-5 last:pb-0">
                  {idx < eco.approvalLogs.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-[2px] h-[calc(100%-12px)] bg-surface-200" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                    isApproved ? 'bg-success-50' : isRejected ? 'bg-danger-50' : 'bg-primary-50'
                  }`}>
                    {isApproved ? <CheckCircle size={14} className="text-success-600" /> :
                     isRejected ? <XCircle size={14} className="text-danger-600" /> :
                     <Send size={14} className="text-primary-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-surface-700">{log.user}</span>
                      <span className={`text-xs font-semibold ${
                        isApproved ? 'text-success-600' : isRejected ? 'text-danger-600' : 'text-primary-600'
                      }`}>{log.action}</span>
                    </div>
                    {log.comment && <p className="text-xs text-surface-500">{log.comment}</p>}
                    <p className="text-xs text-surface-300 mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        images={previewImages || []}
        initialIndex={previewIndex}
        isOpen={!!previewImages}
        onClose={() => setPreviewImages(null)}
      />
    </div>
  );
}
