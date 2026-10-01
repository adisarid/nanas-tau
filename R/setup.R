# Shared setup for every lecture: source("../R/setup.R") in the first chunk.
# Keeps the look of all charts consistent across the course.

suppressPackageStartupMessages({
  library(tidyverse)
  library(scales)
})

set.seed(2026)

# Colour-blind safe palette (Okabe–Ito based). Use nanas_pal[["primary"]] etc.
nanas_pal <- c(
  primary = "#2B59C3",
  accent  = "#E4572E",
  green   = "#009E73",
  yellow  = "#E69F00",
  sky     = "#56B4E9",
  purple  = "#8E6BBF",
  grey    = "#8A8F98"
)

theme_nanas <- function(base_size = 14) {
  theme_minimal(base_size = base_size) +
    theme(
      plot.title.position   = "plot",
      plot.caption.position = "plot",
      # Hebrew titles align right; the axes themselves still run left-to-right.
      plot.title    = element_text(face = "bold", hjust = 1),
      plot.subtitle = element_text(colour = "grey30", hjust = 1),
      plot.caption  = element_text(colour = "grey45", hjust = 1, size = rel(0.75)),
      panel.grid.minor = element_blank(),
      legend.position  = "top",
      strip.text       = element_text(face = "bold")
    )
}

theme_set(theme_nanas())

options(
  ggplot2.discrete.colour = unname(nanas_pal),
  ggplot2.discrete.fill   = unname(nanas_pal),
  digits = 4
)

update_geom_defaults("point", list(colour = nanas_pal[["primary"]]))
update_geom_defaults("bar",   list(fill = nanas_pal[["primary"]]))
update_geom_defaults("col",   list(fill = nanas_pal[["primary"]]))
