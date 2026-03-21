// ============================================================//
//  EcoDetail.jsx — MOST COMPLEX PAGE                          //
//  Shows ECO header, stage progress, diff view,               //
//  image changes, approve/reject buttons, approval logs       //
// ============================================================//
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/ui/StatusBadge';
import DiffView from '../components/ui/DiffView';
import StageProgress from '../components/ui/StageProgress';
import ImageDiffView from '../components/ui/ImageDiffView';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import ImpactPredictor from '../components/ECO/ImpactPredictor';
import SLATimer from '../components/ECO/SLATimer';
import ExportPDFButton from '../components/ECO/ExportPDFButton';
import RiskAnalyzer from '../components/ECO/RiskAnalyzer';
import QRCodeModal from '../components/ECO/QRCodeModal';
import { ArrowLeft, User, Calendar, FileText, Clock, CheckCircle, XCircle, Send, AlertCircle, MessageSquare, ImageIcon, Paperclip, History, Image, Download, Hash, ChevronRight, X, ExternalLink, QrCode } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { secureGet } from '../capacitor/nativeServices';
import { useTranslation } from 'react-i18next';

export default function EcoDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { ecoList, updateEcoStage, rejectEco, reviewEcoImage, canApprove, canEditDraft, currentUser, isReadOnly } = useApp();
  const eco = ecoList.find(e => e?.id === id || e?._id === id);
  const [comment, setComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [previewImages, setPreviewImages] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [slaData, setSlaData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSla = async () => {
      try {
        const token = await secureGet('token');
        const res = await fetch(`${API_BASE_URL}/ecos/sla/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && isMounted) {
          const match = json.data.find(d => d?.ecoId === eco?.id || d?.ecoId === eco?._id);
          if (match) setSlaData(match);
        }
      } catch (err) { }
    };
    if (eco) fetchSla();
    return () => { isMounted = false; };
  }, [eco?.id]);

  if (!eco) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-surface-400">{t('eco.not_found')}</p>
      </div>
    );
  }

  const imageChanges = eco.imageChanges || [];
  const attachedImages = eco.attachedImages || [];
  // Operations users can only see approved image changes
  const visibleImageChanges = isReadOnly
    ? imageChanges.filter(ic => ic.reviewStatus === 'approved')
    : imageChanges;

  // ==========================================//
  //  SUBMIT — Sends ECO to approval stage     //
  // ==========================================//
  const handleSubmitForApproval = () => {
    updateEcoStage(eco.id, 'Approval', comment || t('eco.submitted_for_approval'));
    setComment('');
    setShowConfirm(null);
  };

  // ==========================================//
  //  APPROVE — Moves ECO to 'Done' stage      //
  // ==========================================//
  const handleApprove = () => {
    updateEcoStage(eco.id, 'Done', comment || t('eco.approved_changes_applied'));
    setComment('');
    setShowConfirm(null);
  };

  // ==========================================//
  //  REJECT — Resets ECO back to 'New'        //
  // ==========================================//
  const handleReject = () => {
    rejectEco(eco.id, comment || t('eco.rejected_changes_revision'));
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
        <ArrowLeft size={16} /> {t('actions.back_to_ecos')}
      </Link>

      {/* ECO Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-6 mb-4">
          <div className="w-full">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="text-sm font-mono text-surface-400">{eco.ecoNumber || eco.eco_number}</span>
              <StatusBadge status={eco.type} />
              <StatusBadge status={eco.priority} />
              {attachedImages.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-inset ring-indigo-500/20">
                  <Paperclip size={10} /> {attachedImages.length} {attachedImages.length !== 1 ? t('eco.images') : t('eco.image')}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-surface-800 break-words">{eco.title}</h1>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <StatusBadge status={eco.stage} size="lg" />
            <div className="flex items-center gap-2">
              <QRCodeModal eco={eco} />
              <ExportPDFButton eco={eco} />
            </div>
          </div>
        </div>
        {eco.description && (
          <p className="text-sm text-surface-600 leading-relaxed mb-6">{eco.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <User size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">{t('eco.created_by')}</p>
              <p className="text-sm font-medium text-surface-700">{eco.createdByName || eco.creator_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">{t('eco.created')}</p>
              <p className="text-sm font-medium text-surface-700">{eco.createdAt || eco.created_at}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">{t('eco.effective_date')}</p>
              <p className="text-sm font-medium text-surface-700">{eco.effectiveDate || eco.effective_date || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">{t('eco.product')}</p>
              <Link to={`/products/${eco.productId || eco.product_id}`} className="text-sm font-medium text-primary-600 hover:underline">{eco.productName}</Link>
            </div>
          </div>
        </div>

        {eco.versionUpdate && eco.newVersion && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
            <span className="text-xs text-primary-600 font-medium">{t('eco.version_update')}</span>
            <span className="text-xs font-bold text-primary-700">→ v{eco.newVersion}</span>
          </div>
        )}
      </motion.div>

      {/* SLA Timer detail view */}
      {slaData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SLATimer
            enteredAt={slaData.enteredAt}
            stage={eco.stage}
            slaStatus={slaData.slaStatus}
            percentageUsed={slaData.percentageUsed}
            warnThreshold={slaData.warnThreshold}
            escalateThreshold={slaData.escalateThreshold}
            compact={false}
          />
        </motion.div>
      )}

      {/* Stage Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6">
        <h2 className="text-base font-semibold text-surface-800 mb-6">{t('eco.approval_workflow')}</h2>
        <StageProgress currentStage={eco.stage} />
      </motion.div>

      {/* Diff View */}
      {eco.changes && eco.changes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6">
          <DiffView changes={eco.changes} />
        </motion.div>
      )}

      {/* Image Changes - Diff View */}
      {visibleImageChanges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6">
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={16} className="text-surface-400" />
            <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wider">{t('eco.attached_images')}</h3>
            <span className="text-xs text-surface-400 font-medium">({attachedImages.length})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {attachedImages.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => handlePreviewImage(attachedImages, idx)}
                className="group relative aspect-square bg-surface-50 rounded-xl border border-surface-200 overflow-hidden cursor-pointer hover:border-primary-300 transition-colors flex items-center justify-center"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/logo.svg'; e.target.className = 'w-1/2 h-1/2 object-contain opacity-20'; }} loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{t('actions.preview')}</span>
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
      {/* ======================================== */}
      {/* ACTION BUTTONS — Role + Stage gated       */}
      {/* Engineer: Submit | Approver: Approve/Reject */}
      {/* ======================================== */}
      {!isReadOnly && eco.stage !== 'Done' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6">
          <h2 className="text-base font-semibold text-surface-800 mb-4">{t('eco.actions', 'Actions')}</h2>

          {/* Comment Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-600 mb-1.5">{t('eco.comment_optional', 'Comment (optional)')}</label>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-3 top-3 text-surface-400" />
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t('eco.comment_ph', 'Add a comment for the approval log...')}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Submit for Approval (Engineering/Admin, stage is New or In Review) */}
            {canEditDraft && (eco.stage === 'New' || eco.stage === 'In Review') && (
              <button
                onClick={() => setShowConfirm('submit')}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-primary-600 text-white text-base font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Send size={20} /> {t('actions.submit_approval', 'Submit for Approval Review')}
              </button>
            )}

            {/* Impact Predictor (Approver/Admin, stage is active) */}
            {canApprove && !['Done', 'Rejected'].includes(eco.stage) && (
              <ImpactPredictor
                ecoId={eco.id}
                eco={eco}
                onApprove={() => setShowConfirm('approve')}
                onReject={() => setShowConfirm('reject')}
              />
            )}

            {/* Standalone Approve / Reject Buttons — always visible for approvers */}
            {canApprove && !['Done', 'Rejected'].includes(eco.stage) && (
              <>
                {eco.stage === 'Approval' && <RiskAnalyzer ecoId={eco.id || eco._id} />}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-surface-200">
                  <button
                  onClick={() => setShowConfirm('approve')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <CheckCircle size={18} /> {t('actions.approve_eco', 'Approve ECO')}
                </button>
                <button
                  onClick={() => setShowConfirm('reject')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                >
                  <XCircle size={18} /> {t('actions.reject_eco', 'Reject ECO')}
                </button>
              </div>
              </>
            )}

            {/* No action available info */}
            {!canEditDraft && !canApprove && (
              <div className="flex items-center gap-2 text-sm text-surface-400">
                <AlertCircle size={16} />
                <span>{t('eco.no_permission')}</span>
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
                {showConfirm === 'submit' && t('eco.confirm_submit')}
                {showConfirm === 'approve' && t('eco.confirm_approve')}
                {showConfirm === 'reject' && t('eco.confirm_reject')}
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
                  {t('actions.confirm')}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-surface-100 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  {t('actions.cancel')}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Approval Logs */}
      {eco.approvalLogs && eco.approvalLogs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface-100 rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="text-base font-semibold text-surface-800">{t('eco.approval_log', 'Approval Log')}</h2>
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
                      <span className="text-sm font-medium text-surface-700">{log.user_name || log.user}</span>
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
