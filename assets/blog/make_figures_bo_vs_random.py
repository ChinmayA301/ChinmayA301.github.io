# make_figures_bo_vs_random.py
# Generates GitHub-blog-ready PNGs:
# 1) Best-so-far curve with confidence bands (BO vs Random)
# 2) Bar chart of best reach at final budget (with error bars)
# 3) Violin plot of distribution of best reach (BO vs Random)
#
# Usage:
#   python make_figures_bo_vs_random.py
#
# Output goes to: ./assets/blog/  (edit OUT_DIR if needed)

import os
import numpy as np
import matplotlib.pyplot as plt

OUT_DIR = os.path.join("assets", "blog")
os.makedirs(OUT_DIR, exist_ok=True)

# -----------------------------
# Mock experimental results
# Replace this section later with your real experiment logs.
# Shape: runs x iterations
# -----------------------------
rng = np.random.default_rng(7)
N_RUNS = 40
N_ITERS = 25

def generate_mock_curves(method: str):
    # random: slower improvement, noisier
    # bo: faster improvement, less regret
    curves = np.zeros((N_RUNS, N_ITERS), dtype=float)

    for r in range(N_RUNS):
        if method == "random":
            base = rng.normal(10, 2)
            increments = rng.normal(1.2, 1.0, size=N_ITERS)
            trend = np.cumsum(np.clip(increments, -0.5, 3.0))
            noise = rng.normal(0, 3.0, size=N_ITERS)
            raw = base + 2.0 * trend + noise
        else:  # "bo"
            base = rng.normal(10, 2)
            increments = rng.normal(2.0, 0.9, size=N_ITERS)
            trend = np.cumsum(np.clip(increments, -0.2, 4.0))
            noise = rng.normal(0, 2.2, size=N_ITERS)
            raw = base + 2.6 * trend + noise

        # Enforce "best-so-far" (monotone nondecreasing)
        curves[r, :] = np.maximum.accumulate(raw)

    # Clamp to plausible range (e.g., reach scaled 0..100)
    curves = np.clip(curves, 0, 100)
    return curves

random_curves = generate_mock_curves("random")
bo_curves = generate_mock_curves("bo")

iters = np.arange(1, N_ITERS + 1)

def mean_ci(curves: np.ndarray, z: float = 1.96):
    # curves: runs x iters
    mean = curves.mean(axis=0)
    se = curves.std(axis=0, ddof=1) / np.sqrt(curves.shape[0])
    lo = mean - z * se
    hi = mean + z * se
    return mean, lo, hi

# -----------------------------
# 1) Best-so-far curve with CI
# -----------------------------
bo_mean, bo_lo, bo_hi = mean_ci(bo_curves)
rd_mean, rd_lo, rd_hi = mean_ci(random_curves)

plt.figure()
plt.plot(iters, rd_mean, label="Random")
plt.fill_between(iters, rd_lo, rd_hi, alpha=0.2)
plt.plot(iters, bo_mean, label="Bayesian Optimization")
plt.fill_between(iters, bo_lo, bo_hi, alpha=0.2)
plt.xlabel("Iteration")
plt.ylabel("Best-so-far Reach (scaled)")
plt.title("Best-so-far Influence: BO vs Random (mean ± 95% CI)")
plt.legend()
plt.tight_layout()
path1 = os.path.join(OUT_DIR, "bo_vs_random_best_so_far_ci.png")
plt.savefig(path1, dpi=220)
plt.close()

# -----------------------------
# 2) Bar chart: final best reach
# -----------------------------
final_random = random_curves[:, -1]
final_bo = bo_curves[:, -1]

means = [final_random.mean(), final_bo.mean()]
errs = [final_random.std(ddof=1), final_bo.std(ddof=1)]  # std as error bar (you can use SE)

plt.figure()
plt.bar(["Random", "BO"], means, yerr=errs, capsize=6)
plt.xlabel("Method")
plt.ylabel("Best Reach at Budget N (scaled)")
plt.title("Fixed Budget Outcome: Best Reach (mean ± std)")
plt.tight_layout()
path2 = os.path.join(OUT_DIR, "bo_vs_random_final_bar.png")
plt.savefig(path2, dpi=220)
plt.close()

# -----------------------------
# 3) Violin plot: distribution
# -----------------------------
plt.figure()
plt.violinplot([final_random, final_bo], showmeans=True, showextrema=True)
plt.xticks([1, 2], ["Random", "BO"])
plt.xlabel("Method")
plt.ylabel("Best Reach at Budget N (scaled)")
plt.title("Distribution of Best Reach: BO vs Random")
plt.tight_layout()
path3 = os.path.join(OUT_DIR, "bo_vs_random_final_violin.png")
plt.savefig(path3, dpi=220)
plt.close()

print("Saved:")
print(" -", path1)
print(" -", path2)
print(" -", path3)
