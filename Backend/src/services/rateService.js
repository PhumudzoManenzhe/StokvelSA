// @ts-nocheck
const axios = require('axios');
const prisma = require('../config/database');

const SARB_BASE = 'https://custom.resbank.co.za/SarbWebApi/WebIndicators';

// ─────────────────────────────────────────
// FETCH RATES FROM SARB
// South African Reserve Bank public API
// Prime rate = repo rate + 3.5%
// ─────────────────────────────────────────
const fetchRatesFromSARB = async () => {
  try {
    // SARB indicator codes:
    // KBP1442M = Repo rate (monthly)
    // KBP2000M = Prime lending rate (monthly)
    const [repoRes, primeRes] = await Promise.all([
      axios.get(`${SARB_BASE}/ShareData/KBP1442M`, { timeout: 10000 }),
      axios.get(`${SARB_BASE}/ShareData/KBP2000M`, { timeout: 10000 }),
    ]);

    // SARB returns array of observations — get the most recent
    const repoData = repoRes.data;
    const primeData = primeRes.data;

    const repoRate = parseFloat(repoData[repoData.length - 1]?.value || 8.25);
    const primeRate = parseFloat(
      primeData[primeData.length - 1]?.value || 11.75
    );

    return { repoRate, primeRate };
  } catch (err) {
    console.warn('SARB API unavailable, using cached rates:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────
// GET CURRENT RATES
// Returns cached rates, refreshes if stale
// Cache duration: 24 hours
// ─────────────────────────────────────────
const getCurrentRates = async () => {
  // Check cache — use rates fetched within last 24 hours
  const cached = await prisma.interestRate.findFirst({
    orderBy: { fetchedAt: 'desc' },
    where: {
      fetchedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  if (cached) {
    return {
      primeRate: parseFloat(cached.primeRate),
      repoRate: parseFloat(cached.repoRate),
      fetchedAt: cached.fetchedAt,
      fromCache: true,
    };
  }

  // Cache miss — fetch from SARB
  const fresh = await fetchRatesFromSARB();

  if (fresh) {
    // Store in DB
    const stored = await prisma.interestRate.create({
      data: {
        primeRate: fresh.primeRate,
        repoRate: fresh.repoRate,
      },
    });

    return {
      primeRate: parseFloat(stored.primeRate),
      repoRate: parseFloat(stored.repoRate),
      fetchedAt: stored.fetchedAt,
      fromCache: false,
    };
  }

  // SARB down — use last known rates even if stale
  const lastKnown = await prisma.interestRate.findFirst({
    orderBy: { fetchedAt: 'desc' },
  });

  if (lastKnown) {
    return {
      primeRate: parseFloat(lastKnown.primeRate),
      repoRate: parseFloat(lastKnown.repoRate),
      fetchedAt: lastKnown.fetchedAt,
      fromCache: true,
      stale: true,
    };
  }

  // Absolute fallback — hardcoded current rates
  return {
    primeRate: 11.75,
    repoRate: 8.25,
    fetchedAt: new Date(),
    fromCache: false,
    fallback: true,
  };
};

// ─────────────────────────────────────────
// CALCULATE SAVINGS PROJECTION
// Shows member how savings grow over time
// using current prime rate
// ─────────────────────────────────────────
const calculateSavingsProjection = async (monthlyContribution, months) => {
  const rates = await getCurrentRates();
  const annualRate = rates.primeRate / 100;
  const monthlyRate = annualRate / 12;

  const projections = [];
  let balance = 0;

  for (let month = 1; month <= months; month++) {
    // Compound interest formula for recurring deposits
    balance = balance * (1 + monthlyRate) + monthlyContribution;

    projections.push({
      month,
      balance: Math.round(balance * 100) / 100,
      totalContributed: monthlyContribution * month,
      interestEarned:
        Math.round((balance - monthlyContribution * month) * 100) / 100,
    });
  }

  return {
    primeRate: rates.primeRate,
    monthlyContribution,
    projections,
    finalBalance: projections[projections.length - 1]?.balance || 0,
    totalInterestEarned:
      projections[projections.length - 1]?.interestEarned || 0,
  };
};

module.exports = {
  getCurrentRates,
  calculateSavingsProjection,
};
