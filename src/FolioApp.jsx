import React, { useState, useMemo } from "react";
import { Home, BookOpen, User, Plus, Flame, Heart, Minus, Check } from "lucide-react";

const COVER_COLORS = ["#8A6E4B", "#3E6E8E", "#7A5C8E", "#A2586B", "#4B6E8A", "#6E8F6B", "#8E6E3E"];
function pickColor() {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}

const initialBooks = [
  { id: "b1", title: "The Song of Achilles", author: "Madeline Miller", totalPages: 416, pagesRead: 266, status: "reading", color: "#8A6E4B" },
  { id: "b2", title: "Project Hail Mary", author: "Andy Weir", totalPages: 496, pagesRead: 120, status: "reading", color: "#3E6E8E" },
  { id: "b3", title: "Atomic Habits", author: "James Clear", totalPages: 320, pagesRead: 320, status: "finished", color: "#6E8F6B" },
  { id: "b4", title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", totalPages: 416, pagesRead: 0, status: "want", color: "#A2586B" },
  { id: "b5", title: "Fourth Wing", author: "Rebecca Yarros", totalPages: 512, pagesRead: 0, status: "want", color: "#7A5C8E" },
  { id: "b6", title: "The Midnight Library", author: "Matt Haig", totalPages: 304, pagesRead: 304, status: "finished", color: "#4B6E8A" },
];

const initialFeed = [
  { id: "f1", user: "You", initial: "A", isYou: true, timeAgo: "Yesterday", bookTitle: "The Song of Achilles", author: "Madeline Miller", minutes: 30, pages: 25, progressAfter: 64, kudos: 5, kudosGiven: false, type: "session", note: null },
  { id: "f2", user: "Priya", initial: "P", isYou: false, timeAgo: "2h ago", bookTitle: "Circe", author: "Madeline Miller", minutes: 35, pages: 30, progressAfter: 58, kudos: 4, kudosGiven: false, type: "session", note: null },
  { id: "f3", user: "Marcus", initial: "M", isYou: false, timeAgo: "5h ago", bookTitle: "Dune", author: "Frank Herbert", minutes: 55, pages: 42, progressAfter: 22, kudos: 6, kudosGiven: true, type: "session", note: "Worldbuilding is incredible so far." },
  { id: "f4", user: "Dana", initial: "D", isYou: false, timeAgo: "1 day ago", bookTitle: "Lessons in Chemistry", author: "Bonnie Garmus", minutes: 0, pages: 0, progressAfter: 100, kudos: 9, kudosGiven: false, type: "finished", note: null },
];

function pct(book) {
  if (!book.totalPages) return 0;
  return Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
}

function heatColor(level, isToday) {
  if (isToday) return level >= 4 ? "var(--brass)" : "rgba(239,231,210,0.12)";
  const alpha = [0.1, 0.28, 0.48, 0.68, 0.9][level] ?? 0.1;
  return `rgba(110,143,107,${alpha})`;
}

export default function FolioApp() {
  const [activeTab, setActiveTab] = useState("feed");
  const [books, setBooks] = useState(initialBooks);
  const [feed, setFeed] = useState(initialFeed);
  const [streak, setStreak] = useState(6);
  const [longestStreak, setLongestStreak] = useState(34);
  const [todayLogged, setTodayLogged] = useState(false);
  const [minutesTotal, setMinutesTotal] = useState(12840);
  const [pagesTotalYear, setPagesTotalYear] = useState(6420);
  const [booksFinishedYear, setBooksFinishedYear] = useState(18);
  const [toast, setToast] = useState(null);

  const [libraryFilter, setLibraryFilter] = useState("reading");
  const [showLibAdd, setShowLibAdd] = useState(false);
  const [libTitle, setLibTitle] = useState("");
  const [libAuthor, setLibAuthor] = useState("");
  const [libPages, setLibPages] = useState("300");
  const [libStatus, setLibStatus] = useState("want");

  const firstReading = initialBooks.find((b) => b.status === "reading");
  const [selectedBookId, setSelectedBookId] = useState(firstReading ? firstReading.id : null);
  const [addingNew, setAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newTotalPages, setNewTotalPages] = useState("300");
  const [minutesInput, setMinutesInput] = useState(20);
  const [pagesInput, setPagesInput] = useState(10);
  const [noteInput, setNoteInput] = useState("");

  const heatmap = useMemo(() => {
    return Array.from({ length: 84 }, (_, i) => {
      if (i === 83) return todayLogged ? 4 : 1;
      const x = Math.sin((i + 1) * 999.37) * 10000;
      const frac = x - Math.floor(x);
      return Math.floor(frac * 5);
    });
  }, [todayLogged]);

  function toggleKudos(id) {
    setFeed((prev) =>
      prev.map((f) => (f.id === id ? { ...f, kudosGiven: !f.kudosGiven, kudos: f.kudos + (f.kudosGiven ? -1 : 1) } : f))
    );
  }

  function startReading(bookId) {
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, status: "reading" } : b)));
  }

  function addLibraryBook() {
    if (!libTitle.trim()) return;
    const total = Number(libPages) || 200;
    const id = "b" + Date.now();
    setBooks((prev) => [
      ...prev,
      {
        id,
        title: libTitle.trim(),
        author: libAuthor.trim() || "Unknown",
        totalPages: total,
        pagesRead: libStatus === "finished" ? total : 0,
        status: libStatus,
        color: pickColor(),
      },
    ]);
    setLibTitle("");
    setLibAuthor("");
    setLibPages("300");
    setLibStatus("want");
    setShowLibAdd(false);
  }

  function handleLogSubmit() {
    let bookTitleForFeed, authorForFeed, newProgress, becameFinished;

    if (addingNew) {
      if (!newTitle.trim()) return;
      const total = Number(newTotalPages) || 200;
      const pagesReadNow = Math.min(pagesInput, total);
      becameFinished = pagesReadNow >= total;
      const id = "b" + Date.now();
      const newBook = {
        id,
        title: newTitle.trim(),
        author: newAuthor.trim() || "Unknown",
        totalPages: total,
        pagesRead: pagesReadNow,
        status: becameFinished ? "finished" : "reading",
        color: pickColor(),
      };
      setBooks((prev) => [...prev, newBook]);
      bookTitleForFeed = newBook.title;
      authorForFeed = newBook.author;
      newProgress = Math.round((pagesReadNow / total) * 100);
    } else {
      const book = books.find((b) => b.id === selectedBookId);
      if (!book) return;
      const updatedPagesRead = Math.min(book.pagesRead + pagesInput, book.totalPages);
      becameFinished = updatedPagesRead >= book.totalPages && book.status !== "finished";
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, pagesRead: updatedPagesRead, status: updatedPagesRead >= b.totalPages ? "finished" : b.status } : b
        )
      );
      bookTitleForFeed = book.title;
      authorForFeed = book.author;
      newProgress = Math.round((updatedPagesRead / book.totalPages) * 100);
    }

    const entry = {
      id: "f" + Date.now(),
      user: "You",
      initial: "A",
      isYou: true,
      timeAgo: "Just now",
      bookTitle: bookTitleForFeed,
      author: authorForFeed,
      minutes: minutesInput,
      pages: pagesInput,
      progressAfter: newProgress,
      kudos: 0,
      kudosGiven: false,
      type: becameFinished ? "finished" : "session",
      note: noteInput.trim() || null,
    };
    setFeed((prev) => [entry, ...prev]);
    setMinutesTotal((prev) => prev + minutesInput);
    setPagesTotalYear((prev) => prev + pagesInput);
    if (becameFinished) setBooksFinishedYear((prev) => prev + 1);
    if (!todayLogged) {
      setStreak((prev) => {
        const next = prev + 1;
        setLongestStreak((l) => Math.max(l, next));
        return next;
      });
      setTodayLogged(true);
    }

    setMinutesInput(20);
    setPagesInput(10);
    setNoteInput("");
    setAddingNew(false);
    setNewTitle("");
    setNewAuthor("");
    setNewTotalPages("300");

    setToast(becameFinished ? `Stamped — you finished ${bookTitleForFeed}` : "Session logged");
    setTimeout(() => setToast(null), 2400);
    setActiveTab("feed");
  }

  const readingBooks = books.filter((b) => b.status === "reading");

  return (
    <div className="folio-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap');

        .folio-page {
          --ink: #16222D;
          --ink-soft: #1E2E3A;
          --paper: #EFE7D2;
          --text-on-ink: #EFE7D2;
          --text-on-paper: #1C2A36;
          --text-muted-onpaper: #6B6455;
          --text-muted-onink: #93A3AD;
          --brass: #C99A4B;
          --stamp-red: #B5432E;
          --moss: #6E8F6B;
          --hairline: rgba(239,231,210,0.12);
          --font-display: 'Source Serif 4', Georgia, serif;
          --font-ui: 'Archivo', 'Helvetica Neue', sans-serif;
          min-height: 100vh;
          background: #0B1218;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 32px 16px;
          font-family: var(--font-ui);
        }
        .folio-page *, .folio-page *::before, .folio-page *::after { box-sizing: border-box; }
        .folio-frame button, .folio-frame input, .folio-frame textarea { font-family: var(--font-ui); }

        .folio-frame {
          width: 100%;
          max-width: 420px;
          background: var(--ink);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          height: 844px;
          position: relative;
          color: var(--text-on-ink);
        }

        .folio-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 12px; flex-shrink: 0; }
        .brand { font-family: var(--font-display); font-size: 22px; font-weight: 600; }
        .streak-pill { display: flex; align-items: center; gap: 6px; background: rgba(201,154,75,0.14); color: var(--brass); padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; }

        .folio-content { flex: 1; overflow-y: auto; padding: 8px 20px 110px; }
        .screen-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; margin: 8px 0 18px; }
        .field-label { font-size: 13px; font-weight: 600; color: var(--text-muted-onink); margin: 18px 0 8px; }
        .empty { color: var(--text-muted-onink); font-size: 14px; padding: 24px 0; text-align: center; }

        .card-feed { background: var(--paper); color: var(--text-on-paper); border-radius: 14px; padding: 16px; margin-bottom: 14px; border-left: 4px solid var(--brass); }
        .card-feed.is-finished { border-left-color: var(--stamp-red); }
        .feed-row-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--ink-soft); color: var(--paper); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; }
        .avatar.large { width: 52px; height: 52px; font-size: 20px; background: var(--brass); color: var(--ink); }
        .who .name { font-weight: 600; font-size: 14px; }
        .who .time { font-size: 12px; color: var(--text-muted-onpaper); }
        .feed-book { margin-bottom: 8px; }
        .book-title { font-family: var(--font-display); font-weight: 600; font-size: 16px; }
        .book-author { font-size: 12px; color: var(--text-muted-onpaper); margin-top: 1px; }
        .stat-row { font-size: 13px; color: var(--text-muted-onpaper); margin-bottom: 8px; font-variant-numeric: tabular-nums; }
        .feed-note { font-size: 13px; font-style: italic; margin: 0 0 10px; }

        .progress-track { position: relative; height: 8px; background: rgba(28,42,54,0.12); border-radius: 4px; margin-bottom: 4px; }
        .progress-track.small { height: 6px; }
        .progress-fill { height: 100%; background: var(--moss); border-radius: 4px; }
        .progress-marker { position: absolute; top: 50%; width: 10px; height: 10px; background: var(--paper); border: 2px solid var(--moss); border-radius: 2px; transform: translate(-50%,-50%) rotate(45deg); }

        .kudos-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 1px solid rgba(28,42,54,0.2); color: var(--text-on-paper); padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
        .kudos-btn.active { background: rgba(181,67,46,0.12); border-color: var(--stamp-red); color: var(--stamp-red); }
        .kudos-btn:active { transform: scale(0.95); }

        .segmented { display: flex; background: rgba(239,231,210,0.06); border-radius: 12px; padding: 4px; margin-bottom: 16px; gap: 4px; }
        .segmented button { flex: 1; border: none; background: transparent; color: var(--text-muted-onink); padding: 8px 6px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .segmented button.active { background: var(--brass); color: var(--ink); }
        .segmented.small { margin-bottom: 0; }

        .book-row { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--hairline); }
        .book-cover { position: relative; width: 56px; height: 80px; border-radius: 6px; flex-shrink: 0; }
        .book-cover.reading::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 16px 16px 0; border-color: transparent rgba(0,0,0,0.32) transparent transparent; }
        .stamp-finished { position: absolute; inset: 0; margin: auto; width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--stamp-red); background: rgba(20,20,20,0.18); display: flex; align-items: center; justify-content: center; color: var(--stamp-red); transform: rotate(-10deg); }
        .book-info { flex: 1; min-width: 0; }
        .book-info .book-title { font-size: 15px; }
        .progress-caption { font-size: 12px; color: var(--text-muted-onink); margin-top: 4px; }

        .btn-outline { background: transparent; border: 1px solid rgba(239,231,210,0.25); color: var(--text-on-ink); padding: 11px 16px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .btn-outline.small { margin-top: 8px; padding: 6px 12px; font-size: 12px; }
        .btn-outline.full { width: 100%; margin-top: 8px; }
        .btn-primary { background: var(--brass); border: none; color: var(--ink); padding: 13px 16px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; }
        .btn-primary.full { width: 100%; margin-top: 22px; }
        .btn-primary:active, .btn-outline:active { transform: scale(0.98); }

        .inline-add { background: rgba(239,231,210,0.05); border: 1px solid var(--hairline); border-radius: 12px; padding: 14px; margin: 10px 0 14px; display: flex; flex-direction: column; gap: 10px; }
        .text-input { background: var(--ink-soft); border: 1px solid var(--hairline); color: var(--text-on-ink); padding: 10px 12px; border-radius: 8px; font-size: 14px; }
        .row-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .row-actions .btn-outline, .row-actions .btn-primary { padding: 9px 14px; font-size: 13px; margin: 0; }

        .chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { background: rgba(239,231,210,0.06); border: 1px solid var(--hairline); color: var(--text-on-ink); padding: 8px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; }
        .chip.active { background: var(--brass); border-color: var(--brass); color: var(--ink); font-weight: 600; }

        .stepper { display: flex; align-items: center; gap: 16px; }
        .stepper button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--hairline); background: var(--ink-soft); color: var(--text-on-ink); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .stepper .value { font-family: var(--font-display); font-size: 20px; font-weight: 600; min-width: 40px; text-align: center; font-variant-numeric: tabular-nums; }
        .textarea { width: 100%; min-height: 70px; background: var(--ink-soft); border: 1px solid var(--hairline); color: var(--text-on-ink); padding: 10px 12px; border-radius: 8px; font-size: 14px; resize: none; }

        .profile-head { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .profile-name { font-family: var(--font-display); font-size: 18px; font-weight: 600; }
        .profile-sub { font-size: 13px; color: var(--text-muted-onink); }

        .streak-hero { background: var(--ink-soft); border-radius: 16px; padding: 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .hero-number { font-family: var(--font-display); font-size: 44px; font-weight: 700; color: var(--brass); line-height: 1; }
        .hero-label { font-size: 13px; color: var(--text-muted-onink); margin-top: 2px; }
        .streak-best { font-size: 13px; color: var(--text-muted-onink); text-align: right; max-width: 110px; }

        .stat-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 10px; margin-bottom: 6px; }
        .stat-block { background: var(--ink-soft); border-radius: 14px; padding: 16px; }
        .stat-block.large { display: flex; flex-direction: column; justify-content: center; }
        .stat-col { display: flex; flex-direction: column; gap: 10px; }
        .stat-number { font-family: var(--font-display); font-size: 28px; font-weight: 700; }
        .stat-block.large .stat-number { font-size: 36px; }
        .stat-label { font-size: 12px; color: var(--text-muted-onink); margin-top: 2px; }

        .heatmap { display: grid; grid-template-rows: repeat(7, 20px); grid-auto-flow: column; grid-auto-columns: 20px; gap: 3px; margin-bottom: 6px; overflow-x: auto; }
        .heatmap-cell { width: 20px; height: 20px; border-radius: 3px; }

        .records-list { background: var(--ink-soft); border-radius: 14px; padding: 4px 16px; margin-bottom: 6px; }
        .record-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--hairline); font-size: 14px; }
        .record-row:last-child { border-bottom: none; }
        .record-row span:last-child { color: var(--brass); font-weight: 600; font-variant-numeric: tabular-nums; }

        .badges-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
        .badge-tag { flex-shrink: 0; border-left: 2px dashed var(--brass); padding: 8px 12px; background: var(--ink-soft); border-radius: 0 10px 10px 0; font-size: 12px; font-weight: 600; white-space: nowrap; }

        .bottom-nav { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-around; background: rgba(22,34,45,0.94); backdrop-filter: blur(6px); padding: 10px 12px 14px; border-top: 1px solid var(--hairline); }
        .nav-btn { background: none; border: none; display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--text-muted-onink); font-size: 11px; cursor: pointer; padding: 4px 10px; }
        .nav-btn.active { color: var(--brass); }
        .nav-raised { width: 52px; height: 52px; border-radius: 50%; background: var(--brass); color: var(--ink); display: flex; align-items: center; justify-content: center; border: 4px solid var(--ink); margin-top: -30px; box-shadow: 0 6px 16px rgba(201,154,75,0.4); cursor: pointer; }

        .toast { position: absolute; bottom: 92px; left: 50%; background: var(--ink-soft); color: var(--brass); border: 1px solid var(--brass); padding: 10px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,0.35); white-space: nowrap; z-index: 20; animation: stampIn 0.3s ease forwards; }
        @keyframes stampIn { from { opacity: 0; transform: translate(-50%, 10px) scale(0.9); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
      `}</style>

      <div className="folio-frame">
        <header className="folio-header">
          <span className="brand">Folio</span>
          <div className="streak-pill">
            <Flame size={16} /> {streak}
          </div>
        </header>

        <main className="folio-content">
          {activeTab === "feed" && (
            <div className="screen">
              {feed.map((item) => (
                <article key={item.id} className={`card-feed ${item.type === "finished" ? "is-finished" : ""}`}>
                  <div className="feed-row-top">
                    <div className="avatar" style={{ background: item.isYou ? "var(--brass)" : "var(--ink-soft)", color: item.isYou ? "var(--ink)" : "var(--paper)" }}>
                      {item.initial}
                    </div>
                    <div className="who">
                      <div className="name">{item.user}</div>
                      <div className="time">{item.timeAgo}</div>
                    </div>
                  </div>
                  <div className="feed-book">
                    <div className="book-title">{item.type === "finished" ? `Finished ${item.bookTitle}` : item.bookTitle}</div>
                    {item.author && <div className="book-author">{item.author}</div>}
                  </div>
                  {item.type === "session" ? (
                    <>
                      <div className="stat-row">{item.minutes} min · {item.pages} pages · {item.progressAfter}% through</div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${item.progressAfter}%` }} />
                        <div className="progress-marker" style={{ left: `${item.progressAfter}%` }} />
                      </div>
                    </>
                  ) : (
                    <div className="stat-row">Closed the back cover on this one.</div>
                  )}
                  {item.note && <p className="feed-note">"{item.note}"</p>}
                  <button className={`kudos-btn ${item.kudosGiven ? "active" : ""}`} onClick={() => toggleKudos(item.id)}>
                    <Heart size={16} fill={item.kudosGiven ? "currentColor" : "none"} />
                    Kudos{item.kudos > 0 ? ` · ${item.kudos}` : ""}
                  </button>
                </article>
              ))}
            </div>
          )}

          {activeTab === "library" && (
            <div className="screen">
              <div className="segmented">
                <button className={libraryFilter === "reading" ? "active" : ""} onClick={() => setLibraryFilter("reading")}>Reading</button>
                <button className={libraryFilter === "want" ? "active" : ""} onClick={() => setLibraryFilter("want")}>Want to read</button>
                <button className={libraryFilter === "finished" ? "active" : ""} onClick={() => setLibraryFilter("finished")}>Finished</button>
              </div>

              {books.filter((b) => b.status === libraryFilter).length === 0 && <p className="empty">Nothing on this shelf yet.</p>}

              {books.filter((b) => b.status === libraryFilter).map((b) => (
                <div className="book-row" key={b.id}>
                  <div className={`book-cover ${b.status === "reading" ? "reading" : ""}`} style={{ background: b.color }}>
                    {b.status === "finished" && (
                      <div className="stamp-finished">
                        <Check size={18} />
                      </div>
                    )}
                  </div>
                  <div className="book-info">
                    <div className="book-title">{b.title}</div>
                    <div className="book-author">{b.author}</div>
                    {b.status === "reading" && (
                      <>
                        <div className="progress-track small">
                          <div className="progress-fill" style={{ width: `${pct(b)}%` }} />
                        </div>
                        <div className="progress-caption">{pct(b)}% · {b.pagesRead} of {b.totalPages} pages</div>
                      </>
                    )}
                    {b.status === "finished" && <div className="progress-caption">Finished · {b.totalPages} pages</div>}
                    {b.status === "want" && (
                      <button className="btn-outline small" onClick={() => startReading(b.id)}>Start reading</button>
                    )}
                  </div>
                </div>
              ))}

              {!showLibAdd ? (
                <button className="btn-outline full" onClick={() => setShowLibAdd(true)}>Add a book</button>
              ) : (
                <div className="inline-add">
                  <input className="text-input" placeholder="Title" value={libTitle} onChange={(e) => setLibTitle(e.target.value)} />
                  <input className="text-input" placeholder="Author" value={libAuthor} onChange={(e) => setLibAuthor(e.target.value)} />
                  <input className="text-input" placeholder="Total pages" type="number" value={libPages} onChange={(e) => setLibPages(e.target.value)} />
                  <div className="segmented small">
                    <button className={libStatus === "want" ? "active" : ""} onClick={() => setLibStatus("want")}>Want to read</button>
                    <button className={libStatus === "reading" ? "active" : ""} onClick={() => setLibStatus("reading")}>Reading</button>
                  </div>
                  <div className="row-actions">
                    <button className="btn-outline" onClick={() => setShowLibAdd(false)}>Cancel</button>
                    <button className="btn-primary" onClick={addLibraryBook}>Add to shelf</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "log" && (
            <div className="screen">
              <h2 className="screen-title">Log a reading session</h2>

              <div className="field-label">Which book?</div>
              <div className="chip-row">
                {readingBooks.map((b) => (
                  <button
                    key={b.id}
                    className={`chip ${!addingNew && selectedBookId === b.id ? "active" : ""}`}
                    onClick={() => { setSelectedBookId(b.id); setAddingNew(false); }}
                  >
                    {b.title}
                  </button>
                ))}
                <button className={`chip ${addingNew ? "active" : ""}`} onClick={() => setAddingNew(true)}>Add a new book</button>
              </div>

              {addingNew && (
                <div className="inline-add">
                  <input className="text-input" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <input className="text-input" placeholder="Author" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
                  <input className="text-input" placeholder="Total pages" type="number" value={newTotalPages} onChange={(e) => setNewTotalPages(e.target.value)} />
                </div>
              )}

              <div className="field-label">Minutes read</div>
              <div className="stepper">
                <button onClick={() => setMinutesInput((m) => Math.max(5, m - 5))}><Minus size={16} /></button>
                <span className="value">{minutesInput}</span>
                <button onClick={() => setMinutesInput((m) => Math.min(240, m + 5))}><Plus size={16} /></button>
              </div>

              <div className="field-label">Pages read</div>
              <div className="stepper">
                <button onClick={() => setPagesInput((p) => Math.max(0, p - 5))}><Minus size={16} /></button>
                <span className="value">{pagesInput}</span>
                <button onClick={() => setPagesInput((p) => Math.min(150, p + 5))}><Plus size={16} /></button>
              </div>

              <div className="field-label">Add a note (optional)</div>
              <textarea className="textarea" placeholder="Any thoughts on this session?" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />

              <button className="btn-primary full" onClick={handleLogSubmit}>Log session</button>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="screen">
              <div className="profile-head">
                <div className="avatar large">A</div>
                <div>
                  <div className="profile-name">Alex Rivera</div>
                  <div className="profile-sub">Reading since 2023</div>
                </div>
              </div>

              <div className="streak-hero">
                <div>
                  <div className="hero-number">{streak}</div>
                  <div className="hero-label">day reading streak</div>
                </div>
                <div className="streak-best">Longest streak: {longestStreak} days</div>
              </div>

              <div className="field-label">This year</div>
              <div className="stat-grid">
                <div className="stat-block large">
                  <div className="stat-number">{booksFinishedYear}</div>
                  <div className="stat-label">books finished</div>
                </div>
                <div className="stat-col">
                  <div className="stat-block">
                    <div className="stat-number">{pagesTotalYear.toLocaleString()}</div>
                    <div className="stat-label">pages read</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-number">{Math.round(minutesTotal / 60)}</div>
                    <div className="stat-label">hours read</div>
                  </div>
                </div>
              </div>

              <div className="field-label">Reading calendar · last 12 weeks</div>
              <div className="heatmap">
                {heatmap.map((level, i) => (
                  <div key={i} className="heatmap-cell" style={{ background: heatColor(level, i === 83) }} />
                ))}
              </div>

              <div className="field-label">Personal records</div>
              <div className="records-list">
                <div className="record-row"><span>Longest session</span><span>3h 10m</span></div>
                <div className="record-row"><span>Biggest day</span><span>96 pages</span></div>
                <div className="record-row"><span>Longest streak</span><span>{longestStreak} days</span></div>
              </div>

              <div className="field-label">Badges</div>
              <div className="badges-row">
                <div className="badge-tag">7-day streak</div>
                <div className="badge-tag">First finish</div>
                <div className="badge-tag">Big read</div>
                <div className="badge-tag">Early bird</div>
              </div>
            </div>
          )}
        </main>

        {toast && <div className="toast">{toast}</div>}

        <nav className="bottom-nav">
          <button className={`nav-btn ${activeTab === "feed" ? "active" : ""}`} onClick={() => setActiveTab("feed")}>
            <Home size={20} />
            <span>Feed</span>
          </button>
          <button className={`nav-btn ${activeTab === "library" ? "active" : ""}`} onClick={() => setActiveTab("library")}>
            <BookOpen size={20} />
            <span>Library</span>
          </button>
          <button className="nav-raised" aria-label="Log a reading session" onClick={() => setActiveTab("log")}>
            <Plus size={24} />
          </button>
          <button className={`nav-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            <User size={20} />
            <span>You</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
