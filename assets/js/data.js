/* Portfolio data — transcribed from the Cynerva product portfolio (Cynerva Sqaure FinalDraft.pdf).
   `area` is an illustrative therapeutic grouping used only for filtering. */
window.CYNERVA_DATA = {
  stages: {
    developed: { label: 'Developed APIs' },
    development: { label: 'Under development' },
    validation: { label: 'Under validation' },
    planned: { label: 'To be developed' },
    intermediate: { label: 'Developed intermediates' }
  },
  areas: {
    onc: 'Oncology',
    cns: 'CNS & Psychiatry',
    cardio: 'Cardio-renal & Metabolic',
    infect: 'Anti-infectives',
    gi: 'GI & Respiratory',
    other: 'Other specialties'
  },
  items: [
    // Developed APIs
    { n: 1, name: 'Alverine Citrate', ind: 'Antispasmodic & Irritable Bowel Syndrome (IBS)', stage: 'developed', area: 'gi' },
    { n: 2, name: 'Asenapine', ind: 'Schizophrenia', stage: 'developed', area: 'cns' },
    { n: 3, name: 'Carteolol', ind: 'Ocular hypertension', stage: 'developed', area: 'other' },
    { n: 4, name: 'Cenobamate', ind: 'Partial-onset seizures', stage: 'developed', area: 'cns' },
    { n: 5, name: 'Cloperastine Fendizoate', ind: 'Dry cough', stage: 'developed', area: 'gi' },
    { n: 6, name: 'Cloperastine Hydrochloride', ind: 'Acute and chronic coughs', stage: 'developed', area: 'gi' },
    { n: 7, name: 'Delamanid', ind: 'Active multidrug-resistant tuberculosis (MDR-TB)', stage: 'developed', area: 'infect' },
    { n: 8, name: 'Desvenlafaxine Benzoate', ind: 'Major depressive disorder (MDD)', stage: 'developed', area: 'cns' },
    { n: 9, name: 'Eplerenone', ind: 'Heart failure', stage: 'developed', area: 'cardio' },
    { n: 10, name: 'Fesoterodine Fumarate', ind: 'Overactive bladder', stage: 'developed', area: 'other' },
    { n: 11, name: 'Finerenone Salt', ind: 'Chronic Kidney Disease', stage: 'developed', area: 'cardio' },
    { n: 12, name: 'Gemigliptin', ind: 'Type 2 Diabetes Mellitus', stage: 'developed', area: 'cardio', v: 2 },
    { n: 13, name: 'Nilotinib Salt', ind: 'Chronic myelogenous leukemia', stage: 'developed', area: 'onc' },
    { n: 14, name: 'Opicapone', ind: "Off episodes in Parkinson's", stage: 'developed', area: 'cns' },
    { n: 15, name: 'Resmetirom', ind: 'Metabolic dysfunction-associated steatohepatitis', stage: 'developed', area: 'cardio' },
    { n: 16, name: 'Ribociclib', ind: 'HER2-negative advanced & metastatic breast cancer', stage: 'developed', area: 'onc' },
    { n: 17, name: 'Rimegepant', ind: 'Migraine', stage: 'developed', area: 'cns' },
    { n: 18, name: 'Roxadustat', ind: 'Anemia', stage: 'developed', area: 'cardio' },
    // Under development
    { n: 19, name: 'Etravirine', ind: 'HIV-1 infection', stage: 'development', area: 'infect' },
    { n: 20, name: 'Levomilnacipran', ind: 'Major depressive disorder (MDD)', stage: 'development', area: 'cns' },
    { n: 21, name: 'Momelitinib', ind: 'Myelofibrosis', stage: 'development', area: 'onc' },
    { n: 22, name: 'Fexuprazan', ind: 'Gastroesophageal reflux disease (GERD)', stage: 'development', area: 'gi' },
    { n: 23, name: 'Pretomanid', ind: 'Drug-resistant tuberculosis (XDR-TB)', stage: 'development', area: 'infect' },
    { n: 24, name: 'Samidorphan L-Malate', ind: 'Schizophrenia & Bipolar', stage: 'development', area: 'cns' },
    { n: 25, name: 'Trametinib', ind: 'Melanoma', stage: 'development', area: 'onc' },
    // Under validation
    { n: 26, name: 'Lumateperone ', ind: 'Schizophrenia', stage: 'validation', area: 'cns' },
    // To be developed
    { n: 27, name: 'Ilaprazole', ind: 'Dyspepsia', stage: 'planned', area: 'gi' },
    { n: 28, name: 'Iopromide', ind: 'Radiographic contrast agent', stage: 'planned', area: 'other' },
    { n: 29, name: 'Methenamine', ind: 'UTIs', stage: 'planned', area: 'infect' },
    { n: 30, name: 'Oclacitinib', ind: 'Veterinary atopic dermatitis', stage: 'planned', area: 'other' },
    { n: 31, name: 'Orforglipron', ind: 'Obesity', stage: 'planned', area: 'cardio' },
    { n: 32, name: 'Sapogrelate', ind: 'Peripheral arterial disease', stage: 'planned', area: 'cardio' },
    // Developed intermediates
    { n: 1, name: 'Carteolol Intermediate', ind: 'Carteolol API / Glaucoma', stage: 'intermediate', area: 'other' },
    { n: 2, name: 'Gemigliptin Intermediates', ind: 'Gemigliptin API / Type 2 diabetes mellitus', stage: 'intermediate', area: 'cardio' },
    { n: 3, name: 'Palbociclib Intermediates', ind: 'Palbociclib API / Oncology', stage: 'intermediate', area: 'onc' },
    { n: 4, name: 'Rimegepant Intermediates', ind: 'Rimegepant API / Migraine', stage: 'intermediate', area: 'cns' },
    { n: 5, name: 'Lumateperone Intermediates', ind: 'Lumateperone API / Atypical antipsychotic', stage: 'intermediate', area: 'cns' },
    { n: 6, name: 'Ribociclib Intermediates', ind: 'Ribociclib API / Oncology', stage: 'intermediate', area: 'onc' },
    { n: 7, name: 'Nilotinib Intermediates', ind: 'Nilotinib API / Oncology', stage: 'intermediate', area: 'onc' }
  ]
};
