# data/

Datasets used in lectures, one subfolder per lecture topic. Each file gets a row
below (source and what it's used for). Data simulated inside a lecture needs no file.

| File | Source | Used in |
|---|---|---|
| `nonparametric/api_latency.csv` | Ohad Eisenhandler's deck (numbers); framing as API latency is new | L1 sign test, signed-rank |
| `nonparametric/exam_grades.csv` | Ohad Eisenhandler's deck | L1 sign test |
| `nonparametric/llm_labelling_errors.csv` | Constructed for this course (error rates are made up, not real model results). Shape follows the TSP example in Ohad's deck: one model wins most tasks by a little and loses two by a lot | L1 paired sign test, sign vs. signed-rank |
| `nonparametric/production_output.csv` | Ohad Eisenhandler's deck | L1 rank-sum |
| `nonparametric/cotton_strength.csv` | Ohad Eisenhandler's deck (after Montgomery's cotton example) | Planned for the ANOVA lecture (Kruskal–Wallis, contrasts). Was in L1 |
| `nonparametric/argentina_world_cup.csv` | Ohad's deck, checked against FIFA ranks (2006 = 6, 2010 = 5) and extended with 2022. Empty rank = did not take part or did not reach the last 16 | L1 summary question |
| `nonparametric/llm_prompt_eval.csv` | Constructed for this course | Planned for the ANOVA lecture (Friedman). Was in L1 |
