'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { apiGet } from '@/lib/api-client';
import { GlassCard } from '../shared/GlassCard';
import { GradientButton } from '../shared/GradientButton';

interface Certificate {
  id: string;
  certificate_number: string;
  user_name: string;
  course_id: string;
  course_title: string;
  courseTitle?: string;
  instructor_name: string;
  organization_name: string;
  issued_at: string;
  grade?: string;
}

export function CertificatesPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const res = await apiGet<{ certificates: Certificate[] }>('/api/student/certificates');
        setCertificates(res.certificates || []);
      } catch (err: any) {
        console.error('Failed to fetch certificates:', err);
        setError(err?.message || 'Failed to load certificates');
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDownload = (cert: Certificate) => {
    const certNumber = cert.certificate_number;
    if (certNumber) {
      window.open(`/api/student/certificates/${certNumber}/pdf`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Certificates</h1>
          <p className="text-sm text-muted-foreground">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>
        </div>
      </motion.div>

      {certificates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="relative group">
                {/* Gradient border effect */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500 opacity-50 group-hover:opacity-100 blur-[1px] transition-opacity" />
                <GlassCard className="relative p-5">
                  {/* Certificate header */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Award className="w-5 h-5 text-white" />
                    </motion.div>
                    {cert.grade && (
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Grade: {cert.grade}
                      </span>
                    )}
                  </div>

                  {/* Certificate details */}
                  <h3 className="font-bold text-sm text-foreground mb-1">{cert.courseTitle || cert.course_title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Instructor: {cert.instructor_name}</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <span>{formatDate(cert.issued_at)}</span>
                    <span className="text-muted-foreground/30">|</span>
                    <span className="font-mono text-[10px]">{cert.certificate_number}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <GradientButton size="sm" className="flex-1 text-xs" onClick={() => handleDownload(cert)}>
                      <Download className="w-3 h-3" />
                      Download
                    </GradientButton>
                    <motion.button
                      className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(cert)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">No certificates yet</p>
          <p className="text-sm text-muted-foreground mb-4">Complete courses to earn certificates</p>
          <GradientButton onClick={() => navigate('explore')}>Explore Courses</GradientButton>
        </motion.div>
      )}
    </div>
  );
}
