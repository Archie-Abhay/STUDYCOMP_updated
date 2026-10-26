// Sample academic notes curated for PS 01: Study Companion from Real Notes
// Each topic is 2-4 pages equivalent of detailed academic notes with precise facts.

const SAMPLE_TOPICS = {
    cellular_respiration: {
        id: "cellular_respiration",
        title: "Cellular Respiration & Bioenergetics",
        subject: "Cell Biology & Biochemistry (BIOL 201)",
        pages: 3,
        summary: "Detailed notes on glycolysis, pyruvate oxidation, citric acid cycle, and oxidative phosphorylation.",
        content: `# Topic: Cellular Respiration & Bioenergetics: Aerobic Metabolism in Eukaryotes
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
  * Cyanide (CN-) and carbon monoxide (CO) act as potent metabolic poisons by binding with high affinity to the heme iron in Cytochrome c oxidase (Complex IV), completely halting electron transport and halting oxidative ATP production.
`,
        demoQuestions: {
            supported: {
                question: "What is the final electron acceptor in the electron transport chain, and what molecule is formed when it accepts electrons?",
                expectedEvidenceFragment: "transfers electrons to the terminal electron acceptor, molecular oxygen (O2). When O2 accepts four electrons and four protons, it is reduced to form two molecules of metabolic water (H2O)",
                section: "Section 5: Oxidative Phosphorylation & Chemiosmosis"
            },
            unsupported: {
                question: "What is the maximum lifespan of Drosophila melanogaster fruit flies when fed on a sucrose-restricted diet?",
                reason: "The notes strictly cover eukaryotic cellular respiration, glycolysis, Krebs cycle, and oxidative phosphorylation. They contain no data about insect lifespan, Drosophila melanogaster, or sucrose dietary restrictions."
            }
        }
    }
};

module.exports = { SAMPLE_TOPICS };
