// Home Page (Notes Intake) Script for Study Companion
// Handles note upload, pasting, live statistics, sample loading, and navigation to /study

document.addEventListener("DOMContentLoaded", () => {
  const notesTextarea = document.getElementById("notesTextarea");
  const notesTitleInput = document.getElementById("notesTitleInput");
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");
  const btnSaveAndContinue = document.getElementById("btnSaveAndContinue");
  const btnLoadCrispr = document.getElementById("btnLoadCrispr");
  const counterWords = document.getElementById("counterWords");
  const counterSentences = document.getElementById("counterSentences");
  const counterChars = document.getElementById("counterChars");
  const presetContainer = document.getElementById("presetContainer");

  // Single Sample Topic Notes: Cellular Respiration & Bioenergetics
  const SAMPLE_CELLULAR_RESPIRATION_TEXT = `# Topic: Cellular Respiration & Bioenergetics: Aerobic Metabolism in Eukaryotes
Course: BIOL 201 - Advanced Cell Biology & Metabolism
Instructor: Dr. A. Vance | Lecture Series 4

## 1. Overview and Overall Chemical Equation
Cellular respiration is the biochemical pathway by which eukaryotic cells break down glucose in the presence of molecular oxygen to produce ATP, carbon dioxide, and water. The overall balanced chemical formula is:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + approximately 30-32 ATP.
The process consists of four sequential stages: (1) Glycolysis, (2) Pyruvate Oxidation / Link Reaction, (3) The Citric Acid (Krebs) Cycle, and (4) Oxidative Phosphorylation (Electron Transport Chain and Chemiosmosis).

## 2. Stage 1: Glycolysis (Cytoplasm)
Glycolysis occurs exclusively in the cytosol and does not require oxygen directly (it can function anaerobically). One 6-carbon glucose molecule is broken down into two 3-carbon molecules of pyruvate.
- Energy Investment Phase: Two ATP molecules are hydrolyzed to phosphorylate glucose intermediates. The rate-limiting enzyme is phosphofructokinase-1 (PFK-1), which is allosterically inhibited by high ATP and high citrate levels, and stimulated by high AMP.
- Energy Payoff Phase: Four ATP molecules are generated via substrate-level phosphorylation, along with two molecules of reduced NADH from NAD+.
- Net Yield per glucose: 2 Pyruvate, 2 Net ATP (4 produced minus 2 consumed), and 2 NADH.

## 3. Stage 2: Pyruvate Oxidation (Mitochondrial Matrix)
Under aerobic conditions, pyruvate enters the mitochondrial matrix via a secondary active transport symporter using the pyruvate-H+ symport carrier.
- Pyruvate is acted upon by the multienzyme pyruvate dehydrogenase (PDH) complex.
- Reaction: Pyruvate (3C) + CoA-SH + NAD+ -> Acetyl-CoA (2C) + CO2 + NADH + H+.
- Decarboxylation: One carbon is released as CO2 per pyruvate molecule (total 2 CO2 per glucose).
- Acetyl-CoA acts as the high-energy carrier molecule entering the Krebs Cycle.

## 4. Stage 3: The Citric Acid (Krebs) Cycle (Mitochondrial Matrix)
The citric acid cycle operates in the matrix of the mitochondria. Acetyl-CoA (2 carbons) combines with oxaloacetate (4 carbons) catalyzed by citrate synthase to form citrate (6 carbons).
- In a series of eight enzymatic reactions, citrate is oxidized back into oxaloacetate.
- Per turn of the cycle (per Acetyl-CoA):
  * 3 molecules of NADH are generated (from reduction of NAD+ by isocitrate dehydrogenase, alpha-ketoglutarate dehydrogenase, and malate dehydrogenase).
  * 1 molecule of FADH2 is formed (catalyzed by succinate dehydrogenase, which is bound directly to the inner mitochondrial membrane as Complex II).
  * 1 molecule of GTP (or ATP) is synthesized via substrate-level phosphorylation (succinyl-CoA synthetase).
  * 2 molecules of CO2 are released as metabolic waste.
- Per Glucose (2 turns of the cycle): 6 NADH, 2 FADH2, 2 ATP/GTP, and 4 CO2 are produced.

## 5. Stage 4: Oxidative Phosphorylation & Chemiosmosis
This stage takes place across the inner mitochondrial membrane (cristae) and yields the vast majority of cellular ATP.
- Electron Transport Chain (ETC):
  * Complex I (NADH dehydrogenase): accepts electrons from NADH, pumping 4 protons (H+) from the matrix into the intermembrane space.
  * Complex II (Succinate dehydrogenase): accepts electrons from FADH2; does NOT pump any protons across the membrane.
  * Coenzyme Q (Ubiquinone): a lipophilic mobile electron carrier moving within the lipid bilayer between Complexes I/II and Complex III.
  * Complex III (Cytochrome bc1 complex): pumps 4 protons into the intermembrane space.
  * Cytochrome c: a hydrophilic peripheral membrane protein carrying electrons from Complex III to Complex IV.
  * Complex IV (Cytochrome c oxidase): transfers electrons to the terminal electron acceptor, molecular oxygen (O2). When O2 accepts four electrons and four protons, it is reduced to form two molecules of metabolic water (H2O). Complex IV pumps 2 protons into the intermembrane space.
- Proton-Motive Force & Chemiosmosis:
  * The directional pumping of protons creates a steep electrochemical gradient across the inner mitochondrial membrane (intermembrane space is acidic and positively charged relative to the matrix).
  * Peter Mitchell's Chemiosmotic Hypothesis explains that ATP synthesis is driven by this proton gradient.
  * Protons flow down their electrochemical gradient back into the mitochondrial matrix through ATP Synthase (Complex V).
  * The rotation of the F0 rotor subunit drives conformational changes in the F1 catalytic head, phosphorylating ADP and inorganic phosphate (Pi) to synthesize ATP.
- Cyanide and Carbon Monoxide Toxicity:
  * Cyanide (CN-) and carbon monoxide (CO) act as potent metabolic poisons by binding with high affinity to the heme iron in Cytochrome c oxidase (Complex IV), completely halting electron transport and halting oxidative ATP production.`;

  // Update live counters
  function updateCounters() {
    const text = notesTextarea.value || "";
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).length : 0;

    counterWords.textContent = `${words} words`;
    counterSentences.textContent = `${sentences} sentences`;
    counterChars.textContent = `${charCount} characters`;

    if (btnSaveAndContinue) {
      btnSaveAndContinue.disabled = text.trim().length < 20;
    }
  }

  notesTextarea.addEventListener("input", updateCounters);

  // File Upload handler
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        notesTextarea.value = event.target.result;
        if (!notesTitleInput.value) {
          notesTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
        }
        updateCounters();
        showToast(`Loaded file: ${file.name}`, "info");
      };
      reader.onerror = () => {
        showToast("Error reading file", "error");
      };
      reader.readAsText(file);
    });
  }

  // Drag and drop support
  if (dropZone) {
    ["dragenter", "dragover"].forEach(event => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach(event => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
      });
    });
    dropZone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          notesTextarea.value = event.target.result;
          if (!notesTitleInput.value) {
            notesTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
          }
          updateCounters();
          showToast(`Imported: ${file.name}`, "info");
        };
        reader.readAsText(file);
      }
    });
  }

  // Load Sample Topic button
  if (btnLoadCrispr) {
    btnLoadCrispr.addEventListener("click", () => {
      notesTextarea.value = SAMPLE_CELLULAR_RESPIRATION_TEXT;
      notesTitleInput.value = "Cellular Respiration & Bioenergetics (BIOL 201)";
      updateCounters();
      showToast("Loaded sample Cellular Respiration notes", "info");
    });
  }

  // Save Notes and Navigate to /study
  if (btnSaveAndContinue) {
    btnSaveAndContinue.addEventListener("click", async () => {
      const text = notesTextarea.value.trim();
      if (text.length < 20) {
        showToast("Please provide notes with at least 20 characters.", "error");
        return;
      }

      btnSaveAndContinue.disabled = true;
      btnSaveAndContinue.innerHTML = `
        <svg class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <span>Saving Notes…</span>
      `;

      try {
        const title = notesTitleInput.value.trim() || "Custom Uploaded Notes";
        const result = await API.uploadNotes(text, title);
        showToast("Notes saved successfully! Redirecting to Study Questions...", "success");
        setTimeout(() => {
          window.location.href = "/study";
        }, 400);
      } catch (err) {
        showToast(err.message || "Failed to upload notes", "error");
        btnSaveAndContinue.disabled = false;
        btnSaveAndContinue.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
          <span>Continue to Questions →</span>
        `;
      }
    });
  }

  // Load Presets onto the right column
  async function loadPresetsList() {
    if (!presetContainer) return;
    try {
      const data = await API.getPresets();
      presetContainer.innerHTML = "";

      data.presets.forEach((preset) => {
        const isCurrent = preset.id === data.currentTopicId;
        const card = document.createElement("div");
        card.className = `preset-topic-card ${isCurrent ? "active-preset" : ""}`;
        card.innerHTML = `
          <div class="preset-card-header">
            <div class="preset-badge">${escapeHtml(preset.subject)}</div>
            <span class="preset-pages">${preset.pages} Pages</span>
          </div>
          <h3 class="preset-card-title">${escapeHtml(preset.title)}</h3>
          <p class="preset-card-summary">${escapeHtml(preset.summary)}</p>
          <div class="preset-card-footer">
            <span class="preset-meta-tag">15 Practice Qs Ready</span>
            <button type="button" class="btn-secondary btn-sm btn-select-preset" data-topic-id="${preset.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
              <span>Load & Study →</span>
            </button>
          </div>
        `;

        const btnSelect = card.querySelector(".btn-select-preset");
        btnSelect.addEventListener("click", async (e) => {
          e.stopPropagation();
          btnSelect.disabled = true;
          btnSelect.textContent = "Loading…";
          try {
            await API.loadTopic(preset.id);
            showToast(`Loaded ${preset.title}! Navigating to Q&A...`, "success");
            setTimeout(() => {
              window.location.href = "/study";
            }, 350);
          } catch (err) {
            showToast(err.message, "error");
            btnSelect.disabled = false;
            btnSelect.textContent = "Load & Study →";
          }
        });

        presetContainer.appendChild(card);
      });
    } catch (err) {
      presetContainer.innerHTML = `<p class="text-secondary">Error loading course presets: ${escapeHtml(err.message)}</p>`;
    }
  }

  loadPresetsList();
  updateCounters();
});
