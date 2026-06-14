'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, BookOpen, GraduationCap, Video, Sparkles, Loader2 } from 'lucide-react';
import { useSearchStore, useNavigationStore } from '@/lib/store';
import { aiSearchApi, type AISearchResponse } from '@/lib/api-client';
import { formatDuration } from '@/lib/mock-data';
import { GlassCard } from '../shared/GlassCard';
import { ProgressiveImage } from '@/components/shared/ProgressiveImage';

const TRENDING_SEARCHES = [
  'Web Development',
  'Python',
  'JavaScript',
  'C Programming',
  'Android Development',
  'Database',
  'Networking',
  'Machine Learning',
];

export function SearchPage() {
  const { query, setQuery, recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();
  const navigate = useNavigationStore((s) => s.navigate);

  // Debounce
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // AI Search state
  const [searchResult, setSearchResult] = useState<AISearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const result = await aiSearchApi.search(q.trim());
      setSearchResult(result);
      setAiEnhanced(result.aiEnhanced);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) addRecentSearch(q.trim());
  };

  const courses = searchResult?.courses || [];
  const instructors = searchResult?.instructors || [];
  const videos = searchResult?.videos || [];
  const hasResults = debouncedQuery && !isSearching && (courses.length > 0 || instructors.length > 0 || videos.length > 0);

  return (
    <div>
      {/* Search input */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, instructors, videos..."
          className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg shadow-sky-500/5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all text-base"
          autoFocus
        />
        {/* AI Search indicator */}
        {debouncedQuery && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
            ) : aiEnhanced ? (
              <motion.div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-bold">AI</span>
              </motion.div>
            ) : null}
          </div>
        )}
        {query && (
          <motion.button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center"
            onClick={() => { setQuery(''); setDebouncedQuery(''); setSearchResult(null); }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </motion.div>

      {/* Show recent & trending when no query */}
      {!debouncedQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* AI Search badge */}
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-sky-500/10 border border-violet-500/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">AI-Powered Search</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Smarter results, less typing</span>
          </motion.div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Recent Searches</h3>
                <button onClick={clearRecentSearches} className="text-xs text-sky-500 font-semibold">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <motion.button
                    key={search}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleSearch(search)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Clock className="w-3 h-3" />
                    {search}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <motion.button
                  key={term}
                  className="px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-sm font-semibold"
                  onClick={() => handleSearch(term)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {term}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search results */}
      {debouncedQuery && (
        <div className="space-y-6">
          {/* Loading state */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {/* Results count */}
          {!isSearching && searchResult && (
            <motion.div
              className="flex items-center gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>{searchResult.total} result{searchResult.total !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;</span>
              {aiEnhanced && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 font-semibold">
                  <Sparkles className="w-3 h-3" /> AI Enhanced
                </span>
              )}
            </motion.div>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-500" />
                Courses ({courses.length})
              </h3>
              <div className="space-y-2">
                {courses.slice(0, 5).map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard
                      hover
                      className="p-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate('course-detail', { courseId: course.id })}
                    >
                      <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                        <ProgressiveImage
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full rounded-xl"
                          imgClassName="w-full h-full object-cover"
                          placeholderGradient="from-sky-400 to-blue-600"
                          fallback={<div className="w-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center"><BookOpen className="w-6 h-6 text-white/50" /></div>}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{course.title}</h4>
                        <p className="text-xs text-muted-foreground">{course.level} {course.tags ? `• ${course.tags}` : ''}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Instructors */}
          {instructors.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                Instructors ({instructors.length})
              </h3>
              <div className="space-y-2">
                {instructors.slice(0, 5).map((inst, i) => (
                  <motion.div
                    key={inst.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard
                      hover
                      className="p-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate('instructor-profile', { instructorId: inst.id })}
                    >
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                        <ProgressiveImage
                          src={inst.avatar_url}
                          alt={inst.name}
                          className="w-full h-full rounded-full"
                          imgClassName="w-full h-full object-cover"
                          placeholderGradient="from-emerald-400 to-teal-600"
                          fallback={<div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold">{inst.name.charAt(0)}</div>}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground">{inst.name}</h4>
                        <p className="text-xs text-muted-foreground">{inst.specialization}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                Videos ({videos.length})
              </h3>
              <div className="space-y-2">
                {videos.slice(0, 5).map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard
                      hover
                      className="p-3 flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate('video-player', { videoId: video.id, courseId: video.course_id })}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {video.course_title} • {formatDuration(video.duration)}
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!isSearching && !hasResults && debouncedQuery && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No results for &quot;{debouncedQuery}&quot;</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
