import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import { 
  Calendar as CalendarIcon, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  GripVertical,
  X,
  Search,
  Eye,
  Trash2,
  Layers,
  List,
  LayoutGrid,
  Smartphone,
  Share2,
  Sparkles,
  ArrowRightLeft,
  Lightbulb
} from 'lucide-react';

// Фирменные векторные иконки брендов
const VkIcon = ({ size = 13, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ flexShrink: 0 }}>
    <path d="M15.684 0H8.316C2.992 0 0 2.992 0 8.316v7.368C0 21.008 2.992 24 8.316 24h7.368C21.008 24 24 21.008 24 15.684V8.316C24 2.992 21.008 0 15.684 0zm3.602 17.135h-1.928c-.73 0-.954-.58-2.27-1.897-1.144-1.12-1.653-1.267-1.936-1.267-.396 0-.51.114-.51.657v1.834c0 .463-.147.673-1.37.673-2.028 0-4.282-1.233-5.868-3.528-2.39-3.41-3.053-5.975-3.053-6.495 0-.284.113-.547.657-.547h1.928c.487 0 .673.226.86.747 1.007 2.923 2.686 5.488 3.376 5.488.26 0 .373-.124.373-.804v-3.14c-.08-1.449-.849-1.573-.849-2.083 0-.238.192-.475.509-.475h3.033c.42 0 .577.227.577.725v3.875c0 .419.18.566.306.566.26 0 .475-.147.962-.634 1.494-1.675 2.56-4.27 2.56-4.27.136-.283.373-.463.86-.463h1.928c.577 0 .702.295.577.725-.238.996-2.31 3.96-2.424 4.14-.328.487-.453.713 0 1.29 1.052 1.347 2.402 3.195 2.685 4.316.204.691-.125 1.099-.837 1.099z"/>
  </svg>
);

const PineIcon = ({ size = 13, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L6 11h3.5L4 18h16l-5.5-7H18L12 2z"/>
    <path d="M12 18v4"/>
  </svg>
);

const TeaLeafIcon = ({ size = 13, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 4 13c0-4 4-8 8-9 4 1 8 5 8 9a7 7 0 0 1-7 7z"/>
    <path d="M12 4v16"/>
  </svg>
);

// СЛОВАРЬ СТАТУСОВ ПУБЛИКАЦИЙ
const POST_STATUSES = {
  planned: {
    id: 'planned',
    label: 'В плане',
    badge: '📝 В плане',
    short: '📝 В плане',
    color: '#524b42',
    bg: '#f5f2eb',
    border: '#dcd5ca'
  },
  review: {
    id: 'review',
    label: 'На обсуждении',
    badge: '💬 На обсуждении',
    short: '💬 Обсуждение',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d'
  },
  field_trip: {
    id: 'field_trip',
    label: 'Выезд / Локация',
    badge: '🚗 Выезд',
    short: '🚗 Выезд',
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#7dd3fc'
  },
  shooting: {
    id: 'shooting',
    label: 'Съёмка контента',
    badge: '📸 Съёмка',
    short: '📸 Съёмка',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc'
  },
  in_progress: {
    id: 'in_progress',
    label: 'В работе (текст / визуал)',
    badge: '🎨 В работе',
    short: '🎨 В работе',
    color: '#6d28d9',
    bg: '#f3e8ff',
    border: '#d8b4fe'
  },
  approved: {
    id: 'approved',
    label: 'Утверждён',
    badge: '✨ Утверждён',
    short: '✨ Утверждён',
    color: '#15803d',
    bg: '#dcfce7',
    border: '#86efac'
  },
  draft: {
    id: 'draft',
    label: 'Черновик в ВК готов',
    badge: '⏳ Черновик в ВК',
    short: '⏳ Черновик',
    color: '#0077ff',
    bg: '#e8f2ff',
    border: '#bae6fd'
  },
  draft_vk: {
    id: 'draft',
    label: 'Черновик в ВК готов',
    badge: '⏳ Черновик в ВК',
    short: '⏳ Черновик',
    color: '#0077ff',
    bg: '#e8f2ff',
    border: '#bae6fd'
  },
  published: {
    id: 'published',
    label: 'Опубликован',
    badge: '✅ Опубликован',
    short: '✅ Вышел',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0'
  },
  idea: {
    id: 'idea',
    label: 'Идея (без даты)',
    badge: '💡 Идея',
    short: '💡 Идея',
    color: '#b45309',
    bg: '#fef9c3',
    border: '#fde047'
  },
  paused: {
    id: 'paused',
    label: 'Отложен / В архив',
    badge: '⏸️ Отложен',
    short: '⏸️ Отложен',
    color: '#4b5563',
    bg: '#f3f4f6',
    border: '#d1d5db'
  }
};

const getStatusInfo = (statusKey) => {
  return POST_STATUSES[statusKey] || POST_STATUSES.planned;
};

export default function App() {
  const [posts, setPosts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [showPwaTip, setShowPwaTip] = useState(true);
  
  // Колонка идей для постов (бэклог тем без даты)
  const [showIdeasSidebar, setShowIdeasSidebar] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 1024));
  const [ideasFilter, setIdeasFilter] = useState('all');
  const [dragOverIdeas, setDragOverIdeas] = useState(false);
  
  // Режим отображения: 'calendar' (сетка месяца) или 'feed' (лента по дням для мобильных)
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 820 ? 'feed' : 'calendar'));
  const [selectedWeek, setSelectedWeek] = useState('all');

  // Текущий месяц (по умолчанию Октябрь 2026, 9 в JS 0-indexed)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  // Выбранный день в сетке для мобильного инспектора
  const [selectedGridDate, setSelectedGridDate] = useState('2026-10-01');
  
  // Состояние авторизации
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Drag and Drop
  const [draggedPostId, setDraggedPostId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  // Модальные окна постов
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewPost, setIsNewPost] = useState(false);
  const [modalForm, setModalForm] = useState({
    title: '',
    date: '2026-10-01',
    time: '10:30',
    project: 'fair',
    status: 'planned',
    vk_draft_url: '',
    meaning: '',
    visual: '',
    cta: ''
  });

  // Модальные окна условных дат и вех (ярмарки, праздники 🍎/🎪)
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isNewMilestone, setIsNewMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    summary: '',
    date_start: '2026-10-01',
    date_end: '2026-10-01',
    color: '#c65328',
    description: ''
  });

  // Защита модалок от случайного закрытия при выделении текста мышью
  const authBackdropMouseDownRef = useRef(false);
  const editBackdropMouseDownRef = useRef(false);
  const milestoneBackdropMouseDownRef = useRef(false);
  const rescheduleBackdropMouseDownRef = useRef(false);

  // Touch Drag & Drop для мобильных устройств
  const [touchDraggingPost, setTouchDraggingPost] = useState(null);
  const [touchGhostPos, setTouchGhostPos] = useState({ x: 0, y: 0 });
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const isTouchDraggingRef = useRef(false);

  // Быстрый перенос даты публикации в 1 клик для смартфонов
  const [reschedulePost, setReschedulePost] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-10-01');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Загрузка постов
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Ошибка загрузки публикаций:', err.message);
    }
  };

  // Загрузка вех
  const fetchMilestones = async () => {
    try {
      const { data } = await supabase.from('milestones').select('*');
      setMilestones(data || []);
    } catch (err) {
      console.error('Ошибка загрузки вех:', err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchMilestones();

    // Проверка текущей сессии
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) setEditMode(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) setEditMode(true);
      else setEditMode(false);
    });

    // Realtime подписка на посты и вехи
    const channel = supabase
      .channel('public:calendar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => {
        fetchMilestones();
      })
      .subscribe();

    // Обработка печати в PDF: автоматическое переключение в полную сетку месяца
    const handleBeforePrint = () => {
      setViewMode('calendar');
    };
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);

  // АВТОРИЗАЦИЯ
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword
      });
      if (error) throw error;

      setIsAuthModalOpen(false);
      setAuthPassword('');
      showToast('🎉 Режим редактирования активирован');
    } catch (err) {
      setAuthError(err.message === 'Invalid login credentials' ? 'Неверный email или пароль' : err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEditMode(false);
    showToast('Вы перешли в режим просмотра');
  };

  // УНИВЕРСАЛЬНЫЙ ПЕРЕНОС ПУБЛИКАЦИИ НА НОВУЮ ДАТУ (СИНХРОНИЗАЦИЯ С SUPABASE)
  const movePostToDate = async (postId, targetDateStr) => {
    if (!postId || !targetDateStr) return;
    const movingPost = posts.find(p => p.id === postId);
    if (movingPost && movingPost.date === targetDateStr) return;

    // Если пост был идеей (status === 'idea'), то при переносе на дату статус переводим в 'planned'
    const newStatus = (movingPost && movingPost.status === 'idea') ? 'planned' : (movingPost?.status || 'planned');

    // Оптимистичное локальное обновление UI
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, date: targetDateStr, status: newStatus } : p));

    const dateFormatted = new Date(targetDateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    showToast(`📍 Публикация перенесена на ${dateFormatted}`);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch (_) {}
    }

    // Запись в Supabase
    const { error } = await supabase
      .from('posts')
      .update({ date: targetDateStr, status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) {
      console.error('Ошибка сохранения переноса:', error);
      fetchPosts();
      showToast('⚠️ Ошибка сохранения переноса');
    }
  };

  // ПЕРЕНОС ПУБЛИКАЦИИ В БАНК ИДЕЙ (СНЯТИЕ С ДАТЫ)
  const movePostToIdeas = async (postId) => {
    if (!postId) return;
    const movingPost = posts.find(p => p.id === postId);
    if (movingPost && movingPost.status === 'idea' && !movingPost.date) return;

    // Оптимистичное обновление UI
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, date: null, status: 'idea' } : p));
    showToast(`💡 Пост перенесён в Банк идей`);

    const { error } = await supabase
      .from('posts')
      .update({ date: null, status: 'idea', updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) {
      console.error('Ошибка переноса в идеи:', error);
      fetchPosts();
      showToast('⚠️ Ошибка переноса в идеи');
    }
  };

  // DRAG AND DROP (МЫШЬ / ДЕСКТОП)
  const handleDragStart = (e, post) => {
    if (!editMode) return;
    e.dataTransfer.setData('text/plain', post.id);
    setDraggedPostId(post.id);
  };

  const handleDragOver = (e, dateStr) => {
    if (!editMode) return;
    e.preventDefault();
    setDragOverDate(dateStr);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e, targetDateStr) => {
    if (!editMode) return;
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain') || draggedPostId;
    setDragOverDate(null);
    setDraggedPostId(null);
    if (postId) {
      await movePostToDate(postId, targetDateStr);
    }
  };

  const handleDropToIdeas = async (e) => {
    if (!editMode) return;
    e.preventDefault();
    setDragOverIdeas(false);
    const postId = e.dataTransfer.getData('text/plain') || draggedPostId;
    setDraggedPostId(null);
    if (postId) {
      await movePostToIdeas(postId);
    }
  };

  // TOUCH DRAG & DROP (ТАЧСКРИН / СМАРТФОНЫ И ПЛАНШЕТЫ)
  const handleTouchStart = (e, post) => {
    if (!editMode) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    isTouchDraggingRef.current = false;
    setTouchDraggingPost(post);
    setTouchGhostPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!touchDraggingPost || !editMode) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

    // Активируем перетаскивание только если смещение больше 8px (защита от случайного скролла)
    if (!isTouchDraggingRef.current && (dx > 8 || dy > 8)) {
      isTouchDraggingRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(25); } catch (_) {}
      }
    }

    if (isTouchDraggingRef.current) {
      setTouchGhostPos({ x: touch.clientX, y: touch.clientY });

      // Находим ячейку дня календаря под пальцем
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetDayElem = elem?.closest('[data-date]');
      const targetDate = targetDayElem?.getAttribute('data-date') || null;
      setDragOverDate(targetDate);
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchDraggingPost) return;
    const wasDragging = isTouchDraggingRef.current;
    const postToMove = touchDraggingPost;
    const touch = e.changedTouches ? e.changedTouches[0] : null;

    let targetDate = null;
    if (touch) {
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetDayElem = elem?.closest('[data-date]');
      targetDate = targetDayElem?.getAttribute('data-date') || null;
    }

    setTouchDraggingPost(null);
    isTouchDraggingRef.current = false;
    setDragOverDate(null);

    if (wasDragging && targetDate && postToMove) {
      movePostToDate(postToMove.id, targetDate);
    }
  };

  // БЫСТРЫЙ ПЕРЕНОС ДАТЫ В 1 КЛИК ДЛЯ СМАРТФОНОВ
  const openRescheduleModal = (post) => {
    if (!editMode) return;
    setReschedulePost(post);
    setRescheduleDate(post.date || '2026-10-01');
  };

  const confirmReschedule = async (e) => {
    e.preventDefault();
    if (!reschedulePost || !rescheduleDate) return;
    const postToMove = reschedulePost;
    setReschedulePost(null);
    await movePostToDate(postToMove.id, rescheduleDate);
  };

  // ПЕЧАТЬ И ВЫГРУЗКА В PDF
  const handlePrint = () => {
    if (viewMode !== 'calendar') {
      setViewMode('calendar');
      setTimeout(() => {
        window.print();
      }, 250);
    } else {
      window.print();
    }
  };

  // ОТКРЫТИЕ ПОСТА
  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsNewPost(false);
    setModalForm({
      title: post.title || '',
      date: post.date || '',
      time: post.time || '10:30',
      project: post.project || 'fair',
      status: post.status || (post.date ? 'planned' : 'idea'),
      vk_draft_url: post.vk_draft_url || '',
      meaning: post.meaning || '',
      visual: post.visual || '',
      cta: post.cta || ''
    });
    setIsEditModalOpen(true);
  };

  // СОЗДАНИЕ ПОСТА
  const openNewPostModal = (dayDateStr) => {
    if (!editMode) return;
    setSelectedPost(null);
    setIsNewPost(true);
    setModalForm({
      title: '',
      date: dayDateStr || '2026-10-01',
      time: '10:30',
      project: 'fair',
      status: 'planned',
      vk_draft_url: '',
      meaning: '',
      visual: '',
      cta: ''
    });
    setIsEditModalOpen(true);
  };

  // СОЗДАНИЕ НОВОЙ ИДЕИ В БЭКЛОГ
  const openNewIdeaModal = (project = 'fair') => {
    if (!editMode) return;
    setSelectedPost(null);
    setIsNewPost(true);
    setModalForm({
      title: '',
      date: '',
      time: '11:00',
      project: project,
      status: 'idea',
      vk_draft_url: '',
      meaning: '',
      visual: '',
      cta: ''
    });
    setIsEditModalOpen(true);
  };

  // СОХРАНЕНИЕ
  const savePostChanges = async (e) => {
    e.preventDefault();
    if (!editMode) return;

    const payload = {
      title: modalForm.title,
      date: modalForm.date && modalForm.date.trim() ? modalForm.date : null,
      time: modalForm.time || '10:30',
      project: modalForm.project,
      status: modalForm.status,
      vk_draft_url: modalForm.vk_draft_url?.trim() || null,
      meaning: modalForm.meaning?.trim() || null,
      visual: modalForm.visual?.trim() || null,
      cta: modalForm.cta?.trim() || null,
      updated_at: new Date().toISOString()
    };

    if (isNewPost) {
      const { error } = await supabase.from('posts').insert([payload]);
      if (error) {
        showToast('⚠️ Ошибка создания: ' + error.message);
      } else {
        showToast('✨ Новая публикация добавлена');
        fetchPosts();
      }
    } else if (selectedPost) {
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, ...payload } : p));
      const { error } = await supabase.from('posts').update(payload).eq('id', selectedPost.id);
      if (error) {
        fetchPosts();
        showToast('⚠️ Ошибка сохранения: ' + error.message);
      } else {
        showToast('💾 Изменения сохранены');
      }
    }

    setIsEditModalOpen(false);
  };

  // УДАЛЕНИЕ ПОСТА
  const deletePost = async () => {
    if (!editMode || !selectedPost) return;
    if (!window.confirm(`Удалить публикацию «${selectedPost.title}»?`)) return;

    setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
    setIsEditModalOpen(false);

    const { error } = await supabase.from('posts').delete().eq('id', selectedPost.id);
    if (error) {
      fetchPosts();
      showToast('⚠️ Ошибка удаления');
    } else {
      showToast('🗑️ Публикация удалена');
    }
  };

  // ВЕХИ И УСЛОВНЫЕ ДАТЫ (ПРАЗДНИКИ, ЯРМАРКИ, СОБЫТИЯ 🍎/🎪)
  const openMilestoneModal = (milestone) => {
    setSelectedMilestone(milestone);
    setIsNewMilestone(false);
    setMilestoneForm({
      summary: milestone.summary || '',
      date_start: milestone.date_start || '2026-10-01',
      date_end: milestone.date_end || milestone.date_start || '2026-10-01',
      color: milestone.color || '#c65328',
      description: milestone.description || ''
    });
    setIsMilestoneModalOpen(true);
  };

  const openNewMilestoneModal = (dayDateStr) => {
    if (!editMode) return;
    const targetDate = dayDateStr || '2026-10-01';
    setSelectedMilestone(null);
    setIsNewMilestone(true);
    setMilestoneForm({
      summary: '🍎 Праздник / Важная дата',
      date_start: targetDate,
      date_end: targetDate,
      color: '#c65328',
      description: ''
    });
    setIsMilestoneModalOpen(true);
  };

  const saveMilestoneChanges = async (e) => {
    e.preventDefault();
    if (!editMode) return;

    if (!milestoneForm.summary.trim()) {
      showToast('⚠️ Укажите название события');
      return;
    }

    const payload = {
      summary: milestoneForm.summary.trim(),
      date_start: milestoneForm.date_start,
      date_end: milestoneForm.date_end || milestoneForm.date_start,
      color: milestoneForm.color || '#c65328',
      description: milestoneForm.description?.trim() || null
    };

    if (isNewMilestone) {
      const { data, error } = await supabase.from('milestones').insert([payload]).select();
      if (error) {
        showToast('⚠️ Ошибка создания: ' + error.message);
      } else {
        showToast('✨ Событие успешно добавлено');
        if (data && data[0]) {
          setMilestones(prev => [...prev, data[0]]);
        }
        fetchMilestones();
      }
    } else if (selectedMilestone) {
      setMilestones(prev => prev.map(m => m.id === selectedMilestone.id ? { ...m, ...payload } : m));
      const { error } = await supabase.from('milestones').update(payload).eq('id', selectedMilestone.id);
      if (error) {
        fetchMilestones();
        showToast('⚠️ Ошибка сохранения: ' + error.message);
      } else {
        showToast('💾 Событие обновлено');
      }
    }

    setIsMilestoneModalOpen(false);
  };

  const deleteMilestone = async () => {
    if (!editMode || !selectedMilestone) return;
    if (!window.confirm(`Удалить событие «${selectedMilestone.summary}»?`)) return;

    const idToDelete = selectedMilestone.id;
    setMilestones(prev => prev.filter(m => m.id !== idToDelete));
    setIsMilestoneModalOpen(false);

    const { error } = await supabase.from('milestones').delete().eq('id', idToDelete);
    if (error) {
      fetchMilestones();
      showToast('⚠️ Ошибка удаления: ' + error.message);
    } else {
      showToast('🗑️ Событие удалено');
    }
  };

  // НАВИГАЦИЯ
  const prevMonth = () => {
    const nextD = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(nextD);
    const mStr = String(nextD.getMonth() + 1).padStart(2, '0');
    setSelectedGridDate(`${nextD.getFullYear()}-${mStr}-01`);
  };
  const nextMonth = () => {
    const nextD = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextD);
    const mStr = String(nextD.getMonth() + 1).padStart(2, '0');
    setSelectedGridDate(`${nextD.getFullYear()}-${mStr}-01`);
  };
  const goToOctober = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedGridDate('2026-10-01');
  };

  // ГЕНЕРАЦИЯ ДНЕЙ МЕСЯЦА
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const totalDays = lastDayOfMonth.getDate();
  const calendarDays = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ date: d, dateStr, isCurrentMonth: false, dayOfWeek: (startDayOfWeek - 1 - i) % 7 });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = (startDayOfWeek + d - 1) % 7;
    calendarDays.push({ date: d, dateStr, isCurrentMonth: true, dayOfWeek });
  }

  const remainingSlots = 7 - (calendarDays.length % 7);
  if (remainingSlots < 7) {
    for (let d = 1; d <= remainingSlots; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      calendarDays.push({ date: d, dateStr, isCurrentMonth: false, dayOfWeek: (calendarDays.length) % 7 });
    }
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Разделение постов: Банк идей (без даты или status === 'idea') и Календарные посты
  const ideaPosts = posts.filter(p => !p.date || p.status === 'idea');
  const calendarPosts = posts.filter(p => p.date && p.status !== 'idea');

  // Фильтрация идей для боковой колонки
  const filteredIdeas = ideaPosts.filter(p => {
    if (ideasFilter !== 'all' && p.project !== ideasFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.meaning?.toLowerCase().includes(q);
    }
    return true;
  });

  // Фильтрация для календаря
  const fairCount = calendarPosts.filter(p => p.project === 'fair').length;
  const teaCount = calendarPosts.filter(p => p.project === 'tea').length;

  const filteredPostsList = calendarPosts.filter(p => {
    if (filter !== 'all' && p.project !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchMeaning = p.meaning?.toLowerCase().includes(q);
      return matchTitle || matchMeaning;
    }
    return true;
  });

  // Проверка постов на текущий отображаемый месяц
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const postsInCurrentMonth = calendarPosts.filter(p => p.date && p.date.startsWith(currentMonthPrefix));

  // Посты и вехи для выбранного дня в мобильной сетке
  const selectedDayPosts = calendarPosts.filter(p => {
    if (p.date !== selectedGridDate) return false;
    if (filter !== 'all' && p.project !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.meaning?.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedDayMilestones = milestones.filter(m => {
    return selectedGridDate >= m.date_start && selectedGridDate <= m.date_end;
  });

  // Свободные дни в Октябре для быстрого заполнения слотов идеями
  const emptyOctoberDays = [
    '2026-10-12', '2026-10-14', '2026-10-15', '2026-10-19', '2026-10-22', '2026-10-23', '2026-10-26', '2026-10-29', '2026-10-30'
  ].filter(d => !calendarPosts.some(p => p.date === d));

  // Группировка для мобильного вида (Feed / Agenda)
  const uniqueDates = [...new Set(calendarPosts.map(p => p.date))].filter(Boolean).sort();
  const feedDates = uniqueDates.filter(d => {
    if (selectedWeek === 'w1') return d >= '2026-09-28' && d <= '2026-10-04';
    if (selectedWeek === 'w2') return d >= '2026-10-05' && d <= '2026-10-11';
    if (selectedWeek === 'w3') return d >= '2026-10-12' && d <= '2026-10-18';
    if (selectedWeek === 'w4') return d >= '2026-10-19' && d <= '2026-10-25';
    if (selectedWeek === 'w5') return d >= '2026-10-26' && d <= '2026-10-31';
    return true;
  });

  return (
    <div className="app-container">

      {/* ТОСТ УВЕДОМЛЕНИЙ */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ШАПКА */}
      <header className="brand-header">
        <div className="header-left">
          <div className="brand-seal" title="Гостинцев двор & Чайная любовь">
            <div className="seal-inner">
              <PineIcon size={16} className="seal-pine" />
              <div className="seal-divider" />
              <TeaLeafIcon size={16} className="seal-tea" />
            </div>
          </div>

          <div className="brand-titles">
            <div className="brand-eyebrow">
              <span className="live-dot" title="Синхронизация активна" />
              <span>Календарь контента ВК • Череповец</span>
            </div>
            <h1 className="brand-heading">
              «Гостинцев двор» <span className="ampersand">&</span> «Чайная любовь»
            </h1>
            <div className="brand-meta">
              <span className="brand-subtitle-craft">План публикаций • Октябрь 2026</span>
            </div>
          </div>
        </div>

        {/* Легенда только для чистого экспорта в PDF и печати */}
        <div className="print-header-legend">
          <span className="legend-item"><span className="legend-dot dot-fair" /> «Гостинцев двор»</span>
          <span className="legend-item"><span className="legend-dot dot-tea" /> «Чайная любовь»</span>
          <span className="legend-item"><span className="legend-dot dot-milestone" /> События и праздники</span>
        </div>

        <div className="header-actions">
          {/* Индикатор статуса доступа (без упоминания конкретных имён) */}
          <div className={`access-pill ${user ? 'mode-team' : 'mode-guest'}`}>
            {user ? (
              <>
                <Unlock size={13} className="access-icon pulse-icon" />
                <span>Режим: <strong>Редактор</strong></span>
              </>
            ) : (
              <>
                <Eye size={13} className="access-icon" />
                <span>Режим: <strong>Просмотр</strong></span>
              </>
            )}
          </div>

          {/* Управление для команды */}
          {user ? (
            <div className="team-controls">
              <button 
                className="btn btn-milestone-action" 
                onClick={() => openNewMilestoneModal(selectedGridDate)} 
                title="Добавить условную дату, праздник или маркет (эмодзи 🍎, 🎪)"
              >
                <Sparkles size={13} />
                <span className="btn-text-desktop">+ Дата / Веха</span>
                <span className="btn-text-mobile">+ Дата</span>
              </button>

              <button 
                className="btn btn-save" 
                onClick={() => openNewPostModal(selectedGridDate)} 
                title="Создать новую публикацию"
              >
                <Plus size={13} />
                <span className="btn-text-desktop">+ Публикация</span>
                <span className="btn-text-mobile">+ Пост</span>
              </button>

              <div 
                className={`toggle-dnd ${editMode ? 'active' : ''}`}
                onClick={() => setEditMode(!editMode)}
                title="Включить / отключить перетаскивание карточек"
              >
                <span className="toggle-label">Drag & Drop</span>
                <div className="switch-track">
                  <div className="switch-thumb" />
                </div>
              </div>

              <button className="btn btn-outline" onClick={handleLogout} title="Выйти из режима редактора">
                Выйти
              </button>
            </div>
          ) : (
            <button className="btn btn-login" onClick={() => setIsAuthModalOpen(true)}>
              <Lock size={13} />
              <span className="btn-text-desktop">Вход для редакторов</span>
              <span className="btn-text-mobile">Вход</span>
            </button>
          )}

          {/* Печать / PDF */}
          <button className="btn btn-print" onClick={handlePrint} title="Распечатать или сохранить чистый PDF">
            <Printer size={13} />
            <span className="btn-text-desktop">Печать / PDF</span>
            <span className="btn-text-mobile">PDF</span>
          </button>
        </div>
      </header>

      {/* ПАНЕЛЬ ПЕРЕКЛЮЧЕНИЯ ВИДА И ФИЛЬТРОВ */}
      <section className="control-bar">
        {/* Переключатель вида (Календарь / Лента по дням для мобильных) */}
        <div className="view-mode-tabs">
          <button 
            className={`view-tab ${viewMode === 'feed' ? 'active' : ''}`}
            onClick={() => setViewMode('feed')}
            title="Список по дням (Удобно для смартфонов)"
          >
            <List size={14} /> <span>По дням</span>
          </button>
          <button 
            className={`view-tab ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            title="Сетка месяца"
          >
            <LayoutGrid size={14} /> <span>Сетка</span>
          </button>
        </div>

        {/* Кнопка Банка идей */}
        <button 
          className={`btn-ideas-toggle ${showIdeasSidebar ? 'active' : ''}`}
          onClick={() => setShowIdeasSidebar(!showIdeasSidebar)}
          title="Открыть / скрыть боковую панель банка идей"
        >
          <Lightbulb size={14} />
          <span>Идеи ({ideaPosts.length})</span>
        </button>

        {/* Селектор месяцев (в режиме календаря) */}
        {viewMode === 'calendar' && (
          <div className="calendar-nav">
            <button className="nav-btn" onClick={prevMonth} title="Предыдущий месяц">
              <ChevronLeft size={16} />
            </button>
            <div className="current-month-display">
              <span className="month-name">{monthNames[month]}</span>
              <span className="year-name">{year}</span>
            </div>
            <button className="nav-btn" onClick={nextMonth} title="Следующий месяц">
              <ChevronRight size={16} />
            </button>
            {month !== 9 && (
              <button className="btn-quick-today" onClick={goToOctober} title="Вернуться к плану Октября">
                Октябрь 2026
              </button>
            )}
          </div>
        )}

        {/* Проектные фильтры-чипы */}
        <div className="project-chips">
          <button 
            className={`chip chip-all ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Layers size={13} /> Все <span className="chip-count">{calendarPosts.length}</span>
          </button>
          <button 
            className={`chip chip-fair ${filter === 'fair' ? 'active' : ''}`}
            onClick={() => setFilter('fair')}
          >
            <PineIcon size={13} /> Ярмарка <span className="chip-count">{fairCount}</span>
          </button>
          <button 
            className={`chip chip-tea ${filter === 'tea' ? 'active' : ''}`}
            onClick={() => setFilter('tea')}
          >
            <TeaLeafIcon size={13} /> Чайная <span className="chip-count">{teaCount}</span>
          </button>
        </div>

        {/* Живой поиск */}
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Поиск по темам..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} title="Очистить поиск">
              <X size={12} />
            </button>
          )}
        </div>
      </section>

      {/* ПЛАШКА АКТИВНОГО ПОИСКА */}
      {searchQuery.trim() && (
        <div className="search-active-banner">
          <span>Результаты поиска «<strong>{searchQuery}</strong>»: найдено публикаций: <strong>{filteredPostsList.length}</strong></span>
          <button className="btn-reset-search" onClick={() => setSearchQuery('')}>Сбросить поиск</button>
        </div>
      )}

      {/* ========================================================
          РЕЖИМ 1: СЕТКА МЕСЯЦА (DESKTOP & ПЛАНШЕТЫ)
          ======================================================== */}
      {viewMode === 'calendar' && (
        <div className={`calendar-workspace ${showIdeasSidebar ? 'has-ideas-sidebar' : ''}`}>
          {/* БОКОВАЯ ПАНЕЛЬ / КОЛОНКА ИДЕЙ */}
          {showIdeasSidebar && (
            <aside 
              className={`ideas-sidebar ${dragOverIdeas ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdeas(true); }}
              onDragLeave={() => setDragOverIdeas(false)}
              onDrop={handleDropToIdeas}
            >
              <div className="ideas-sidebar-header">
                <div className="ideas-title-row">
                  <div className="ideas-badge">
                    <Lightbulb size={16} className="ideas-bulb-icon" />
                    <h2 className="ideas-sidebar-title">Банк идей</h2>
                    <span className="ideas-count-chip">{filteredIdeas.length}</span>
                  </div>
                  <div className="ideas-header-actions">
                    {editMode && (
                      <button 
                        className="btn-add-idea" 
                        onClick={() => openNewIdeaModal(filter === 'tea' ? 'tea' : 'fair')}
                        title="Добавить новую идею в банк"
                      >
                        <Plus size={13} /> Новая
                      </button>
                    )}
                    <button 
                      className="btn-close-ideas" 
                      onClick={() => setShowIdeasSidebar(false)}
                      title="Свернуть колонку идей"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <p className="ideas-sidebar-subtitle">
                  Темы без даты от нейросети и команды. Перетаскивайте мышкой на дни календаря.
                </p>

                {/* Фильтры банка идей */}
                <div className="ideas-filter-chips">
                  <button 
                    className={`ideas-chip ${ideasFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setIdeasFilter('all')}
                  >
                    Все ({ideaPosts.length})
                  </button>
                  <button 
                    className={`ideas-chip ${ideasFilter === 'fair' ? 'active' : ''}`}
                    onClick={() => setIdeasFilter('fair')}
                  >
                    <PineIcon size={11} /> Ярмарка ({ideaPosts.filter(p => p.project === 'fair').length})
                  </button>
                  <button 
                    className={`ideas-chip ${ideasFilter === 'tea' ? 'active' : ''}`}
                    onClick={() => setIdeasFilter('tea')}
                  >
                    <TeaLeafIcon size={11} /> Чайная ({ideaPosts.filter(p => p.project === 'tea').length})
                  </button>
                </div>

                {/* Дроп-зона для возврата постов в идеи */}
                {editMode && (
                  <div className={`ideas-drop-target ${dragOverIdeas ? 'active' : ''}`}>
                    <span>📥 Перетащите пост сюда, чтобы вернуть в банк идей</span>
                  </div>
                )}
              </div>

              {/* Список карточек идей */}
              <div className="ideas-cards-scroll">
                {filteredIdeas.length === 0 ? (
                  <div className="ideas-empty-state">
                    <span>💡 В этой категории пока нет свободных идей.</span>
                    {editMode && (
                      <button className="btn btn-outline" style={{ marginTop: '8px' }} onClick={() => openNewIdeaModal('fair')}>
                        + Создать идею
                      </button>
                    )}
                  </div>
                ) : (
                  filteredIdeas.map(idea => {
                    const isFair = idea.project === 'fair';
                    const statusInfo = getStatusInfo(idea.status);
                    const isDragging = draggedPostId === idea.id;

                    return (
                      <div 
                        key={idea.id}
                        className={`idea-card ${isFair ? 'post-fair' : 'post-tea'} ${isDragging ? 'is-dragged' : ''} ${editMode ? 'can-drag' : ''}`}
                        draggable={editMode}
                        onDragStart={(e) => handleDragStart(e, idea)}
                        onClick={() => openPostModal(idea)}
                      >
                        <div className="idea-card-header">
                          <span className={`project-tag ${isFair ? 'tag-fair' : 'tag-tea'}`}>
                            {isFair ? <><PineIcon size={10} /> Ярмарка</> : <><TeaLeafIcon size={10} /> Чайная</>}
                          </span>
                          <span 
                            className="idea-status-pill"
                            style={{ 
                              color: statusInfo.color,
                              backgroundColor: statusInfo.bg,
                              borderColor: statusInfo.border
                            }}
                          >
                            {statusInfo.short}
                          </span>
                        </div>

                        <h4 className="idea-card-title">{idea.title}</h4>

                        {idea.meaning && (
                          <p className="idea-card-meaning">{idea.meaning}</p>
                        )}

                        <div className="idea-card-footer">
                          {editMode ? (
                            <div className="idea-assign-row">
                              <button 
                                className="btn-assign-slot"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (emptyOctoberDays.length > 0) {
                                    movePostToDate(idea.id, emptyOctoberDays[0]);
                                  } else {
                                    openRescheduleModal(idea);
                                  }
                                }}
                                title={emptyOctoberDays.length > 0 ? `Занять ближайший свободный слот: ${new Date(emptyOctoberDays[0]).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}` : "Назначить дату"}
                              >
                                📅 {emptyOctoberDays.length > 0 ? `В слот ${new Date(emptyOctoberDays[0]).getDate()} окт` : 'В календарь ➔'}
                              </button>

                              <button 
                                className="btn-assign-custom"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRescheduleModal(idea);
                                }}
                                title="Выбрать любую дату"
                              >
                                Выбрать день...
                              </button>
                            </div>
                          ) : (
                            <span className="idea-view-hint">Клик для деталей</span>
                          )}

                          {editMode && (
                            <span 
                              className="drag-handle"
                              onTouchStart={(e) => handleTouchStart(e, idea)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              onClick={(e) => e.stopPropagation()}
                              title="Перетащить на календарь"
                            >
                              <GripVertical size={13} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
          )}

          <main className="calendar-container">
          {/* Предупреждение, если выбран пустой месяц */}
          {postsInCurrentMonth.length === 0 && (
            <div className="empty-month-banner">
              <span>📅 В месяце {monthNames[month]} {year} нет публикаций. Основной утверждённый план составлен на Октябрь 2026 года.</span>
              <button className="btn btn-login" onClick={goToOctober} style={{ marginLeft: '12px', padding: '5px 12px' }}>
                Перейти к Октябрю 2026
              </button>
            </div>
          )}

          {/* Заголовки дней недели */}
          <div className="weekdays-grid">
            <div className="weekday-cell"><span className="weekday-full">Понедельник</span><span className="weekday-short">Пн</span></div>
            <div className="weekday-cell"><span className="weekday-full">Вторник</span><span className="weekday-short">Вт</span></div>
            <div className="weekday-cell"><span className="weekday-full">Среда</span><span className="weekday-short">Ср</span></div>
            <div className="weekday-cell"><span className="weekday-full">Четверг</span><span className="weekday-short">Чт</span></div>
            <div className="weekday-cell"><span className="weekday-full">Пятница</span><span className="weekday-short">Пт</span></div>
            <div className="weekday-cell weekend-cell"><span className="weekday-full">Суббота</span><span className="weekday-short">Сб</span></div>
            <div className="weekday-cell weekend-cell"><span className="weekday-full">Воскресенье</span><span className="weekday-short">Вс</span></div>
          </div>

          {/* Сетка ячеек дней */}
          <div className="calendar-days-grid">
            {calendarDays.map((slot, idx) => {
              const isToday = slot.dateStr === '2026-09-28';
              const isWeekend = slot.dayOfWeek === 5 || slot.dayOfWeek === 6;
              const isHovered = dragOverDate === slot.dateStr;

              // Посты дня с учетом фильтров
              const dayPosts = calendarPosts.filter(p => {
                if (p.date !== slot.dateStr) return false;
                if (filter !== 'all' && p.project !== filter) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  const matchTitle = p.title?.toLowerCase().includes(q);
                  const matchMeaning = p.meaning?.toLowerCase().includes(q);
                  return matchTitle || matchMeaning;
                }
                return true;
              });

              // Праздники и даты ярмарок
              const dayMilestones = milestones.filter(m => {
                return slot.dateStr >= m.date_start && slot.dateStr <= m.date_end;
              });

              return (
                <div 
                  key={idx}
                  data-date={slot.dateStr}
                  className={`day-card ${!slot.isCurrentMonth ? 'outside-month' : ''} ${isWeekend ? 'weekend-day' : ''} ${isToday ? 'is-today' : ''} ${isHovered ? 'drag-target-hover' : ''} ${slot.dateStr === selectedGridDate ? 'is-selected-day' : ''}`}
                  onClick={() => setSelectedGridDate(slot.dateStr)}
                  onDragOver={(e) => handleDragOver(e, slot.dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, slot.dateStr)}
                >
                  {/* Шапочка дня: дата и плюс */}
                  <div className="day-header">
                    <div className="day-number-badge">
                      <span className="day-num">{slot.date}</span>
                      {isToday && <span className="today-craft-label">Сегодня</span>}
                    </div>

                    {editMode && slot.isCurrentMonth && (
                      <button 
                        className="add-post-quick-btn" 
                        onClick={(e) => { e.stopPropagation(); openNewPostModal(slot.dateStr); }}
                        title="Добавить публикацию на этот день"
                      >
                        <Plus size={11} />
                      </button>
                    )}
                  </div>

                  {/* Полоска праздника/вехи отдельной строкой */}
                  {dayMilestones.length > 0 && (
                    <div className="day-milestone-bar">
                      {dayMilestones.map((m) => (
                        <div 
                          key={m.id}
                          className="milestone-ribbon-item" 
                          style={{ backgroundColor: m.color || '#c65328' }}
                          onClick={(e) => { e.stopPropagation(); openMilestoneModal(m); }}
                          title={`${m.summary} (нажмите для подробностей)`}
                        >
                          <span className="ribbon-text">{m.summary}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Мобильные компактные индикаторы для плитки */}
                  <div className="day-mobile-indicators">
                    {dayMilestones.map((m, mIdx) => (
                      <span 
                        key={m.id || `m-${mIdx}`} 
                        className="mobile-milestone-dot" 
                        title={m.summary}
                      >
                        {m.summary?.includes('🎪') ? '🎪' : (m.summary?.includes('🎂') ? '🎂' : (m.summary?.includes('📦') ? '📦' : '🍎'))}
                      </span>
                    ))}
                    {dayPosts.map((post, pIdx) => {
                      const isFair = post.project === 'fair';
                      return (
                        <span 
                          key={post.id || pIdx} 
                          className={`mobile-post-dot ${isFair ? 'dot-fair' : 'dot-tea'}`}
                          title={`${isFair ? 'Ярмарка' : 'Чайная'}: ${post.title}`}
                        >
                          {isFair ? <PineIcon size={9} /> : <TeaLeafIcon size={9} />}
                        </span>
                      );
                    })}
                  </div>

                  {/* Список карточек постов для десктопа (на мобильных скрывается через CSS) */}
                  <div className="posts-stack">
                    {dayPosts.map(post => {
                      const isFair = post.project === 'fair';
                      const isDragging = draggedPostId === post.id;
                      const hasVkLink = Boolean(post.vk_draft_url && post.vk_draft_url.trim());

                      return (
                        <article 
                          key={post.id} 
                          className={`post-card ${isFair ? 'post-fair' : 'post-tea'} ${isDragging ? 'is-dragged' : ''} ${editMode ? 'can-drag' : ''}`}
                          draggable={editMode}
                          onDragStart={(e) => handleDragStart(e, post)}
                          onClick={(e) => { e.stopPropagation(); openPostModal(post); }}
                        >
                          <div className="card-meta">
                            <span className={`project-tag ${isFair ? 'tag-fair' : 'tag-tea'}`}>
                              {isFair ? (
                                <><PineIcon size={10} /> Ярмарка</>
                              ) : (
                                <><TeaLeafIcon size={10} /> Чайная</>
                              )}
                            </span>

                            <span className="card-time">
                              <Clock size={10} /> {post.time || '10:30'}
                            </span>
                          </div>

                          <h4 className="card-title" title={post.title}>
                            {post.title}
                          </h4>

                          <div className="card-footer">
                            {hasVkLink ? (
                              <a 
                                href={post.vk_draft_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="vk-pill-btn"
                                onClick={(e) => e.stopPropagation()}
                                title="Открыть отложенную запись во ВКонтакте"
                              >
                                <VkIcon size={11} />
                                <span>Черновик ВК ↗</span>
                              </a>
                            ) : (
                              <span 
                                className="status-label"
                                style={{
                                  color: getStatusInfo(post.status).color,
                                  backgroundColor: getStatusInfo(post.status).bg,
                                  borderColor: getStatusInfo(post.status).border,
                                  border: `1px solid ${getStatusInfo(post.status).border}`,
                                  borderRadius: '3px',
                                  padding: '1px 5px',
                                  fontSize: '10px',
                                  fontWeight: 600
                                }}
                                title={getStatusInfo(post.status).label}
                              >
                                {getStatusInfo(post.status).short}
                              </span>
                            )}

                            {editMode && (
                              <span 
                                className="drag-handle" 
                                onTouchStart={(e) => handleTouchStart(e, post)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                title="Перетащить на другой день"
                              >
                                <GripVertical size={13} />
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
              ПАНЕЛЬ ВЫБРАННОГО ДНЯ ДЛЯ МОБИЛЬНЫХ (ПОД СЕТКОЙ)
              ======================================================== */}
          <section className="mobile-selected-day-panel">
            <div className="selected-day-header">
              <div className="selected-day-date-info">
                <div className="selected-day-icon-circle">
                  <CalendarIcon size={16} />
                </div>
                <div className="selected-day-texts">
                  <h4 className="selected-day-title">
                    {new Date(selectedGridDate).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h4>
                  <span className="selected-day-subtitle">
                    {selectedDayPosts.length === 0 
                      ? 'Нет публикаций' 
                      : `${selectedDayPosts.length} ${selectedDayPosts.length === 1 ? 'публикация' : (selectedDayPosts.length < 5 ? 'публикации' : 'публикаций')}`}
                  </span>
                </div>
              </div>

              {editMode && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="btn btn-outline"
                    style={{ padding: '5px 8px', fontSize: '11px' }}
                    onClick={() => openNewMilestoneModal(selectedGridDate)}
                    title="Добавить условную дату на этот день"
                  >
                    <Sparkles size={11} /> + Дата
                  </button>
                  <button 
                    className="btn btn-outline"
                    style={{ padding: '5px 8px', fontSize: '11px' }}
                    onClick={() => openNewPostModal(selectedGridDate)}
                    title="Добавить публикацию на этот день"
                  >
                    <Plus size={11} /> + Пост
                  </button>
                </div>
              )}
            </div>

            {/* Праздник или маркет дня */}
            {selectedDayMilestones.length > 0 && (
              <div className="selected-day-milestones-container">
                {selectedDayMilestones.map(m => (
                  <div 
                    key={m.id} 
                    className="selected-day-milestone-card"
                    onClick={() => openMilestoneModal(m)}
                    title="Нажмите для просмотра или редактирования"
                  >
                    <div className="milestone-badge-row">
                      <span 
                        className="milestone-badge"
                        style={{ backgroundColor: m.color || '#c65328' }}
                      >
                        {m.summary}
                      </span>
                      {m.date_start !== m.date_end ? (
                        <span className="milestone-range-tag">
                          {new Date(m.date_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {new Date(m.date_end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </span>
                      ) : (
                        <span className="milestone-range-tag">
                          {new Date(m.date_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span className="milestone-view-action">
                        {editMode ? 'Редактировать ✏️' : 'Подробнее ↗'}
                      </span>
                    </div>
                    {m.description && (
                      <p className="milestone-desc">{m.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Карточки постов на выбранный день */}
            {selectedDayPosts.length > 0 ? (
              <div className="selected-day-posts-list">
                {selectedDayPosts.map(post => {
                  const isFair = post.project === 'fair';
                  const hasVkLink = Boolean(post.vk_draft_url && post.vk_draft_url.trim());

                  return (
                    <div 
                      key={post.id} 
                      className={`selected-day-post-card ${isFair ? 'post-fair' : 'post-tea'}`}
                      onClick={() => openPostModal(post)}
                    >
                      <div className="post-card-meta">
                        <span className={`project-tag ${isFair ? 'tag-fair' : 'tag-tea'}`}>
                          {isFair ? <><PineIcon size={11} /> Гостинцев двор</> : <><TeaLeafIcon size={11} /> Чайная любовь</>}
                        </span>
                        <span className="post-time-badge">
                          <Clock size={11} /> {post.time || '10:30'}
                        </span>
                        <span 
                          className={`status-badge-inline status-${post.status || 'planned'}`}
                          style={{
                            color: getStatusInfo(post.status).color,
                            backgroundColor: getStatusInfo(post.status).bg,
                            borderColor: getStatusInfo(post.status).border,
                            border: `1px solid ${getStatusInfo(post.status).border}`
                          }}
                        >
                          {getStatusInfo(post.status).badge}
                        </span>

                        {editMode && (
                          <div 
                            className="mobile-drag-grip" 
                            onTouchStart={(e) => handleTouchStart(e, post)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onClick={(e) => e.stopPropagation()}
                            title="Зажмите и перетащите на любой день календаря выше"
                          >
                            <GripVertical size={15} />
                            <span className="drag-hint-text">Тяните на дату</span>
                          </div>
                        )}
                      </div>

                      <h5 className="post-card-title">{post.title}</h5>

                      {post.meaning && (
                        <p className="post-card-snippet">{post.meaning}</p>
                      )}

                      <div className="post-card-actions">
                        {editMode && (
                          <button 
                            type="button"
                            className="post-reschedule-btn" 
                            onClick={(e) => { e.stopPropagation(); openRescheduleModal(post); }}
                            title="Быстро перенести публикацию на другую дату"
                          >
                            <ArrowRightLeft size={12} />
                            <span>Перенести</span>
                          </button>
                        )}

                        {hasVkLink ? (
                          <a 
                            href={post.vk_draft_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="post-vk-action-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <VkIcon size={13} /> Черновик ВК ↗
                          </a>
                        ) : (
                          <span className="vk-pending-label">Черновик формируется</span>
                        )}

                        <button className="post-details-btn" onClick={() => openPostModal(post)}>
                          Подробнее →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-day-craft-box">
                <span>✨ В этот день публикаций нет</span>
                <p>Нажмите на любую дату с цветными точками 🌲/🍵 в календаре выше, чтобы посмотреть посты.</p>
              </div>
            )}
          </section>
        </main>
      </div>
      )}

      {/* ========================================================
          РЕЖИМ 2: СПИСОК ПО ДНЯМ (УДОБНО ДЛЯ СМАРТФОНОВ & МИНИ-ВЕБ-ПРИЛОЖЕНИЯ)
          ======================================================== */}
      {viewMode === 'feed' && (
        <div className="feed-container">
          {/* Быстрые фильтры по неделям */}
          <div className="week-filter-strip">
            <button 
              className={`week-pill ${selectedWeek === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('all')}
            >
              Все дни
            </button>
            <button 
              className={`week-pill ${selectedWeek === 'w1' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('w1')}
            >
              <span className="week-badge">1 нед</span> <span>28.09 – 04.10</span>
            </button>
            <button 
              className={`week-pill ${selectedWeek === 'w2' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('w2')}
            >
              <span className="week-badge">2 нед</span> <span>05.10 – 11.10</span>
            </button>
            <button 
              className={`week-pill ${selectedWeek === 'w3' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('w3')}
            >
              <span className="week-badge">3 нед</span> <span>12.10 – 18.10</span>
            </button>
            <button 
              className={`week-pill ${selectedWeek === 'w4' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('w4')}
            >
              <span className="week-badge">4 нед</span> <span>19.10 – 25.10</span>
            </button>
            <button 
              className={`week-pill ${selectedWeek === 'w5' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('w5')}
            >
              <span className="week-badge">5 нед</span> <span>26.10 – 31.10</span>
            </button>
            <button 
              className={`week-pill pill-ideas ${selectedWeek === 'ideas' ? 'active' : ''}`}
              onClick={() => setSelectedWeek('ideas')}
            >
              <span className="week-badge">💡</span> <span>Банк идей ({ideaPosts.length})</span>
            </button>
          </div>

          {/* Режим Банка идей в мобильном списке */}
          {selectedWeek === 'ideas' ? (
            <div className="feed-ideas-container">
              <div className="feed-ideas-header">
                <div>
                  <h3 className="feed-ideas-title">💡 Банк идей для публикаций</h3>
                  <p className="feed-ideas-desc">Темы без назначенной даты. Выбирайте тему и нажимайте «В календарь», чтобы поставить её в свободный день.</p>
                </div>
                {editMode && (
                  <button 
                    className="btn btn-save" 
                    onClick={() => openNewIdeaModal(filter === 'tea' ? 'tea' : 'fair')}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Plus size={13} /> + Новая идея
                  </button>
                )}
              </div>

              {filteredIdeas.length === 0 ? (
                <div className="ideas-empty-state">
                  <span>💡 В банке идей пока пусто.</span>
                  {editMode && (
                    <button className="btn btn-outline" style={{ marginTop: '8px' }} onClick={() => openNewIdeaModal('fair')}>
                      + Создать первую идею
                    </button>
                  )}
                </div>
              ) : (
                <div className="feed-cards-grid">
                  {filteredIdeas.map(idea => {
                    const isFair = idea.project === 'fair';
                    const statusInfo = getStatusInfo(idea.status);

                    return (
                      <div 
                        key={idea.id}
                        className={`feed-post-card idea-feed-card ${isFair ? 'post-fair' : 'post-tea'}`}
                        onClick={() => openPostModal(idea)}
                      >
                        <div className="feed-post-header">
                          <span className={`project-tag ${isFair ? 'tag-fair' : 'tag-tea'}`}>
                            {isFair ? <><PineIcon size={11} /> Гостинцев двор</> : <><TeaLeafIcon size={11} /> Чайная любовь</>}
                          </span>
                          <span 
                            className="feed-planned-badge"
                            style={{
                              color: statusInfo.color,
                              backgroundColor: statusInfo.bg,
                              borderColor: statusInfo.border,
                              border: `1px solid ${statusInfo.border}`
                            }}
                          >
                            {statusInfo.badge}
                          </span>
                        </div>

                        <h3 className="feed-post-title">{idea.title}</h3>

                        {idea.meaning && (
                          <p className="feed-post-meaning">
                            💡 {idea.meaning}
                          </p>
                        )}

                        <div className="feed-post-actions">
                          {editMode && (
                            <button 
                              type="button"
                              className="post-reschedule-btn btn-assign-primary"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (emptyOctoberDays.length > 0) {
                                  movePostToDate(idea.id, emptyOctoberDays[0]);
                                } else {
                                  openRescheduleModal(idea); 
                                }
                              }}
                              title={emptyOctoberDays.length > 0 ? `Занять слот: ${emptyOctoberDays[0]}` : "Выбрать дату"}
                            >
                              <CalendarIcon size={13} />
                              <span>{emptyOctoberDays.length > 0 ? `В слот ${new Date(emptyOctoberDays[0]).getDate()} окт` : 'В календарь ➔'}</span>
                            </button>
                          )}

                          {editMode && (
                            <button 
                              type="button"
                              className="post-reschedule-btn"
                              onClick={(e) => { e.stopPropagation(); openRescheduleModal(idea); }}
                              title="Выбрать другую дату"
                            >
                              <ArrowRightLeft size={13} />
                              <span>Выбрать день...</span>
                            </button>
                          )}

                          <span className="feed-details-hint">
                            Подробнее →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (

          /* Список дней */
          <div className="feed-days-list">
            {feedDates.map(dateStr => {
              const dayPosts = calendarPosts.filter(p => {
                if (p.date !== dateStr) return false;
                if (filter !== 'all' && p.project !== filter) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  return p.title?.toLowerCase().includes(q) || p.meaning?.toLowerCase().includes(q);
                }
                return true;
              });

              if (dayPosts.length === 0) return null;

              const dateObj = new Date(dateStr);
              const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
              const dateFormatted = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
              const isToday = dateStr === '2026-09-28';

              const dayMilestones = milestones.filter(m => dateStr >= m.date_start && dateStr <= m.date_end);

              return (
                <div key={dateStr} className={`feed-day-group ${isToday ? 'is-today-feed' : ''}`}>
                  <div className="feed-day-header">
                    <div className="feed-day-title">
                      <span className="feed-day-name">{dayName}</span>
                      <span className="feed-day-date">{dateFormatted}</span>
                      {isToday && <span className="feed-today-tag">Сегодня</span>}
                    </div>

                    {dayMilestones.length > 0 && (
                      <div className="feed-milestones-list">
                        {dayMilestones.map(m => (
                          <span 
                            key={m.id}
                            className="feed-milestone-tag clickable"
                            style={{ 
                              borderColor: m.color || '#c65328', 
                              color: m.color || '#c65328',
                              backgroundColor: `${m.color || '#c65328'}15`
                            }}
                            onClick={() => openMilestoneModal(m)}
                            title="Нажмите для просмотра подробностей или редактирования"
                          >
                            {m.summary}
                          </span>
                        ))}
                      </div>
                    )}

                    {editMode && (
                      <div className="feed-header-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => openNewMilestoneModal(dateStr)}
                          title="Добавить условную дату на этот день"
                        >
                          <Sparkles size={11} /> + Дата
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => openNewPostModal(dateStr)}
                          title="Добавить публикацию на этот день"
                        >
                          <Plus size={11} /> + Пост
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="feed-cards-grid">
                    {dayPosts.map(post => {
                      const isFair = post.project === 'fair';
                      const hasVkLink = Boolean(post.vk_draft_url && post.vk_draft_url.trim());

                      return (
                        <div 
                          key={post.id}
                          className={`feed-post-card ${isFair ? 'post-fair' : 'post-tea'}`}
                          onClick={() => openPostModal(post)}
                        >
                          <div className="card-top-stripe" />
                          
                          <div className="feed-post-header">
                            <span className={`project-tag ${isFair ? 'tag-fair' : 'tag-tea'}`}>
                              {isFair ? <><PineIcon size={11} /> Гостинцев двор</> : <><TeaLeafIcon size={11} /> Чайная любовь</>}
                            </span>
                            <span className="feed-post-time">
                              <Clock size={12} /> {post.time || '10:30'}
                            </span>
                          </div>

                          <h3 className="feed-post-title">{post.title}</h3>

                          {post.meaning && (
                            <p className="feed-post-meaning">
                              💡 {post.meaning}
                            </p>
                          )}

                          <div className="feed-post-actions">
                            {editMode && (
                              <button 
                                type="button"
                                className="post-reschedule-btn"
                                onClick={(e) => { e.stopPropagation(); openRescheduleModal(post); }}
                                title="Быстро перенести публикацию на другую дату"
                              >
                                <ArrowRightLeft size={13} />
                                <span>Перенести дату</span>
                              </button>
                            )}

                            {hasVkLink ? (
                              <a 
                                href={post.vk_draft_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="feed-vk-btn"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <VkIcon size={14} />
                                <span className="btn-text-desktop">Открыть черновик ВК ↗</span>
                                <span className="btn-text-mobile">Черновик ВК ↗</span>
                              </a>
                            ) : (
                              <span 
                                className="feed-planned-badge"
                                style={{
                                  color: getStatusInfo(post.status).color,
                                  backgroundColor: getStatusInfo(post.status).bg,
                                  borderColor: getStatusInfo(post.status).border,
                                  border: `1px solid ${getStatusInfo(post.status).border}`
                                }}
                              >
                                {getStatusInfo(post.status).badge}
                              </span>
                            )}

                            <span className="feed-details-hint">
                              Подробнее →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* МОБИЛЬНАЯ ПОДСКАЗКА ДЛЯ УСТАНОВКИ ВЕБ-ПРИЛОЖЕНИЯ (PWA) */}
      {showPwaTip && (
        <div className="pwa-install-banner">
          <div className="pwa-tip-content">
            <Smartphone size={16} className="pwa-phone-icon" />
            <span>
              <strong>Удобный доступ с телефона:</strong> добавьте страницу на экран «Домой» (в браузере нажмите «Поделиться» <Share2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> ➔ «На экран Домой»), чтобы открывать календарь как приложение!
            </span>
          </div>
          <button className="pwa-tip-close" onClick={() => setShowPwaTip(false)} title="Скрыть подсказку">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ПЛАВАЮЩИЙ ИНДИКАТОР ПЕРЕТАСКИВАНИЯ (ДЛЯ ТАЧСКРИНА И СМАРТФОНОВ) */}
      {touchDraggingPost && (
        <div 
          className="touch-drag-ghost"
          style={{
            transform: `translate3d(${touchGhostPos.x - 110}px, ${touchGhostPos.y - 65}px, 0)`
          }}
        >
          <div className="ghost-badge">
            <span className="ghost-icon">📍</span>
            <span className="ghost-title">{touchDraggingPost.title}</span>
            {dragOverDate ? (
              <span className="ghost-target">➔ {new Date(dragOverDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
            ) : (
              <span className="ghost-hint">Тяните на день в календаре</span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          МОДАЛЬНОЕ ОКНО: ДЕТАЛИ И РЕДАКТИРОВАНИЕ ПОСТА
          ======================================================== */}
      {isEditModalOpen && (
        <div 
          className="modal-backdrop" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) editBackdropMouseDownRef.current = true;
            else editBackdropMouseDownRef.current = false;
          }}
          onMouseUp={(e) => {
            if (editBackdropMouseDownRef.current && e.target === e.currentTarget) {
              setIsEditModalOpen(false);
            }
            editBackdropMouseDownRef.current = false;
          }}
        >
          <div className="modal-card">
            <div className={`modal-header-banner ${modalForm.project === 'fair' ? 'banner-fair' : 'banner-tea'}`}>
              <div className="modal-header-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span className="modal-category-badge">
                    {modalForm.project === 'fair' ? '🎪 Гостинцев двор (Ярмарка мастеров)' : '🍵 Чайная любовь (Травяные сборы)'}
                  </span>
                  <span 
                    className="modal-status-chip"
                    style={{
                      color: getStatusInfo(modalForm.status).color,
                      backgroundColor: getStatusInfo(modalForm.status).bg,
                      borderColor: getStatusInfo(modalForm.status).border,
                      border: `1px solid ${getStatusInfo(modalForm.status).border}`,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {getStatusInfo(modalForm.status).badge}
                  </span>
                </div>
                <h3 className="modal-title-text">
                  {isNewPost ? (modalForm.status === 'idea' ? 'Новая идея в банк' : 'Новая публикация') : (editMode ? 'Редактирование публикации' : modalForm.title)}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)} title="Закрыть">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={savePostChanges} className="modal-form-body">
              <div className="form-row-2">
                <div className="form-field">
                  <label className="field-label">Дата публикации</label>
                  {editMode ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input 
                        type="date" 
                        className="craft-input" 
                        value={modalForm.date || ''} 
                        onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                        placeholder="Без даты для идеи"
                      />
                      {modalForm.date ? (
                        <button 
                          type="button" 
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          onClick={() => setModalForm(prev => ({ ...prev, date: '', status: 'idea' }))}
                          title="Снять дату и перевести в банк идей"
                        >
                          В идеи 💡
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          onClick={() => setModalForm(prev => ({ ...prev, date: emptyOctoberDays[0] || '2026-10-12', status: 'planned' }))}
                          title="Назначить свободный слот"
                        >
                          + Слот 📅
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="readonly-value">
                      {modalForm.date ? (
                        `📅 ${new Date(modalForm.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      ) : (
                        '💡 Без даты (Банк идей)'
                      )}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label">Время выхода</label>
                  {editMode ? (
                    <input 
                      type="text" 
                      className="craft-input" 
                      value={modalForm.time} 
                      onChange={(e) => setModalForm({ ...modalForm, time: e.target.value })}
                      placeholder="10:30"
                      required
                    />
                  ) : (
                    <div className="readonly-value">⏰ {modalForm.time}</div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="form-field">
                  <label className="field-label">Тема / Заголовок</label>
                  <input 
                    type="text" 
                    className="craft-input font-bold" 
                    value={modalForm.title} 
                    onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                    placeholder="Тема публикации"
                    required
                  />
                </div>
              )}

              {editMode && (
                <div className="form-row-2">
                  <div className="form-field">
                    <label className="field-label">Сообщество</label>
                    <select 
                      className="craft-select"
                      value={modalForm.project}
                      onChange={(e) => setModalForm({ ...modalForm, project: e.target.value })}
                    >
                      <option value="fair">🎪 «Гостинцев двор»</option>
                      <option value="tea">🍵 «Чайная любовь»</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Статус публикации</label>
                    <select 
                      className="craft-select"
                      value={modalForm.status}
                      onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    >
                      <option value="planned">📝 В плане</option>
                      <option value="review">💬 На обсуждении</option>
                      <option value="field_trip">🚗 Выезд / Локация</option>
                      <option value="shooting">📸 Съёмка контента</option>
                      <option value="in_progress">🎨 В работе (текст / визуал)</option>
                      <option value="approved">✨ Утверждён к публикации</option>
                      <option value="draft">⏳ Черновик в ВК готов</option>
                      <option value="published">✅ Опубликован</option>
                      <option value="idea">💡 Идея (в бэклог без даты)</option>
                      <option value="paused">⏸️ Отложен / В архив</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Черновик во ВКонтакте */}
              <div className="form-field highlight-field">
                <label className="field-label label-vk">
                  <VkIcon size={14} /> Ссылка на черновик / отложенный пост во ВКонтакте
                </label>
                {editMode ? (
                  <input 
                    type="url" 
                    placeholder="https://vk.com/..." 
                    className="craft-input" 
                    value={modalForm.vk_draft_url} 
                    onChange={(e) => setModalForm({ ...modalForm, vk_draft_url: e.target.value })}
                  />
                ) : (
                  modalForm.vk_draft_url ? (
                    <a 
                      href={modalForm.vk_draft_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-vk-large"
                    >
                      <VkIcon size={16} />
                      <span>Открыть готовый черновик во ВКонтакте ↗</span>
                    </a>
                  ) : (
                    <div className="no-link-msg">
                      Черновик во ВКонтакте формируется и появится здесь после загрузки в отложку.
                    </div>
                  )
                )}
              </div>

              {/* Смысл и ключевая мысль */}
              <div className="form-field">
                <label className="field-label">💡 Смысл публикации</label>
                {editMode ? (
                  <textarea 
                    className="craft-textarea" 
                    rows={2} 
                    value={modalForm.meaning}
                    onChange={(e) => setModalForm({ ...modalForm, meaning: e.target.value })}
                  />
                ) : (
                  <div className="readonly-box">{modalForm.meaning || 'Информация дополняется...'}</div>
                )}
              </div>

              {/* Визуальное оформление */}
              <div className="form-field">
                <label className="field-label">🖼️ Визуальное оформление и фото</label>
                {editMode ? (
                  <textarea 
                    className="craft-textarea" 
                    rows={2} 
                    value={modalForm.visual}
                    onChange={(e) => setModalForm({ ...modalForm, visual: e.target.value })}
                  />
                ) : (
                  <div className="readonly-box">{modalForm.visual || 'Информация дополняется...'}</div>
                )}
              </div>

              {/* Призыв к действию */}
              <div className="form-field">
                <label className="field-label">🎯 Призыв к действию (CTA)</label>
                {editMode ? (
                  <input 
                    type="text" 
                    className="craft-input" 
                    value={modalForm.cta}
                    onChange={(e) => setModalForm({ ...modalForm, cta: e.target.value })}
                  />
                ) : (
                  <div className="readonly-box">{modalForm.cta || '—'}</div>
                )}
              </div>

              <div className="modal-footer">
                {editMode && !isNewPost && (
                  <button type="button" className="btn-delete" onClick={deletePost}>
                    <Trash2 size={14} /> Удалить пост
                  </button>
                )}

                <div className="footer-right-buttons">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                    Закрыть
                  </button>

                  {editMode && (
                    <button type="submit" className="btn btn-save">
                      <CheckCircle2 size={15} /> Сохранить в базу
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          МОДАЛЬНОЕ ОКНО: ДЕТАЛИ И РЕДАКТИРОВАНИЕ СОБЫТИЯ / ВЕХИ
          ======================================================== */}
      {isMilestoneModalOpen && (
        <div 
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) milestoneBackdropMouseDownRef.current = true;
            else milestoneBackdropMouseDownRef.current = false;
          }}
          onMouseUp={(e) => {
            if (milestoneBackdropMouseDownRef.current && e.target === e.currentTarget) {
              setIsMilestoneModalOpen(false);
            }
            milestoneBackdropMouseDownRef.current = false;
          }}
        >
          <div className="modal-card milestone-modal-card">
            <div 
              className="modal-header-banner"
              style={{ borderTopColor: milestoneForm.color || '#c65328' }}
            >
              <div className="modal-header-info">
                <span className="modal-category-badge" style={{ color: milestoneForm.color || '#c65328' }}>
                  📌 Знаменательная дата / Событие
                </span>
                <h3 className="modal-title-text">
                  {isNewMilestone ? 'Новая условная дата / веха' : (editMode ? 'Редактирование события' : milestoneForm.summary)}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsMilestoneModalOpen(false)} title="Закрыть">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveMilestoneChanges} className="modal-form-body">
              {editMode && (
                <div className="form-field">
                  <label className="field-label">Быстрый выбор темы и иконки:</label>
                  <div className="milestone-preset-chips">
                    <button 
                      type="button" 
                      className="preset-chip"
                      onClick={() => setMilestoneForm(prev => {
                        const clean = prev.summary.replace(/^[^\wа-яА-ЯёЁ]+/, '').trim();
                        return {
                          ...prev, 
                          color: '#c65328', 
                          summary: clean ? `🍎 ${clean}` : '🍎 Праздник / Важная дата'
                        };
                      })}
                    >
                      🍎 Праздник
                    </button>
                    <button 
                      type="button" 
                      className="preset-chip"
                      onClick={() => setMilestoneForm(prev => {
                        const clean = prev.summary.replace(/^[^\wа-яА-ЯёЁ]+/, '').trim();
                        return {
                          ...prev, 
                          color: '#233e2f', 
                          summary: clean ? `🎪 ${clean}` : '🎪 Ярмарка мастеров'
                        };
                      })}
                    >
                      🎪 Ярмарка
                    </button>
                    <button 
                      type="button" 
                      className="preset-chip"
                      onClick={() => setMilestoneForm(prev => {
                        const clean = prev.summary.replace(/^[^\wа-яА-ЯёЁ]+/, '').trim();
                        return {
                          ...prev, 
                          color: '#c88924', 
                          summary: clean ? `🎂 ${clean}` : '🎂 Юбилей / Годовщина'
                        };
                      })}
                    >
                      🎂 Юбилей
                    </button>
                    <button 
                      type="button" 
                      className="preset-chip"
                      onClick={() => setMilestoneForm(prev => {
                        const clean = prev.summary.replace(/^[^\wа-яА-ЯёЁ]+/, '').trim();
                        return {
                          ...prev, 
                          color: '#2563eb', 
                          summary: clean ? `📦 ${clean}` : '📦 Поставка / Дедлайн'
                        };
                      })}
                    >
                      📦 Поставка
                    </button>
                    <button 
                      type="button" 
                      className="preset-chip"
                      onClick={() => setMilestoneForm(prev => {
                        const clean = prev.summary.replace(/^[^\wа-яА-ЯёЁ]+/, '').trim();
                        return {
                          ...prev, 
                          color: '#545b3e', 
                          summary: clean ? `🌿 ${clean}` : '🌿 Травы'
                        };
                      })}
                    >
                      🌿 Травы
                    </button>
                  </div>
                </div>
              )}

              {/* Название события */}
              <div className="form-field">
                <label className="field-label">Название события (с эмодзи)</label>
                {editMode ? (
                  <input 
                    type="text" 
                    className="craft-input font-bold" 
                    value={milestoneForm.summary} 
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, summary: e.target.value })}
                    placeholder="Например: 🍎 День урожая или 🎪 Осенний маркет"
                    required
                  />
                ) : (
                  <div className="readonly-value" style={{ fontSize: '15px', fontWeight: 'bold' }}>
                    {milestoneForm.summary}
                  </div>
                )}
              </div>

              {/* Диапазон дат */}
              <div className="form-row-2">
                <div className="form-field">
                  <label className="field-label">Дата начала</label>
                  {editMode ? (
                    <input 
                      type="date" 
                      className="craft-input" 
                      value={milestoneForm.date_start} 
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setMilestoneForm(prev => ({
                          ...prev,
                          date_start: newStart,
                          date_end: prev.date_end < newStart ? newStart : prev.date_end
                        }));
                      }}
                      required
                    />
                  ) : (
                    <div className="readonly-value">
                      📅 {new Date(milestoneForm.date_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label">Дата окончания</label>
                  {editMode ? (
                    <input 
                      type="date" 
                      className="craft-input" 
                      value={milestoneForm.date_end} 
                      min={milestoneForm.date_start}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, date_end: e.target.value })}
                      required
                    />
                  ) : (
                    <div className="readonly-value">
                      {milestoneForm.date_end && milestoneForm.date_end !== milestoneForm.date_start 
                        ? `📅 ${new Date(milestoneForm.date_end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : 'Однодневное событие'}
                    </div>
                  )}
                </div>
              </div>

              {/* Цвет ленточки */}
              {editMode && (
                <div className="form-field">
                  <label className="field-label">Цвет ленточки в календаре</label>
                  <div className="color-picker-row">
                    <input 
                      type="color" 
                      className="craft-color-input" 
                      value={milestoneForm.color} 
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, color: e.target.value })}
                    />
                    <span className="color-hex-label">{milestoneForm.color}</span>
                    <div className="color-swatches">
                      {['#c65328', '#233e2f', '#c88924', '#2563eb', '#545b3e', '#7c3aed'].map(c => (
                        <button 
                          key={c}
                          type="button" 
                          className={`color-swatch-btn ${milestoneForm.color === c ? 'selected' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setMilestoneForm({ ...milestoneForm, color: c })}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Описание / Подробности */}
              <div className="form-field">
                <label className="field-label">📝 Описание / Заметки к событию</label>
                {editMode ? (
                  <textarea 
                    className="craft-textarea" 
                    rows={3} 
                    value={milestoneForm.description}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                    placeholder="Например: локация проведения, время работы, примечания для постов и продаж..."
                  />
                ) : (
                  <div className="readonly-box">{milestoneForm.description || 'Нет дополнительного описания.'}</div>
                )}
              </div>

              <div className="modal-footer">
                {editMode && !isNewMilestone && (
                  <button type="button" className="btn-delete" onClick={deleteMilestone}>
                    <Trash2 size={14} /> Удалить событие
                  </button>
                )}

                <div className="footer-right-buttons">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsMilestoneModalOpen(false)}>
                    Закрыть
                  </button>

                  {editMode && (
                    <button type="submit" className="btn btn-save">
                      <CheckCircle2 size={15} /> {isNewMilestone ? 'Добавить в календарь' : 'Сохранить изменения'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          МОДАЛЬНОЕ ОКНО: БЫСТРЫЙ ПЕРЕНОС ДАТЫ ПУБЛИКАЦИИ
          ======================================================== */}
      {reschedulePost && (
        <div 
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) rescheduleBackdropMouseDownRef.current = true;
            else rescheduleBackdropMouseDownRef.current = false;
          }}
          onMouseUp={(e) => {
            if (rescheduleBackdropMouseDownRef.current && e.target === e.currentTarget) {
              setReschedulePost(null);
            }
            rescheduleBackdropMouseDownRef.current = false;
          }}
        >
          <div className="modal-card reschedule-modal-card">
            <div className={`modal-header-banner ${reschedulePost.project === 'fair' ? 'banner-fair' : 'banner-tea'}`}>
              <div className="modal-header-info">
                <span className="modal-category-badge">
                  <ArrowRightLeft size={13} /> Быстрый перенос даты
                </span>
                <h3 className="modal-title-text" style={{ fontSize: '18px' }}>
                  {reschedulePost.title}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setReschedulePost(null)} title="Закрыть">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={confirmReschedule} className="modal-form-body">
              <div className="reschedule-current-badge">
                <span>Текущая дата: <strong>{reschedulePost.date ? new Date(reschedulePost.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '💡 Идея в бэклоге (дата не назначена)'}</strong></span>
              </div>

              <div className="form-field">
                <label className="field-label">📅 Новая дата публикации</label>
                <input 
                  type="date"
                  className="craft-input font-bold"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                />
              </div>

              {/* Быстрые кнопки сдвига */}
              <div className="form-field">
                <label className="field-label">Быстрый выбор:</label>
                <div className="reschedule-quick-pills">
                  {reschedulePost.date && (
                    <>
                      <button 
                        type="button" 
                        className="quick-pill"
                        onClick={() => {
                          const d = new Date(reschedulePost.date);
                          d.setDate(d.getDate() + 1);
                          setRescheduleDate(d.toISOString().slice(0, 10));
                        }}
                      >
                        +1 день
                      </button>
                      <button 
                        type="button" 
                        className="quick-pill"
                        onClick={() => {
                          const d = new Date(reschedulePost.date);
                          d.setDate(d.getDate() + 2);
                          setRescheduleDate(d.toISOString().slice(0, 10));
                        }}
                      >
                        +2 дня
                      </button>
                      <button 
                        type="button" 
                        className="quick-pill"
                        onClick={() => {
                          const d = new Date(reschedulePost.date);
                          d.setDate(d.getDate() + 7);
                          setRescheduleDate(d.toISOString().slice(0, 10));
                        }}
                      >
                        +7 дней
                      </button>
                    </>
                  )}
                  {emptyOctoberDays.slice(0, 4).map(d => (
                    <button 
                      key={d}
                      type="button" 
                      className="quick-pill"
                      onClick={() => setRescheduleDate(d)}
                      title={`Свободный день в октябре: ${d}`}
                    >
                      {new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} (пусто)
                    </button>
                  ))}
                </div>
              </div>

              {reschedulePost.date && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-cream)' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={async () => {
                      await movePostToIdeas(reschedulePost.id);
                      setReschedulePost(null);
                    }}
                  >
                    💡 Снять с даты (вернуть в банк идей)
                  </button>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReschedulePost(null)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-save">
                  <CheckCircle2 size={15} /> Перенести публикацию
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          МОДАЛЬНОЕ ОКНО: ВХОД ДЛЯ РЕДАКТОРОВ
          ======================================================== */}
      {isAuthModalOpen && (
        <div 
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) authBackdropMouseDownRef.current = true;
            else authBackdropMouseDownRef.current = false;
          }}
          onMouseUp={(e) => {
            if (authBackdropMouseDownRef.current && e.target === e.currentTarget) {
              setIsAuthModalOpen(false);
            }
            authBackdropMouseDownRef.current = false;
          }}
        >
          <div className="modal-card auth-modal-card">
            <div className="auth-header">
              <div className="auth-icon-wrap">
                <Lock size={22} color="#233e2f" />
              </div>
              <h3>Вход в систему</h3>
              <p>Управление публикациями и расписанием</p>
              <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)} title="Закрыть">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="modal-form-body">
              {authError && (
                <div className="auth-error-badge">
                  {authError}
                </div>
              )}

              <div className="form-field">
                <label className="field-label">Email</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="craft-input" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">Пароль</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="craft-input" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-save auth-submit-btn"
                disabled={authLoading}
              >
                {authLoading ? 'Проверка...' : 'Войти в систему'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
