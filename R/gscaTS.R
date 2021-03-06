

# preprocess --------------------------------------------------------------
#' A preprocessing method for a GSCABatch object of Time-series data Gene Set Collection Analyses
#'
#' This function will do basic preprocessing for each GSCA object of 'GSCABatch'.
#' @param object A GSCABatch object.
#' @param species A single character value specifying the species of the inputs.
#' It supports all the species of OrgDb objects in AnnotationDbi.
#' The format should be an abbreviation of the organism as setted by AnnotationDbi.
#' For example, the commonly used ones are "Dm" ("Drosophila_melanogaster"),
#' "Hs" ("Homo_sapiens"), "Rn" ("Rattus_norvegicus"), "Mm" ("Mus_musculus"),
#' "Ce" ("Caenorhabditis_elegans"), and etc.
#' @param initialIDs A single character value specifying the type of
#' initial identifiers for input phenotypeTS The valid terms need match with
#' the keytypes of species db such as keytypes(org.Hs.eg.db).
#' @param keepMultipleMappings A single logical value. If TRUE, the function
#' keeps the entries with multiple mappings (first mapping is kept). If FALSE,
#' the entries with multiple mappings will be discarded.
#' @param duplicateRemoverMethod A single character value specifying the method
#' to remove the duplicates. See help(duplicateRemover) for details.
#' @param orderAbsValue A single logical value indicating whether the values
#' should be converted to absolute values and then ordered (if TRUE), or
#' ordered as they are (if FALSE).
#' @param verbose A single logical value specifying to display detailed messages
#' (when verbose=TRUE) or not (when verbose=FALSE).
#' @return In the end, this function will return an updated list of GSCA object.
#' @seealso \code{\link[HTSanalyzeR2]{preprocess}}
#' @export
#' @examples
#' data(d7, d13, d25)
#'
#' ## generate expInfor to describe the information of time series data
#' expInfor <- matrix(c("d7", "d13", "d25"), nrow = 3, ncol = 2,
#'                    byrow = FALSE, dimnames = list(NULL, c("ID", "Description")))
#'
#' ## package phenotypeTS into a list of phenotypes
#' datalist <- list(d7, d13, d25)
#' phenotypeTS <- lapply(datalist, function(x) {
#'                       tmp <- as.vector(x$neg.lfc)
#'                       names(tmp) <- x$id
#'                       tmp})
#'
#' ## set up a list of gene set collections
#' library(org.Hs.eg.db)
#' library(GO.db)
#' GO_BP <- GOGeneSets(species="Hs", ontologies=c("BP"))
#' ListGSC <- list(GO_BP=GO_BP)
#'
#' ## package hitsTS if you also want to do GSOA, otherwise ignore it
#' hitsTS <- lapply(datalist, function(x){
#' tmp <- x[x$neg.p.value < 0.01, "id"]
#' tmp})
#'
#' ## create an object of class GSCABatch with hitsTS
#' gscaTS <- GSCABatch(expInfor = expInfor, phenotypeTS = phenotypeTS,
#'                  listOfGeneSetCollections = ListGSC, hitsTS = hitsTS)
#'
#' ## preprocess GSCABatch
#' gscaTS1 <- preprocessGscaTS(gscaTS, species="Hs", initialIDs="SYMBOL",
#'                            keepMultipleMappings=TRUE, duplicateRemoverMethod="max",
#'                            orderAbsValue=FALSE)
#' gscaTS1
preprocessGscaTS <- function(object, species="Hs", initialIDs="SYMBOL",
                         keepMultipleMappings=TRUE, duplicateRemoverMethod="max",
                         orderAbsValue=FALSE, verbose = TRUE){
    paraCheck("gscaTS", "object", object)
    tmpName <- names(object@listOfGSCA)
    tmp <- lapply(object@listOfGSCA, function(x){
    preprocess(x, species=species, initialIDs=initialIDs,
               keepMultipleMappings=keepMultipleMappings,
               duplicateRemoverMethod=duplicateRemoverMethod,
               orderAbsValue=orderAbsValue, verbose=verbose)
  })
    names(tmp) <- tmpName
    tmp
}

# analyze -----------------------------------------------------------------
#' Gene Set Collection Analysis for Time-series data.
#'
#' For each GSCA object of 'gscaList', this function will store the results from function
#' analyzeGeneSetCollections in slot result, and update information about
#' these results to slot summary of class GSCA.
#'
#' @param gscaList A named list of GSCA object generated by 'preprocessGscaTS'.
#' @param para A list of parameters for GSEA and hypergeometric tests. Details please see
#' \code{\link[HTSanalyzeR2]{analyze}}.
#' @param verbose a single logical value specifying to display detailed messages
#'  (when verbose=TRUE) or not (when verbose=FALSE), default is TRUE.
#' @param doGSOA a single logical value specifying whether to perform gene set
#' overrepresentation analysis (when doGSOA=TRUE) or not (when doGSOA=FALSE),
#' default is FALSE.
#' @param doGSEA a single logical value specifying whether to perform gene set
#' enrichment analysis (when doGSEA=TRUE) or not (when doGSEA=FALSE),
#' default is TRUE.
#' @param GSEA.by A single character value to choose which algorithm to do GSEA. Valid value
#' could either be "HTSanalyzeR2"(default) or "fgsea". If performed by "fgsea", the result explanation
#' please refer to \code{\link[fgsea:fgsea]{fgsea}}.
#' @return In the end, this function will return an updated list of GSCA object.
#' @seealso \code{\link[HTSanalyzeR2]{analyze}}
#' @export
#' @examples
#' data(d7, d13, d25)
#'
#' ## generate expInfor to describe the information of time series data
#' expInfor <- matrix(c("d7", "d13", "d25"), nrow = 3, ncol = 2,
#'                    byrow = FALSE, dimnames = list(NULL, c("ID", "Description")))
#'
#' ## package phenotypeTS into a list of phenotypes
#' datalist <- list(d7, d13, d25)
#' phenotypeTS <- lapply(datalist, function(x) {
#'                       tmp <- as.vector(x$neg.lfc)
#'                       names(tmp) <- x$id
#'                       tmp})
#'
#' ## set up a list of gene set collections
#' library(org.Hs.eg.db)
#' library(GO.db)
#' GO_BP <- GOGeneSets(species="Hs", ontologies=c("BP"))
#' ListGSC <- list(GO_BP=GO_BP)
#'
#' ## package hitsTS if you also want to do GSOA, otherwise ignore it
#' hitsTS <- lapply(datalist, function(x){
#' tmp <- x[x$neg.p.value < 0.01, "id"]
#' tmp})
#'
#' ## create an object of class GSCABatch with hitsTS
#' gscaTS <- GSCABatch(expInfor = expInfor, phenotypeTS = phenotypeTS,
#'                  listOfGeneSetCollections = ListGSC, hitsTS = hitsTS)
#'
#' ## preprocess GSCABatch
#' gscaTS1 <- preprocessGscaTS(gscaTS, species="Hs", initialIDs="SYMBOL",
#'                            keepMultipleMappings=TRUE, duplicateRemoverMethod="max",
#'                            orderAbsValue=FALSE)
#'
#' ## support parallel calculation using doParallel package
#' if (requireNamespace("doParallel", quietly=TRUE)) {
#' doParallel::registerDoParallel(cores=2)
#' } else {
#' }
#'
#' \dontrun{
#' ## do hypergeometric tests and GSEA
#' gscaTS2 <- analyzeGscaTS(gscaTS1, para=list(pValueCutoff=0.05, pAdjustMethod="BH",
#'                         nPermutations=100, minGeneSetSize=100,
#'                         exponent=1), doGSOA = TRUE, doGSEA = TRUE)
#' head(getResult(gscaTS2[[1]])$GSEA.results$GO_BP, 3)
#' }
analyzeGscaTS <- function(gscaList, para=list(pValueCutoff=0.05, pAdjustMethod="BH",
                                      nPermutations=1000, minGeneSetSize=15,
                                      exponent=1),
                          verbose = TRUE, doGSOA = FALSE,
                          doGSEA = TRUE, GSEA.by = "HTSanalyzeR2"){
              paraCheck("gscaTS", "gscaList", gscaList)
              tmpName <- names(gscaList)
              tmp <- lapply(gscaList, function(x){
                  analyze(x, para=para, verbose=verbose, doGSOA=doGSOA,
                          doGSEA=doGSEA, GSEA.by = GSEA.by)
                        })
              names(tmp) <- tmpName
              tmp
}

# appendGSTermsTS ---------------------------------------------------------
#' Append gene set terms to GSCA results for each GSCA object of Time-series data
#'
#' For each GSCA object in 'gscaList', this function
#' finds corresponding annotation terms for GO, KEGG and MSigDB gene sets and
#' inserts a column named "Gene.Set.Term" to each data frame in the GSCA results.
#' In the same time, to make results more understandable, it will annotate the gene list
#' with EntrezID to gene symbol under specific species.
#'
#' @param gscaList A named list of GSCA object.
#' @param keggGSCs A character vector of names of all KEGG gene set collections.
#' @param goGSCs A character vector of names of all GO gene set collections.
#' @param msigdbGSCs A character vector of names of all MSigDB gene set collections.
#' @param species A single character value specifying the species of the analyzed data.
#' It supports all the species of OrgDb objects in AnnotationDbi.
#' The format should be an abbreviation of the organism as setted by AnnotationDbi.
#' For example, the commonly used ones are "Dm" ("Drosophila_melanogaster"),
#' "Hs" ("Homo_sapiens"), "Rn" ("Rattus_norvegicus"), "Mm" ("Mus_musculus"),
#' "Ce" ("Caenorhabditis_elegans"), and etc.
#'
#'
#' @seealso \code{\link[HTSanalyzeR2]{appendGSTerms}}
#' @export
#' @return In the end, this function will return an updated list of GSCA object.
#' @examples
#' data(d7, d13, d25)
#'
#' ## generate expInfor to describe the information of time series data
#' expInfor <- matrix(c("d7", "d13", "d25"), nrow = 3, ncol = 2,
#'                    byrow = FALSE, dimnames = list(NULL, c("ID", "Description")))
#'
#' ## package phenotypeTS into a list of phenotypes
#' datalist <- list(d7, d13, d25)
#' phenotypeTS <- lapply(datalist, function(x) {
#'                       tmp <- as.vector(x$neg.lfc)
#'                       names(tmp) <- x$id
#'                       tmp})
#'
#' ## set up a list of gene set collections
#' library(org.Hs.eg.db)
#' library(GO.db)
#' GO_BP <- GOGeneSets(species="Hs", ontologies=c("BP"))
#' ListGSC <- list(GO_BP=GO_BP)
#'
#' ## package hitsTS if you also want to do GSOA, otherwise ignore it
#' hitsTS <- lapply(datalist, function(x){
#' tmp <- x[x$neg.p.value < 0.01, "id"]
#' tmp})
#'
#' ## create an object of class GSCABatch with hitsTS
#' gscaTS <- GSCABatch(expInfor = expInfor, phenotypeTS = phenotypeTS,
#'                  listOfGeneSetCollections = ListGSC, hitsTS = hitsTS)
#'
#' ## preprocess GSCABatch
#' gscaTS1 <- preprocessGscaTS(gscaTS, species="Hs", initialIDs="SYMBOL",
#'                            keepMultipleMappings=TRUE, duplicateRemoverMethod="max",
#'                            orderAbsValue=FALSE)
#'
#' ## support parallel calculation using doParallel package
#' if (requireNamespace("doParallel", quietly=TRUE)) {
#' doParallel::registerDoParallel(cores=2)
#' } else {
#' }
#'
#' \dontrun{
#' ## do hypergeometric tests and GSEA
#' gscaTS2 <- analyzeGscaTS(gscaTS1, para=list(pValueCutoff=0.05, pAdjustMethod="BH",
#'                         nPermutations=100, minGeneSetSize=100,
#'                         exponent=1), doGSOA = TRUE, doGSEA = TRUE)
#' head(getResult(gscaTS2[[1]])$GSEA.results$GO_BP, 3)
#'
#' ## append gene set terms to results
#'
#' gscaTS3 <- appendGSTermsTS(gscaTS2, goGSCs=c("GO_BP"),
#'                            species = "Hs")
#' head(getResult(gscaTS3[[1]])$GSEA.results$GO_BP, 3)
#' }
appendGSTermsTS <- function(gscaList, keggGSCs=NULL,
                            goGSCs=NULL, msigdbGSCs=NULL,
                            species = "Hs"){
             paraCheck("gscaTS", "gscaList", gscaList)
             tmpName <- names(gscaList)
             tmp <- lapply(gscaList, function(x){
             appendGSTerms(x, keggGSCs = keggGSCs,
                           goGSCs = goGSCs,
                           msigdbGSCs = msigdbGSCs,
                           species = species)
           })
             names(tmp) <- tmpName
             tmp
}

