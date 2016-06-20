// This file was generated by Rcpp::compileAttributes
// Generator token: 10BE3573-1514-4C36-9D1C-5A225CD40393

#include <Rcpp.h>

using namespace Rcpp;

// calcGScoreCPP
double calcGScoreCPP(IntegerVector Set, NumericVector Eso);
RcppExport SEXP HTSanalyzeR2_calcGScoreCPP(SEXP SetSEXP, SEXP EsoSEXP) {
BEGIN_RCPP
    Rcpp::RObject __result;
    Rcpp::RNGScope __rngScope;
    Rcpp::traits::input_parameter< IntegerVector >::type Set(SetSEXP);
    Rcpp::traits::input_parameter< NumericVector >::type Eso(EsoSEXP);
    __result = Rcpp::wrap(calcGScoreCPP(Set, Eso));
    return __result;
END_RCPP
}
