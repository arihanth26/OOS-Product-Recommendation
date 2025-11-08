# Out-of-Stock Product Recommendation Engine


## 1. Problem Definition

### 1.1 Problem

When an item is out of stock (OOS), the order is at risk. We aim to recommend very similar substitutes that shoppers accept while preserving basket value, and to flag SKUs with weak substitute coverage for planners. We will evaluate against aisle-popularity and graph-only baselines using acceptance@K, Normalized Discounted Cumulative Gain (NDCG), Mean Reciprocal Rank (MRR), Retained Basket Value (RBV), coverage, and calibration. Method: build an alternation graph (items bought instead of one another), cluster with a Gaussian Mixture Model (GMM)-comparing a maximum-likelihood version to a Bayesian GMM with Large Language Model (LLM)–elicited Normal–Inverse–Wishart (NIW) priors-then train a personalized ranker using text, taxonomy, graph, and cluster-posterior features; for efficient, interpretable serving, use a k-partite graph that collapses near-duplicates into “100% buckets” and consults next-best clusters only when needed.

### 1.2 Motivation

The motivation is rooted in mitigating the significant financial and customer experience costs associated with **Out-of-Stock (OOS)** items in online grocery. When an expected item is unavailable, customers face friction and often abandon their entire order or seek substitutes that diminish the **basket value (RBV)**. 

By developing a sophisticated, multi-stage engine—combining **Bayesian GMM clustering** informed by LLM priors and a **LambdaMART ranker**—we aim to dramatically boost **acceptance@K** and preserve profitability. Furthermore, identifying SKUs with poor substitute coverage provides essential, actionable signals for **inventory planning**, transforming a customer service challenge into a targeted logistics optimization opportunity.



## 2. Introduction & Background

## 2.1 Goal

When a shopper’s item is **out-of-stock (OOS)**, we must suggest a ***good replacement*** so they still check out and we retain order value. We also surface **Stock Keeping Units (SKUs)** whose best replacements are weak so planners can stock those deeper.

***Reason:*** This dual approach **protects completion** and **retained basket value (RBV)** while simultaneously **informing inventory policy** to prevent future OOS issues.

### 2.2 Dataset Description

### Instacart

* ***What it is:*** Approximately **3 million orders**, **~200,000 users**, and **~50,000 products** with the core tables `orders`, `order_products_prior,train`, `products`, `aisles`, and `departments`. These allow us to reconstruct shopping sequences and product–aisle relations at scale.
* ***Public source:*** Instacart 2017 “Market Basket Analysis” (Kaggle): [https://www.kaggle.com/c/instacart-market-basket-analysis](https://www.kaggle.com/c/instacart-market-basket-analysis).
* ***Why this dataset:*** It is large, reproducible, and widely used for basket modeling, which makes our results comparable and our pipeline easy to evaluate and replicate.

---

### Open Food Facts Dataset

* **What it is:** A large-scale, crowdsourced database of packaged food products collected globally, containing **over 2 million entries** with detailed product-level information including **product name, brand, categories, ingredients, nutritional values, serving size, quantity, and country of sale**. Each record corresponds to a unique barcode (EAN/UPC), enabling linkage across nutrition, ingredient, and category hierarchies.
* **Public source:** Open Food Facts “Product Database” (Open Data Project): [https://world.openfoodfacts.org/data](https://world.openfoodfacts.org/data)
* **Why this dataset:** Provides **rich, standardized food and nutrition information** supporting **ingredient-level analysis, nutritional profiling, and product matching** with the Instacart dataset. Its open-source nature and wide coverage make it ideal for our analysis.
  
### 2.3 What Makes Our Project Novel

We build substitutes from an alternation graph (bought instead of) rather than co-purchase, so complements don’t contaminate candidates. We optimize for RBV and acceptance@K, and surface SKUs with weak substitute coverage for planners. On the modeling side, we compare a vanilla GMM to a Bayesian GMM with LLM-elicited NIW priors to stabilize sparse categories. For serving, a k-partite graph collapses near-duplicates into “100% buckets” and routes to next-best clusters only when needed- yielding a sparse, interpretable fallback policy.


### 2.4 Literature Survey

* **node2vec** (Grover & Leskovec, 2016). This method introduces a flexible, biased **random walk** procedure to learn low-dimensional vector representations (embeddings) of nodes in graphs. It is valuable because it can capture both local neighborhood structure and broader community structure, making it ideal for retrieval tasks like finding similar **substitute items** ("items on a map" style retrieval).
* **DeepWalk** (Perozzi et al., 2014). An earlier, foundational method that uses standard uniform **random walks** to embed graph nodes. It paved the way for modern graph representation learning and is crucial for creating robust **product-graph embeddings** that capture item-to-item relatedness based on co-occurrence in shopper baskets.
* **Learning to Rank / LambdaMART** (Burges, 2010). This is a core **boosted tree ranking** approach derived from Microsoft Research. It optimizes directly for ranking metrics like **NDCG** by treating the gradient as the change in the ranking metric (the "lambda"). It is the standard-bearer for supervised ranking in search and recommendation systems due to its high performance and feature handling capabilities.
* **Substitution Policies in Online Grocery** (Hoang & Breugelmans, 2023). This work focuses specifically on how different retailer **substitution rules** (e.g., brand-only, size-up) affect customer acceptance and value perception in grocery retail. This motivates the project's goal of optimizing the recommendation engine to maximize **acceptance** and **Retained Basket Value (RBV)**, rather than just raw prediction accuracy.
* **LLM-Prior** (Huang, 2025). This emerging technique automates **Bayesian prior elicitation** by leveraging large language models (LLMs). The LLM is used to translate unstructured **product context** (descriptions, categories, brand history) into structured **Normal-Inverse-Wishart (NIW) hyperparameters** for the Bayesian GMM. This allows us to inject crucial domain knowledge into the clustering process, especially when training data is sparse.




## 3. Methods

### 3.1 Data Preprocessing Implemented 

This section describes how we preprocessed and combined **Instacart grocery products (Kaggle)** with **OpenFoodFacts** ingredient and nutrition data, producing a unified table that aligns retail and compositional attributes. The preprocessing required extensive normalization and entity matching across two heterogeneous datasets that lacked a common identifier such as barcode or SKU.

**Challenges:**  
Instacart data provided structured product and category information (`product_name`, `aisle`, `department`) but no nutritional attributes, whereas OpenFoodFacts offered rich metadata with highly variable text fields (`product_name`, `brands`, `categories`) across multiple languages and inconsistent formatting. Direct string joins produced poor recall, motivating a hybrid semantic–fuzzy matching approach.

---

### Step 1. Instacart Data Preparation
We used the Kaggle **Instacart Online Grocery Shopping Dataset**, retaining `products.csv`, `aisles.csv`, and `departments.csv`. These were merged into a clean product table containing product IDs, names, aisles, and departments for subsequent linkage.

---

### Step 2. OpenFoodFacts Processing
The OpenFoodFacts dataset was accessed through the `datasets` library in Python (Hugging Face).  
Only relevant columns were retained: `product_name`, `brands`, `categories`, `ingredients_text`, `ingredients_tags`, `nutriments`, and related metadata.

- **Filtering:** Restricted to U.S. products (`countries_tags` containing “en:united-states”) with valid ingredient lists and “en:ingredients-completed” state tags.  
- **Text Flattening:** Extracted text from nested list–dictionary structures, lowercased, and removed punctuation and extra whitespace.  
- **Category Cleaning:** Normalized `compared_to_category` by removing language prefixes and non-alphanumeric characters to form a clean `final_category`.  
- **Nutriments Expansion:** The nested `nutriments` JSON field was flattened into individual columns. Attributes with fewer than 20% missing values (e.g., `energy_100g`, `fat_100g`, `saturated-fat_100g`, `sugars_100g`, `proteins_100g`, `salt_100g`, `fiber_100g`) were retained, yielding a consistent columnar nutrient schema.

---

### Step 3. Product Matching
To align Instacart products with OpenFoodFacts entries, we developed a multi-stage hybrid pipeline combining deep embeddings, approximate nearest-neighbor retrieval, and rule-based scoring.

1. **Normalization:** Standardized product names (lowercase, punctuation and unit removal) and removed constant stopwords (`inc`, `ltd`, `co`, `pack`, `oz`, `ml`, `g`, `kg`, etc.).  
2. **Semantic Embedding:** Encoded each name using `SentenceTransformer('all-MiniLM-L6-v2')` to obtain 384-dimensional vectors capturing contextual meaning.  
3. **Candidate Retrieval:** Constructed a FAISS index on OpenFood embeddings and retrieved top-K (≈ 50) nearest candidates per Instacart product.  
4. **Fuzzy Re-Scoring:** For each candidate pair, computed multiple similarity metrics (`token_set_ratio`, `token_sort_ratio`, `WRatio`, `Jaro–Winkler`). Perfect token matches favored longer, more descriptive names.  
5. **Rule-Based Final Selection:**  
   A deterministic hierarchy of six rules was applied to assign one final match per product.

   Let each Instacart product be *q*, and its candidate set *C = {cᵢ}* retrieved from FAISS.  
   We compute four similarity scores: *WRatio*, *token_set_ratio* (TS), *token_sort_ratio* (TSort), and *Jaro–Winkler* (Jaro).  
   Tie-breakers prefer higher secondary scores (Jaro → TSort → TS), then longer candidate strings |cᵢ|, then lexicographic order for determinism.

   **Rules:**

   - **R1. High WRatio:**  
     If `max_i WRatio(q, c_i) > 90`, select `c* = argmax_i WRatio(q, c_i)`;  
     `final_algo = WRatio`.
   - **R2. Single-Word, Perfect Token Set, High Jaro:**  
     If ∃ i such that `TS(q, c_i)=100`, `isSingle(q)` and `Jaro(q, c_i) > 90`,  
     choose `c* = argmax Jaro(q, c_i)`; `final_algo = Jaro`.
   - **R3. Single-Word, Matching Last Token, Equal Jaro = TSort:**  
     If `TS(q, c_i)=100`, `isSingle(q)`, `last(q)=last(c_i)`, and `TSort=Jaro`,  
     select `c* = argmax Jaro(q, c_i)`; `final_algo = Jaro`.
   - **R4. Perfect Token Set, Matching Last Token, High Jaro:**  
     If `TS(q, c_i)=100`, `last(q)=last(c_i)`, `Jaro(q, c_i) > 85`, and `Jaro=TSort`,  
     pick `c* = argmax Jaro(q, c_i)`; `final_algo = Jaro`.
   - **R5. Perfect Token Set:**  
     If any candidate has `TS(q, c_i)=100`, select `c* = argmax TS(q, c_i)`  
     using tie-breakers (prefer higher Jaro → TSort → longer |cᵢ|);  
     `final_algo = TokenSet`.
   - **R6. No Confident Match:**  
     If none of the above apply, mark as “Not Confident”;  
     `final_algo = None`, `final_score = 0`.

   Each product record stored `final_match` (`c*` string), `final_algo`, and `final_score`, along with diagnostic fields (token count, last tokens, and top-K similarity scores) for transparency and reproducibility.

---

### Step 4. Integration
Matched pairs were merged back with Instacart product data, and corresponding OpenFood entries were joined via the selected `final_match`.  
The integrated dataset contained:
- Instacart product IDs, names, and category hierarchy  
- OpenFood ingredient and nutrient attributes  
- Match scores and algorithmic provenance  

---

### Outcome
The resulting unified dataset harmonized transactional and nutritional dimensions of grocery products, supporting downstream clustering for nutritional profiling, ingredient analysis, and diet-aware recommendation modeling. The pipeline is fully reproducible and generalizable to other retail–nutrition integration tasks.



## 3.2 Unsupervised Machine Learning Model Implemented

---

### Gaussian Mixture Model (GMM) via Maximum Likelihood Estimation (MLE):

We cluster items using a **$K$-component GMM** (a probabilistic clustering model that assigns each item a soft membership over components) fitted with **expectation–maximization, EM** (an iterative procedure that alternates between computing posterior memberships and re-estimating parameters). We initialize with k-means++ or small randomized $1/K$ responsibilities and keep three restarts to reduce sensitivity to local optima. The number of components $K$ is selected using Bayesian/Akaike criteria (BIC/AIC) and cluster stability. This baseline provides well-calibrated posterior responsibilities that become strong, low-leakage features for ranking.

### 3.3 GMM Implementation

---
## Feature Engineering

Before clustering, the pipeline performed extensive **feature engineering** to transform raw product data into a vector space that the Gaussian Mixture Model (GMM) could effectively process:

### Product Bucketing
* **Product Layer (P0 & P1):** Products were first grouped into granular buckets (**P1 Buckets**) based on high similarity in name ($\ge 0.92$) and a tight tolerance for the price variable ($\le 10\%$). This ensures that the clustering algorithm works with averaged, highly representative product units rather than raw, noisy product data. The function `make_buckets` was used for this implementation.

### Feature Vectors
Each bucket was represented by a high-dimensional feature vector combining three critical aspects:

* **Text/Sensory:** Features derived from **TF-IDF** and **Truncated SVD** on product names and ingredient lists (capturing type, flavor, and quality cues).
* **Price:** The Robust-Scaled `PRICE_PER_100G` (capturing value segment).
* **Category:** **One-Hot Encoded** representations of the product's aisle (capturing context).

### Dimensionality Reduction
* A final **Truncated SVD (PCA)** was applied to this combined vector to create the **96-dimensional input** for the GMM, ensuring the model focuses on the most significant variance in the data. This gave the input matrix for the GMM algorithm to train on, and is implemented in the `average_by_bucket` function.

---

## Training: Gaussian Mixture Model (GMM)

A **Gaussian Mixture Model (GMM)** was employed to perform **soft clustering**, which allows each product to have a probabilistic membership across multiple clusters. This is a suitable choice for substitution modeling where a product may belong to more than one potential substitute group. A custom function, `sweep_gmm_metrics()`, was used to train multiple GMMs across different cluster counts ($k$ values) and compute performance metrics such as **AIC**, **BIC**, **Silhouette**, and **Davies–Bouldin (DB)** scores.

The parameter `tiny_frac` was set to a low value to ensure finer cluster resolution without overfitting.

### GMM Cluster Characteristics
Each GMM cluster is characterized by:
* **Mean ($\mu$):** Represents the centroid or center of the cluster in the feature space.
* **Covariance ($\Sigma$):** Describes the shape and orientation of the cluster. A **full covariance matrix** was used, enabling flexible, non-spherical cluster boundaries to fit complex data distributions.
* **Mixing Weight ($\pi$):** Represents the probability that a randomly selected product belongs to that cluster.

### Training Algorithm
The GMM was trained using the **Expectation-Maximization (EM)** algorithm:
* **E-step:** Compute the responsibilities, i.e., the probability that each product belongs to each cluster.
* **M-step:** Update the parameters (means, covariances, and mixing weights) to maximize the likelihood of observing the given data.

---

## 4. Results and Discussion

---

### 4.1 Quantitative Metrics

### 4.1.1 Silhouette Score

The **Silhouette Score** measures how similar an object is to its own cluster compared to other clusters. It ranges from -1 to 1, where a higher value indicates better-defined clusters. 

The optimal Gaussian Mixture Model (GMM) configuration was achieved through a multi-stage iterative process that analyzed the impact of feature selection and cluster count ($k$) on model performance, primarily measured by the Silhouette Score. 

#### Analysis of Silhouette Score:

* **Using Price Metrics as primary:** GMM with price as the dominant feature yielded a Silhouette Score of **0.07** with 48 clusters, indicating poorly defined groups.
* **Using Elbow Curve Evaluation:** Using an elbow curve to estimate optimal $k$ led to 48 clusters and a score of **0.41**, showing moderate improvement.
* **Using Ingredient Features from OpenFoodFacts dataset:** Incorporating additional ingredient and nutrition features from the OpenFoodFacts dataset and performing TF-IDF + SVD feature extraction produced significantly better clusters.

Using AIC/BIC and elbow methods, the optimal number of clusters was determined as **$k = 96$**, resulting in a **Silhouette Score of 0.73**, indicating well-separated and coherent clusters.

Functions like `suggest_optimal_k` and `plot_elbow_and_metrics` were developed to automate and visualize the process of selecting the optimal number of clusters.

### 4.1.2 AIC and BIC

The **Akaike Information Criterion (AIC)** and **Bayesian Information Criterion (BIC)** were employed to assess model quality and penalize overfitting.

* Both metrics balance model fit (log-likelihood) and model complexity (number of parameters).
* A **lower AIC/BIC** value corresponds to a better model.

The BIC curve showed a clear minimum near **$k = 96$**, aligning with the silhouette results, confirming the model's optimal complexity.

### 4.1.3 Davies–Bouldin (DB) Index

The **DB index** quantifies cluster separation and compactness, where **lower values ($<1$)** indicate well-separated clusters. 

At **$k = 96$**, the DB index was observed to be 0.8, further validating the quality of clustering.



**Figure 1: GMM Model Selection and Cluster Visualization: Optimal $k=96$ determined by BIC, Silhouette, and Davies-Bouldin metrics.**


![https://github.com/user/repo/raw/main/assets/image.png](https://github.gatech.edu/Group44-OOS-Recommendation/OOS-Product-Recommendation-Engine/blob/main/images/gmm_evaluation_plot.png)

### 4.2 Vizualization

## Visualization and K-Partite Graph Construction

To interpret and operationalize the clustering results, a **$k$-partite graph** was constructed to represent relationships across three levels of abstraction:

* **P1 Nodes:** Represent product buckets grouped by name similarity.
* **P2 Nodes:** Represent cluster centroids from the GMM (i.e., each P2 node is a product cluster in feature space).
* **P3 Nodes:** Represent aisles or higher-level product categories.

The $k$-partite graph was created using the `build_kpartite_graph` function, which connects these nodes based on their relationships.

### Graph Edges
The function creates the following connections:

* **P1 $\to$ P2:** Connect product buckets to their respective GMM clusters.
* **P2 $\to$ P3:** Link each cluster to its corresponding aisle.
* **P2 $\to$ P2:** Capture inter-cluster relationships based on **cosine similarity** between cluster centroids, identifying clusters that share similar product compositions.

### Visualization

The graph was visualized using the `networkx` library:

* **P3 Nodes (Light Green):** Represent aisles.
* **P2 Nodes (Dark Green):** Represent GMM clusters (P2), numbered from 1–96.
* **P2–P2 edges:** Depict inter-cluster mappings, emphasizing similarity scores between clusters.



![plot]()
*Figure: Overall Substitution K-Partite Graph with Aisles, Clusters and P2-P2 Mappings.*

An individual drill-down visualization for a particular cluster in this $k$-partite graph can be seen below:



![plot](/images/individual_cluster_graph.png)
*Figure: Hierarchical Drill-Down: Products in Cluster 44 (Aisle: water seltzer sparkling water).*

This visual network provides an intuitive way to explore substitution relationships and product proximity within and across aisles, which is critical for the supervised learning algorithm and substitution ranking.

---

### 4.3 Analysis of Algorithm

The **Gaussian Mixture Model (GMM)** effectively captured the nuanced relationships between grocery products by allowing soft membership across multiple clusters, which is ideal for substitution scenarios. The iterative **Expectation-Maximization (EM)** training achieved stable convergence, and the combination of **textual, price, and nutritional features** significantly improved cluster quality.  

The optimal configuration, determined through **AIC**, **BIC**, and **Silhouette Score** analysis, was found at **k = 96**, yielding a high **Silhouette Score of 0.73** and a **Davies–Bouldin Index below 1**, indicating compact and well-separated clusters. These results validate the **GMM’s suitability** as a foundational unsupervised layer for generating meaningful product substitutes and guiding downstream personalized ranking.


### 4.4 Next Steps

With the baseline GMM, $k$-partite graph, and evaluation harness in place, the next phase focuses on strengthening the clustering foundation and validating it under task-driven metrics. We will re-cluster with a **Bayesian GMM** using **LLM-elicited–Normal–Inverse–Wishart (NIW) priors** and benchmark against the **MLE GMM** (log-likelihood/BIC or ELBO; silhouette; bootstrap stability; purity vs. near-duplicate buckets and alternation constraints). Next, we will finalize the **out-of-stock (OOS) replay simulator**: remove item $i$ from historical baskets, surface candidates from the $k$-partite graph, and label accepted if a substitute is purchased while $i$ is not repurchased within 7/14/28 days; we will time-split by order date and keep users disjoint across train/validation/test to avoid leakage. For supervised learning, we will compare **LightGBM–LambdaMART** and **XGBoost** (pairwise/listwise ranking) using features from text/taxonomy, unit-value gaps, shopper/basket context, graph distances, and GMM responsibilities; model selection will use nested cross-validation with early stopping and Bayesian hyper-parameter search. Offline, we will report the metrics: **Top-K, NDCG@K** (Normalized Discounted Cumulative Gain), **MRR** (Mean Reciprocal Rank), **Precision@K**, **Recall@K**, **Retained Basket Value (RBV)**, **Coverage**, and **probability calibration** (Brier score and Expected Calibration Error)—with department-level breakdowns and 95% bootstrap confidence intervals; we will also include ablations (MLE vs. Bayesian GMM; ranker with/without cluster features; unconstrained vs. $k$-partite graph) and efficiency reads (training/refresh time, inference latency, and candidate fan-out/edge count). Beyond efficiency, we will log hardware/runtime counters (CPU/GPU hours, memory) and estimate energy CO2 using a lightweight tracker (e.g., codecarbon) per training refresh and per 1k recommendations, enabling like-for-like sustainability comparisons across models and serving policies. We will ship an interactive D3.js visualization of clusters and aisles, and we will finalize replenishment signals by ranking SKUs on RBV-at-risk multiplied by acceptance depth to identify where to deepen stock or engineer better substitutes.

## 5. References

1.  A. Grover and J. Leskovec, "node2vec: Scalable feature learning for networks," *KDD*, 2016.
2.  B. Perozzi, R. Al-Rfou, and S. Skiena, "DeepWalk: Online learning of social representations," *KDD*, 2014.
3.  C. Burges, "From RankNet to LambdaRank to LambdaMART," MSR-TR-2010-82, 2010.
4.  T. Hoang and E. Breugelmans, "Substitution policies in online grocery," *Journal of Retailing & Consumer Services*, 2023.
5.  Recent work on Large Language Model (LLM)-elicited priors for Bayesian models and weakly supervised clustering/ranking (specific 2024–2025 citations to be added in the final).


## 6. Contribution Table

## Team Contributions (Midterm)

| Name | Midterm Contributions |
| :--- | :--- |
| Arihanth Jayavijayan | Model Selection, Model Coding, Modeling Evaluation, Visualization of Clustering, Midterm Report |
| Riya Bharathwaj | Data Sourcing, EDA, Modeling Evaluation, Visualization of Clustering, Midterm Report |
| Malhar Jadhav | EDA, Model Selection, Model Coding, Modeling Evaluation, Midterm Report |
| Nirmal Francis Xavier | Data Preprocessing, Data Cleaning, EDA, Modeling Evaluation, Midterm Report |



## 7. Gantt Chart

![plot](/images/Gantt_Image.png)
[See the document](/docs/Midterm_Gantt_Chart.xlsx)

