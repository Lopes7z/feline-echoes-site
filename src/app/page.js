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
  const [isMobile, setIsMobile] = useState(false);
  
  const FILTER_EMOTIONS = [
    'Fear', 'Overwhelm', 'Guilt',
    'Solitude', 'Grief', 'Emptiness',
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
    <div className={`${isDarkMode ? 'bg-[#000509] text-white' : 'bg-white text-black'} p-6 min-h-screen relative`}>
<div className="fixed top-2 sm:top-4 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8">
  {/* Left-side buttons */}
  <div className="flex gap-2">
    <a
      href="#about"
      className={`px-4 py-1 rounded-full border-2 font-medium tracking-wide text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-silver-400 ${
        isDarkMode
          ? 'bg-black text-white border-white/30 hover:border-white'
          : 'bg-white text-black border-black/30 hover:border-black'
      }`}
    >
      About
    </a>

    <a
      href="#nft-economics"
      className={`px-4 py-1 rounded-full border-2 font-medium tracking-wide text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-silver-400 ${
        isDarkMode
          ? 'bg-black text-white border-white/30 hover:border-white'
          : 'bg-white text-black border-black/30 hover:border-black'
      }`}
    >
      NFT Economics
    </a>

    <div
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setHoveredId('mint')}
      onMouseLeave={() => setHoveredId(null)}
    >
      <a
        href="https://www.jpg.store/collection/felineechoes"
        target="_blank"
        rel="noopener noreferrer"
        className={`px-4 py-1 rounded-full border-2 font-medium tracking-wide text-sm transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105 hover:ring-2 hover:ring-yellow-300 pulse-gold-bg ${
          isDarkMode
            ? 'text-white border-white'
            : 'text-black border-black'
        }`}
      >
        Mint
      </a>

      {hoveredId === 'mint' && (
  <p
    className={`absolute top-full mt-2 text-xs italic text-center font-serif whitespace-nowrap tracking-wide px-3 py-1 rounded ${
      isDarkMode ? 'text-white/80' : 'text-black/80'
    }`}
    style={{ whiteSpace: 'nowrap' }}
  >
    {'A single click. A permanent emotion.'.split(' ').map((word, index) => (
      <span
        key={index}
        className="word-fade-in"
        style={{
          animationDelay: `${index * 0.3}s`,
          display: 'inline-block',
          marginRight: '0.25em',
        }}
      >
        {word}
      </span>
    ))}
  </p>
)}

    </div>
  </div>

  {/* Right-side dark/light toggle */}
  <button
    onClick={() => setIsDarkMode(!isDarkMode)}
    className={`px-4 py-1 rounded-full border-2 font-medium tracking-wide text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-silver-400 ${
      isDarkMode
        ? 'bg-black text-white border-white/30 hover:border-white'
        : 'bg-white text-black border-black/30 hover:border-black'
    }`}
  >
    {isDarkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
  </button>
</div>

      <h1 className="mt-12 sm:mt-14 text-3xl sm:text-5xl font-serif font-semibold mb-2 text-center tracking-wide">
        {[..."Feline Echoes"].map((char, i) => (
          <span
            key={i}
            className="inline-block transition duration-1000 ease-out hover:opacity-0 hover:-translate-y-1 hover:rotate-2"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      <p className={`text-center text-base sm:text-lg italic mb-6 max-w-2xl mx-auto leading-relaxed ${
  isDarkMode ? 'text-white/70' : 'text-black/70'
}`}>
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
      <div id="about" className="scroll-mt-12 mt-14 max-w-3xl mx-auto text-center px-4 py-10">
  <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-serif">About the Project</h2>
  <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
  <div className="text-base sm:text-lg leading-relaxed md:w-1/2">
    <p className="mb-4">
      <strong>Feline Echoes</strong> is a collection of 1,147 digital artworks that explore the depths of human emotion
      through the silent gaze of cats — quiet observers turned mirrors of the soul. Each piece echoes feelings we often
      struggle to express in words: sorrow, hope, loss, guilt, longing, and forgiveness.
    </p>
    <p className="mb-4">
      This collection was created with a sensitive and intentional eye, aiming to connect emotionally broken individuals
      with images that whisper exactly what they feel — even when they don’t know how to say it.
    </p>
  </div>
  <img
    src="https://gateway.pinata.cloud/ipfs/QmfSbno54M7XTP7hipX3ZPBE2bPJ6qdXyhJu7nBp36NXip"
    alt="Feline Echo Project"
    className="w-96 h-96 rounded-2xl object-cover shadow-lg md:w-1/2"
  />
</div>
  <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-serif mt-10">About the Creator</h2>
  <div className="flex flex-col md:flex-row items-center gap-6">
  <img
    src="https://gateway.pinata.cloud/ipfs/QmR4ZNPsx97YbvtbAGQbDNDMe78KSXMJr1RaV6K9o97e3B"
    alt="Alisson Lopes"
    className="w-96 h-96 rounded-2xl object-cover shadow-lg"
  />
  <div className="text-base sm:text-lg leading-relaxed">
    <p className="mb-4">
      I am <strong>A. L.</strong> — a Christian pastor, conceptual artist, and the mind behind Feline Echoes.
      As someone who walks daily with people through stories of pain, faith, and redemption, I’ve come to understand how
      deeply we carry unspoken emotions.
    </p>
    <p className="mb-4">
      This project is born from the fusion of my faith, my pastoral journey, and my passion for art, silence, and digital
      expression.
    </p>
    <p className="italic">
      Feline Echoes is not about cats. <br />
      It’s about you. <br />
      It’s about me. <br />
      It’s about everything we’ve felt but never said.
    </p>
  </div>
</div>
  <h2 className="text-2xl sm:text-3xl font-bold mb-6 font-serif mt-10">Vision and Future</h2>
  <div className="flex flex-col md:flex-row items-center gap-6 mt-10">
  <div className="text-base sm:text-lg leading-relaxed md:w-1/2">
    <p className="mb-4">
      The first phase — <strong>Core Emotions</strong> — captures the fundamental feelings that shape the human experience.
      Future phases will explore healing, reconnection, and transcendence.
    </p>
    <p>
      Our mission is simple: <strong>to touch souls with illustrated silence</strong>. In the near future, we aim to expand
      this universe through physical editions, immersive experiences, and emotionally-driven exhibitions — digital and
      beyond.
    </p>
  </div>
  <img
    src="https://gateway.pinata.cloud/ipfs/QmYoB1WpX8J8rExA8vYwupShYaYWzm3eweFpwiFimPuHKw"
    alt="Vision and Future"
    className="w-96 h-96 rounded-2xl object-cover shadow-lg md:w-1/2"
  />
</div>
</div>
<div id="nft-economics" className="scroll-mt-12 mt-14 max-w-3xl mx-auto px-4 py-10 text-center">
<h2 className="text-2xl sm:text-3xl font-bold mb-6 font-serif">NFT Economics</h2>
<div className="flex flex-col md:flex-row items-center gap-6 mb-10">
  <div className="text-base sm:text-lg leading-relaxed md:w-1/2">
    <p className="mb-4">
      <strong>NFTomics</strong> — or NFT economics — is how we structure the emotional and financial logic behind the collection.
    </p>
    <p className="mb-4">
      Feline Echoes is not a generative project. Each piece is individually created, deeply intentional, and emotionally loaded. 
      The mint price is not just a number — it reflects the value of unique visual art that speaks what many cannot say.
    </p>
    <p className="mb-4">
      This collection is about building something meaningful — not just minting quickly, but creating a lasting emotional archive. 
      Every phase funds this artistic mission and honors the silence inside each artwork.
    </p>
    <p>
      Minting here is not just a transaction. It’s participation in a journey.
    </p>
  </div>
  <img
    src="https://gateway.pinata.cloud/ipfs/QmYCQASVEkxuWYWjwA1dC51HcUdwhiLzaJPUQ3eR5V74hV"
    alt="NFT Economics"
    className="w-96 h-96 rounded-2xl object-cover shadow-lg md:w-1/2"
  />
</div>

<h2 className="text-2xl sm:text-3xl font-bold mb-6 font-serif mt-10">Minting Phases</h2>
<div className="flex flex-col md:flex-row items-center gap-6 mb-10">
  <img
    src="https://gateway.pinata.cloud/ipfs/QmdwP9xbg6tZFxbwhbVsB4QnMNtS4nSv4ttoNoKS3Tqmpo"
    alt="Minting Phases"
    className="w-96 h-96 rounded-2xl object-cover shadow-lg md:w-1/2"
  />
  <div className="text-base sm:text-lg leading-relaxed md:w-1/2 text-left">
    <p className="mb-4">
      <strong>PHASE 1 — Public Whitelist</strong><br />
      🗓 May 20, 2025 – May 27, 2025<br />
      🎟 147 NFTs<br />
      💰 Price: 49 ADA<br />
      🔓 No wallet limit — up to 10 per transaction
    </p>
    <p className="mb-4">
      <strong>PHASE 2 — Echo Gallery</strong><br />
      🗓 May 27, 2025 – June 3, 2025<br />
      🎟 400 NFTs<br />
      💰 Price: 99 ADA<br />
      🔓 No wallet limit — up to 10 per transaction
    </p>
    <p>
      <strong>PHASE 3 — Silent Auction</strong><br />
      🗓 June 3, 2025 – June 10, 2025<br />
      🎟 600 NFTs<br />
      💰 Price: 199 ADA<br />
      🔓 No wallet limit — up to 10 per transaction
    </p>
  </div>
</div>

<h2 className="text-2xl sm:text-3xl font-bold mb-6 font-serif mt-10">How Value Grows</h2>
<div className="flex flex-col md:flex-row items-center gap-6">
  <div className="text-base sm:text-lg leading-relaxed md:w-1/2">
    <p className="mb-4">
      The price rises — not because of hype, but because of depth.
    </p>
    <p className="mb-4">
      Each NFT in Feline Echoes is handcrafted with care, representing emotions that are often silenced. 
      As the phases progress, the collection matures — echoing the journey of healing, self-awareness, and emotional clarity.
    </p>
    <ul className="mb-4 list-disc list-inside">
      <li>Early collectors are rewarded with lower mint prices.</li>
      <li>Later phases reflect greater refinement and significance.</li>
      <li>No two pieces are the same. Each one whispers something unspoken.</li>
    </ul>
    <p>
      This is not about flipping.<br />
      It’s about feeling.<br />
      It’s about echoing what words alone can’t express.
    </p>
  </div>
  <img
    src="https://gateway.pinata.cloud/ipfs/QmPjabK6KyQs5yxg9x481UvT8Mww5Cz88okV6fwG5qmkRB"
    alt="How Value Grows"
    className="w-96 h-96 rounded-2xl object-cover shadow-lg md:w-1/2"
  />
</div>
</div>

    </div>
  );
}
