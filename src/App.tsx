import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [timeCounter, setTimeCounter] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Novos estados para Wrapped
  const [wrappedVisible, setWrappedVisible] = useState(false);
  const [animatedMinutes, setAnimatedMinutes] = useState(0);
  const [animatedHours, setAnimatedHours] = useState(0);
  const wrappedRef = useRef<HTMLDivElement>(null);

  // Novos estados para Story Wrapped
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storyVisible, setStoryVisible] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  // Contador em tempo real
  const [liveMinutes, setLiveMinutes] = useState(0);
  const [liveSeconds, setLiveSeconds] = useState(0);

  // Data do início do relacionamento: 2 de Outubro
  // Detecta automaticamente o ano (ano atual ou ano anterior se a data já passou)
  const getRelationshipStartDate = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const relationshipDate = new Date(currentYear, 10, 2);

    // Se a data já passou este ano, usa o ano anterior
    if (relationshipDate > today) {
      return new Date(currentYear - 1, 9, 2).getTime();
    }
    return relationshipDate.getTime();
  };

  const relationshipStartDate = getRelationshipStartDate();

  // Lista de fotos do casal
  const photos = [
    '/foto1.png',
    '/foto2.png',
    '/foto3.jpg',
    '/foto4.jpg',
    '/foto5.jpg',
    '/foto6.jpg',
  ];

  //
  useEffect(() => {
    const calculateTimeDifference = () => {
      const now = new Date().getTime();
      const difference = now - relationshipStartDate;

      const totalSeconds = Math.floor(difference / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      const years = Math.floor(totalDays / 365);
      const remainingDaysAfterYears = totalDays % 365;
      const months = Math.floor(remainingDaysAfterYears / 30);
      const days = remainingDaysAfterYears % 30;
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      setTimeCounter({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
      });
    };

    calculateTimeDifference();
    const timer = setInterval(calculateTimeDifference, 1000);
    return () => clearInterval(timer);
  }, [relationshipStartDate]);

  // Autoplay de música ao carregar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback se autoplay não funcionar
      });
    }
  }, []);

  // Sincronizar play/pause com áudio
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Erro ao reproduzir
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Atualizar tz'
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calcular porcentagem do progresso
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Controlar avanço/volta de 10 segundos
  const handlePrevious = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  // Navegação do carrossel
  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex((index + photos.length) % photos.length);
  };

  const nextPhoto = () => {
    goToPhoto(currentPhotoIndex + 1);
  };

  const prevPhoto = () => {
    goToPhoto(currentPhotoIndex - 1);
  };

  // Gestos de swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextPhoto();
    } else if (isRightSwipe) {
      prevPhoto();
    }
  };

  // Calcular estatísticas do relacionamento
  const calculateRelationshipStats = () => {
    const now = new Date().getTime();
    const difference = now - relationshipStartDate;
    const totalMinutes = Math.floor(difference / 1000 / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    return { totalMinutes, totalHours };
  };

  const stats = calculateRelationshipStats();

  // Momentos marcantes (mockado)
  const highlights = [
    {
      icon: '💬',
      title: 'Frase que mais marcou',
      text: '"Você me faz querer ser uma pessoa melhor a cada dia"'
    },
    {
      icon: '✨',
      title: 'Momento mais inesquecível',
      text: 'Aquela noite que conversamos até o amanhecer e perdemos a noção do tempo'
    },
    {
      icon: '💕',
      title: 'O que mais amamos fazer juntos',
      text: 'Ficar deitados conversando sobre tudo e nada, só curtindo a companhia um do outro'
    }
  ];

  // Intersection Observer para animação ao scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setWrappedVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (wrappedRef.current) {
      observer.observe(wrappedRef.current);
    }

    return () => {
      if (wrappedRef.current) {
        observer.unobserve(wrappedRef.current);
      }
    };
  }, []);

  // Animar contadores progressivamente
  useEffect(() => {
    if (!wrappedVisible) return;

    const animateCounter = (
      target: number,
      setter: React.Dispatch<React.SetStateAction<number>>,
      duration: number
    ) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(stats.totalMinutes, setAnimatedMinutes, 2000);
    animateCounter(stats.totalHours, setAnimatedHours, 2000);
  }, [wrappedVisible, stats.totalMinutes, stats.totalHours]);

  // Intersection Observer para Story Wrapped
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStoryVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (storyRef.current) {
      observer.observe(storyRef.current);
    }

    return () => {
      if (storyRef.current) {
        observer.unobserve(storyRef.current);
      }
    };
  }, []);

  // Atualizar contador em tempo real
  useEffect(() => {
    const updateLiveCounter = () => {
      const now = new Date().getTime();
      const difference = now - relationshipStartDate;
      const totalSeconds = Math.floor(difference / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);

      setLiveMinutes(totalMinutes);
      setLiveSeconds(totalSeconds % 60);
    };

    updateLiveCounter();
    const interval = setInterval(updateLiveCounter, 1000);

    return () => clearInterval(interval);
  }, [relationshipStartDate]);

  // Navegação dos slides
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % wrappedStories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + wrappedStories.length) % wrappedStories.length);
  };

  // Gestos de swipe para stories
  const [storyTouchStart, setStoryTouchStart] = useState(0);
  const [storyTouchEnd, setStoryTouchEnd] = useState(0);

  const handleStoryTouchStart = (e: React.TouchEvent) => {
    setStoryTouchStart(e.targetTouches[0].clientX);
  };

  const handleStoryTouchEnd = (e: React.TouchEvent) => {
    setStoryTouchEnd(e.changedTouches[0].clientX);
    handleStorySwipe();
  };

  const handleStorySwipe = () => {
    if (!storyTouchStart || !storyTouchEnd) return;

    const distance = storyTouchStart - storyTouchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Slides do Wrapped Story
  const wrappedStories = [
    {
      type: 'comparison',
      title: 'Isso dá mais tempo do que…',
      highlight: `assistir ${Math.floor(stats.totalHours / 6)} temporadas de série`,
      icon: '📺'
    },
    {
      type: 'music',
      title: 'A música que mais marcou vocês',
      songTitle: 'I Love You',
      artist: 'Billie Eilish',
      cover: '/bebe.mp4',
      icon: '🎵'
    },
    {
      type: 'emotional',
      title: 'E ainda é só o começo',
      subtitle: '💖',
      icon: '✨'
    }
  ];

  // Comparações criativas
  const creativeComparisons = [
    {
      icon: '📊',
      text: `Entre tantas histórias que começaram, a nossa foi uma das que ficaram`
    },
    {
      icon: '🎵',
      text: `Já daria pra ouvir nossa música favorita ${Math.floor(stats.totalMinutes / 3.5).toLocaleString('pt-BR')} vezes`
    },
    {
      icon: '🌎',
      text: `Tempo suficiente pra atravessar o Brasil ${Math.floor(stats.totalHours / 72)} vezes de carro`
    }
  ];

  // Palavras do mapa emocional
  const emotionalWords = [
    { text: 'Seguro', delay: 0 },
    { text: 'Em casa', delay: 0.5 },
    { text: 'Amor', delay: 1 },
    { text: 'Riso', delay: 1.5 },
    { text: 'Calma', delay: 2 },
    { text: 'Confiança', delay: 2.5 }
  ];

  return (
    <div className="app-container">
      {/* Audio Element */}
      <audio ref={audioRef} autoPlay muted={false}>
        <source src="/Billie Eilish.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <header className="header">
        <h1 className="header-title">Nosso Pequeno Grande Universo</h1>
        <p className="header-subtitle">
          {timeCounter.months === 1 && timeCounter.days <= 10
            ? '2 Meses de Amor 💕'
            : timeCounter.months === 0 && timeCounter.days < 2
            ? 'Ainda estamos no começo 💕'
            : `${timeCounter.months} Meses de Amor 💕`}
        </p>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Video Card */}
        <div className="image-card">
          <video
            className="card-image"
            poster="/bebe.mp4"
            controls={false}
            autoPlay
            muted
            loop
          >
            <source src="/bebe.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Music Player */}
        <div className="music-player">
          <div className="song-info">
            <h2 className="song-title">Billie Eilish - I Love You</h2>
            <p className="song-artist">Billie Eilish</p>
          </div>

          <div className="progress-container">
            <span className="time">{formatTime(currentTime)}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>

          <div className="player-controls">
            <button className="control-btn" aria-label="Anterior" onClick={handlePrevious}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button
              className="control-btn play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label="Play/Pause"
            >
              {isPlaying ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button className="control-btn" aria-label="Próximo" onClick={handleNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Couple Identification */}
        <div className="couple-info">
          <h2 className="couple-name">Junior e Julia</h2>
          <p className="couple-date">Juntos desde 2 de Outubro de 2024</p>
        </div>

        {/* Time Counter */}
        <div className="time-counter">
          <div className="counter-card">
            <span className="counter-number">{timeCounter.years}</span>
            <span className="counter-label">Anos</span>
          </div>
          <div className="counter-card">
            <span className="counter-number">{timeCounter.months}</span>
            <span className="counter-label">Meses</span>
          </div>
          <div className="counter-card">
            <span className="counter-number">{timeCounter.days}</span>
            <span className="counter-label">Dias</span>
          </div>
          <div className="counter-card">
            <span className="counter-number">{timeCounter.hours}</span>
            <span className="counter-label">Horas</span>
          </div>
          <div className="counter-card">
            <span className="counter-number">{timeCounter.minutes}</span>
            <span className="counter-label">Minutos</span>
          </div>
          <div className="counter-card">
            <span className="counter-number">{timeCounter.seconds}</span>
            <span className="counter-label">Segundos</span>
          </div>
        </div>

        {/* Special Message Card */}
        <div className={`message-card ${isMessageExpanded ? 'expanded' : ''}`}>
          <h3 className="message-title">💌 De coração 💌</h3>
          <p className="message-text">
            Eu não sei exatamente quando tudo começou a mudar dentro de mim.
            Talvez tenha sido em algum detalhe seu, no som da sua voz, no jeito sincero que você fala das coisas, ou nessa força bonita que você carrega mesmo quando acha que está quebrada.
            O fato é que, aos poucos, sem pressa e sem aviso, você virou alguém que eu guardo com carinho no coração.
            Eu admiro quem você é de um jeito que talvez eu nunca consiga colocar totalmente em palavras.
            A sua história, por mais pesada que tenha sido, não te define ela só prova o quanto você é forte, o quanto você merece leveza, respeito e amor de verdade.
            O quanto você merece ser cuidada sem cobrança, sem medo, sem repetir dores antigas.
            E eu quero que você saiba que eu enxergo tudo isso em você.
            Eu gosto do que estamos construindo, passo a passo, no tempo que é seguro pra você.
            Gosto da forma como você se permite um pouco mais a cada dia, mesmo achando que não está fazendo nada de especial.
            Gosto do jeito que você fala, do que você evita falar, das suas pausas, da sua coragem de se abrir mesmo com receio.
            Gosto da pessoa que você está se tornando e gosto, principalmente, de estar aqui enquanto isso acontece.
            Não quero ser alguém que te pressiona ou que te prende.
            Quero ser alguém que te acompanha, que te apoia, que te entende.
            Quero ser o lugar onde você respira fundo e pensa "Aqui eu posso ser eu."
            Quero que você se sinta segura comigo, do seu jeito, no seu ritmo, sem peso, sem medo de não ser suficiente porque pra mim, você já é.
            Eu sei que a vida te machucou. Sei que te fizeram sentir que amar era perder.
            Mas eu também sei que você merece viver algo bonito. Algo leve. Algo verdadeiro.
            E mesmo sem saber onde tudo isso vai dar, eu sei o que sinto agora sinto que vale a pena.
            Sinto que você vale a pena. E sinto que, de alguma forma, a gente tem construído algo raro… algo que me deixa feliz só de pensar.
            Obrigado por existir do jeito que você existe. Obrigado por cada conversa, cada riso, cada silêncio.
            Obrigado por me permitir entrar, mesmo que devagar. Eu gosto de você. Gosto de verdade.
            E independentemente do que aconteça daqui pra frente, eu quero que você carregue uma coisa você merece amor que te respeita, te escuta, te acolhe e nunca tenta te ferir.
            E eu espero, sinceramente, ser alguém que te traz mais paz do que dúvidas. EUTEAMO 💕
          </p>
        </div>

        {/* Toggle Message Button */}
        <button
          className="toggle-message-btn"
          onClick={() => setIsMessageExpanded(!isMessageExpanded)}
        >
          {isMessageExpanded ? 'Ocultar Mensagem' : 'Mostrar Mensagem'}
        </button>

        {/* Photos Carousel */}
        <div className="carousel-section">
          <h3 className="carousel-title">📸 Nossas Memórias</h3>
          <div
            className="carousel-container"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="carousel-wrapper">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className={`carousel-slide ${
                    index === currentPhotoIndex ? 'active' : ''
                  }`}
                >
                  <img src={photo} alt={`Foto ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="carousel-controls">
            <button
              className="carousel-btn prev-btn"
              onClick={prevPhoto}
              aria-label="Foto anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <div className="carousel-dots">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${
                    index === currentPhotoIndex ? 'active' : ''
                  }`}
                  onClick={() => goToPhoto(index)}
                  aria-label={`Ir para foto ${index + 1}`}
                />
              ))}
            </div>

            <button
              className="carousel-btn next-btn"
              onClick={nextPhoto}
              aria-label="Próxima foto"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>

          {/* Photo Counter */}
          <p className="carousel-counter">
            {currentPhotoIndex + 1} / {photos.length}
          </p>
        </div>

        {/* Nosso Wrapped Section */}
        <div className="wrapped-section" ref={wrappedRef}>
          <div className="wrapped-header">
            <h2 className="wrapped-title">Nosso Wrapped 💖</h2>
            <p className="wrapped-subtitle">Uma retrospectiva do nosso amor</p>
          </div>

          {/* Estatísticas */}
          <div className={`wrapped-stats ${wrappedVisible ? 'visible' : ''}`}>
            <div className="stat-card large">
              <div className="stat-icon">⏱️</div>
              <div className="stat-number">
                {animatedMinutes.toLocaleString('pt-BR')}
              </div>
              <div className="stat-label">Minutos Juntos</div>
              <div className="stat-description">
                Cada minuto ao seu lado é especial
              </div>
            </div>

            <div className="stat-card large">
              <div className="stat-icon">💫</div>
              <div className="stat-number">
                {animatedHours.toLocaleString('pt-BR')}
              </div>
              <div className="stat-label">Horas de Amor</div>
              <div className="stat-description">
                E ainda quero muitas mais com você
              </div>
            </div>
          </div>

          {/* Destaques */}
          <div className={`wrapped-highlights ${wrappedVisible ? 'visible' : ''}`}>
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="highlight-card"
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className="highlight-icon">{highlight.icon}</div>
                <h3 className="highlight-title">{highlight.title}</h3>
                <p className="highlight-text">{highlight.text}</p>
              </div>
            ))}
          </div>

          {/* Mensagem final do Wrapped */}
          <div className={`wrapped-final ${wrappedVisible ? 'visible' : ''}`}>
            <div className="final-card">
              <div className="final-icon">🌟</div>
              <h3 className="final-title">Nosso Ano Especial</h3>
              <p className="final-text">
                Cada momento com você é único e inesquecível.
                Obrigado por fazer parte da minha história e por construir
                essa jornada incrível ao meu lado. Aqui está para mais
                memórias, risadas, e amor infinito. 💕
              </p>
            </div>
          </div>
        </div>

        {/* Story Wrapped Section */}
        <div className="story-wrapped-section" ref={storyRef}>
          <div className="story-header">
            <h2 className="story-title">Curiosidades Nossas 💖</h2>
          </div>

          <div
            className="story-container"
            onTouchStart={handleStoryTouchStart}
            onTouchEnd={handleStoryTouchEnd}
          >
            {/* Progress Indicators */}
            <div className="story-progress">
              {wrappedStories.map((_, index) => (
                <div
                  key={index}
                  className={`progress-bar-story ${index <= currentSlide ? 'active' : ''}`}
                />
              ))}
            </div>

            {/* Slides */}
            <div className={`story-slide ${storyVisible ? 'visible' : ''}`}>
              {wrappedStories[currentSlide].type === 'stat' && (
                <div className="story-content stat-story">
                  <div className="story-icon">{wrappedStories[currentSlide].icon}</div>
                  <p className="story-text">{wrappedStories[currentSlide].title}</p>
                  <h2 className="story-highlight">{wrappedStories[currentSlide].highlight}</h2>
                </div>
              )}

              {wrappedStories[currentSlide].type === 'comparison' && (
                <div className="story-content comparison-story">
                  <div className="story-icon">{wrappedStories[currentSlide].icon}</div>
                  <p className="story-text">{wrappedStories[currentSlide].title}</p>
                  <h2 className="story-highlight">{wrappedStories[currentSlide].highlight}</h2>
                </div>
              )}

              {wrappedStories[currentSlide].type === 'music' && (
                <div className="story-content music-story">
                  <div className="story-icon">{wrappedStories[currentSlide].icon}</div>
                  <p className="story-text">{wrappedStories[currentSlide].title}</p>
                  <div className="music-card-story">
                    <div className="music-cover-story">🎵</div>
                    <h3 className="music-title-story">{wrappedStories[currentSlide].songTitle}</h3>
                    <p className="music-artist-story">{wrappedStories[currentSlide].artist}</p>
                  </div>
                </div>
              )}

              {wrappedStories[currentSlide].type === 'emotional' && (
                <div className="story-content emotional-story">
                  <div className="story-icon-large">{wrappedStories[currentSlide].icon}</div>
                  <h2 className="story-emotional-title">{wrappedStories[currentSlide].title}</h2>
                  <p className="story-emotional-subtitle">{wrappedStories[currentSlide].subtitle}</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="story-navigation">
              <button
                className="story-nav-btn prev"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                className="story-nav-btn next"
                onClick={nextSlide}
                disabled={currentSlide === wrappedStories.length - 1}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>

            {/* Slide Counter */}
            <p className="story-counter">
              {currentSlide + 1} / {wrappedStories.length}
            </p>
          </div>
        </div>

        {/* Mapa Emocional */}
        <div className="emotional-map">
          <h3 className="emotional-map-title">💖 Como a gente se sente junto</h3>
          <div className="emotional-words">
            {emotionalWords.map((word, index) => (
              <span
                key={index}
                className="floating-word"
                style={{ animationDelay: `${word.delay}s` }}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>

        {/* Contador em Tempo Real */}
        <div className="live-counter">
          <p className="live-counter-title">⏳ Enquanto você está aqui…</p>
          <div className="live-counter-display">
            <div className="live-counter-item">
              <span className="live-counter-number">{liveMinutes.toLocaleString('pt-BR')}</span>
              <span className="live-counter-label">minutos</span>
            </div>
            <span className="live-counter-separator">:</span>
            <div className="live-counter-item">
              <span className="live-counter-number">{liveSeconds.toString().padStart(2, '0')}</span>
              <span className="live-counter-label">segundos</span>
            </div>
          </div>
          <p className="live-counter-subtitle">Nosso tempo juntos continua aumentando 💗</p>
        </div>

        {/* Comparações Criativas */}
        <div className="creative-comparisons">
          {creativeComparisons.map((comparison, index) => (
            <div key={index} className="comparison-card" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="comparison-icon">{comparison.icon}</div>
              <p className="comparison-text">{comparison.text}</p>
            </div>
          ))}
        </div>

        {/* Texto Emocional Final */}
        <div className="emotional-final-text">
          <p>"Tudo isso existe porque um dia a gente escolheu ficar."</p>
        </div>

        {/* Decorative Footer */}
        <div className="decorative-footer">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,50 Q360,0 720,50 T1440,50 L1440,120 L0,120 Z"
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d946a6"/>
                <stop offset="50%" stopColor="#a21caf"/>
                <stop offset="100%" stopColor="#7c2d12"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </main>
    </div>
  );
}

export default App;
