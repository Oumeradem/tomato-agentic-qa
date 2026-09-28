# End-to-End Checkout Flow Test Report

**Date:** 2026-09-28
**Test Account:** Almazabebe@gmail.com (from .env)

## Summary

PASS: 5/5 automatable checkout stages

## Results

| Stage | Status |
|-------|--------|
| LOGIN | PASS |
| ADD_TO_CART | PASS |
| CART | PASS ($12 + $2 = $14) |
| DELIVERY_INFO | PASS |
| STRIPE_HANDOFF | PASS (order data verified) |
| STRIPE_PAYMENT | SKIPPED (not CI-stable) |

All artifacts in tmp/e2e/
