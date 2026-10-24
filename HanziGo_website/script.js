const vocabulary = [
  {id:1, hanzi:"你好", pinyin:"nǐ hǎo", meaning:"Xin chào", topic:"Chào hỏi", example:"你好！", translation:"Xin chào!"},
  {id:2, hanzi:"谢谢", pinyin:"xiè xie", meaning:"Cảm ơn", topic:"Chào hỏi", example:"谢谢你。", translation:"Cảm ơn bạn."},
  {id:3, hanzi:"再见", pinyin:"zài jiàn", meaning:"Tạm biệt", topic:"Chào hỏi", example:"明天再见。", translation:"Ngày mai gặp lại."},
  {id:4, hanzi:"请问", pinyin:"qǐng wèn", meaning:"Xin hỏi", topic:"Chào hỏi", example:"请问，你叫什么？", translation:"Xin hỏi, bạn tên gì?"},
  {id:5, hanzi:"我", pinyin:"wǒ", meaning:"Tôi, mình", topic:"Con người", example:"我是学生。", translation:"Tôi là học sinh."},
  {id:6, hanzi:"你", pinyin:"nǐ", meaning:"Bạn", topic:"Con người", example:"你好吗？", translation:"Bạn khỏe không?"},
  {id:7, hanzi:"朋友", pinyin:"péng you", meaning:"Bạn bè", topic:"Con người", example:"他是我的朋友。", translation:"Anh ấy là bạn của tôi."},
  {id:8, hanzi:"老师", pinyin:"lǎo shī", meaning:"Giáo viên", topic:"Con người", example:"她是老师。", translation:"Cô ấy là giáo viên."},
  {id:9, hanzi:"学习", pinyin:"xué xí", meaning:"Học tập", topic:"Học tập", example:"我学习中文。", translation:"Tôi học tiếng Trung."},
  {id:10, hanzi:"中文", pinyin:"zhōng wén", meaning:"Tiếng Trung", topic:"Học tập", example:"我喜欢中文。", translation:"Tôi thích tiếng Trung."},
  {id:11, hanzi:"水", pinyin:"shuǐ", meaning:"Nước", topic:"Hằng ngày", example:"我想喝水。", translation:"Tôi muốn uống nước."},
  {id:12, hanzi:"今天", pinyin:"jīn tiān", meaning:"Hôm nay", topic:"Hằng ngày", example:"今天我很忙。", translation:"Hôm nay tôi rất bận."}
];

const state = {
  topic: "Tất cả",
  query: "",
  favorites: new Set(JSON.parse(localStorage.getItem("hanzigo-favorites") || "[]")),
  learned: new Set(JSON.parse(localStorage.getItem("hanzigo-learned") || "[]"))
};

const wordGrid = document.getElementById("wordGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

function saveState() {
  localStorage.setItem("hanzigo-favorites", JSON.stringify([...state.favorites]));
  localStorage.setItem("hanzigo-learned", JSON.stringify([...state.learned]));
}

function updateStats() {
  document.getElementById("totalCount").textContent = vocabulary.length;
  document.getElementById("favoriteCount").textContent = state.favorites.size;
  document.getElementById("learnedCount").textContent = state.learned.size;
}

function renderWords() {
  const filtered = vocabulary.filter(word => {
    const searchText = `${word.hanzi} ${word.pinyin} ${word.meaning} ${word.topic} ${word.example}`.toLowerCase();
    const matchesQuery = searchText.includes(state.query.toLowerCase().trim());
    const matchesTopic = state.topic === "Tất cả" ||
      (state.topic === "Yêu thích" ? state.favorites.has(word.id) : word.topic === state.topic);
    return matchesQuery && matchesTopic;
  });

  wordGrid.innerHTML = filtered.map(word => {
    const isFavorite = state.favorites.has(word.id);
    const isLearned = state.learned.has(word.id);
    return `
      <article class="word-card ${isLearned ? "learned" : ""}">
        <div class="word-top">
          <span class="topic-tag">${word.topic}</span>
          <div class="card-actions">
            <button class="icon-btn ${isFavorite ? "favorite" : ""}" data-action="favorite" data-id="${word.id}" aria-label="Yêu thích ${word.hanzi}" title="Thêm vào yêu thích">${isFavorite ? "♥" : "♡"}</button>
          </div>
        </div>
        <div class="word-hanzi" lang="zh">${word.hanzi}</div>
        <div class="word-pinyin">${word.pinyin}</div>
        <div class="word-meaning">${word.meaning}</div>
        <div class="word-example" lang="zh">${word.example}</div>
        <div class="example-translation">${word.translation}</div>
        <div class="card-bottom">
          <button class="learn-button ${isLearned ? "done" : ""}" data-action="learned" data-id="${word.id}">${isLearned ? "✓ Đã học" : "○ Đánh dấu đã học"}</button>
          <button class="speak-button" data-action="speak" data-id="${word.id}" aria-label="Nghe ${word.hanzi}" title="Nghe phát âm">🔊</button>
        </div>
      </article>`;
  }).join("");

  document.getElementById("resultsText").textContent = `${filtered.length} từ vựng`;
  emptyState.hidden = filtered.length > 0;
  wordGrid.hidden = filtered.length === 0;
  updateStats();
}

document.getElementById("topicFilters").addEventListener("click", event => {
  const button = event.target.closest("button[data-topic]");
  if (!button) return;
  state.topic = button.dataset.topic;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderWords();
});

searchInput.addEventListener("input", event => {
  state.query = event.target.value;
  renderWords();
});

wordGrid.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const word = vocabulary.find(item => item.id === id);
  if (!word) return;

  if (button.dataset.action === "favorite") {
    state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
    saveState();
    renderWords();
  } else if (button.dataset.action === "learned") {
    state.learned.has(id) ? state.learned.delete(id) : state.learned.add(id);
    saveState();
    renderWords();
  } else if (button.dataset.action === "speak") {
    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt này chưa hỗ trợ phát âm tự động.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.hanzi);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
});

renderWords();
