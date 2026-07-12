// Specialty and subspecialty data with hardcoded counts from the physicians DB.
// Counts reflect total physicians per specialty_text value.
// Update periodically if the DB grows significantly.

export interface SpecialtyEntry {
  label: string;
  dbValue: string;
  count: number;
  maleShare?: number; // fraction male (0–1), from DB. Falls back to global if absent.
}

// Overall DB gender split (713,832 M / 450,026 F) used when a specialty has no
// specific maleShare (e.g. subspecialties).
export const GLOBAL_MALE_SHARE = 0.613;

export const SPECIALTIES: SpecialtyEntry[] = [
  { label: "Allergy & Immunology",               dbValue: "Allergy & Immunology Physician",                              count: 3393, maleShare: 0.579  },
  { label: "Anesthesiology",                     dbValue: "Anesthesiology Physician",                                   count: 56864, maleShare: 0.714  },
  { label: "Colon & Rectal Surgery",             dbValue: "Colon & Rectal Surgery Physician",                           count: 1623, maleShare: 0.736  },
  { label: "Dermatology",                        dbValue: "Dermatology Physician",                                      count: 14758, maleShare: 0.462  },
  { label: "Emergency Medicine",                 dbValue: "Emergency Medicine Physician",                               count: 65297, maleShare: 0.688  },
  { label: "Family Medicine",                    dbValue: "Family Medicine Physician",                                  count: 148872, maleShare: 0.539  },
  { label: "General Practice",                   dbValue: "General Practice Physician",                                 count: 16940, maleShare: 0.618  },
  { label: "Internal Medicine",                  dbValue: "Internal Medicine Physician",                                count: 173424, maleShare: 0.597  },
  { label: "Medical Genetics & Genomics",        dbValue: "Clinical Genetics (M.D.) Physician",                        count: 828, maleShare: 0.469  },
  { label: "Neurological Surgery",               dbValue: "Neurological Surgery Physician",                            count: 8202, maleShare: 0.873  },
  { label: "Neurology",                          dbValue: "Neurology Physician",                                       count: 20127, maleShare: 0.63  },
  { label: "Nuclear Medicine",                   dbValue: "Nuclear Medicine Physician",                                 count: 901, maleShare: 0.729  },
  { label: "Obstetrics & Gynecology",            dbValue: "Obstetrics & Gynecology Physician",                         count: 44625, maleShare: 0.366  },
  { label: "Ophthalmology",                      dbValue: "Ophthalmology Physician",                                   count: 22226, maleShare: 0.727  },
  { label: "Orthopaedic Surgery",                dbValue: "Orthopaedic Surgery Physician",                             count: 25875, maleShare: 0.908  },
  { label: "Otolaryngology – Head & Neck",       dbValue: "Otolaryngology Physician",                                  count: 10974, maleShare: 0.775  },
  { label: "Pathology",                          dbValue: "Anatomic Pathology & Clinical Pathology Physician",         count: 13832, maleShare: 0.573  },
  { label: "Pediatrics",                         dbValue: "Pediatrics Physician",                                      count: 81088, maleShare: 0.338  },
  { label: "Physical Medicine & Rehabilitation", dbValue: "Physical Medicine & Rehabilitation Physician",              count: 15437, maleShare: 0.527  },
  { label: "Plastic Surgery",                    dbValue: "Plastic Surgery Physician",                                 count: 5371, maleShare: 0.765  },
  { label: "Preventive Medicine",                dbValue: "Public Health & General Preventive Medicine Physician",     count: 1801, maleShare: 0.523  },
  { label: "Psychiatry",                         dbValue: "Psychiatry Physician",                                      count: 53741, maleShare: 0.55  },
  { label: "Radiology",                          dbValue: "Diagnostic Radiology Physician",                            count: 40037, maleShare: 0.749  },
  { label: "Surgery",                            dbValue: "Surgery Physician",                                         count: 36499, maleShare: 0.728  },
  { label: "Thoracic Surgery",                   dbValue: "Thoracic Surgery (Cardiothoracic Vascular Surgery) Physician", count: 5108, maleShare: 0.898  },
  { label: "Urology",                            dbValue: "Urology Physician",                                         count: 13442, maleShare: 0.868  },
];

export const SUBSPECIALTIES: Record<string, SpecialtyEntry[]> = {
  "Allergy & Immunology": [
    { label: "Allergy & Immunology (Internal Medicine)", dbValue: "Allergy & Immunology (Internal Medicine) Physician", count: 521 },
    { label: "Allergy only",                             dbValue: "Allergy Physician",                                  count: 1014 },
  ],
  "Anesthesiology": [
    { label: "Critical Care Medicine",        dbValue: "Critical Care Medicine (Anesthesiology) Physician",            count: 1426 },
    { label: "Hospice & Palliative Medicine", dbValue: "Hospice and Palliative Medicine (Anesthesiology) Physician",  count: 49 },
    { label: "Pain Medicine",                 dbValue: "Pain Medicine (Anesthesiology) Physician",                    count: 4078 },
    { label: "Pediatric Anesthesiology",      dbValue: "Pediatric Anesthesiology Physician",                          count: 1342 },
  ],
  "Dermatology": [
    { label: "Dermatopathology",              dbValue: "Dermatopathology Physician",                                   count: 577 },
    { label: "Pediatric Dermatology",         dbValue: "Pediatric Dermatology Physician",                             count: 229 },
    { label: "Procedural Dermatology",        dbValue: "Procedural Dermatology Physician",                            count: 686 },
  ],
  "Emergency Medicine": [
    { label: "Emergency Medical Services",    dbValue: "Emergency Medical Services (Emergency Medicine) Physician",   count: 3638 },
    { label: "Hospice & Palliative Medicine", dbValue: "Hospice and Palliative Medicine (Emergency Medicine) Physician", count: 160 },
    { label: "Pediatric Emergency Medicine",  dbValue: "Pediatric Emergency Medicine (Emergency Medicine) Physician", count: 841 },
    { label: "Sports Medicine",               dbValue: "Sports Medicine (Emergency Medicine) Physician",              count: 324 },
    { label: "Undersea & Hyperbaric Medicine",dbValue: "Undersea and Hyperbaric Medicine (Emergency Medicine) Physician", count: 202 },
  ],
  "Family Medicine": [
    { label: "Adolescent Medicine",           dbValue: "Adolescent Medicine (Family Medicine) Physician",             count: 259 },
    { label: "Geriatric Medicine",            dbValue: "Geriatric Medicine (Family Medicine) Physician",              count: 1788 },
    { label: "Hospice & Palliative Medicine", dbValue: "Hospice and Palliative Medicine (Family Medicine) Physician", count: 810 },
    { label: "Obesity Medicine",              dbValue: "Obesity Medicine (Family Medicine) Physician",                count: 154 },
    { label: "Sleep Medicine",                dbValue: "Sleep Medicine (Family Medicine) Physician",                  count: 197 },
    { label: "Sports Medicine",               dbValue: "Sports Medicine (Family Medicine) Physician",                 count: 2168 },
  ],
  "Internal Medicine": [
    { label: "Adolescent Medicine",                          dbValue: "Adolescent Medicine (Internal Medicine) Physician",            count: 368 },
    { label: "Adult Congenital Heart Disease",               dbValue: "Adult Congenital Heart Disease Physician",                     count: 109 },
    { label: "Advanced Heart Failure & Transplant Cardiology", dbValue: "Advanced Heart Failure and Transplant Cardiology Physician", count: 547 },
    { label: "Cardiovascular Disease",                       dbValue: "Cardiovascular Disease Physician",                            count: 24965 },
    { label: "Clinical Cardiac Electrophysiology",           dbValue: "Clinical Cardiac Electrophysiology Physician",                count: 1636 },
    { label: "Critical Care Medicine",                       dbValue: "Critical Care Medicine (Internal Medicine) Physician",        count: 6762 },
    { label: "Endocrinology, Diabetes & Metabolism",         dbValue: "Endocrinology, Diabetes & Metabolism Physician",             count: 7952 },
    { label: "Gastroenterology",                             dbValue: "Gastroenterology Physician",                                  count: 16780 },
    { label: "Geriatric Medicine",                           dbValue: "Geriatric Medicine (Internal Medicine) Physician",            count: 4182 },
    { label: "Hematology",                                   dbValue: "Hematology (Internal Medicine) Physician",                   count: 1483 },
    { label: "Hematology & Oncology",                        dbValue: "Hematology & Oncology Physician",                            count: 11319 },
    { label: "Hepatology",                                   dbValue: "Hepatology Physician",                                       count: 286 },
    { label: "Hospice & Palliative Medicine",                dbValue: "Hospice and Palliative Medicine (Internal Medicine) Physician", count: 1579 },
    { label: "Hospitalist",                                  dbValue: "Hospitalist Physician",                                      count: 17332 },
    { label: "Infectious Disease",                           dbValue: "Infectious Disease Physician",                               count: 8438 },
    { label: "Interventional Cardiology",                    dbValue: "Interventional Cardiology Physician",                        count: 3492 },
    { label: "Medical Oncology",                             dbValue: "Medical Oncology Physician",                                 count: 3942 },
    { label: "Nephrology",                                   dbValue: "Nephrology Physician",                                       count: 10663 },
    { label: "Obesity Medicine",                             dbValue: "Obesity Medicine (Internal Medicine) Physician",             count: 146 },
    { label: "Pulmonary Disease",                            dbValue: "Pulmonary Disease Physician",                               count: 9454 },
    { label: "Rheumatology",                                 dbValue: "Rheumatology Physician",                                    count: 6273 },
    { label: "Sleep Medicine",                               dbValue: "Sleep Medicine (Internal Medicine) Physician",              count: 899 },
    { label: "Sports Medicine",                              dbValue: "Sports Medicine (Internal Medicine) Physician",             count: 296 },
    { label: "Transplant Hepatology",                        dbValue: "Transplant Hepatology Physician",                           count: 136 },
  ],
  "Medical Genetics & Genomics": [
    { label: "Clinical Biochemical Genetics",  dbValue: "Clinical Biochemical Genetics Physician",                    count: 81 },
    { label: "Clinical Molecular Genetics",    dbValue: "Clinical Molecular Genetics Physician",                      count: 113 },
    { label: "Medical Biochemical Genetics",   dbValue: "Medical Biochemical Genetics",                               count: 25 },
  ],
  "Neurological Surgery": [
    { label: "Neurocritical Care",             dbValue: "Neurocritical Care Physician",                               count: 371 },
  ],
  "Neurology": [
    { label: "Behavioral Neurology & Neuropsychiatry", dbValue: "Behavioral Neurology & Neuropsychiatry Physician",  count: 277 },
    { label: "Child Neurology",                dbValue: "Neurology with Special Qualifications in Child Neurology Physician", count: 1848 },
    { label: "Clinical Neurophysiology",       dbValue: "Clinical Neurophysiology Physician",                        count: 646 },
    { label: "Epilepsy",                       dbValue: "Epilepsy Physician",                                        count: 366 },
    { label: "Neurocritical Care",             dbValue: "Neurocritical Care Physician",                              count: 371 },
    { label: "Neurodevelopmental Disabilities",dbValue: "Neurodevelopmental Disabilities Physician",                 count: 57 },
    { label: "Neuromuscular Medicine",         dbValue: "Neuromuscular Medicine (Psychiatry & Neurology) Physician", count: 347 },
    { label: "Vascular Neurology",             dbValue: "Vascular Neurology Physician",                              count: 580 },
  ],
  "Obstetrics & Gynecology": [
    { label: "Complex Family Planning",                      dbValue: "Complex Family Planning Physician",                          count: 57 },
    { label: "Critical Care Medicine",                       dbValue: "Critical Care Medicine (Obstetrics & Gynecology) Physician", count: 35 },
    { label: "Gynecologic Oncology",                         dbValue: "Gynecologic Oncology Physician",                            count: 1377 },
    { label: "Gynecology only",                              dbValue: "Gynecology Physician",                                      count: 3916 },
    { label: "Hospice & Palliative Medicine",                dbValue: "Hospice and Palliative Medicine (Obstetrics & Gynecology) Physician", count: 91 },
    { label: "Maternal & Fetal Medicine",                    dbValue: "Maternal & Fetal Medicine Physician",                       count: 2147 },
    { label: "Obesity Medicine",                             dbValue: "Obesity Medicine (Obstetrics & Gynecology) Physician",      count: 23 },
    { label: "Reproductive Endocrinology & Infertility",     dbValue: "Reproductive Endocrinology Physician",                     count: 1448 },
    { label: "Urogynecology & Reconstructive Pelvic Surgery",dbValue: "Urogynecology and Reconstructive Pelvic Surgery (Obstetrics & Gynecology) Physician", count: 605 },
  ],
  "Ophthalmology": [
    { label: "Cornea & External Diseases",     dbValue: "Cornea and External Diseases Specialist Physician",         count: 306 },
    { label: "Glaucoma",                       dbValue: "Glaucoma Specialist (Ophthalmology) Physician",             count: 361 },
    { label: "Neuro-ophthalmology",            dbValue: "Neuro-ophthalmology Physician",                             count: 134 },
    { label: "Ophthalmic Plastic & Reconstructive Surgery", dbValue: "Ophthalmic Plastic and Reconstructive Surgery Physician", count: 298 },
    { label: "Pediatric Ophthalmology",        dbValue: "Pediatric Ophthalmology and Strabismus Specialist Physician", count: 249 },
    { label: "Retina Specialist",              dbValue: "Retina Specialist (Ophthalmology) Physician",               count: 955 },
    { label: "Uveitis & Ocular Inflammatory Disease", dbValue: "Uveitis and Ocular Inflammatory Disease (Ophthalmology) Physician", count: 41 },
  ],
  "Orthopaedic Surgery": [
    { label: "Adult Reconstructive Surgery",   dbValue: "Adult Reconstructive Orthopaedic Surgery Physician",        count: 1268 },
    { label: "Foot & Ankle Surgery",           dbValue: "Orthopaedic Foot and Ankle Surgery Physician",              count: 689 },
    { label: "Hand Surgery",                   dbValue: "Orthopaedic Hand Surgery Physician",                        count: 1987 },
    { label: "Orthopaedic Sports Medicine",    dbValue: "Sports Medicine (Orthopaedic Surgery) Physician",           count: 2726 },
    { label: "Pediatric Orthopaedic Surgery",  dbValue: "Pediatric Orthopaedic Surgery Physician",                  count: 627 },
    { label: "Spine Surgery",                  dbValue: "Orthopaedic Surgery of the Spine Physician",               count: 1807 },
    { label: "Trauma",                         dbValue: "Orthopaedic Trauma Physician",                              count: 729 },
  ],
  "Otolaryngology – Head & Neck": [
    { label: "Facial Plastic Surgery",         dbValue: "Otolaryngology/Facial Plastic Surgery Physician",           count: 749 },
    { label: "Otology & Neurotology",          dbValue: "Otology & Neurotology Physician",                           count: 335 },
    { label: "Pediatric Otolaryngology",       dbValue: "Pediatric Otolaryngology Physician",                        count: 577 },
    { label: "Plastic Surgery within Head & Neck", dbValue: "Plastic Surgery within the Head & Neck (Otolaryngology) Physician", count: 627 },
    { label: "Sleep Medicine",                 dbValue: "Sleep Medicine (Otolaryngology) Physician",                 count: 98 },
  ],
  "Pathology": [
    { label: "Anatomic Pathology only",        dbValue: "Anatomic Pathology Physician",                              count: 2626 },
    { label: "Blood Banking & Transfusion Medicine", dbValue: "Blood Banking & Transfusion Medicine Physician",      count: 571 },
    { label: "Clinical Informatics",           dbValue: "Clinical Informatics (Pathology) Physician",               count: 26 },
    { label: "Clinical Pathology only",        dbValue: "Clinical Pathology Physician",                              count: 417 },
    { label: "Cytopathology",                  dbValue: "Cytopathology Physician",                                   count: 1387 },
    { label: "Dermatopathology",               dbValue: "Dermatopathology (Pathology) Physician",                   count: 565 },
    { label: "Forensic Pathology",             dbValue: "Forensic Pathology Physician",                             count: 567 },
    { label: "Hematopathology",                dbValue: "Hematology (Pathology) Physician",                         count: 757 },
    { label: "Medical Microbiology",           dbValue: "Medical Microbiology Physician",                            count: 88 },
    { label: "Neuropathology",                 dbValue: "Neuropathology Physician",                                  count: 339 },
    { label: "Pediatric Pathology",            dbValue: "Pediatric Pathology Physician",                             count: 200 },
  ],
  "Pediatrics": [
    { label: "Adolescent Medicine",            dbValue: "Pediatric Adolescent Medicine Physician",                   count: 2590 },
    { label: "Allergy & Immunology",           dbValue: "Pediatric Allergy/Immunology Physician",                   count: 429 },
    { label: "Child Abuse Pediatrics",         dbValue: "Child Abuse Pediatrics Physician",                         count: 130 },
    { label: "Developmental-Behavioral Pediatrics", dbValue: "Developmental - Behavioral Pediatrics Physician",    count: 969 },
    { label: "Hospice & Palliative Medicine",  dbValue: "Pediatric Hospice and Palliative Medicine Physician",      count: 206 },
    { label: "Neonatal-Perinatal Medicine",    dbValue: "Neonatal-Perinatal Medicine Physician",                    count: 5699 },
    { label: "Neurodevelopmental Disabilities",dbValue: "Pediatric Neurodevelopmental Disabilities Physician",      count: 284 },
    { label: "Pediatric Cardiology",           dbValue: "Pediatric Cardiology Physician",                           count: 2591 },
    { label: "Pediatric Critical Care Medicine", dbValue: "Pediatric Critical Care Medicine Physician",             count: 2302 },
    { label: "Pediatric Emergency Medicine",   dbValue: "Pediatric Emergency Medicine (Pediatrics) Physician",      count: 1847 },
    { label: "Pediatric Endocrinology",        dbValue: "Pediatric Endocrinology Physician",                        count: 1484 },
    { label: "Pediatric Gastroenterology",     dbValue: "Pediatric Gastroenterology Physician",                     count: 1609 },
    { label: "Pediatric Hematology & Oncology",dbValue: "Pediatric Hematology & Oncology Physician",               count: 2607 },
    { label: "Pediatric Hospital Medicine",    dbValue: "Pediatric Hospital Medicine Physician",                    count: 0 },
    { label: "Pediatric Infectious Diseases",  dbValue: "Pediatric Infectious Diseases Physician",                  count: 1083 },
    { label: "Pediatric Nephrology",           dbValue: "Pediatric Nephrology Physician",                           count: 734 },
    { label: "Pediatric Pulmonology",          dbValue: "Pediatric Pulmonology Physician",                          count: 1074 },
    { label: "Pediatric Rheumatology",         dbValue: "Pediatric Rheumatology Physician",                         count: 397 },
    { label: "Pediatric Sleep Medicine",       dbValue: "Pediatric Sleep Medicine Physician",                       count: 103 },
    { label: "Pediatric Sports Medicine",      dbValue: "Pediatric Sports Medicine Physician",                      count: 217 },
    { label: "Pediatric Transplant Hepatology",dbValue: "Pediatric Transplant Hepatology Physician",               count: 21 },
    { label: "Sleep Medicine",                 dbValue: "Sleep Medicine (Pediatrics) Physician",                    count: 0 },
    { label: "Sports Medicine",                dbValue: "Sports Medicine (Pediatrics) Physician",                   count: 0 },
  ],
  "Physical Medicine & Rehabilitation": [
    { label: "Brain Injury Medicine",          dbValue: "Brain Injury Medicine (Physical Medicine & Rehabilitation) Physician", count: 98 },
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Physical Medicine & Rehabilitation) Physician", count: 95 },
    { label: "Neuromuscular Medicine",         dbValue: "Neuromuscular Medicine (Physical Medicine & Rehabilitation) Physician", count: 153 },
    { label: "Pain Medicine",                  dbValue: "Pain Medicine (Physical Medicine & Rehabilitation) Physician", count: 1644 },
    { label: "Pediatric Rehabilitation Medicine", dbValue: "Pediatric Rehabilitation Medicine Physician",            count: 391 },
    { label: "Spinal Cord Injury Medicine",    dbValue: "Spinal Cord Injury Medicine Physician",                    count: 265 },
    { label: "Sports Medicine",                dbValue: "Sports Medicine (Physical Medicine & Rehabilitation) Physician", count: 1284 },
  ],
  "Plastic Surgery": [
    { label: "Plastic & Reconstructive Surgery", dbValue: "Plastic and Reconstructive Surgery Physician",           count: 2380 },
    { label: "Surgery of the Hand",            dbValue: "Surgery of the Hand (Plastic Surgery) Physician",          count: 379 },
    { label: "Plastic Surgery within Head & Neck", dbValue: "Plastic Surgery Within the Head and Neck (Plastic Surgery) Physician", count: 185 },
  ],
  "Preventive Medicine": [
    { label: "Addiction Medicine",             dbValue: "Addiction Medicine (Preventive Medicine) Physician",        count: 340 },
    { label: "Obesity Medicine",               dbValue: "Obesity Medicine (Preventive Medicine) Physician",          count: 144 },
    { label: "Occupational & Environmental Medicine", dbValue: "Preventive Medicine/Occupational Environmental Medicine Physician", count: 964 },
    { label: "Sports Medicine",                dbValue: "Sports Medicine (Preventive Medicine) Physician",           count: 162 },
    { label: "Undersea & Hyperbaric Medicine", dbValue: "Undersea and Hyperbaric Medicine (Preventive Medicine) Physician", count: 249 },
  ],
  "Psychiatry": [
    { label: "Addiction Medicine",             dbValue: "Addiction Medicine (Psychiatry & Neurology) Physician",    count: 647 },
    { label: "Addiction Psychiatry",           dbValue: "Addiction Psychiatry Physician",                           count: 671 },
    { label: "Brain Injury Medicine",          dbValue: "Brain Injury Medicine (Psychiatry & Neurology) Physician", count: 24 },
    { label: "Child & Adolescent Psychiatry",  dbValue: "Child & Adolescent Psychiatry Physician",                  count: 6217 },
    { label: "Forensic Psychiatry",            dbValue: "Forensic Psychiatry Physician",                            count: 824 },
    { label: "Geriatric Psychiatry",           dbValue: "Geriatric Psychiatry Physician",                           count: 780 },
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Psychiatry & Neurology) Physician", count: 38 },
    { label: "Neuromuscular Medicine",         dbValue: "Neuromuscular Medicine (Psychiatry & Neurology) Physician", count: 347 },
    { label: "Obesity Medicine",               dbValue: "Obesity Medicine (Psychiatry & Neurology) Physician",      count: 15 },
    { label: "Pain Medicine",                  dbValue: "Pain Medicine (Psychiatry & Neurology) Physician",         count: 166 },
    { label: "Psychosomatic Medicine",         dbValue: "Psychosomatic Medicine Physician",                         count: 494 },
    { label: "Sleep Medicine",                 dbValue: "Sleep Medicine (Psychiatry & Neurology) Physician",        count: 378 },
  ],
  "Radiology": [
    { label: "Body Imaging",                   dbValue: "Body Imaging Physician",                                    count: 1916 },
    { label: "Diagnostic Neuroimaging",        dbValue: "Diagnostic Neuroimaging (Radiology) Physician",            count: 179 },
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Radiology) Physician",    count: 9 },
    { label: "Neuroradiology",                 dbValue: "Neuroradiology Physician",                                  count: 1990 },
    { label: "Nuclear Radiology",              dbValue: "Nuclear Radiology Physician",                               count: 661 },
    { label: "Pain Medicine",                  dbValue: "Pain Medicine Physician",                                   count: 966 },
    { label: "Pediatric Radiology",            dbValue: "Pediatric Radiology Physician",                             count: 927 },
    { label: "Radiation Oncology",             dbValue: "Radiation Oncology Physician",                              count: 6080 },
    { label: "Vascular & Interventional Radiology", dbValue: "Vascular & Interventional Radiology Physician",       count: 3099 },
  ],
  "Surgery": [
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Surgery) Physician",      count: 35 },
    { label: "Pediatric Surgery",              dbValue: "Pediatric Surgery Physician",                               count: 1142 },
    { label: "Surgery of the Hand",            dbValue: "Surgery of the Hand (Surgery) Physician",                  count: 403 },
    { label: "Surgical Critical Care",         dbValue: "Surgical Critical Care Physician",                          count: 1509 },
    { label: "Surgical Oncology",              dbValue: "Surgical Oncology Physician",                               count: 1440 },
    { label: "Trauma Surgery",                 dbValue: "Trauma Surgery Physician",                                  count: 984 },
    { label: "Vascular Surgery",               dbValue: "Vascular Surgery Physician",                               count: 4276 },
  ],
  "Urology": [
    { label: "Pediatric Urology",              dbValue: "Pediatric Urology Physician",                               count: 357 },
    { label: "Urogynecology & Reconstructive Pelvic Surgery", dbValue: "Urogynecology and Reconstructive Pelvic Surgery (Urology) Physician", count: 114 },
  ],
};

// Grand total of all physicians in the DB (shown when nothing is selected)
export const TOTAL_PHYSICIANS = 1_164_511;

// Physicians per US state (standard 2-letter codes only)
export const STATE_COUNTS: Record<string, number> = {
  AK: 2594,  AL: 12886, AR: 7995,  AZ: 23104, CA: 131397,
  CO: 21861, CT: 15674, DC: 6221,  DE: 3775,  FL: 74061,
  GA: 30257, GU: 249,   HI: 5608,  IA: 10113, ID: 4812,
  IL: 48123, IN: 19772, KS: 8924,  KY: 13192, LA: 13623,
  MA: 38105, MD: 25072, ME: 5930,  MI: 38916, MN: 23838,
  MO: 23864, MP: 52,    MS: 6895,  MT: 3600,  NC: 33698,
  ND: 2669,  NE: 6569,  NH: 5647,  NJ: 31508, NM: 6421,
  NV: 8221,  NY: 84997, OH: 42489, OK: 11096, OR: 15917,
  PA: 55979, PR: 11393, RI: 5189,  SC: 16920, SD: 2771,
  TN: 20817, TX: 80505, UT: 9501,  VA: 28497, VI: 155,
  VT: 2565,  WA: 29049, WI: 22204, WV: 5647,  WY: 1474,
};

// Compute count from all filters (client-side, no DB call).
// State filter applies a proportion multiplier (approximate — assumes even specialty distribution).
export function computeCount(
  selectedSpecialtyLabels: string[],
  selectedSubspecialtyDbValues: string[],
  stateMode: "all" | "include" | "exclude" = "all",
  selectedStates: string[] = [],
): number {
  // Base count from specialty/subspecialty
  let base: number;
  if (selectedSpecialtyLabels.length === 0) {
    base = TOTAL_PHYSICIANS;
  } else {
    base = 0;
    for (const label of selectedSpecialtyLabels) {
      const specialty = SPECIALTIES.find(s => s.label === label);
      if (!specialty) continue;
      const subEntries = SUBSPECIALTIES[label] || [];
      const selectedSubs = subEntries.filter(s => selectedSubspecialtyDbValues.includes(s.dbValue));
      if (selectedSubs.length > 0) {
        base += selectedSubs.reduce((sum, s) => sum + s.count, 0);
      } else {
        base += specialty.count;
      }
    }
  }

  // Apply state multiplier
  if (stateMode !== "all" && selectedStates.length > 0) {
    const stateTotal = selectedStates.reduce((sum, code) => sum + (STATE_COUNTS[code] ?? 0), 0);
    const multiplier = stateMode === "include"
      ? stateTotal / TOTAL_PHYSICIANS
      : (TOTAL_PHYSICIANS - stateTotal) / TOTAL_PHYSICIANS;
    return Math.round(base * Math.max(0, multiplier));
  }

  return base;
}

// Weighted male share across the selected specialties (by their counts).
// Subspecialties inherit their parent specialty's share; unknowns use the global.
export function weightedMaleShare(selectedSpecialtyLabels: string[]): number {
  if (selectedSpecialtyLabels.length === 0) return GLOBAL_MALE_SHARE;
  let weightedMales = 0;
  let total = 0;
  for (const label of selectedSpecialtyLabels) {
    const s = SPECIALTIES.find(x => x.label === label);
    if (!s) continue;
    const share = s.maleShare ?? GLOBAL_MALE_SHARE;
    weightedMales += s.count * share;
    total += s.count;
  }
  return total > 0 ? weightedMales / total : GLOBAL_MALE_SHARE;
}

// Multiplier to apply to a base count for a gender selection ("M" | "F" | "any").
export function genderMultiplier(gender: string, selectedSpecialtyLabels: string[]): number {
  if (gender !== "M" && gender !== "F") return 1;
  const male = weightedMaleShare(selectedSpecialtyLabels);
  return gender === "M" ? male : 1 - male;
}
