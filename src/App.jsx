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
  Share2
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

export default function App() {
  const [posts, setPosts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [showPwaTip, setShowPwaTip] = useState(true);
  
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

  // Модальные окна
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

  // Защита модалок от случайного закрытия при выделении текста мышью
  const authBackdropMouseDownRef = useRef(false);
  const editBackdropMouseDownRef = useRef(false);

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

    // Realtime подписка
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
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

  // DRAG AND DROP
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

    if (!postId || !targetDateStr) return;

    const movingPost = posts.find(p => p.id === postId);
    if (movingPost && movingPost.date === targetDateStr) return;

    // Локальное обновление
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, date: targetDateStr } : p));

    const dateFormatted = new Date(targetDateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    showToast(`📍 Публикация перенесена на ${dateFormatted}`);

    // Запись в Supabase
    const { error } = await supabase
      .from('posts')
      .update({ date: targetDateStr, updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) {
      console.error('Ошибка сохранения:', error);
      fetchPosts();
      showToast('⚠️ Ошибка сохранения');
    }
  };

  // ОТКРЫТИЕ ПОСТА
  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsNewPost(false);
    setModalForm({
      title: post.title || '',
      date: post.date || '2026-10-01',
      time: post.time || '10:30',
      project: post.project || 'fair',
      status: post.status || 'planned',
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

  // СОХРАНЕНИЕ
  const savePostChanges = async (e) => {
    e.preventDefault();
    if (!editMode) return;

    const payload = {
      title: modalForm.title,
      date: modalForm.date,
      time: modalForm.time,
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

  // УДАЛЕНИЕ
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

  // Фильтрация
  const fairCount = posts.filter(p => p.project === 'fair').length;
  const teaCount = posts.filter(p => p.project === 'tea').length;

  const filteredPostsList = posts.filter(p => {
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
  const postsInCurrentMonth = posts.filter(p => p.date.startsWith(currentMonthPrefix));

  // Посты и вехи для выбранного дня в мобильной сетке
  const selectedDayPosts = posts.filter(p => {
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

  // Группировка для мобильного вида (Feed / Agenda)
  const uniqueDates = [...new Set(posts.map(p => p.date))].sort();
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
          <button className="btn btn-print" onClick={() => window.print()} title="Распечатать или сохранить чистый PDF">
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
            <Layers size={13} /> Все <span className="chip-count">{posts.length}</span>
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
              const dayPosts = posts.filter(p => {
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
                    <div className="day-milestone-bar" title={dayMilestones[0].summary}>
                      {dayMilestones[0].category === 'fair' ? (
                        <span className="ribbon-fair">🎪 <span className="ribbon-text">{dayMilestones[0].summary}</span></span>
                      ) : (
                        <span className="ribbon-holiday">🍎 <span className="ribbon-text">{dayMilestones[0].summary}</span></span>
                      )}
                    </div>
                  )}

                  {/* Мобильные компактные индикаторы для плитки */}
                  <div className="day-mobile-indicators">
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
                          <div className="card-top-stripe" />

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
                              <span className="status-label">
                                {post.status === 'published' ? '✅ Вышел' : '📝 В плане'}
                              </span>
                            )}

                            {editMode && (
                              <span className="drag-handle" title="Перетащить на другой день">
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
                <button 
                  className="btn btn-outline"
                  style={{ padding: '5px 10px', fontSize: '11px' }}
                  onClick={() => openNewPostModal(selectedGridDate)}
                >
                  <Plus size={13} /> Добавить
                </button>
              )}
            </div>

            {/* Праздник или маркет дня */}
            {selectedDayMilestones.length > 0 && (
              <div className="selected-day-milestone-card">
                <span className="milestone-badge">
                  {selectedDayMilestones[0].category === 'fair' ? '🎪 ' : '🍎 '}
                  {selectedDayMilestones[0].summary}
                </span>
                {selectedDayMilestones[0].description && (
                  <p className="milestone-desc">{selectedDayMilestones[0].description}</p>
                )}
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
                      <div className="card-top-stripe" />
                      
                      <div className="post-card-meta">
                        <span className={`project-tag ${isFair ? 'tag-fair' : 'tag-tea'}`}>
                          {isFair ? <><PineIcon size={11} /> Гостинцев двор</> : <><TeaLeafIcon size={11} /> Чайная любовь</>}
                        </span>
                        <span className="post-time-badge">
                          <Clock size={11} /> {post.time || '10:30'}
                        </span>
                        <span className={`status-badge-inline status-${post.status || 'planned'}`}>
                          {post.status === 'published' ? '✅ Опубликован' : (post.status === 'draft' ? '⏳ Черновик в ВК' : '📝 В плане')}
                        </span>
                      </div>

                      <h5 className="post-card-title">{post.title}</h5>

                      {post.meaning && (
                        <p className="post-card-snippet">{post.meaning}</p>
                      )}

                      <div className="post-card-actions">
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
          </div>

          {/* Список дней */}
          <div className="feed-days-list">
            {feedDates.map(dateStr => {
              const dayPosts = posts.filter(p => {
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
                      <span className="feed-milestone-tag">
                        {dayMilestones[0].category === 'fair' ? '🎪 ' : '🍎 '}
                        {dayMilestones[0].summary}
                      </span>
                    )}

                    {editMode && (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '11px', marginLeft: 'auto' }}
                        onClick={() => openNewPostModal(dateStr)}
                      >
                        <Plus size={12} /> Добавить пост
                      </button>
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
                              <span className="feed-planned-badge">
                                📝 В плане публикации
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
                <span className="modal-category-badge">
                  {modalForm.project === 'fair' ? '🎪 Гостинцев двор (Ярмарка мастеров)' : '🍵 Чайная любовь (Травяные сборы)'}
                </span>
                <h3 className="modal-title-text">
                  {isNewPost ? 'Новая публикация' : (editMode ? 'Редактирование публикации' : modalForm.title)}
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
                    <input 
                      type="date" 
                      className="craft-input" 
                      value={modalForm.date} 
                      onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                      required
                    />
                  ) : (
                    <div className="readonly-value">
                      📅 {new Date(modalForm.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                    <label className="field-label">Статус</label>
                    <select 
                      className="craft-select"
                      value={modalForm.status}
                      onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    >
                      <option value="planned">📝 В плане</option>
                      <option value="draft">⏳ Черновик в ВК готов</option>
                      <option value="published">✅ Опубликован</option>
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
