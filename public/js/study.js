// Study & Grounded Q&A Page Script
// Loads active notes into Document Reader, handles grounded Q&A, evidence locator,
// out-of-scope refusals, and live demo checklist integration.

document.addEventListener("DOMContentLoaded", async () => {
  const activeTopicTitle = document.getElementById("activeTopicTitle");
  const activeTopicSubject = document.getElementById("activeTopicSubject");
  const activeNotesSummary = document.getElementById("activeNotesSummary");
  const notesDocumentReader = document.getElementById("notesDocumentReader");
  const notesSearchInput = document.getElementById("notesSearchInput");

  const questionInput = document.getElementById("questionInput");
  const btnSubmitQuestion = document.getElementById("btnSubmitQuestion");
  const chipSupported = document.getElementById("chipSupported");
  const chipUnsupported = document.getElementById("chipUnsupported");

  const answerContainer = document.getElementById("answerContainer");
  const answerContent = document.getElementById("answerContent");
  const groundingBadge = document.getElementById("groundingBadge");
  const evidenceCard = document.getElementById("evidenceCard");
  const evidenceList = document.getElementById("evidenceList");
  const refusalCard = document.getElementById("refusalCard");
  const refusalReasonText = document.getElementById("refusalReasonText");

  const btnPromptTrace = document.getElementById("btnPromptTrace");
  const promptModal = document.getElementById("promptModal");
  const btnClosePromptModal = document.getElementById("btnClosePromptModal");
  const promptCodeBlock = document.getElementById("promptCodeBlock");

  let currentActiveData = null;
  let lastGemmaTrace = null;

  // 1. Load active notes into reader
  async function loadActiveNotes() {
    try {
      const data = await API.getActiveNotes();
      currentActiveData = data;

      if (activeTopicTitle) activeTopicTitle.textContent = data.title;
      if (activeTopicSubject) activeTopicSubject.textContent = data.subject || "Academic Course Material";
      if (activeNotesSummary) {
        activeNotesSummary.textContent = `${data.indexedSummary.totalSentences} verified sentences across ${data.indexedSummary.totalParagraphs} paragraphs (${data.indexedSummary.sections.length} sections)`;
      }

      renderDocumentReader(data.sections);
      updateDemoChips(data.demoQuestions);
      refreshChecklist();
    } catch (err) {
      showToast(err.message, "error");
      if (notesDocumentReader) {
        notesDocumentReader.innerHTML = `<div class="reader-empty">Unable to load active material. <a href="/">Return to Upload Page</a></div>`;
      }
    }
  }

  // Render notes with section headings, paragraph tags, and sentence identifiers
  function renderDocumentReader(sections) {
    if (!notesDocumentReader) return;
    if (!sections || sections.length === 0) {
      notesDocumentReader.innerHTML = `<div class="reader-empty">No notes content loaded. <a href="/">Upload material here</a>.</div>`;
      return;
    }

    let html = "";
    sections.forEach((sec, sIdx) => {
      html += `<div class="reader-section" data-section-idx="${sIdx}">`;
      html += `<h3 class="reader-section-title">${escapeHtml(sec.title)}</h3>`;

      sec.paragraphs.forEach((para, pIdx) => {
        html += `<div class="reader-paragraph" data-para-idx="${pIdx + 1}">`;
        html += `<span class="para-marker">§${pIdx + 1}</span>`;

        // Split paragraph lines and bullets into readable blocks
        const lines = para.split("\n");
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;

          const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ");
          const cleanLine = trimmed.replace(/^[-*•]\s*|\d+\.\s+/, "");

          html += `<div class="para-line ${isBullet ? 'is-bullet' : ''}">`;
          if (isBullet) {
            html += `<span class="bullet-dot" aria-hidden="true">•</span>`;
          }

          // Split line into sentences for fine-grained highlighting
          const rawSentences = cleanLine.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleanLine];
          rawSentences.forEach((sentText, rIdx) => {
            const sentenceId = `sent_${sIdx}_${pIdx}_${rIdx}`;
            html += `<span class="note-sentence" data-sentence-text="${escapeHtml(sentText.trim())}" id="${sentenceId}">${escapeHtml(sentText)}</span> `;
          });

          html += `</div>`;
        });

        html += `</div>`;
      });

      html += `</div>`;
    });

    notesDocumentReader.innerHTML = html;
  }

  // Quick chips for demo queries
  function updateDemoChips(demoQuestions) {
    if (demoQuestions && demoQuestions.supported && chipSupported) {
      chipSupported.style.display = "inline-flex";
      chipSupported.querySelector(".chip-text").textContent = `Query: "${demoQuestions.supported.question.slice(0, 48)}…"`;
      chipSupported.onclick = () => {
        questionInput.value = demoQuestions.supported.question;
        askGroundedQuestion();
      };
    } else if (chipSupported) {
      chipSupported.style.display = "none";
    }

    if (demoQuestions && demoQuestions.unsupported && chipUnsupported) {
      chipUnsupported.style.display = "inline-flex";
      chipUnsupported.querySelector(".chip-text").textContent = `Unsupported: "${demoQuestions.unsupported.question.slice(0, 46)}…"`;
      chipUnsupported.onclick = () => {
        questionInput.value = demoQuestions.unsupported.question;
        askGroundedQuestion();
      };
    } else if (chipUnsupported) {
      chipUnsupported.style.display = "none";
    }
  }

  // Ask Question
  async function askGroundedQuestion() {
    const query = questionInput.value.trim();
    if (!query) {
      showToast("Please enter an inquiry regarding the notes.", "error");
      return;
    }

    btnSubmitQuestion.disabled = true;
    btnSubmitQuestion.innerHTML = `
      <svg class="btn-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>Searching Notes…</span>
    `;

    // Clear previous highlights
    clearEvidenceHighlights();

    try {
      const result = await API.askQuestion(query);
      lastGemmaTrace = result.gemmaPromptTrace;
      renderAnswerResult(result);
      refreshChecklist();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btnSubmitQuestion.disabled = false;
      btnSubmitQuestion.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Ask Question</span>
      `;
    }
  }

  if (btnSubmitQuestion) {
    btnSubmitQuestion.addEventListener("click", askGroundedQuestion);
  }
  if (questionInput) {
    questionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askGroundedQuestion();
      }
    });
  }

  // Render Q&A Result
  function renderAnswerResult(result) {
    answerContainer.style.display = "block";

    if (result.isRefusal) {
      // Out of scope refusal
      groundingBadge.className = "grounding-status-badge refusal-badge";
      groundingBadge.textContent = "NOT FOUND IN NOTES";

      refusalCard.style.display = "block";
      refusalReasonText.textContent = result.refusalReason || "The provided lecture material does not contain sufficient facts to answer this inquiry.";

      answerContent.innerHTML = `<p class="refusal-explanation-body">${escapeHtml(result.answer)}</p>`;
      evidenceCard.style.display = "none";
    } else {
      // Grounded answer
      groundingBadge.className = "grounding-status-badge supported-badge";
      groundingBadge.textContent = "VERIFIED IN NOTES";

      refusalCard.style.display = "none";
      evidenceCard.style.display = "block";

      // Format markdown bold points
      const formatted = result.answer
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n• /g, "<br>• ");

      answerContent.innerHTML = `<p>${formatted}</p>`;

      // Render evidence citations
      if (result.evidence && result.evidence.length > 0) {
        evidenceList.innerHTML = "";
        result.evidence.forEach((ev, idx) => {
          const item = document.createElement("div");
          item.className = "evidence-quote-item";
          item.innerHTML = `
            <div class="evidence-quote-header">
              <span class="evidence-tag">Citation [${idx + 1}]</span>
              <span class="evidence-meta">${escapeHtml(ev.section)} · Paragraph ${ev.paragraph}</span>
              <button type="button" class="btn-ghost btn-xs btn-highlight-evidence" data-quote="${escapeHtml(ev.verbatimQuote)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Locate in Notes</span>
              </button>
            </div>
            <blockquote class="evidence-blockquote">"${escapeHtml(ev.verbatimQuote)}"</blockquote>
          `;

          item.querySelector(".btn-highlight-evidence").onclick = () => {
            highlightVerbatimQuoteInReader(ev.verbatimQuote);
          };

          evidenceList.appendChild(item);
        });

        // Auto highlight the primary citation
        highlightVerbatimQuoteInReader(result.evidence[0].verbatimQuote);
      }
    }
  }

  // Highlight sentence inside the left reader
  function highlightVerbatimQuoteInReader(quoteText) {
    clearEvidenceHighlights();
    const sentences = notesDocumentReader.querySelectorAll(".note-sentence");
    let found = false;

    sentences.forEach(span => {
      const text = span.textContent.trim().toLowerCase();
      const target = quoteText.trim().toLowerCase();

      if (text.includes(target) || target.includes(text) || (text.length > 25 && target.slice(0, 25) === text.slice(0, 25))) {
        span.classList.add("evidence-highlighted");
        if (!found) {
          found = true;
          span.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    if (found) {
      showToast("Located supporting evidence in lecture document", "info");
    }
  }

  function clearEvidenceHighlights() {
    if (!notesDocumentReader) return;
    notesDocumentReader.querySelectorAll(".evidence-highlighted").forEach(el => {
      el.classList.remove("evidence-highlighted");
    });
  }

  // In-document search
  if (notesSearchInput) {
    notesSearchInput.addEventListener("input", (e) => {
      const term = e.target.value.trim().toLowerCase();
      const sentences = notesDocumentReader.querySelectorAll(".note-sentence");

      sentences.forEach(span => {
        if (!term) {
          span.classList.remove("search-match");
        } else if (span.textContent.toLowerCase().includes(term)) {
          span.classList.add("search-match");
        } else {
          span.classList.remove("search-match");
        }
      });
    });
  }

  // Prompt Trace Modal
  if (btnPromptTrace) {
    btnPromptTrace.addEventListener("click", () => {
      if (promptCodeBlock) {
        promptCodeBlock.textContent = lastGemmaTrace || "Run a query to generate and inspect Gemma 4's exact turn prompt.";
      }
      if (promptModal) promptModal.style.display = "flex";
    });
  }
  if (btnClosePromptModal) {
    btnClosePromptModal.addEventListener("click", () => {
      if (promptModal) promptModal.style.display = "none";
    });
  }

  // Demo Checklist Bar
  async function refreshChecklist() {
    const listEl = document.getElementById("demoChecklistItems");
    if (!listEl) return;
    try {
      const data = await API.getDemoChecklist();
      listEl.innerHTML = "";

      data.items.forEach(item => {
        const row = document.createElement("div");
        row.className = `checklist-row-item ${item.status === 'PASSED' ? 'row-passed' : 'row-ready'}`;
        row.innerHTML = `
          <div class="chk-status-col">
            <span class="chk-status-badge ${item.status === 'PASSED' ? 'badge-passed' : 'badge-ready'}">${item.status}</span>
          </div>
          <div class="chk-info-col">
            <span class="chk-title">${escapeHtml(item.title)}</span>
            <span class="chk-desc">${escapeHtml(item.description)}</span>
          </div>
        `;
        listEl.appendChild(row);
      });
    } catch (e) {
      // Non critical
    }
  }

  await loadActiveNotes();
});
