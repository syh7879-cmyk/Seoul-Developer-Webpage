export type FeasibilityInputs = {
  appliedFar: number;
  averageUnitAreaSqm: number;
  expectedSalePricePerSqm: number;
  constructionCostPerSqm: number;
  otherCostRatio: number;
};

export type FeasibilityResults = {
  totalLandAreaSqm: number;
  expectedGfaSqm: number;
  expectedHouseholds: number;
  expectedSalesRevenue: number;
  expectedConstructionCost: number;
  expectedOtherCost: number;
  expectedTotalCost: number;
  expectedProfit: number;
  roi: number;
};
