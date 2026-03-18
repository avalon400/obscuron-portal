/**
 * translations.js — UI text for all supported languages
 *
 * HOW TO EDIT:
 *   - Find the key you want to change (e.g. welcome_title)
 *   - Edit the text inside the quotes for the language you want (hu / en)
 *   - Save the file and commit — no other files need to be touched
 *
 * HOW TO ADD A NEW LANGUAGE:
 *   - Copy the entire `en: { ... }` block
 *   - Rename it to your language code (e.g. `de:`)
 *   - Translate all values
 *   - Add a button in index.html:  <button class="lang-btn" onclick="setLang('de')">DE</button>
 */

const T = {

  // ─────────────────────────────────────────────
  //  HUNGARIAN
  // ─────────────────────────────────────────────
  hu: {
    // Site
    site_title:               'KompetenciaKapu — Vizsgáztató Rendszer',

    // Welcome screen
    welcome_title:            'KompetenciaKapu',
    welcome_sub:              'Hivatalos Kompetencia Vizsgáztató Platform',
    welcome_desc:             'Adja meg vizsgaazonosítóját a vizsga megkezdéséhez, vagy lépjen be az adminisztrátori felületre.',
    btn_start_exam:           'Vizsga megkezdése',
    btn_view_result:          'Eredmény megtekintése',
    btn_admin:                'Adminisztrátor',

    // Login screen
    login_title:              'Vizsgázó azonosítása',
    login_sub:                'Adja meg intézménye által kiadott vizsgakódot és vizsgázói azonosítót.',
    login_info:               'Az azonosítókat a vizsgáztató intézmény bocsátja ki. Probléma esetén forduljon a felügyelőhöz.',
    exam_code:                'Vizsgakód',
    exam_code_hint:           'A vizsgáztatói kör által kiadott egyedi kód.',
    exam_code_hint2:          'Egyedi. Vizsgázókkal megosztandó.',
    examinee_id:              'Vizsgázói azonosító',
    examinee_id_hint:         'Az intézmény által kiadott személyes azonosító.',
    btn_back:                 '← Vissza',
    btn_verify:               'Ellenőrzés és folytatás →',

    // Instructions
    instructions_heading:     'Útmutató',
    instr_items: [
      'Figyelmesen olvassa el az összes kérdést, mielőtt válaszol.',
      'A feleletválasztós kérdéseknél válassza a legjobb választ.',
      'Az időmérő a <strong>Vizsga megkezdése</strong> gombra kattintva indul, és nem szüneteltethető.',
      'A vizsga automatikusan beadásra kerül, ha lejár az idő.',
      'Az alsó navigációs pontok segítségével szabadon mozoghat a kérdések között.',
      'A kompetenciapontszám az egyes feladatok nehézségi fokán alapul.',
      '<strong>Az eredményeket az adminisztrátor teszi közzé egy későbbi időpontban.</strong>',
    ],
    instr_warn:               'Ne zárja be és ne frissítse az oldalt a vizsga közben. Az előrehaladás nem állítható vissza.',
    btn_begin:                'Vizsga megkezdése →',

    // Exam screen
    questions:                'Kérdések',
    minutes:                  'Perc',
    max_points:               'Max. pont',
    btn_submit:               'Beadás',
    btn_prev:                 '← Előző',
    btn_next:                 'Következő →',
    q_of:                     '/ kérdés',
    answered_pct:             'megválaszolva',
    difficulty_label:         'Nehézség',
    diff_levels:              ['', 'Minimális', 'Alap', 'Közepes', 'Standard', 'Haladó', 'Szakértői', 'Mester'],
    confirm_submit_partial:   '%d kérdés megválaszolatlan. Biztosan be szeretné adni a vizsgát?',

    // Submitted screen
    submitted_title:          'Vizsga beadva',
    submitted_msg:            'Válaszai rögzítve lettek. Az eredményeket az adminisztrátor teszi közzé. Amint elérhetővé válnak, az alábbi azonosítóval tekintheti meg őket.',
    btn_home:                 '← Főoldal',

    // Result lookup
    lookup_title:             'Eredmény lekérdezése',
    lookup_sub:               'Adja meg azonosítóit a közzétett eredmény megtekintéséhez.',
    btn_lookup:               'Eredmény megtekintése →',

    // Result screen
    result_title:             'Vizsga eredménye',
    competence_points:        'Kompetenciapontok',
    out_of_2500:              '2500-ból',
    correct:                  'Helyes',
    incorrect:                'Helytelen',
    time_used:                'Felhasznált idő',
    question_review:          'Kérdések áttekintése',
    grade_outstanding:        'Kiváló',
    grade_excellent:          'Jeles',
    grade_proficient:         'Jó',
    grade_developing:         'Közepes',
    grade_beginning:          'Kezdő',
    msg_outstanding:          'Kiemelkedő teljesítmény. Mesterfokú tudást mutatott ezen a vizsgán.',
    msg_excellent:            'Kiváló eredmény. Magas szintű kompetenciát mutatott ezen a területen.',
    msg_proficient:           'Jó eredmény. A várt szintet meghaladó teljesítmény.',
    msg_developing:           'Fejlődő kompetencia. Javaslunk további tanulást ezen a területen.',
    msg_beginning:            'További tanulás szükséges. Kérjük, tekintse át a tananyagot.',
    your_answer:              'Az Ön válasza',
    correct_answer:           'Helyes válasz',

    // Admin login
    admin_login_title:        'Adminisztrátori hozzáférés',
    admin_login_sub:          'Korlátozott hozzáférés — kizárólag jogosult személyek számára.',
    admin_password:           'Adminisztrátori jelszó',
    btn_enter:                'Belépés →',

    // Admin panel
    admin_panel_title:        'Adminisztrátori panel',
    admin_panel_sub:          'Vizsgák, feladatbank, eredmények és közzétételek kezelése.',
    btn_exit:                 '← Kilépés',
    tab_exams:                'Vizsgák',
    tab_tasks:                'Feladatbank',
    tab_examinees:            'Vizsgázók',
    tab_results:              'Eredmények',
    tab_publish:              'Közzététel',

    // Exams tab
    create_exam:              'Vizsga létrehozása',
    exam_title:               'Vizsga megnevezése',
    category:                 'Kategória',
    time_limit:               'Időkorlát (perc)',
    description:              'Leírás',
    btn_create_exam:          'Vizsga létrehozása',
    exam_list:                'Vizsgák listája',
    th_code:                  'Kód',
    th_title:                 'Megnevezés',
    th_tasks:                 'Feladatok',
    th_time:                  'Idő',
    assign_task:              'Feladat hozzárendelése vizsgához',
    select_exam:              'Vizsga kiválasztása',
    select_task:              'Feladat kiválasztása',
    btn_assign:               'Hozzárendelés',

    // Tasks tab
    add_task:                 'Feladat hozzáadása a bankhoz',
    question_text:            'Kérdés szövege',
    question_type:            'Kérdéstípus',
    type_mc:                  'Feleletválasztós',
    type_text:                'Rövid válasz',
    type_order:               'Sorbarendezés',
    type_match:               'Párosítás',
    difficulty:               'Nehézség (1–7)',
    diff_1:                   '1 — Minimális',
    diff_2:                   '2 — Alap',
    diff_3:                   '3 — Közepes',
    diff_4:                   '4 — Standard',
    diff_5:                   '5 — Haladó',
    diff_6:                   '6 — Szakértői',
    diff_7:                   '7 — Mester',
    options_label:            'Válaszlehetőségek (jelölje meg a helyeset)',
    btn_add_option:           '+ Lehetőség hozzáadása',
    keywords_label:           'Elfogadott kulcsszavak (vesszővel elválasztva)',
    order_items_label:        'Elemek helyes sorrendben (soronként egy)',
    match_pairs_label:        'Párok — formátum "Bal | Jobb" (soronként egy)',
    btn_save_task:            'Mentés a feladatbankba',
    task_bank:                'Feladatbank',
    th_question:              'Kérdés',
    th_type:                  'Típus',
    th_diff:                  'Neh.',
    th_pts:                   'Pont',

    // Examinees tab
    register_examinee:        'Vizsgázó regisztrálása',
    btn_register:             'Regisztrálás',
    registered_examinees:     'Regisztrált vizsgázók',
    th_status:                'Állapot',

    // Results tab
    all_results:              'Összes eredmény',
    th_points:                'Pontszám',
    th_correct:               'Helyes',
    th_submitted:             'Beadva',
    btn_refresh:              '↻ Frissítés',
    no_results:               'Még nincsenek eredmények.',

    // Publish tab
    publish_results:          'Eredmények közzététele',
    publish_warn:             'A közzététel után minden regisztrált vizsgázó megtekintheti saját eredményét. Ez a művelet nem vonható vissza.',
    th_submissions:           'Beadások',
    th_action:                'Művelet',
    no_exams:                 'Még nincsenek vizsgák.',
    btn_publish:              'Közzétesz',
    status_published:         'Közzétett',
    status_pending:           'Függőben',

    // Errors
    err_fill_required:        'Kérjük, töltse ki az összes kötelező mezőt.',
    err_code_exists:          'Ilyen kódú vizsga már létezik.',
    err_no_exam:              'A vizsgakód nem ismert.',
    err_no_examinee:          'Ez az azonosító nem regisztrált erre a vizsgára.',
    err_already_submitted:    'Ezt a vizsgát már beadta.',
    err_not_released:         'Az eredmények még nem kerültek közzétételre.',
    err_no_result:            'Nem található eredmény ezekkel az azonosítókkal.',
    err_task_required:        'A kérdés szövege kötelező.',
    err_min_options:          'Legalább 2 válaszlehetőség szükséges.',
    err_mark_correct:         'Jelölje meg a helyes választ.',
    err_keywords:             'Adjon meg legalább egy kulcsszót.',
    err_order_items:          'Legalább 2 elem szükséges.',
    err_match_pairs:          'Legalább 2 pár szükséges, "Bal | Jobb" formátumban.',
    err_register_required:    'Adjon meg egy vizsgát és vizsgázói azonosítót.',
    err_already_registered:   'Ez az azonosító már regisztrálva van erre a vizsgára.',

    // Success messages
    success_task_assigned:        'Feladat sikeresen hozzárendelve.',
    success_examinee_registered:  'Vizsgázó sikeresen regisztrálva.',
    network_error:                'Hálózati hiba. Ellenőrizze a kapcsolatot.',

    // Misc
    all_exams_option:         'Összes vizsga',
    select_exam_first:        '— Válasszon vizsgát —',
    min_placeholder:          'perc',
    no_tasks:                 'Még nincsenek feladatok.',
    no_examinees:             'Nincs regisztrált vizsgázó.',
    task_already_assigned:    'Ez a feladat már hozzá van rendelve ehhez a vizsgához.',
  },

  // ─────────────────────────────────────────────
  //  ENGLISH
  // ─────────────────────────────────────────────
  en: {
    // Site
    site_title:               'CompetenceGate — Examination System',

    // Welcome screen
    welcome_title:            'CompetenceGate',
    welcome_sub:              'Official Competence Examination Platform',
    welcome_desc:             'Enter your examination credentials to begin, or access the administrator panel.',
    btn_start_exam:           'Start Examination',
    btn_view_result:          'View My Result',
    btn_admin:                'Administrator',

    // Login screen
    login_title:              'Examinee Identification',
    login_sub:                'Enter the examination code and examinee ID issued by your institution.',
    login_info:               'Your credentials were issued by the examination authority. Contact your invigilator if you have not received them.',
    exam_code:                'Examination Code',
    exam_code_hint:           'A unique code issued per examination session.',
    exam_code_hint2:          'Unique. Share with examinees.',
    examinee_id:              'Examinee ID',
    examinee_id_hint:         'Your personal identifier assigned by the authority.',
    btn_back:                 '← Back',
    btn_verify:               'Verify & Continue →',

    // Instructions
    instructions_heading:     'Instructions',
    instr_items: [
      'Read each question carefully before answering.',
      'For multiple-choice questions, select the single best answer.',
      'The timer begins when you press <strong>Begin Examination</strong> and cannot be paused.',
      'The examination is submitted automatically when time expires.',
      'You may navigate freely between questions using the dot panel at the bottom.',
      'Your competence score is based on the difficulty rating of each task.',
      '<strong>Results will be released by the administrator at a later date.</strong>',
    ],
    instr_warn:               'Do not close or refresh the browser during the examination. Your progress cannot be recovered.',
    btn_begin:                'Begin Examination →',

    // Exam screen
    questions:                'Questions',
    minutes:                  'Minutes',
    max_points:               'Max Points',
    btn_submit:               'Submit',
    btn_prev:                 '← Previous',
    btn_next:                 'Next →',
    q_of:                     'of',
    answered_pct:             'answered',
    difficulty_label:         'Difficulty',
    diff_levels:              ['', 'Minimal', 'Basic', 'Moderate', 'Standard', 'Advanced', 'Expert', 'Mastery'],
    confirm_submit_partial:   'You have %d unanswered question(s). Submit anyway?',

    // Submitted screen
    submitted_title:          'Examination Submitted',
    submitted_msg:            'Your responses have been recorded. Results will be released by the administrator. Once available, use the reference below to view your results.',
    btn_home:                 '← Home',

    // Result lookup
    lookup_title:             'Result Lookup',
    lookup_sub:               'Enter your credentials to view your published result.',
    btn_lookup:               'View Result →',

    // Result screen
    result_title:             'Examination Result',
    competence_points:        'Competence Points',
    out_of_2500:              'out of 2500',
    correct:                  'Correct',
    incorrect:                'Incorrect',
    time_used:                'Time Used',
    question_review:          'Question Review',
    grade_outstanding:        'Outstanding',
    grade_excellent:          'Excellent',
    grade_proficient:         'Proficient',
    grade_developing:         'Developing',
    grade_beginning:          'Beginning',
    msg_outstanding:          'Exceptional performance. You have demonstrated mastery of this examination.',
    msg_excellent:            'Excellent result. You show a high level of competence in this area.',
    msg_proficient:           'Good result. You are above the expected standard.',
    msg_developing:           'You are developing competence. Continued study is recommended.',
    msg_beginning:            'Further study is needed. Please review the learning materials.',
    your_answer:              'Your answer',
    correct_answer:           'Correct answer',

    // Admin login
    admin_login_title:        'Administrator Access',
    admin_login_sub:          'Restricted — authorised personnel only.',
    admin_password:           'Administrator Password',
    btn_enter:                'Access Panel →',

    // Admin panel
    admin_panel_title:        'Administration Panel',
    admin_panel_sub:          'Manage examinations, task bank, results, and publication.',
    btn_exit:                 '← Exit',
    tab_exams:                'Examinations',
    tab_tasks:                'Task Bank',
    tab_examinees:            'Examinees',
    tab_results:              'Results',
    tab_publish:              'Publish',

    // Exams tab
    create_exam:              'Create Examination',
    exam_title:               'Examination Title',
    category:                 'Category',
    time_limit:               'Time Limit (min)',
    description:              'Description',
    btn_create_exam:          'Create Examination',
    exam_list:                'Examination List',
    th_code:                  'Code',
    th_title:                 'Title',
    th_tasks:                 'Tasks',
    th_time:                  'Time',
    assign_task:              'Assign Task to Examination',
    select_exam:              'Select Examination',
    select_task:              'Select Task',
    btn_assign:               'Assign',

    // Tasks tab
    add_task:                 'Add Task to Bank',
    question_text:            'Question Text',
    question_type:            'Question Type',
    type_mc:                  'Multiple Choice',
    type_text:                'Short Answer',
    type_order:               'Ordering',
    type_match:               'Matching',
    difficulty:               'Difficulty (1–7)',
    diff_1:                   '1 — Minimal',
    diff_2:                   '2 — Basic',
    diff_3:                   '3 — Moderate',
    diff_4:                   '4 — Standard',
    diff_5:                   '5 — Advanced',
    diff_6:                   '6 — Expert',
    diff_7:                   '7 — Mastery',
    options_label:            'Options (mark the correct one)',
    btn_add_option:           '+ Add Option',
    keywords_label:           'Accepted keywords (comma-separated)',
    order_items_label:        'Items in correct order (one per line)',
    match_pairs_label:        'Pairs — format "Left | Right" (one per line)',
    btn_save_task:            'Save to Task Bank',
    task_bank:                'Task Bank',
    th_question:              'Question',
    th_type:                  'Type',
    th_diff:                  'Diff.',
    th_pts:                   'Points',

    // Examinees tab
    register_examinee:        'Register Examinee',
    btn_register:             'Register',
    registered_examinees:     'Registered Examinees',
    th_status:                'Status',

    // Results tab
    all_results:              'All Results',
    th_points:                'Score',
    th_correct:               'Correct',
    th_submitted:             'Submitted',
    btn_refresh:              '↻ Refresh',
    no_results:               'No results yet.',

    // Publish tab
    publish_results:          'Publish Results',
    publish_warn:             'Once published, all examinees can view their individual scores. This action cannot be undone.',
    th_submissions:           'Submissions',
    th_action:                'Action',
    no_exams:                 'No examinations yet.',
    btn_publish:              'Publish',
    status_published:         'Published',
    status_pending:           'Pending',

    // Errors
    err_fill_required:        'Please fill in all required fields.',
    err_code_exists:          'An examination with that code already exists.',
    err_no_exam:              'Examination code not recognised.',
    err_no_examinee:          'Examinee ID not registered for this examination.',
    err_already_submitted:    'This examination has already been submitted.',
    err_not_released:         'Results have not yet been released.',
    err_no_result:            'No result found for these credentials.',
    err_task_required:        'Question text is required.',
    err_min_options:          'At least 2 options are required.',
    err_mark_correct:         'Please mark the correct answer.',
    err_keywords:             'Provide at least one keyword.',
    err_order_items:          'At least 2 items are required.',
    err_match_pairs:          'At least 2 pairs required in "Left | Right" format.',
    err_register_required:    'Please select an exam and enter an examinee ID.',
    err_already_registered:   'This ID is already registered for this examination.',

    // Success messages
    success_task_assigned:        'Task successfully assigned.',
    success_examinee_registered:  'Examinee successfully registered.',
    network_error:                'Network error. Please check your connection.',

    // Misc
    all_exams_option:         'All examinations',
    select_exam_first:        '— Select examination —',
    min_placeholder:          'min',
    no_tasks:                 'No tasks yet.',
    no_examinees:             'No registered examinees.',
    task_already_assigned:    'This task is already assigned to this examination.',
  }
};
