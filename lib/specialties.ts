// Specialty and subspecialty data with hardcoded counts from the physicians DB.
// Counts reflect total physicians per specialty_text value.
// Update periodically if the DB grows significantly.

import { SSG, type GenderCell } from "./specialtyStateGender";

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
    { label: "Allergy & Immunology (Internal Medicine)", dbValue: "Allergy & Immunology (Internal Medicine) Physician", count: 521, maleShare: 0.599  },
    { label: "Allergy only",                             dbValue: "Allergy Physician",                                  count: 1014, maleShare: 0.635  },
  ],
  "Anesthesiology": [
    { label: "Critical Care Medicine",        dbValue: "Critical Care Medicine (Anesthesiology) Physician",            count: 1426, maleShare: 0.683  },
    { label: "Hospice & Palliative Medicine", dbValue: "Hospice and Palliative Medicine (Anesthesiology) Physician",  count: 49, maleShare: 0.449  },
    { label: "Pain Medicine",                 dbValue: "Pain Medicine (Anesthesiology) Physician",                    count: 4078, maleShare: 0.798  },
    { label: "Pediatric Anesthesiology",      dbValue: "Pediatric Anesthesiology Physician",                          count: 1342, maleShare: 0.491  },
  ],
  "Dermatology": [
    { label: "Dermatopathology",              dbValue: "Dermatopathology Physician",                                   count: 577, maleShare: 0.565  },
    { label: "Pediatric Dermatology",         dbValue: "Pediatric Dermatology Physician",                             count: 229, maleShare: 0.227  },
    { label: "Procedural Dermatology",        dbValue: "Procedural Dermatology Physician",                            count: 686, maleShare: 0.571  },
  ],
  "Emergency Medicine": [
    { label: "Emergency Medical Services",    dbValue: "Emergency Medical Services (Emergency Medicine) Physician",   count: 3638, maleShare: 0.747  },
    { label: "Hospice & Palliative Medicine", dbValue: "Hospice and Palliative Medicine (Emergency Medicine) Physician", count: 160, maleShare: 0.519  },
    { label: "Pediatric Emergency Medicine",  dbValue: "Pediatric Emergency Medicine (Emergency Medicine) Physician", count: 841, maleShare: 0.411  },
    { label: "Sports Medicine",               dbValue: "Sports Medicine (Emergency Medicine) Physician",              count: 324, maleShare: 0.548  },
    { label: "Undersea & Hyperbaric Medicine",dbValue: "Undersea and Hyperbaric Medicine (Emergency Medicine) Physician", count: 202, maleShare: 0.767  },
  ],
  "Family Medicine": [
    { label: "Adolescent Medicine",           dbValue: "Adolescent Medicine (Family Medicine) Physician",             count: 259, maleShare: 0.432  },
    { label: "Geriatric Medicine (via Family Medicine)", dbValue: "Geriatric Medicine (Family Medicine) Physician",              count: 1788, maleShare: 0.522  },
    { label: "Hospice & Palliative Medicine", dbValue: "Hospice and Palliative Medicine (Family Medicine) Physician", count: 810, maleShare: 0.416  },
    { label: "Obesity Medicine",              dbValue: "Obesity Medicine (Family Medicine) Physician",                count: 154, maleShare: 0.383  },
    { label: "Sleep Medicine",                dbValue: "Sleep Medicine (Family Medicine) Physician",                  count: 197, maleShare: 0.563  },
    { label: "Sports Medicine",               dbValue: "Sports Medicine (Family Medicine) Physician",                 count: 2168, maleShare: 0.765  },
  ],
  "Internal Medicine": [
    { label: "Adolescent Medicine",                          dbValue: "Adolescent Medicine (Internal Medicine) Physician",            count: 368, maleShare: 0.606  },
    { label: "Adult Congenital Heart Disease",               dbValue: "Adult Congenital Heart Disease Physician",                     count: 109, maleShare: 0.651  },
    { label: "Advanced Heart Failure & Transplant Cardiology", dbValue: "Advanced Heart Failure and Transplant Cardiology Physician", count: 547, maleShare: 0.647  },
    { label: "Cardiovascular Disease",                       dbValue: "Cardiovascular Disease Physician",                            count: 24965, maleShare: 0.839  },
    { label: "Clinical Cardiac Electrophysiology",           dbValue: "Clinical Cardiac Electrophysiology Physician",                count: 1636, maleShare: 0.877  },
    { label: "Critical Care Medicine",                       dbValue: "Critical Care Medicine (Internal Medicine) Physician",        count: 6762, maleShare: 0.732  },
    { label: "Endocrinology, Diabetes & Metabolism",         dbValue: "Endocrinology, Diabetes & Metabolism Physician",             count: 7952, maleShare: 0.477  },
    { label: "Gastroenterology",                             dbValue: "Gastroenterology Physician",                                  count: 16780, maleShare: 0.797  },
    { label: "Geriatric Medicine (via Internal Medicine)",   dbValue: "Geriatric Medicine (Internal Medicine) Physician",            count: 4182, maleShare: 0.494  },
    { label: "Hematology",                                   dbValue: "Hematology (Internal Medicine) Physician",                   count: 1483, maleShare: 0.632  },
    { label: "Hematology & Oncology",                        dbValue: "Hematology & Oncology Physician",                            count: 11319, maleShare: 0.653  },
    { label: "Hepatology",                                   dbValue: "Hepatology Physician",                                       count: 286, maleShare: 0.664  },
    { label: "Hospice & Palliative Medicine",                dbValue: "Hospice and Palliative Medicine (Internal Medicine) Physician", count: 1579, maleShare: 0.414  },
    { label: "Hospitalist",                                  dbValue: "Hospitalist Physician",                                      count: 17332, maleShare: 0.584  },
    { label: "Infectious Disease",                           dbValue: "Infectious Disease Physician",                               count: 8438, maleShare: 0.579  },
    { label: "Interventional Cardiology",                    dbValue: "Interventional Cardiology Physician",                        count: 3492, maleShare: 0.908  },
    { label: "Medical Oncology",                             dbValue: "Medical Oncology Physician",                                 count: 3942, maleShare: 0.65  },
    { label: "Nephrology",                                   dbValue: "Nephrology Physician",                                       count: 10663, maleShare: 0.713  },
    { label: "Obesity Medicine",                             dbValue: "Obesity Medicine (Internal Medicine) Physician",             count: 146, maleShare: 0.521  },
    { label: "Pulmonary Disease",                            dbValue: "Pulmonary Disease Physician",                               count: 9454, maleShare: 0.78  },
    { label: "Rheumatology",                                 dbValue: "Rheumatology Physician",                                    count: 6273, maleShare: 0.542  },
    { label: "Sleep Medicine",                               dbValue: "Sleep Medicine (Internal Medicine) Physician",              count: 899, maleShare: 0.69  },
    { label: "Sports Medicine",                              dbValue: "Sports Medicine (Internal Medicine) Physician",             count: 296, maleShare: 0.733  },
    { label: "Transplant Hepatology",                        dbValue: "Transplant Hepatology Physician",                           count: 136, maleShare: 0.559  },
  ],
  "Medical Genetics & Genomics": [
    { label: "Clinical Biochemical Genetics",  dbValue: "Clinical Biochemical Genetics Physician",                    count: 81, maleShare: 0.568  },
    { label: "Clinical Molecular Genetics",    dbValue: "Clinical Molecular Genetics Physician",                      count: 113, maleShare: 0.459  },
    { label: "Medical Biochemical Genetics",   dbValue: "Medical Biochemical Genetics",                               count: 25, maleShare: 0.36  },
  ],
  "Neurological Surgery": [
    { label: "Neurocritical Care",             dbValue: "Neurocritical Care Physician",                               count: 371, maleShare: 0.642  },
  ],
  "Neurology": [
    { label: "Behavioral Neurology & Neuropsychiatry", dbValue: "Behavioral Neurology & Neuropsychiatry Physician",  count: 277, maleShare: 0.54  },
    { label: "Child Neurology",                dbValue: "Neurology with Special Qualifications in Child Neurology Physician", count: 1848, maleShare: 0.456  },
    { label: "Clinical Neurophysiology",       dbValue: "Clinical Neurophysiology Physician",                        count: 646, maleShare: 0.636  },
    { label: "Epilepsy",                       dbValue: "Epilepsy Physician",                                        count: 366, maleShare: 0.536  },
    { label: "Neurocritical Care",             dbValue: "Neurocritical Care Physician",                              count: 371, maleShare: 0.642  },
    { label: "Neurodevelopmental Disabilities",dbValue: "Neurodevelopmental Disabilities Physician",                 count: 57, maleShare: 0.536  },
    { label: "Neuromuscular Medicine",         dbValue: "Neuromuscular Medicine (Psychiatry & Neurology) Physician", count: 347, maleShare: 0.559  },
    { label: "Vascular Neurology",             dbValue: "Vascular Neurology Physician",                              count: 580, maleShare: 0.693  },
  ],
  "Obstetrics & Gynecology": [
    { label: "Complex Family Planning",                      dbValue: "Complex Family Planning Physician",                          count: 57, maleShare: 0.053  },
    { label: "Critical Care Medicine",                       dbValue: "Critical Care Medicine (Obstetrics & Gynecology) Physician", count: 35, maleShare: 0.6  },
    { label: "Gynecologic Oncology",                         dbValue: "Gynecologic Oncology Physician",                            count: 1377, maleShare: 0.505  },
    { label: "Gynecology only",                              dbValue: "Gynecology Physician",                                      count: 3916, maleShare: 0.467  },
    { label: "Hospice & Palliative Medicine",                dbValue: "Hospice and Palliative Medicine (Obstetrics & Gynecology) Physician", count: 91, maleShare: 0.418  },
    { label: "Maternal & Fetal Medicine",                    dbValue: "Maternal & Fetal Medicine Physician",                       count: 2147, maleShare: 0.483  },
    { label: "Obesity Medicine",                             dbValue: "Obesity Medicine (Obstetrics & Gynecology) Physician",      count: 23, maleShare: 0.391  },
    { label: "Reproductive Endocrinology & Infertility",     dbValue: "Reproductive Endocrinology Physician",                     count: 1448, maleShare: 0.532  },
    { label: "Urogynecology & Reconstructive Pelvic Surgery",dbValue: "Urogynecology and Reconstructive Pelvic Surgery (Obstetrics & Gynecology) Physician", count: 605, maleShare: 0.374  },
  ],
  "Ophthalmology": [
    { label: "Cornea & External Diseases",     dbValue: "Cornea and External Diseases Specialist Physician",         count: 306, maleShare: 0.572  },
    { label: "Glaucoma",                       dbValue: "Glaucoma Specialist (Ophthalmology) Physician",             count: 361, maleShare: 0.626  },
    { label: "Neuro-ophthalmology",            dbValue: "Neuro-ophthalmology Physician",                             count: 134, maleShare: 0.519  },
    { label: "Ophthalmic Plastic & Reconstructive Surgery", dbValue: "Ophthalmic Plastic and Reconstructive Surgery Physician", count: 298, maleShare: 0.611  },
    { label: "Pediatric Ophthalmology",        dbValue: "Pediatric Ophthalmology and Strabismus Specialist Physician", count: 249, maleShare: 0.41  },
    { label: "Retina Specialist",              dbValue: "Retina Specialist (Ophthalmology) Physician",               count: 955, maleShare: 0.791  },
    { label: "Uveitis & Ocular Inflammatory Disease", dbValue: "Uveitis and Ocular Inflammatory Disease (Ophthalmology) Physician", count: 41, maleShare: 0.439  },
  ],
  "Orthopaedic Surgery": [
    { label: "Adult Reconstructive Surgery",   dbValue: "Adult Reconstructive Orthopaedic Surgery Physician",        count: 1268, maleShare: 0.947  },
    { label: "Foot & Ankle Surgery",           dbValue: "Orthopaedic Foot and Ankle Surgery Physician",              count: 689, maleShare: 0.83  },
    { label: "Hand Surgery",                   dbValue: "Orthopaedic Hand Surgery Physician",                        count: 1987, maleShare: 0.826  },
    { label: "Orthopaedic Sports Medicine",    dbValue: "Sports Medicine (Orthopaedic Surgery) Physician",           count: 2726, maleShare: 0.915  },
    { label: "Pediatric Orthopaedic Surgery",  dbValue: "Pediatric Orthopaedic Surgery Physician",                  count: 627, maleShare: 0.707  },
    { label: "Spine Surgery",                  dbValue: "Orthopaedic Surgery of the Spine Physician",               count: 1807, maleShare: 0.95  },
    { label: "Trauma",                         dbValue: "Orthopaedic Trauma Physician",                              count: 729, maleShare: 0.846  },
  ],
  "Otolaryngology – Head & Neck": [
    { label: "Facial Plastic Surgery",         dbValue: "Otolaryngology/Facial Plastic Surgery Physician",           count: 749, maleShare: 0.848  },
    { label: "Otology & Neurotology",          dbValue: "Otology & Neurotology Physician",                           count: 335, maleShare: 0.854  },
    { label: "Pediatric Otolaryngology",       dbValue: "Pediatric Otolaryngology Physician",                        count: 577, maleShare: 0.622  },
    { label: "Plastic Surgery within Head & Neck", dbValue: "Plastic Surgery within the Head & Neck (Otolaryngology) Physician", count: 627, maleShare: 0.813  },
    { label: "Sleep Medicine",                 dbValue: "Sleep Medicine (Otolaryngology) Physician",                 count: 98, maleShare: 0.786  },
  ],
  "Pathology": [
    { label: "Anatomic Pathology only",        dbValue: "Anatomic Pathology Physician",                              count: 2626, maleShare: 0.583  },
    { label: "Blood Banking & Transfusion Medicine", dbValue: "Blood Banking & Transfusion Medicine Physician",      count: 571, maleShare: 0.544  },
    { label: "Clinical Informatics",           dbValue: "Clinical Informatics (Pathology) Physician",               count: 26, maleShare: 0.885  },
    { label: "Clinical Pathology only",        dbValue: "Clinical Pathology Physician",                              count: 417, maleShare: 0.572  },
    { label: "Cytopathology",                  dbValue: "Cytopathology Physician",                                   count: 1387, maleShare: 0.505  },
    { label: "Dermatopathology",               dbValue: "Dermatopathology (Pathology) Physician",                   count: 565, maleShare: 0.607  },
    { label: "Forensic Pathology",             dbValue: "Forensic Pathology Physician",                             count: 567, maleShare: 0.568  },
    { label: "Hematopathology",                dbValue: "Hematology (Pathology) Physician",                         count: 757, maleShare: 0.59  },
    { label: "Medical Microbiology",           dbValue: "Medical Microbiology Physician",                            count: 88, maleShare: 0.636  },
    { label: "Neuropathology",                 dbValue: "Neuropathology Physician",                                  count: 339, maleShare: 0.619  },
    { label: "Pediatric Pathology",            dbValue: "Pediatric Pathology Physician",                             count: 200, maleShare: 0.445  },
  ],
  "Pediatrics": [
    { label: "Adolescent Medicine",            dbValue: "Pediatric Adolescent Medicine Physician",                   count: 2590, maleShare: 0.39  },
    { label: "Allergy & Immunology",           dbValue: "Pediatric Allergy/Immunology Physician",                   count: 429, maleShare: 0.459  },
    { label: "Child Abuse Pediatrics",         dbValue: "Child Abuse Pediatrics Physician",                         count: 130, maleShare: 0.146  },
    { label: "Developmental-Behavioral Pediatrics", dbValue: "Developmental - Behavioral Pediatrics Physician",    count: 969, maleShare: 0.271  },
    { label: "Hospice & Palliative Medicine",  dbValue: "Pediatric Hospice and Palliative Medicine Physician",      count: 206, maleShare: 0.291  },
    { label: "Neonatal-Perinatal Medicine",    dbValue: "Neonatal-Perinatal Medicine Physician",                    count: 5699, maleShare: 0.467  },
    { label: "Neurodevelopmental Disabilities",dbValue: "Pediatric Neurodevelopmental Disabilities Physician",      count: 284, maleShare: 0.378  },
    { label: "Pediatric Cardiology",           dbValue: "Pediatric Cardiology Physician",                           count: 2591, maleShare: 0.621  },
    { label: "Pediatric Critical Care Medicine", dbValue: "Pediatric Critical Care Medicine Physician",             count: 2302, maleShare: 0.506  },
    { label: "Pediatric Emergency Medicine",   dbValue: "Pediatric Emergency Medicine (Pediatrics) Physician",      count: 1847, maleShare: 0.396  },
    { label: "Pediatric Endocrinology",        dbValue: "Pediatric Endocrinology Physician",                        count: 1484, maleShare: 0.332  },
    { label: "Pediatric Gastroenterology",     dbValue: "Pediatric Gastroenterology Physician",                     count: 1609, maleShare: 0.512  },
    { label: "Pediatric Hematology & Oncology",dbValue: "Pediatric Hematology & Oncology Physician",               count: 2607, maleShare: 0.456  },
    { label: "Pediatric Hospital Medicine",    dbValue: "Pediatric Hospital Medicine Physician",                    count: 0 },
    { label: "Pediatric Infectious Diseases",  dbValue: "Pediatric Infectious Diseases Physician",                  count: 1083, maleShare: 0.477  },
    { label: "Pediatric Nephrology",           dbValue: "Pediatric Nephrology Physician",                           count: 734, maleShare: 0.443  },
    { label: "Pediatric Pulmonology",          dbValue: "Pediatric Pulmonology Physician",                          count: 1074, maleShare: 0.506  },
    { label: "Pediatric Rheumatology",         dbValue: "Pediatric Rheumatology Physician",                         count: 397, maleShare: 0.287  },
    { label: "Pediatric Sleep Medicine",       dbValue: "Pediatric Sleep Medicine Physician",                       count: 103, maleShare: 0.476  },
    { label: "Pediatric Sports Medicine",      dbValue: "Pediatric Sports Medicine Physician",                      count: 217, maleShare: 0.571  },
    { label: "Pediatric Transplant Hepatology",dbValue: "Pediatric Transplant Hepatology Physician",               count: 21, maleShare: 0.286  },
    { label: "Sleep Medicine",                 dbValue: "Sleep Medicine (Pediatrics) Physician",                    count: 0 },
    { label: "Sports Medicine",                dbValue: "Sports Medicine (Pediatrics) Physician",                   count: 0 },
  ],
  "Physical Medicine & Rehabilitation": [
    { label: "Brain Injury Medicine",          dbValue: "Brain Injury Medicine (Physical Medicine & Rehabilitation) Physician", count: 98, maleShare: 0.51  },
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Physical Medicine & Rehabilitation) Physician", count: 95, maleShare: 0.453  },
    { label: "Neuromuscular Medicine",         dbValue: "Neuromuscular Medicine (Physical Medicine & Rehabilitation) Physician", count: 153, maleShare: 0.425  },
    { label: "Pain Medicine",                  dbValue: "Pain Medicine (Physical Medicine & Rehabilitation) Physician", count: 1644, maleShare: 0.774  },
    { label: "Pediatric Rehabilitation Medicine", dbValue: "Pediatric Rehabilitation Medicine Physician",            count: 391, maleShare: 0.244  },
    { label: "Spinal Cord Injury Medicine",    dbValue: "Spinal Cord Injury Medicine Physician",                    count: 265, maleShare: 0.532  },
    { label: "Sports Medicine",                dbValue: "Sports Medicine (Physical Medicine & Rehabilitation) Physician", count: 1284, maleShare: 0.506  },
  ],
  "Plastic Surgery": [
    { label: "Plastic & Reconstructive Surgery", dbValue: "Plastic and Reconstructive Surgery Physician",           count: 2380, maleShare: 0.742  },
    { label: "Surgery of the Hand",            dbValue: "Surgery of the Hand (Plastic Surgery) Physician",          count: 379, maleShare: 0.839  },
    { label: "Plastic Surgery within Head & Neck", dbValue: "Plastic Surgery Within the Head and Neck (Plastic Surgery) Physician", count: 185, maleShare: 0.843  },
  ],
  "Preventive Medicine": [
    { label: "Addiction Medicine",             dbValue: "Addiction Medicine (Preventive Medicine) Physician",        count: 340, maleShare: 0.543  },
    { label: "Obesity Medicine",               dbValue: "Obesity Medicine (Preventive Medicine) Physician",          count: 144, maleShare: 0.41  },
    { label: "Occupational & Environmental Medicine", dbValue: "Preventive Medicine/Occupational Environmental Medicine Physician", count: 964, maleShare: 0.683  },
    { label: "Sports Medicine",                dbValue: "Sports Medicine (Preventive Medicine) Physician",           count: 162, maleShare: 0.447  },
    { label: "Undersea & Hyperbaric Medicine", dbValue: "Undersea and Hyperbaric Medicine (Preventive Medicine) Physician", count: 249, maleShare: 0.727  },
  ],
  "Psychiatry": [
    { label: "Addiction Medicine",             dbValue: "Addiction Medicine (Psychiatry & Neurology) Physician",    count: 647, maleShare: 0.677  },
    { label: "Addiction Psychiatry",           dbValue: "Addiction Psychiatry Physician",                           count: 671, maleShare: 0.644  },
    { label: "Brain Injury Medicine",          dbValue: "Brain Injury Medicine (Psychiatry & Neurology) Physician", count: 24, maleShare: 0.75  },
    { label: "Child & Adolescent Psychiatry",  dbValue: "Child & Adolescent Psychiatry Physician",                  count: 6217, maleShare: 0.442  },
    { label: "Forensic Psychiatry",            dbValue: "Forensic Psychiatry Physician",                            count: 824, maleShare: 0.632  },
    { label: "Geriatric Psychiatry",           dbValue: "Geriatric Psychiatry Physician",                           count: 780, maleShare: 0.574  },
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Psychiatry & Neurology) Physician", count: 38, maleShare: 0.5  },
    { label: "Neuromuscular Medicine",         dbValue: "Neuromuscular Medicine (Psychiatry & Neurology) Physician", count: 347, maleShare: 0.559  },
    { label: "Obesity Medicine",               dbValue: "Obesity Medicine (Psychiatry & Neurology) Physician",      count: 15, maleShare: 0.6  },
    { label: "Pain Medicine",                  dbValue: "Pain Medicine (Psychiatry & Neurology) Physician",         count: 166, maleShare: 0.741  },
    { label: "Psychosomatic Medicine",         dbValue: "Psychosomatic Medicine Physician",                         count: 494, maleShare: 0.5  },
    { label: "Sleep Medicine",                 dbValue: "Sleep Medicine (Psychiatry & Neurology) Physician",        count: 378, maleShare: 0.651  },
  ],
  "Radiology": [
    { label: "Body Imaging",                   dbValue: "Body Imaging Physician",                                    count: 1916, maleShare: 0.727  },
    { label: "Diagnostic Neuroimaging",        dbValue: "Diagnostic Neuroimaging (Radiology) Physician",            count: 179, maleShare: 0.726  },
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Radiology) Physician",    count: 9 },
    { label: "Neuroradiology",                 dbValue: "Neuroradiology Physician",                                  count: 1990, maleShare: 0.81  },
    { label: "Nuclear Radiology",              dbValue: "Nuclear Radiology Physician",                               count: 661, maleShare: 0.794  },
    { label: "Pain Medicine",                  dbValue: "Pain Medicine Physician",                                   count: 966, maleShare: 0.744  },
    { label: "Pediatric Radiology",            dbValue: "Pediatric Radiology Physician",                             count: 927, maleShare: 0.574  },
    { label: "Radiation Oncology",             dbValue: "Radiation Oncology Physician",                              count: 6080, maleShare: 0.716  },
    { label: "Vascular & Interventional Radiology", dbValue: "Vascular & Interventional Radiology Physician",       count: 3099, maleShare: 0.876  },
  ],
  "Surgery": [
    { label: "Hospice & Palliative Medicine",  dbValue: "Hospice and Palliative Medicine (Surgery) Physician",      count: 35, maleShare: 0.629  },
    { label: "Pediatric Surgery",              dbValue: "Pediatric Surgery Physician",                               count: 1142, maleShare: 0.708  },
    { label: "Surgery of the Hand",            dbValue: "Surgery of the Hand (Surgery) Physician",                  count: 403, maleShare: 0.854  },
    { label: "Surgical Critical Care",         dbValue: "Surgical Critical Care Physician",                          count: 1509, maleShare: 0.658  },
    { label: "Surgical Oncology",              dbValue: "Surgical Oncology Physician",                               count: 1440, maleShare: 0.589  },
    { label: "Trauma Surgery",                 dbValue: "Trauma Surgery Physician",                                  count: 984, maleShare: 0.685  },
    { label: "Vascular Surgery",               dbValue: "Vascular Surgery Physician",                               count: 4276, maleShare: 0.836  },
  ],
  "Urology": [
    { label: "Pediatric Urology",              dbValue: "Pediatric Urology Physician",                               count: 357, maleShare: 0.686  },
    { label: "Urogynecology & Reconstructive Pelvic Surgery", dbValue: "Urogynecology and Reconstructive Pelvic Surgery (Urology) Physician", count: 114, maleShare: 0.386  },
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

// Pick the gender slice of a [M, F] cell.
function pickGender(cell: GenderCell | undefined, gender: string): number {
  if (!cell) return 0;
  if (gender === "M") return cell[0];
  if (gender === "F") return cell[1];
  return cell[0] + cell[1];
}

// EXACT count from all filters, computed client-side from the hardcoded
// specialty x state x gender table (no DB call, no approximation).
// - specialty/subspecialty: sums the exact matching specialty_text rows
// - state: exact per-state counts (include = selected states; exclude = all others)
// - gender: exact male/female slice
export function computeCount(
  selectedSpecialtyLabels: string[],
  selectedSubspecialtyDbValues: string[],
  stateMode: "all" | "include" | "exclude" = "all",
  selectedStates: string[] = [],
  gender: string = "any",
): number {
  // Which specialty_text keys to sum (deduped — handles cross-listed subspecialties).
  const targets = new Set<string>();
  if (selectedSpecialtyLabels.length === 0) {
    for (const key of Object.keys(SSG)) targets.add(key);
  } else {
    for (const label of selectedSpecialtyLabels) {
      const specialty = SPECIALTIES.find(s => s.label === label);
      if (!specialty) continue;
      const selectedSubs = (SUBSPECIALTIES[label] || []).filter(s =>
        selectedSubspecialtyDbValues.includes(s.dbValue));
      if (selectedSubs.length > 0) {
        for (const s of selectedSubs) targets.add(s.dbValue);
      } else {
        targets.add(specialty.dbValue);
      }
    }
  }

  const includeSet = stateMode === "include" ? new Set(selectedStates) : null;
  const excludeSet = stateMode === "exclude" ? new Set(selectedStates) : null;

  let sum = 0;
  for (const key of targets) {
    const byState = SSG[key];
    if (!byState) continue;
    for (const st in byState) {
      if (includeSet && !includeSet.has(st)) continue;   // only chosen states
      if (excludeSet && excludeSet.has(st)) continue;     // all except chosen
      sum += pickGender(byState[st], gender);
    }
  }
  return sum;
}

// Weighted male share across the current selection. Mirrors computeCount:
// if subspecialties are selected under a specialty, weight by those subspecialties
// (each falling back to the parent specialty's share, then global); otherwise
// weight by the specialty itself.
export function weightedMaleShare(
  selectedSpecialtyLabels: string[],
  selectedSubspecialtyDbValues: string[] = [],
): number {
  if (selectedSpecialtyLabels.length === 0) return GLOBAL_MALE_SHARE;
  let weightedMales = 0;
  let total = 0;
  const seen = new Set<string>(); // dedupe cross-listed subspecialties
  for (const label of selectedSpecialtyLabels) {
    const s = SPECIALTIES.find(x => x.label === label);
    if (!s) continue;
    const parentShare = s.maleShare ?? GLOBAL_MALE_SHARE;
    const subEntries = (SUBSPECIALTIES[label] || []).filter(
      x => selectedSubspecialtyDbValues.includes(x.dbValue),
    );
    if (subEntries.length > 0) {
      for (const sub of subEntries) {
        if (seen.has(sub.dbValue)) continue;
        seen.add(sub.dbValue);
        weightedMales += sub.count * (sub.maleShare ?? parentShare);
        total += sub.count;
      }
    } else {
      weightedMales += s.count * parentShare;
      total += s.count;
    }
  }
  return total > 0 ? weightedMales / total : GLOBAL_MALE_SHARE;
}

// Multiplier to apply to a base count for a gender selection ("M" | "F" | "any").
export function genderMultiplier(
  gender: string,
  selectedSpecialtyLabels: string[],
  selectedSubspecialtyDbValues: string[] = [],
): number {
  if (gender !== "M" && gender !== "F") return 1;
  const male = weightedMaleShare(selectedSpecialtyLabels, selectedSubspecialtyDbValues);
  return gender === "M" ? male : 1 - male;
}
