# ננס · ניתוח נתונים סטטיסטי (Statistical Data Analysis)

Course materials for **TAU 0571-3137, Statistical Data Analysis**, Faculty of Engineering (Industrial Engineering), Tel Aviv University, semester A 2026/27 (תשפ״ז).

- **Site:** <https://adisarid.github.io/nanas-tau/>
- **Lecturer:** Dr. Adi Sarid. Lectures Mon 09:00–12:00, Shmuel Engineering building, room 001.
- **TA:** Avital Shamir. Recitations Wed 14:30–15:30 (group 02) and 15:30–16:30 (group 03).
- **Official syllabus:** [TAU syllabus system](https://www.ims.tau.ac.il/Tal/Syllabus/Syllabus_L.aspx?course=0571313701&year=2026)
- **Grading:** project 15%, final exam 85% (3h exam, self-prepared formula sheet of up to 10 pages)
- **[Moodle](https://moodle.tau.ac.il/course/view.php?id=571313701)** handles announcements, homework and submissions. This repo is for lecture content only.

The materials build on Ohad's earlier version of the course (PowerPoint decks), rewritten from scratch. The aim is a modern look, real-world examples drawn from industry and AI practice, and every chart and computation shown in **R** code.

---

## For AI agents: read this first

Read this section before you edit anything.

### Stack

| Piece | Choice |
|---|---|
| Site | Quarto website (`_quarto.yml`), deployed to GitHub Pages (`gh-pages` branch) |
| Lectures | One `.qmd` per lecture in `lectures/`. Each one renders as a notes page (`html`) **and** a slide deck (`revealjs`) |
| Code | R only (tidyverse + ggplot2). Packages pinned in `renv.lock` |
| Language | Hebrew, RTL (`lang: he`, `dir: rtl`). English technical terms in parentheses on first use |
| CI | `.github/workflows/publish.yml` renders **without R**, using the committed `_freeze/` |

### Repo map

```
_quarto.yml               site config, navbar (lecture menu lives here), footer (last-updated date)
index.qmd                 home page (course info, staff, times)
lectures.qmd              lecture schedule table, links to notes + slides
syllabus.qmd              syllabus summary
lectures/
  _metadata.yml           shared html + revealjs formats for every lecture
  NN-slug.qmd             one lecture → NN-slug.html + NN-slug-slides.html
R/setup.R                 shared ggplot theme (theme_nanas), palette (nanas_pal), seed
assets/styles.scss        site theme (Heebo font, RTL fixes for code/figures)
assets/slides.scss        slide theme (RTL, title slide)
_templates/               lecture-template.qmd. Not rendered (leading underscore)
data/                     course datasets + data/README.md (source & licence per file)
_freeze/                  COMMITTED computation cache. CI depends on it
renv/, renv.lock          R package environment
```

### Adding a lecture

1. `cp _templates/lecture-template.qmd lectures/NN-slug.qmd` (two-digit NN, English kebab-case slug).
2. Set `title`, `subtitle` and `format.revealjs.output-file: NN-slug-slides.html`.
3. Add it to the `הרצאות` menu in `_quarto.yml` and fill in its row in `lectures.qmd` (links to both `.qmd` and `-slides.html`).
4. Render locally: `quarto render lectures/NN-slug.qmd`, or `quarto preview` while writing.
5. Commit the `.qmd` **and** the matching `_freeze/lectures/NN-slug/` folder.

### Before every push to `main`

Update the last-updated date in the site footer: `website.page-footer.right` in `_quarto.yml` (`עודכן לאחרונה: DD.MM.YYYY`). Set it to the push date and commit it with the rest of the change.

### Authoring conventions

- **Slides and notes come from the same source.** Every `##` heading starts a new slide and is also a section on the notes page. Keep slides short.
  - Longer explanations that should appear only on the notes page go in `::: {.content-hidden when-format="revealjs"}`. Don't use `when-format="html"`: Quarto counts revealjs as html, so that content would show on the slides too.
  - Content that should appear only in the slides goes in `::: {.content-visible when-format="revealjs"}`.
  - Speaker notes go in `::: notes`.
- **Dense slides:** add `{.smaller}` to the `##` heading. Put a chart chunk's output on its own slide with `#| output-location: slide`, so the code doesn't squeeze it.
- **First chunk** of every lecture: `source("../R/setup.R")` with `include: false`.
- **Charts:**
  - Use ggplot2 with the default `theme_nanas()`.
  - Use colours from `nanas_pal`. Don't hard-code new hex values.
  - Titles and subtitles are in Hebrew.
  - Axis labels can be English when they name variables.
  - The **x axis always runs left to right**: zero or the earliest time on the left, even on RTL pages. The CSS already sets figures to `direction: ltr`. Don't flip axes for RTL.
- **Examples:**
  - Prefer modern, realistic scenarios to textbook toy data: A/B tests, response times, LLM evals and AI-system experiments, operations and service data, survey data.
  - Each example should state its business or engineering question before showing any statistics.
  - Simulated data is fine. Use a fixed seed (set in `setup.R`).
- **Method lectures should follow this arc:** question → data → assumptions → method → R output → interpretation → what can go wrong. The exam stresses interpreting software output, so show the R output and explain how to read it.
- **Hand calculation still matters.** The exam includes manual computation, so the notes should keep the key formulas (as LaTeX math, never images), with a small worked example next to the R version.
- **Hebrew text:**
  - Write natural Hebrew.
  - Keep R code, function names and package names in English.
  - When an English term appears inline, wrap it as `[Kruskal–Wallis]{.en}` if bidi ordering breaks.
- **Do not** convert the old PowerPoint decks slide by slide. Their formulas are embedded as images and the examples are dated. Use them as a checklist of topics, not as source text.

### What is not in this repo

This repo is **public**. Never commit:

- exams, exam solutions, or the bank of exam questions
- student work, names, grades or any student data
- project rubrics and grading notes before they are published to students

Reference material from the previous iteration (Previous decks, past exams and solutions, project guidelines) lives **only locally**, outside the repo, in `~/Documents/statistical_analysis_course_old_materials/`. The main subfolder is `ננס/`, which has decks 1–8: one-way ANOVA, two-way ANOVA, DOE, PCA, logistic regression, non-parametric methods, time series, summary questions. Agents may read it for topic coverage but must not copy it into the repo. Put anything private in `_private/` (gitignored).

---

## Lecture plan (tentative)

This order was agreed with Avital and differs from the official syllabus order.

| # | Lecture | Recitation |
|---|---|---|
| 1 | Non-parametric methods | Non-parametric methods |
| 2 | *Rescheduled. Make-up date and topic TBD* | Probability distributions review |
| 3 | Multiple linear regression | Simple + multiple regression |
| 4–6 | ANOVA (one-way, contrasts & multiple comparisons, multi-way) | accordingly |
| 7 | Design of experiments | accordingly |
| 8 | Logistic regression | accordingly |
| 9 | PCA | accordingly |
| 10–11 | Time series & forecasting | accordingly |
| 12 | Buffer | |
| 13 | Exam review | accordingly |
| TBD | | Lab: data visualization (content and date still under discussion) |
| TBD | | Lab: working with GitHub (content and date still under discussion) |

### Open design questions

These were raised in planning and are not decided yet. Don't assume an answer.

- How much to shift from hand calculation toward model choice, assumption checks, interpretation and critique of output (including AI-generated analyses).
- AI policy for the project and homework.
- Whether to add simulation-based methods (permutation tests, bootstrap) as a bridge between parametric and non-parametric.
- Whether forecasting stays classical (Brown / Holt / Winters) or adds train/test, ARIMA and forecast evaluation.
- Project: shared dataset vs. student-chosen, whether to require GitHub submission, and which methods are allowed.

---

## Working locally

Requirements: [Quarto](https://quarto.org) ≥ 1.9 and R ≥ 4.5.

```bash
git clone git@github.com:adisarid/nanas-tau.git
cd nanas-tau
Rscript -e 'renv::restore()'     # install pinned packages
quarto preview                   # live preview at localhost
quarto render                    # full render to _site/
```

If you add a package, run `renv::snapshot()` and commit `renv.lock`.

**Publishing.** Pushing to `main` triggers the GitHub Action, which republishes the site. CI does not run R, so always render locally and commit `_freeze/` together with your `.qmd` changes. If you forget, the CI render fails. Before pushing, also update the last-updated date in the footer (`website.page-footer.right` in `_quarto.yml`).

## Licence

Text and slides: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Code: MIT.
