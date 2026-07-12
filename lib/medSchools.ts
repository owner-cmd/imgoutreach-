// Curated medical school list, grouped by country.
// Ordered by IMG volume into US residencies; "Other" fallback keeps free text possible.
export const MED_SCHOOLS: { country: string; schools: string[] }[] = [
  {
    country: "India",
    schools: [
      "All India Institute of Medical Sciences (AIIMS), New Delhi",
      "Armed Forces Medical College, Pune",
      "Christian Medical College, Vellore",
      "Grant Medical College, Mumbai",
      "Jawaharlal Institute (JIPMER), Puducherry",
      "Kasturba Medical College, Manipal",
      "King George's Medical University, Lucknow",
      "Maulana Azad Medical College, New Delhi",
      "Seth GS Medical College, Mumbai",
      "St. John's Medical College, Bangalore",
    ],
  },
  {
    country: "Pakistan",
    schools: [
      "Aga Khan University, Karachi",
      "Allama Iqbal Medical College, Lahore",
      "Dow University of Health Sciences, Karachi",
      "King Edward Medical University, Lahore",
      "Khyber Medical College, Peshawar",
      "Rawalpindi Medical University",
      "Services Institute of Medical Sciences, Lahore",
    ],
  },
  {
    country: "Egypt",
    schools: [
      "Ain Shams University Faculty of Medicine",
      "Alexandria University Faculty of Medicine",
      "Al-Azhar University Faculty of Medicine",
      "Assiut University Faculty of Medicine",
      "Cairo University Faculty of Medicine (Kasr Al-Ainy)",
      "Mansoura University Faculty of Medicine",
      "Tanta University Faculty of Medicine",
      "Zagazig University Faculty of Medicine",
    ],
  },
  {
    country: "Caribbean",
    schools: [
      "American University of Antigua",
      "American University of the Caribbean",
      "Medical University of the Americas",
      "Ross University School of Medicine",
      "Saba University School of Medicine",
      "St. George's University, Grenada",
      "Xavier University School of Medicine",
    ],
  },
  {
    country: "Nigeria",
    schools: [
      "Ahmadu Bello University",
      "Obafemi Awolowo University",
      "University of Ibadan College of Medicine",
      "University of Lagos College of Medicine",
      "University of Nigeria, Nsukka",
    ],
  },
  {
    country: "Jordan",
    schools: [
      "Hashemite University Faculty of Medicine",
      "Jordan University of Science and Technology",
      "University of Jordan School of Medicine",
      "Yarmouk University Faculty of Medicine",
    ],
  },
  {
    country: "Saudi Arabia",
    schools: [
      "Imam Abdulrahman Bin Faisal University",
      "King Abdulaziz University Faculty of Medicine",
      "King Saud University College of Medicine",
      "Umm Al-Qura University Faculty of Medicine",
    ],
  },
  {
    country: "Syria",
    schools: [
      "Damascus University Faculty of Medicine",
      "Tishreen University Faculty of Medicine",
      "University of Aleppo Faculty of Medicine",
    ],
  },
  {
    country: "Iraq",
    schools: [
      "Al-Mustansiriya University College of Medicine",
      "University of Baghdad College of Medicine",
      "University of Basrah College of Medicine",
      "University of Mosul College of Medicine",
    ],
  },
  {
    country: "Iran",
    schools: [
      "Isfahan University of Medical Sciences",
      "Shahid Beheshti University of Medical Sciences",
      "Shiraz University of Medical Sciences",
      "Tehran University of Medical Sciences",
    ],
  },
  {
    country: "Bangladesh",
    schools: [
      "Chittagong Medical College",
      "Dhaka Medical College",
      "Sir Salimullah Medical College",
    ],
  },
  {
    country: "Philippines",
    schools: [
      "Cebu Institute of Medicine",
      "Far Eastern University Institute of Medicine",
      "University of Santo Tomas Faculty of Medicine",
      "University of the Philippines College of Medicine",
    ],
  },
  {
    country: "Lebanon",
    schools: [
      "American University of Beirut Faculty of Medicine",
      "Lebanese American University School of Medicine",
      "Lebanese University Faculty of Medicine",
      "Université Saint-Joseph Faculty of Medicine",
    ],
  },
  {
    country: "Sudan",
    schools: [
      "University of Gezira Faculty of Medicine",
      "University of Khartoum Faculty of Medicine",
    ],
  },
  {
    country: "China",
    schools: [
      "Fudan University Shanghai Medical College",
      "Peking University Health Science Center",
      "Shanghai Jiao Tong University School of Medicine",
      "Zhejiang University School of Medicine",
    ],
  },
  {
    country: "Mexico",
    schools: [
      "Universidad Autónoma de Guadalajara",
      "Universidad La Salle Facultad de Medicina",
      "Universidad Nacional Autónoma de México (UNAM)",
      "Tecnológico de Monterrey School of Medicine",
    ],
  },
  {
    country: "United States",
    schools: [
      "Albert Einstein College of Medicine",
      "Baylor College of Medicine",
      "Columbia University Vagelos College of Physicians and Surgeons",
      "Duke University School of Medicine",
      "Emory University School of Medicine",
      "Harvard Medical School",
      "Johns Hopkins University School of Medicine",
      "Mayo Clinic Alix School of Medicine",
      "Northwestern University Feinberg School of Medicine",
      "NYU Grossman School of Medicine",
      "Rush Medical College",
      "Stanford University School of Medicine",
      "UCLA David Geffen School of Medicine",
      "UCSF School of Medicine",
      "University of Chicago Pritzker School of Medicine",
      "University of Michigan Medical School",
      "University of Pennsylvania Perelman School of Medicine",
      "Vanderbilt University School of Medicine",
      "Washington University School of Medicine in St. Louis",
      "Yale School of Medicine",
    ],
  },
];

export const OTHER_SCHOOL = "Other (type your school)";
