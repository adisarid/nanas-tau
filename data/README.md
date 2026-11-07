# data/

Datasets used in lectures, one subfolder per lecture topic. Each file gets a row
below (source and what it's used for). Data simulated inside a lecture needs no file.

| File | Source | Used in |
|---|---|---|
| `nonparametric/api_latency.csv` | Ohad Eisenhandler's deck (numbers); framing as API latency is new | L1 sign test, signed-rank |
| `nonparametric/exam_grades.csv` | Ohad Eisenhandler's deck | L1 sign test |
| `nonparametric/llm_labelling_errors.csv` | Constructed for this course (error rates are made up, not real model results). Shape follows the TSP example in Ohad's deck: one model wins most tasks by a little and loses two by a lot | L1 paired sign test, sign vs. signed-rank |
| `nonparametric/production_output.csv` | Ohad Eisenhandler's deck | L1 rank-sum |
| `nonparametric/cotton_strength.csv` | Ohad Eisenhandler's deck (after Montgomery's cotton example) | L5 Kruskal–Wallis, contrasts with medians. Was in L1 |
| `nonparametric/argentina_world_cup.csv` | Ohad's deck, checked against FIFA ranks (2006 = 6, 2010 = 5) and extended with 2022. Empty rank = did not take part or did not reach the last 16 | L1 summary question |
| `anova/support_ai.csv` | Numbers from Ohad Eisenhandler's / Evgeny Khmelnitsky's decks (delivery-drivers example), relabelled: drivers D1–D5 → language models M1–M5, trip hours → average handle time (min). The call-centre framing, the model sizes and the day block are ours | L4 one-way ANOVA, L5 contrasts, Duncan, Tukey, Friedman |
| `anova/exam_rooms.csv` | Simulated (seed 80) to mimic the exam-rooms contrast example in the old decks (40/30/30 students, F ≈ 4) | L4 unbalanced design, L5 unbalanced contrast |
| `nonparametric/llm_prompt_eval.csv` | Constructed for this course | L5 Friedman. Was in L1 |
