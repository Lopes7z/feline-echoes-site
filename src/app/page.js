'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

async function fetchData() {
  const res = await fetch('/data/Feline_Echoes_Metadata_0707.json');
  try {
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('Erro ao carregar o JSON:', err);
    return {};
  }
}

export default function FelineEchoesGallery() {
  const [images, setImages] = useState([]);
  const [selectedEmotion1, setSelectedEmotion1] = useState('');
  const [selectedEmotion2, setSelectedEmotion2] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [displayedText, setDisplayedText] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [allEmotions, setAllEmotions] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [emotionCounts, setEmotionCounts] = useState({});
  const [visibleCount, setVisibleCount] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const FILTER_EMOTIONS = [
    'Fear', 'Insecurity', 'Overwhelm', 'Guilt',
    'Solitude', 'Grief', 'Silence', 'Emptiness',
    'Hope', 'Love',
  ];

  useEffect(() => {
    fetchData().then((data) => {
      const parsed = Object.entries(data).map(([key, value]) => ({
        id: key,
        number: key.replace(/\D/g, ''),
        title: value.name || '',
        emotion: Array.isArray(value.Emotion)
          ? value.Emotion
          : String(value.Emotion).split('/').map((e) => e.trim()),
        url: value.image,
        description: value.description,
      }));
      setImages(parsed);

      const counts = {};
      parsed.forEach((img) => {
        img.emotion.forEach((emotion) => {
          counts[emotion] = (counts[emotion] || 0) + 1;
        });
      });
      setEmotionCounts(counts);

      const unique = Array.from(new Set(parsed.flatMap((img) => img.emotion))).sort();
      setAllEmotions(unique);
    });
  }, []);

  useEffect(() => {
    if (!hoveredId) return;
    const img = images.find((img) => img.id === hoveredId);
    if (!img || !img.description) return;

    let index = 0;
    let currentText = '';
    setDisplayedText('');

    const interval = setInterval(() => {
      currentText += img.description.charAt(index);
      setDisplayedText(currentText);
      index++;
      if (index >= img.description.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [hoveredId]);

  const toggleFilter = (emotion) => {
    setSelectedEmotion1('');
    setSelectedEmotion2('');
    setActiveFilters((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const selected = [
    ...activeFilters,
    ...(selectedEmotion1 ? [selectedEmotion1] : []),
    ...(selectedEmotion2 ? [selectedEmotion2] : []),
  ];

  const dynamicCounts = allEmotions.reduce((acc, emotion) => {
    if (selected.includes(emotion)) return acc;
    acc[emotion] = images.filter(
      (img) => selected.some((s) => img.emotion.includes(s)) && img.emotion.includes(emotion)
    ).length;
    return acc;
  }, {});

  const filteredImages = images
    .filter((img) =>
      selected.length === 0 ? true : selected.some((e) => img.emotion.includes(e))
    )
    .sort((a, b) => {
      const countMatch = (img) => selected.filter((e) => img.emotion.includes(e)).length;
      const aCount = countMatch(a);
      const bCount = countMatch(b);
      const aHasAll = selected.every((e) => a.emotion.includes(e));
      const bHasAll = selected.every((e) => b.emotion.includes(e));
      if (aHasAll && !bHasAll) return -1;
      if (!aHasAll && bHasAll) return 1;
      return bCount - aCount;
    });

  const visibleImages = filteredImages.slice(0, visibleCount);
  const handleLoadMore = () => setVisibleCount((prev) => prev + 20);

  return (
    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} p-6 min-h-screen relative`}>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 border px-3 py-1 rounded-full text-sm hover:opacity-75 z-50"
      >
        {isDarkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h1 className="text-5xl font-serif font-semibold mb-2 text-center tracking-wide">
        {[..."Feline Echoes"].map((char, i) => (
          <span
            key={i}
            className="inline-block transition duration-1000 ease-out hover:opacity-0 hover:-translate-y-1 hover:rotate-2"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      <p className="text-center text-lg italic text-blaxk-200 mb-6 max-w-2xl mx-auto leading-relaxed">
        {[...`Feline Echoes is a collection of 1,147 emotional NFT ArtWorks on Cardano. Each cat whispers something unspoken. Mint now on JPG Store.`].map((char, i) => (
          <span
            key={i}
            className="inline-block transition duration-1000 ease-out hover:opacity-0 hover:-translate-y-1 hover:rotate-2"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {FILTER_EMOTIONS.map((emotion) => (
          <button
            key={emotion}
            onClick={() => toggleFilter(emotion)}
            className={`px-5 py-2 rounded-full border-2 font-medium tracking-wide transition-all duration-300 shadow-sm text-sm hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-silver-400 ${
              activeFilters.includes(emotion)
                ? isDarkMode
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-white border-black'
                : isDarkMode
                ? 'bg-black text-white border-white/30'
                : 'bg-white text-black border-black/30'
            }`}
          >
            {emotion} {emotionCounts[emotion] > 0 ? `(${emotionCounts[emotion]})` : ''}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <select
          value={selectedEmotion1}
          onChange={(e) => setSelectedEmotion1(e.target.value)}
          className={`px-4 py-2 rounded-md border-2 focus:outline-none transition-all duration-300 hover:ring-2 hover:ring-silver-400 hover:shadow-lg ${
            isDarkMode ? 'bg-black text-white border-white/60' : 'bg-white text-black border-black/60'
          }`}
        >
          <option value="">Emotion 1</option>
          {allEmotions
            .filter((e) => e !== selectedEmotion2 && !activeFilters.includes(e))
            .map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion} {selected.length > 0
                  ? (dynamicCounts[emotion] > 0 ? `(${dynamicCounts[emotion]})` : '')
                  : (emotionCounts[emotion] > 0 ? `(${emotionCounts[emotion]})` : '')}
              </option>
            ))}
        </select>

        <select
          value={selectedEmotion2}
          onChange={(e) => setSelectedEmotion2(e.target.value)}
          className={`px-4 py-2 rounded-md border-2 focus:outline-none transition-all duration-300 hover:ring-2 hover:ring-silver-400 hover:shadow-lg ${
            isDarkMode ? 'bg-black text-white border-white/60' : 'bg-white text-black border-black/60'
          }`}
        >
          <option value="">Emotion 2</option>
          {allEmotions
            .filter((e) => e !== selectedEmotion1 && !activeFilters.includes(e))
            .map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion} {selected.length > 0
                  ? (dynamicCounts[emotion] > 0 ? `(${dynamicCounts[emotion]})` : '')
                  : (emotionCounts[emotion] > 0 ? `(${emotionCounts[emotion]})` : '')}
              </option>
            ))}
        </select>

        <button
          className="text-sm underline opacity-70"
          onClick={() => {
            setSelectedEmotion1('');
            setSelectedEmotion2('');
            setActiveFilters([]);
          }}
        >
          Clear filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {visibleImages.map((img) => (
          <motion.div
            key={img.id}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
            onMouseEnter={() => setHoveredId(img.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setModalImage(img)}
          >
            <img
              src={img.url.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={img.emotion.join(', ')}
              className="w-full h-80 object-cover"
              loading="lazy"
              onError={(e) => {
                const src = e.target.src;
                setTimeout(() => {
                  e.target.src = src;
                }, 1000);
              }}
            />
            <div className="p-3 text-center">
              <p className="text-sm opacity-70 font-medium tracking-wide">{img.title}</p>
              <p className="text-sm opacity-50">{img.emotion.join(', ')}</p>
            </div>
            {hoveredId === img.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-center p-4 text-base"
              >
                {displayedText}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {visibleCount < filteredImages.length && (
        <div className="flex justify-center mt-8">
          <button
  onClick={handleLoadMore}
  className={`px-5 py-2 rounded-full border-2 font-medium tracking-wide transition-all duration-300 shadow-sm text-sm hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-silver-400 ${
    isDarkMode
      ? 'bg-black text-white border-white/30 hover:border-white'
      : 'bg-white text-black border-black/30 hover:border-black'
  }`}
>
  Load more
</button>
        </div>
      )}

      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage.url.replace('ipfs://', 'https://ipfs.io/ipfs/')}
            alt={modalImage.emotion.join(', ')}
            className="max-w-4xl max-h-[80vh] object-contain border-2 border-white rounded-xl"
          />
          <p className="text-white text-lg mt-4 text-center max-w-2xl px-4 font-serif tracking-wide">
            {modalImage.description}
          </p>
          <p className="text-white text-sm mt-1">(click anywhere to close)</p>
        </div>
      )}
    </div>
  );
}
