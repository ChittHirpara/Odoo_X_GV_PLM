// ============================================================//
//  riskService.js — Smart Risk Analyzer API client            //
//  Calls GET /api/ecos/:id/risk                               //
// ============================================================//
import { secureGet } from '../capacitor/nativeServices';
import { API_BASE_URL } from '../config/api';

/**
 * Fetches risk analysis for a specific ECO.
 * @param {string} ecoId — The ECO ID
 * @returns {Promise<Object>} Risk analysis data
 */
export const analyzeRisk = async (ecoId, token) => {
  try {
    const activeToken = token || await secureGet('token');
    if (!activeToken) throw new Error('No authentication token found');

    const res = await fetch(`${API_BASE_URL}/ecos/${ecoId}/risk`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      }
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Risk analysis failed');
    }
    return data.data;
  } catch (err) {
    console.error('Risk Analysis Error:', err);
    throw err;
  }
};
