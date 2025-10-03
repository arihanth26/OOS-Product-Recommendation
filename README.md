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




## 2. Introduction & Background
### 2.1 Dataset We Use
The dataset we are using is the Instacart 2017 Market Basket Analysis corpus from Kaggle [Link here](https://www.kaggle.com/datasets/yasserh/instacart-online-grocery-basket-analysis-dataset?utm_source=chatgpt.com). It contains roughly 3 million orders placed by about 200,000 users over ~50,000 products. 

### 2.2 Data gaps and mitigation
The dataset lacks signals that would strengthen clustering and evaluation. Table 1 summarizes each gap, why it matters, and our workaround.

### 2.3 What Makes Our Project Novel

We build substitutes from an alternation graph (bought instead of) rather than co-purchase, so complements don’t contaminate candidates. We optimize for RBV and acceptance@K, and surface SKUs with weak substitute coverage for planners. On the modeling side, we compare a vanilla GMM to a Bayesian GMM with LLM-elicited NIW priors to stabilize sparse categories. For serving, a k-partite graph collapses near-duplicates into “100% buckets” and routes to next-best clusters only when needed- yielding a sparse, interpretable fallback policy.


## 3. Methods

### 3.1 Data Preprocessing

- Product title parsing: brand, type, size/pack
- Text features: TF–IDF; SBERT sentence embeddings
- Alternation graph (within aisle/department)
- Down-weighting of same-cart co-occurrences
- Graph embeddings: node2vec; DeepWalk
- SKU normalization/deduplication (“100% buckets” by brand/type/size)
- Unit-size extraction and banded cost-per-unit proxy

### 3.2 Unsupervised Learning
**U1: GMM (Maximum Likelihood Estimation):** We cluster items with a KKK-component GMM fitted by EM (expectation–maximization), initialized via k-means++ or small randomized responsibilities with a few restarts. We select K by BIC/AIC and stability checks. The resulting soft responsibilities are used directly as ranking features.

**U2: Bayesian GMM with LLM priors:** To add domain knowledge in sparse categories, we replace the vanilla GMM with a Bayesian GMM whose components have Normal–Inverse–Wishart priors over their means and covariances. We first collapse near-duplicates into “100% buckets” using brand/type/size rules, then prompt a LLM for reasonable prior centers and relative dispersion for each bucket; prior tightness is capped using small empirical samples. The model is fitted with MAP-EM or variational Bayes. If the priors disagree with data (e.g., poor BIC or posterior fit), we anneal toward weak priors or fall back to the vanilla GMM. This typically converges faster and yields cleaner, more stable clusters, improving candidate quality and downstream ranking features.

### 3.3 Supervised Learning

**S1: Personalized replacement ranking:** We simulate out-of-stock by removing an item from past carts and label a candidate accepted if it is bought within 7–14 days while the original is not repurchased. We then train a LambdaMART/GBDT ranker using features for name/taxonomy match, size/pack gap, shopper loyalty, and basket context, graph distances, and GMM responsibilities. The ranker directly optimizes acceptance@K and RBV and remains fast and interpretable.

**S2: Edge/cluster weight learning with a k-partite graph structure:** We learn pairwise edge scores that favor historically accepted substitutes and organize the product graph as k-partite: collapse near-duplicates into “100% buckets” and expose cross-partition “90% cluster” edges only when a bucket is unavailable. This prevents near-duplicate cliques, reduces candidate fan-out and inference cost, and provides a clear fallback path.


## 4. Potential Results and Discussion

**Metrics evaluated:** Top-K, Normalized Discounted Cumulative Gain (NDCG), Mean Reciprocal Rank (MRR), Precision@K, Recall@K, Retained Basket Value (RBV, via size/pack bands), and Coverage.

**Expected improvements:** Target +5-10% NDCG@5 and similar MRR over aisle-popularity/graph-only baselines; higher cluster stability for the Bayesian GMM with LLM-elicited NIW priors versus MLE GMM; and equal or better RBV with fewer edges using the k-partite graph.

**Ablations:** Compare (i) vanilla vs. Bayesian GMM (LLM priors), (ii) ranker without vs. with cluster-posterior features, and (iii) unconstrained vs. k-partite graph-evaluated under identical OOS replay windows. 

**Sustainability and efficiency:** Better first-shot acceptance reduces corrections, re-deliveries, and food waste. Our graph-based candidate generator (alternation + node2vec/DeepWalk) with a GBDT ranker is lighter than large SVD pipelines, cutting training/refresh time and energy; we will report runtimes and, where feasible, estimated energy use.


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
