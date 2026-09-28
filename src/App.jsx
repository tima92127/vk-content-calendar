import React, { useState, useEffect } from 'react';
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
  Sparkles,
  GripVertical,
  X,
  Search,
  Eye,
  Edit3,
  Filter,
  Trash2,
  Layers,
  ArrowRight
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  
  // Текущий месяц: Октябрь 2026 (месяц 9 в JS 0-indexed)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  
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

  // Модальные окна (Редактирование / Просмотр / Создание)
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Загрузка постов из Supabase
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

  // Загрузка праздников и дат ярмарок
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
    setLoading(false);

    // Проверка текущей сессии пользователя
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

    // Supabase Realtime подписка на живые изменения в базе
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

  // АВТОРИЗАЦИЯ КОМАНДЫ
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
      showToast('🎉 Добро пожаловать! Режим редактирования активирован.');
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
    showToast('👋 Вы вышли из режима редактирования. Включен режим просмотра.');
  };

  // DRAG AND DROP ОБРАБОТЧИКИ
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

    // Оптимистичное локальное обновление
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, date: targetDateStr } : p));

    const dateFormatted = new Date(targetDateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    showToast(`📍 Пост перенесен на ${dateFormatted}`);

    // Запись в Supabase
    const { error } = await supabase
      .from('posts')
      .update({ date: targetDateStr, updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) {
      console.error('Ошибка переноса:', error);
      fetchPosts();
      showToast('⚠️ Ошибка сохранения. Проверьте права доступа.');
    }
  };

  // ОТКРЫТИЕ ПОСТА (ПРОСМОТР / РЕДАКТИРОВАНИЕ)
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

  // СОЗДАНИЕ НОВОГО ПОСТА
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

  // СОХРАНЕНИЕ ИЗМЕНЕНИЙ В МОДАЛКЕ
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
      // Вставка нового поста
      const { data, error } = await supabase.from('posts').insert([payload]).select();
      if (error) {
        console.error('Ошибка добавления поста:', error);
        showToast('⚠️ Не удалось создать пост: ' + error.message);
      } else {
        showToast('✨ Новая публикация добавлена!');
        fetchPosts();
      }
    } else if (selectedPost) {
      // Обновление существующего поста
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, ...payload } : p));
      const { error } = await supabase.from('posts').update(payload).eq('id', selectedPost.id);
      if (error) {
        console.error('Ошибка сохранения поста:', error);
        fetchPosts();
        showToast('⚠️ Ошибка сохранения: ' + error.message);
      } else {
        showToast('💾 Изменения успешно сохранены!');
      }
    }

    setIsEditModalOpen(false);
  };

  // УДАЛЕНИЕ ПОСТА
  const deletePost = async () => {
    if (!editMode || !selectedPost) return;
    if (!window.confirm(`Вы точно хотите удалить публикацию «${selectedPost.title}»?`)) return;

    setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
    setIsEditModalOpen(false);

    const { error } = await supabase.from('posts').delete().eq('id', selectedPost.id);
    if (error) {
      console.error('Ошибка удаления:', error);
      fetchPosts();
      showToast('⚠️ Ошибка при удалении');
    } else {
      showToast('🗑️ Публикация удалена');
    }
  };

  // НАВИГАЦИЯ ПО МЕСЯЦАМ
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToOctober = () => {
    setCurrentDate(new Date(2026, 9, 1));
  };

  // ГЕНЕРАЦИЯ СЕТКИ КАЛЕНДАРЯ
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

  // Фильтрация по поиску и проекту
  const fairCount = posts.filter(p => p.project === 'fair').length;
  const teaCount = posts.filter(p => p.project === 'tea').length;

  return (
    <div className="app-container">

      {/* ТОСТ УВЕДОМЛЕНИЙ */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ВЕРХНЯЯ БРЕНДОВАЯ ПАНЕЛЬ (HEADER) */}
      <header className="brand-header">
        <div className="header-left">
          {/* Фирменный крафтовый медальон-штамп */}
          <div className="brand-seal" title="Гостинцев двор & Чайная любовь">
            <div className="seal-inner">
              <PineIcon size={16} className="seal-pine" />
              <div className="seal-divider" />
              <TeaLeafIcon size={16} className="seal-tea" />
            </div>
          </div>

          <div className="brand-titles">
            <div className="brand-eyebrow">
              <span className="live-dot" title="Realtime база активна" />
              <span>Единый календарь контента ВК • Череповец</span>
            </div>
            <h1 className="brand-heading">
              «Гостинцев двор» <span className="ampersand">&</span> «Чайная любовь»
            </h1>
            <div className="brand-meta">
              План публикаций и интерактивный дашборд для команды и заказчика
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Индикатор статуса доступа */}
          <div className={`access-pill ${user ? 'mode-team' : 'mode-guest'}`}>
            {user ? (
              <>
                <Unlock size={13} className="access-icon pulse-icon" />
                <span>Редактор: <strong>{user.email === 'tima92127@gmail.com' ? 'Тимур' : 'Наталья'}</strong></span>
              </>
            ) : (
              <>
                <Eye size={13} className="access-icon" />
                <span>Режим просмотра (Мила / Гости)</span>
              </>
            )}
          </div>

          {/* Кнопка входа/выхода */}
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

              <button className="btn btn-outline" onClick={handleLogout} title="Выйти из аккаунта">
                Выйти
              </button>
            </div>
          ) : (
            <button className="btn btn-login" onClick={() => setIsAuthModalOpen(true)}>
              <Lock size={13} /> Вход для команды
            </button>
          )}

          {/* Экспорт в PDF / Печать */}
          <button className="btn btn-print" onClick={() => window.print()} title="Распечатать или сохранить чистый PDF">
            <Printer size={14} /> Печать / PDF
          </button>
        </div>
      </header>

      {/* ПАНЕЛЬ НАВИГАЦИИ, ФИЛЬТРОВ И ПОИСКА */}
      <section className="control-bar">
        {/* Селектор месяцев */}
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

        {/* Проектные фильтры-чипы */}
        <div className="project-chips">
          <button 
            className={`chip chip-all ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Layers size={13} /> Все публикации <span className="chip-count">{posts.length}</span>
          </button>
          <button 
            className={`chip chip-fair ${filter === 'fair' ? 'active' : ''}`}
            onClick={() => setFilter('fair')}
          >
            <PineIcon size={13} /> Гостинцев двор <span className="chip-count">{fairCount}</span>
          </button>
          <button 
            className={`chip chip-tea ${filter === 'tea' ? 'active' : ''}`}
            onClick={() => setFilter('tea')}
          >
            <TeaLeafIcon size={13} /> Чайная любовь <span className="chip-count">{teaCount}</span>
          </button>
        </div>

        {/* Живой поиск по темам */}
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Поиск по темам, тексту..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={12} />
            </button>
          )}
        </div>
      </section>

      {/* ДОСКА КАЛЕНДАРЯ */}
      <main className="calendar-container">
        {/* Заголовки дней недели */}
        <div className="weekdays-grid">
          <div className="weekday-cell">Понедельник</div>
          <div className="weekday-cell">Вторник</div>
          <div className="weekday-cell">Среда</div>
          <div className="weekday-cell">Четверг</div>
          <div className="weekday-cell">Пятница</div>
          <div className="weekday-cell weekend-cell">Суббота</div>
          <div className="weekday-cell weekend-cell">Воскресенье</div>
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

            // Праздничные даты / Ярмарочные вехи
            const dayMilestones = milestones.filter(m => {
              return slot.dateStr >= m.date_start && slot.dateStr <= m.date_end;
            });

            return (
              <div 
                key={idx}
                className={`day-card ${!slot.isCurrentMonth ? 'outside-month' : ''} ${isWeekend ? 'weekend-day' : ''} ${isToday ? 'is-today' : ''} ${isHovered ? 'drag-target-hover' : ''}`}
                onDragOver={(e) => handleDragOver(e, slot.dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.dateStr)}
              >
                {/* Шапочка дня: дата и бейджи событий */}
                <div className="day-header">
                  <div className="day-number-badge">
                    <span className="day-num">{slot.date}</span>
                    {isToday && <span className="today-craft-label">Сегодня</span>}
                  </div>

                  {dayMilestones.length > 0 && (
                    <div className="milestone-ribbon" title={dayMilestones[0].summary}>
                      {dayMilestones[0].category === 'fair' ? (
                        <span className="ribbon-fair">🎪 {dayMilestones[0].summary}</span>
                      ) : (
                        <span className="ribbon-holiday">🍎 {dayMilestones[0].summary}</span>
                      )}
                    </div>
                  )}

                  {/* Кнопка быстрого добавления поста в этот день (только для команды) */}
                  {editMode && slot.isCurrentMonth && (
                    <button 
                      className="add-post-quick-btn" 
                      onClick={() => openNewPostModal(slot.dateStr)}
                      title="Добавить публикацию на этот день"
                    >
                      <Plus size={11} />
                    </button>
                  )}
                </div>

                {/* Список постов в ячейке дня */}
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
                        onClick={() => openPostModal(post)}
                      >
                        {/* Верхняя цветная крафтовая полоска-закладка */}
                        <div className="card-top-stripe" />

                        {/* Метаданные карточки: бренд и время */}
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

                        {/* Название / Тема публикации */}
                        <h4 className="card-title" title={post.title}>
                          {post.title}
                        </h4>

                        {/* Нижняя полоска с кнопкой прямого перехода в ВК черновик */}
                        <div className="card-footer">
                          {hasVkLink ? (
                            <a 
                              href={post.vk_draft_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="vk-pill-btn"
                              onClick={(e) => e.stopPropagation()}
                              title="Открыть готовый черновик прямо во ВКонтакте"
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
                            <span className="drag-handle" title="Зажмите и перетащите на другую дату">
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
      </main>

      {/* МОДАЛЬНОЕ ОКНО: ДЕТАЛИ И РЕДАКТИРОВАНИЕ ПОСТА */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header-banner ${modalForm.project === 'fair' ? 'banner-fair' : 'banner-tea'}`}>
              <div className="modal-header-info">
                <span className="modal-category-badge">
                  {modalForm.project === 'fair' ? '🎪 Гостинцев двор (Ярмарка мастеров)' : '🍵 Чайная любовь (Травяные сборы)'}
                </span>
                <h3 className="modal-title-text">
                  {isNewPost ? 'Новая публикация' : (editMode ? 'Редактирование публикации' : modalForm.title)}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={savePostChanges} className="modal-form-body">
              {/* Дата и время выхода */}
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

              {/* Тема поста (в режиме редактирования) */}
              {editMode && (
                <div className="form-field">
                  <label className="field-label">Тема / Заголовок</label>
                  <input 
                    type="text" 
                    className="craft-input font-bold" 
                    value={modalForm.title} 
                    onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                    placeholder="Например: Анонс открытия ярмарки..."
                    required
                  />
                </div>
              )}

              {/* Проект и статус */}
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
                      <option value="planned">📝 Запланирован</option>
                      <option value="draft">⏳ Черновик в ВК готов</option>
                      <option value="published">✅ Опубликован</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Блок прямой ссылки на черновик ВК */}
              <div className="form-field highlight-field">
                <label className="field-label label-vk">
                  <VkIcon size={14} /> Прямая ссылка на черновик или отложенную запись во ВКонтакте
                </label>
                {editMode ? (
                  <input 
                    type="url" 
                    placeholder="https://vk.com/wall-XXXXX_YYYY или ссылка на отложенную запись" 
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
                      Черновик во ВКонтакте формируется. Ссылка появится здесь, как только пост будет загружен в отложку.
                    </div>
                  )
                )}
              </div>

              {/* Смысл и главная идея */}
              <div className="form-field">
                <label className="field-label">💡 Смысл и ключевая мысль публикации</label>
                {editMode ? (
                  <textarea 
                    className="craft-textarea" 
                    rows={2} 
                    value={modalForm.meaning}
                    onChange={(e) => setModalForm({ ...modalForm, meaning: e.target.value })}
                    placeholder="Какую ценность несет пост подписчикам..."
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
                    placeholder="Какое фото или макет из фотобанка используется..."
                  />
                ) : (
                  <div className="readonly-box">{modalForm.visual || 'Информация дополняется...'}</div>
                )}
              </div>

              {/* Призыв к действию (CTA) */}
              <div className="form-field">
                <label className="field-label">🎯 Призыв к действию (CTA)</label>
                {editMode ? (
                  <input 
                    type="text" 
                    className="craft-input" 
                    value={modalForm.cta}
                    onChange={(e) => setModalForm({ ...modalForm, cta: e.target.value })}
                    placeholder="Например: Напишите в комментариях свой любимый сбор..."
                  />
                ) : (
                  <div className="readonly-box">{modalForm.cta || '—'}</div>
                )}
              </div>

              {/* Кнопки действий модалки */}
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

      {/* МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ КОМАНДЫ */}
      {isAuthModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="auth-header">
              <div className="auth-icon-wrap">
                <Lock size={22} color="#233e2f" />
              </div>
              <h3>Вход для команды</h3>
              <p>Редактирование дат, времени и ссылок на черновики ВК (Тимур и Наталья)</p>
              <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
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
                <label className="field-label">Email команды</label>
                <input 
                  type="email" 
                  placeholder="tima92127@gmail.com или nakoresh@gmail.com" 
                  className="craft-input" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
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
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-save auth-submit-btn"
                disabled={authLoading}
              >
                {authLoading ? 'Авторизация...' : 'Войти в панель управления'}
              </button>

              <div className="auth-note">
                🌿 Заказчице (Миле) логин не требуется — режим просмотра открыт по умолчанию без пароля.
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
