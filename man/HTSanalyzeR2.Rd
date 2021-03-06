% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/HTSanalyzeR2.R
\docType{package}
\name{HTSanalyzeR2}
\alias{HTSanalyzeR2}
\alias{HTSanalyzeR2-package}
\title{HTSanalyzeR2 Package Overview}
\description{
This package provides classes and methods for gene set over-representation,
enrichment and network analyses on various high-throughput data generated from RNAi,
microarray, RNA-seq and CRISPR. The over-representation analysis is performed based on hypergeometric tests. The
enrichment analysis is based on the GSEA algorithm (Subramanian et al. PNAS
2005). The network analysis identifies enriched subnetworks based on
algorithms from the BioNet package (Beisser et al., Bioinformatics 2010). A unique point of
this package compared to other similar packages lies in that it can deal with "Time series" data
with high efficiency. In addition, it can generate a dynamic Shiny report including all the results
in, which would be easily for users to download, modify visualizations and even share with others.
A pipeline is also specifically designed for CRISPR data pre-processed
by MAGeCK to perform integrative analyses including
gene set over-representation, enrichment and network analyses. The
users can also build their own analysis pipeline for their data based on
this package.
}
\section{Details}{

The most important classes in this package are 'GSCA' (Gene Set Collection
Analyses), 'NWA' (NetWork Analyses), 'GSCABatch' (Gene Set Collection
Analyses for time-series data) and 'NWABatch' (NetWork Analyses for time-series data).
As an example, a pipeline (see function
'HTSanalyzeR4MAGeCK') is developed in this package for CRISPR data preprocessed by MAGeCK.
Based on these four classes and other functions, users can design
their own pipelines specifically for their own data sets.

Full help on classes and associated functions is available from within class
help pages.

Introductory information on the use of classes and pipeline are available in
the vignette.

A full listing of documented topics is available in HTML view by typing
help.start() and selecting the HTSanalyzeR package from the Packages menu
or via library(help="HTSanalyzeR2").
}

\references{
Subramanian, A., Tamayo, P., Mootha, V. K., Mukherjee, S., Ebert,
  B. L., Gillette, M. A., Paulovich, A., Pomeroy, S. L., Golub, T. R.,
  Lander, E. S. & Mesirov, J. P. (2005) \emph{ Gene set enrichment analysis:
  A knowledge-based approach for interpreting genome-wide expression
  profiles.} Proc. Natl. Acad. Sci. USA 102, 15545-15550.

  Beisser D, Klau GW, Dandekar T, Muller T, Dittrich MT. BioNet: an R-Package
  for the functional analysis of biological networks. Bioinformatics. 2010
  Apr 15;26(8):1129-30.

  Dittrich MT, Klau GW, Rosenwald A., Dandekar T and Muller T.
  \emph{Identifying functional modules in protein-protein interaction
  networks: an integrated exact approach.} Bioinformatics 2008
  24(13):i223-i231.
}
