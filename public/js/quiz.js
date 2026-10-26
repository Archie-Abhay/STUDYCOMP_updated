// Practice Quiz Studio Script (Min 5, Max 15 Questions Limit)
// Handles quiz configuration, question generation, interactive test taking, progressive hints,
// pedagogical misconception feedback, and scorecard summary.

document.addEventListener("DOMContentLoaded", async () => {
  const quizTopicTitle = document.getElementById("quizTopicTitle");
  const quizCountSlider = document.getElementById("quizCountSlider");
  const quizCountInput = document.getElementById("quizCountInput");
  const quizCountDisplay = document.getElementById("quizCountDisplay");
  const quizDifficultySelect = document.getElementById("quizDifficultySelect");
  const btnGenerateQuiz = document.getElementById("btnGenerateQuiz");
  const countPills = document.querySelectorAll(".count-pill");

  const quizSetupPanel = document.getElementById("quizSetupPanel");
  const quizActivePanel = document.getElementById("quizActivePanel");
  const quizSummaryPanel = document.getElementById("quizSummaryPanel");

  const quizProgressText = document.getElementById("quizProgressText");
  const quizProgressBar = document.getElementById("quizProgressBar");
  const profileDiffBadge = document.getElementById("profileDiffBadge");
  const profileAccuracy = document.getElementById("profileAccuracy");
  const profileStreak = document.getElementById("profileStreak");

  const qConcept = document.getElementById("qConcept");
  const qDifficulty = document.getElementById("qDifficulty");
  const qText = document.getElementById("qText");
  const qOptionsContainer = document.getElementById("qOptionsContainer");
  const btnSubmitAnswer = document.getElementById("btnSubmitAnswer");
  const btnNextQuestion = document.getElementById("btnNextQuestion");

  const btnHint1 = document.getElementById("btnHint1");
  const btnHint2 = document.getElementById("btnHint2");
  const hint1Box = document.getElementById("hint1Box");
  const hint2Box = document.getElementById("hint2Box");
  const hint1Text = document.getElementById("hint1Text");
  const hint2Text = document.getElementById("hint2Text");

  const feedbackContainer = document.getElementById("feedbackContainer");
  const feedbackBadge = document.getElementById("feedbackBadge");
  const feedbackHeadline = document.getElementById("feedbackHeadline");
  const feedbackBody = document.getElementById("feedbackBody");
  const feedbackEvidenceQuote = document.getElementById("feedbackEvidenceQuote");
  const feedbackEvidenceMeta = document.getElementById("feedbackEvidenceMeta");

  const scoreFinalText = document.getElementById("scoreFinalText");
  const scorePercentText = document.getElementById("scorePercentText");
  const scoreBreakdownText = document.getElementById("scoreBreakdownText");
  const btnRetakeQuiz = document.getElementById("btnRetakeQuiz");
  const btnReconfigQuiz = document.getElementById("btnReconfigQuiz");

  let currentQuestions = [];
  let currentQuestionIndex = 0;
  let selectedOptionIndex = null;
  let userAnswers = []; // records { questionId, selectedIndex, isCorrect }

  // 1. Initialize Active Topic Info
  async function initTopicInfo() {
    try {
      const data = await API.getActiveNotes();
      if (quizTopicTitle) {
        quizTopicTitle.textContent = `${data.title} (${data.subject || 'Notes'})`;
      }
    } catch (e) {
      if (quizTopicTitle) quizTopicTitle.textContent = "Active Lecture Material";
    }
  }

  // 2. Synchronize Slider, Input, and Quick Pills (Strict Limit: 5 to 15 questions)
  function setQuestionCount(val) {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 5) num = 5;
    if (num > 15) num = 15;

    if (quizCountSlider) quizCountSlider.value = num;
    if (quizCountInput) quizCountInput.value = num;
    if (quizCountDisplay) quizCountDisplay.textContent = `${num} Questions`;

    // Highlight matching pill
    countPills.forEach(pill => {
      const pillVal = parseInt(pill.dataset.count, 10);
      if (pillVal === num) {
        pill.classList.add("active-pill");
      } else {
        pill.classList.remove("active-pill");
      }
    });
  }

  if (quizCountSlider) {
    quizCountSlider.addEventListener("input", (e) => setQuestionCount(e.target.value));
  }
  if (quizCountInput) {
    quizCountInput.addEventListener("change", (e) => setQuestionCount(e.target.value));
  }
  countPills.forEach(pill => {
    pill.addEventListener("click", () => setQuestionCount(pill.dataset.count));
  });

  // 3. Generate Practice Quiz
  async function generateQuiz() {
    const count = parseInt(quizCountSlider ? quizCountSlider.value : 5, 10);
    const difficulty = quizDifficultySelect ? quizDifficultySelect.value : "Adaptive";

    btnGenerateQuiz.disabled = true;
    btnGenerateQuiz.innerHTML = `
      <svg class="btn-spinner" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
      <span>Synthesizing ${count} Grounded Questions…</span>
    `;

    try {
      const res = await API.generateQuiz(count, difficulty);
      currentQuestions = res.questions || [];
      if (currentQuestions.length === 0) {
        showToast("No questions available for this material.", "error");
        return;
      }

      currentQuestionIndex = 0;
      userAnswers = [];
      showToast(`Generated ${currentQuestions.length} practice questions!`, "success");

      // Switch to active quiz panel
      quizSetupPanel.style.display = "none";
      quizSummaryPanel.style.display = "none";
      quizActivePanel.style.display = "block";

      renderQuestion(0);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btnGenerateQuiz.disabled = false;
      btnGenerateQuiz.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <span>Generate Practice Quiz</span>
      `;
    }
  }

  if (btnGenerateQuiz) {
    btnGenerateQuiz.addEventListener("click", generateQuiz);
  }

  // 4. Render Current Question
  function renderQuestion(index) {
    if (index >= currentQuestions.length) {
      showQuizSummary();
      return;
    }

    const q = currentQuestions[index];
    selectedOptionIndex = null;

    // Reset Buttons and containers
    btnSubmitAnswer.style.display = "inline-flex";
    btnSubmitAnswer.disabled = true;
    btnNextQuestion.style.display = "none";
    feedbackContainer.style.display = "none";

    // Reset Hints
    hint1Box.style.display = "none";
    hint2Box.style.display = "none";
    btnHint1.classList.remove("hint-opened");
    btnHint2.classList.remove("hint-opened");
    hint1Text.textContent = q.hintLevel1 || "Reflect on the mechanism described in the lecture notes.";
    hint2Text.textContent = q.hintLevel2 || "Consult the corresponding section in your lecture text.";

    // Update Progress
    const currentNum = index + 1;
    const total = currentQuestions.length;
    quizProgressText.textContent = `Question ${currentNum} of ${total}`;
    const percent = Math.round((currentNum / total) * 100);
    quizProgressBar.style.width = `${percent}%`;

    // Question content
    qConcept.textContent = q.concept || "Academic Concept";
    qDifficulty.textContent = q.difficulty || "Analytical";
    qText.textContent = q.question;

    // Options (A, B, C, D)
    qOptionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((optText, oIdx) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "quiz-option-btn";
      optBtn.dataset.index = oIdx;
      optBtn.innerHTML = `
        <span class="option-letter">${letters[oIdx] || oIdx + 1}</span>
        <span class="option-text">${escapeHtml(optText)}</span>
      `;

      optBtn.addEventListener("click", () => {
        if (btnSubmitAnswer.style.display === "none") return; // already answered
        // Deselect others
        qOptionsContainer.querySelectorAll(".quiz-option-btn").forEach(b => b.classList.remove("selected-option"));
        optBtn.classList.add("selected-option");
        selectedOptionIndex = oIdx;
        btnSubmitAnswer.disabled = false;
      });

      qOptionsContainer.appendChild(optBtn);
    });
  }

  // Progressive Hints Handlers
  if (btnHint1) {
    btnHint1.addEventListener("click", () => {
      const isVisible = hint1Box.style.display === "block";
      hint1Box.style.display = isVisible ? "none" : "block";
      btnHint1.classList.toggle("hint-opened", !isVisible);
    });
  }
  if (btnHint2) {
    btnHint2.addEventListener("click", () => {
      const isVisible = hint2Box.style.display === "block";
      hint2Box.style.display = isVisible ? "none" : "block";
      btnHint2.classList.toggle("hint-opened", !isVisible);
    });
  }

  // 5. Submit Question Answer
  async function submitAnswer() {
    if (selectedOptionIndex === null) {
      showToast("Please choose an answer option.", "error");
      return;
    }

    const q = currentQuestions[currentQuestionIndex];
    btnSubmitAnswer.disabled = true;

    try {
      const evalResult = await API.evaluateQuiz(q.id, selectedOptionIndex);

      // Save current selected option & evaluation
      userAnswers.push({
        questionId: q.id,
        selectedIndex: selectedOptionIndex,
        isCorrect: evalResult.isCorrect,
        correctIndex: evalResult.correctIndex
      });

      // Update learner profile indicators
      if (evalResult.adaptiveProfile) {
        if (profileDiffBadge) profileDiffBadge.textContent = evalResult.adaptiveProfile.currentDifficulty;
        if (profileAccuracy) profileAccuracy.textContent = `${evalResult.adaptiveProfile.accuracy}%`;
        if (profileStreak) profileStreak.textContent = `${evalResult.adaptiveProfile.streak} in a row`;
      }

      // Highlight options: ALWAYS display the correct option in GREEN!
      const optionButtons = qOptionsContainer.querySelectorAll(".quiz-option-btn");
      optionButtons.forEach((btn, idx) => {
        btn.disabled = true;

        if (idx === evalResult.correctIndex) {
          // Always highlight the correct answer in green
          btn.classList.add("option-correct");
          if (idx === selectedOptionIndex) {
            btn.innerHTML += `<span class="correct-answer-tag">✓ Your Answer (Correct)</span>`;
          } else {
            btn.innerHTML += `<span class="correct-answer-tag">✓ Correct Answer</span>`;
          }
        } else if (idx === selectedOptionIndex && !evalResult.isCorrect) {
          // Student chose this incorrect option: highlight in red
          btn.classList.add("option-incorrect");
          btn.innerHTML += `<span class="incorrect-answer-tag">✗ Your Selection</span>`;
        }
      });

      // Render diagnostic feedback card
      renderFeedback(evalResult);

      // Hide submit button and immediately show simple Next Question button
      btnSubmitAnswer.style.display = "none";
      btnNextQuestion.style.display = "inline-flex";

      const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
      btnNextQuestion.innerHTML = isLastQuestion ?
        `<span>View Final Scorecard →</span>` :
        `<span>Next Question →</span>`;

    } catch (err) {
      showToast(err.message, "error");
      btnSubmitAnswer.disabled = false;
    }
  }

  if (btnSubmitAnswer) {
    btnSubmitAnswer.addEventListener("click", submitAnswer);
  }

  // Render Pedagogical Feedback
  function renderFeedback(evalResult) {
    feedbackContainer.style.display = "block";

    if (evalResult.isCorrect) {
      feedbackContainer.className = "quiz-feedback-card feedback-correct";
      feedbackBadge.className = "feedback-badge badge-correct";
      feedbackBadge.textContent = "CORRECT: VERIFIED BY LECTURE NOTES";
      feedbackHeadline.textContent = "Accurate Understanding Demonstrated";
      feedbackBody.textContent = evalResult.explanation;
    } else {
      feedbackContainer.className = "quiz-feedback-card feedback-incorrect";
      feedbackBadge.className = "feedback-badge badge-misconception";
      feedbackBadge.textContent = "MISCONCEPTION IDENTIFIED";
      feedbackHeadline.textContent = evalResult.feedbackHeadline || "Targeted Concept Diagnostic:";
      feedbackBody.innerHTML = `
        <strong>Misconception Analysis:</strong> ${escapeHtml(evalResult.misconceptionAnalysis)}
        <br><br>
        <strong>Correct Fact:</strong> ${escapeHtml(evalResult.explanation)}
      `;
    }

    if (evalResult.evidence) {
      feedbackEvidenceQuote.textContent = `"${evalResult.evidence.quote}"`;
      feedbackEvidenceMeta.textContent = `Source: ${evalResult.evidence.section} (Paragraph ${evalResult.evidence.paragraph})`;
    }
  }

  // 6. Next Question Handler
  if (btnNextQuestion) {
    btnNextQuestion.addEventListener("click", () => {
      currentQuestionIndex++;
      renderQuestion(currentQuestionIndex);
    });
  }

  // 7. Show Scorecard Summary
  function showQuizSummary() {
    quizActivePanel.style.display = "none";
    quizSummaryPanel.style.display = "block";

    const total = currentQuestions.length;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const percent = Math.round((correctCount / total) * 100);

    scoreFinalText.textContent = `${correctCount} / ${total} Correct`;
    scorePercentText.textContent = `${percent}% Accuracy`;

    let gradeMsg = "";
    if (percent >= 85) {
      gradeMsg = "Outstanding mastery! You have demonstrated high factual precision grounded strictly in the notes.";
    } else if (percent >= 60) {
      gradeMsg = "Good baseline grounding. Review the highlighted evidence citations on the study page to resolve identified misconceptions.";
    } else {
      gradeMsg = "Foundational reinforcement needed. Return to the Study Q&A console to inspect verbatim citations before attempting the quiz again.";
    }

    scoreBreakdownText.textContent = gradeMsg;
  }

  // Retake or Reconfigure Buttons
  if (btnRetakeQuiz) {
    btnRetakeQuiz.addEventListener("click", () => {
      currentQuestionIndex = 0;
      userAnswers = [];
      quizSummaryPanel.style.display = "none";
      quizActivePanel.style.display = "block";
      renderQuestion(0);
    });
  }
  if (btnReconfigQuiz) {
    btnReconfigQuiz.addEventListener("click", () => {
      quizSummaryPanel.style.display = "none";
      quizActivePanel.style.display = "none";
      quizSetupPanel.style.display = "block";
    });
  }

  await initTopicInfo();
  setQuestionCount(5); // Default to 5 questions
});
