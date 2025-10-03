# Project Proposal

<div align="center">
  <iframe width="560" height="320" 
    src="https://Link-to-video" 
    title="----" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
</div>

## 1. Problem Definition

When an item is out of stock (OOS), the order is at risk. We aim to recommend very similar substitutes that shoppers accept while preserving basket value, and to flag SKUs with weak substitute coverage for planners. We will evaluate against aisle-popularity and graph-only baselines using acceptance@K, Normalized Discounted Cumulative Gain (NDCG), Mean Reciprocal Rank (MRR), Retained Basket Value (RBV), coverage, and calibration. Method: build an alternation graph (items bought instead of one another), cluster with a Gaussian Mixture Model (GMM)-comparing a maximum-likelihood version to a Bayesian GMM with Large Language Model (LLM)–elicited Normal–Inverse–Wishart (NIW) priors-then train a personalized ranker using text, taxonomy, graph, and cluster-posterior features; for efficient, interpretable serving, use a k-partite graph that collapses near-duplicates into “100% buckets” and consults next-best clusters only when needed.

citation format - [[1](#wavenet)]
                  [[2](#music-gen)]


## 2. Problem
citation format - [[1](#wavenet)]
                  [[2](#music-gen)]

## 3. Methods
citation format - [[1](#wavenet)]
                  [[2](#music-gen)]

## 4. Results and Discussions


## 5. Gantt Chart and Contributions

### 5.1 Gantt Chart

[See the document](https://link-to-doc)

### 5.2 Contributions

| Name          | Contribution       |
|---------------|--------------------|
|               |                    |
|               |                    |
|               |                    |
|               |                    |
|               |                    |


## 6. References

[1] <a name="wavenet"></a>Paper reference in IEEE style

[2] <a name="music-gen"></a>Paper reference in IEEE style
