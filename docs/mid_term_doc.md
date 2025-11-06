# Out-of-Stock Product Recommendation Engine

## 1. Introduction & Background
### 1.1 Dataset We Use
The dataset we are using is the Instacart 2017 Market Basket Analysis corpus from Kaggle [Link here](https://www.kaggle.com/datasets/yasserh/instacart-online-grocery-basket-analysis-dataset?utm_source=chatgpt.com). It contains roughly 3 million orders placed by about 200,000 users over ~50,000 products. 

### 1.2 Data gaps and mitigation
The dataset lacks signals that would strengthen clustering and evaluation. Table 1 summarizes each gap, why it matters, and our workaround.

![Table](images/image.png)

### 1.3 What Makes Our Project Novel

We build substitutes from an alternation graph (bought instead of) rather than co-purchase, so complements don’t contaminate candidates. We optimize for RBV and acceptance@K, and surface SKUs with weak substitute coverage for planners. On the modeling side, we compare a vanilla GMM to a Bayesian GMM with LLM-elicited NIW priors to stabilize sparse categories. For serving, a k-partite graph collapses near-duplicates into “100% buckets” and routes to next-best clusters only when needed- yielding a sparse, interpretable fallback policy.

## 2. Problem Definition

When an item is out of stock (OOS), the order is at risk. We aim to recommend very similar substitutes that shoppers accept while preserving basket value, and to flag SKUs with weak substitute coverage for planners. We will evaluate against aisle-popularity and graph-only baselines using acceptance@K, Normalized Discounted Cumulative Gain (NDCG), Mean Reciprocal Rank (MRR), Retained Basket Value (RBV), coverage, and calibration. Method: build an alternation graph (items bought instead of one another), cluster with a Gaussian Mixture Model (GMM)-comparing a maximum-likelihood version to a Bayesian GMM with Large Language Model (LLM)–elicited Normal–Inverse–Wishart (NIW) priors-then train a personalized ranker using text, taxonomy, graph, and cluster-posterior features; for efficient, interpretable serving, use a k-partite graph that collapses near-duplicates into “100% buckets” and consults next-best clusters only when needed.

## Methods

### Data Preprocessing and Integration

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
