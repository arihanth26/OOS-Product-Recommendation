# Step 3: Creating Mapping between Ingredient Data (OpenFoodFacts) and Product Data (Instacart)

---

## Step 1 — Instacart Dataset (Kaggle)

**Source:** [The Instacart Online Grocery Shopping Dataset](https://www.kaggle.com/c/instacart-market-basket-analysis/data)

**Files Used**
- `products.csv` — product ID, name, aisle ID, department ID  
- `aisles.csv` — aisle names  
- `departments.csv` — department names  
- `order.csv` — order history

**Goal**
Produce a clean table of Instacart products (ID, name, category) for downstream matching.

---

## Step 2 — OpenFoodFacts Ingredient Data Extraction and Preparation

**Source:** [OpenFoodFacts Dataset](https://world.openfoodfacts.org/data)

**Columns Retained**
`product_name`, `brands`, `categories`, `categories_tags`, `compared_to_category`,  
`states_tags`, `ingredients_text`, `ingredients_original_tags`, `ingredients_tags`,  
`nutriments`, `nutrition_data_per`, `product_quantity_unit`, `product_quantity`,  
`serving_quantity`, `serving_size`, `traces_tags`, `countries_tags`

### Filtering
- Keep only U.S. products (`countries_tags` contains `"en:united-states"`)
- Exclude rows with missing `product_name` or `ingredients_text`
- Keep only records where `states_tags` include `"en:ingredients-completed"`

### Flattening
- Extract text from list/dict fields (`product_name`, `ingredients_text`)
- Clean category fields to remove `"en:"` prefix and punctuation
- Expand nested `nutriments` dicts into wide columns  
  - Retain only those with less than 20% missing values

**Output:**  
Flat, deduplicated OpenFoodFacts table with U.S. products containing product names, ingredients, categories, and nutriments.

---

## Step 3 — Mapping OpenFoodFacts Ingredients to Instacart Products

### 3.1 Text Normalization
- Convert text to lowercase  
- Remove punctuation, units, and extra spaces  
- Remove **constant stopwords** (fixed list, not dynamically generated):

```
{inc, ltd, co, company, pack, pcs, pc, oz, ml, kg, g, gram, grams, fl, tbsp, tsp, limited}
```

Purpose: eliminate filler terms (legal or quantity words) that don’t help identity matching.

---

### 3.2 Semantic Candidate Retrieval (Embeddings + FAISS)

- Generate **SentenceTransformer** embeddings (`all-MiniLM-L6-v2`) for all product names.  
  These 384-dimensional vectors capture semantic meaning (e.g., “Coke Zero Sugar” ≈ “Coca-Cola Zero”).  
- Build a **FAISS index** on all OpenFood embeddings.  
- For each Instacart product vector, retrieve top-K (≈ 50) semantically closest candidates.

**Why**  
This step provides high recall — embedding similarity finds potential matches efficiently, even when word order or phrasing differs.

_Pseudocode_
```
for each product in Instacart:
    v = embed(product)
    C = FAISS.topK(v, K)
```

---

### 3.3 Fuzzy Re-Scoring (String Precision)

For each product–candidate pair returned by FAISS:
- Compute four fuzzy similarity metrics:
  - token_set_ratio  
  - token_sort_ratio  
  - WRatio  
  - Jaro–Winkler
- If multiple candidates have token_set_ratio = 100, select the **longest** candidate string.

**Why**
Embeddings ensure semantic closeness (recall).  
Fuzzy scoring ensures literal correctness (precision).

---

### 3.4 Final Selection Logic

A deterministic hierarchy decides which algorithm defines the **final match**:

| Priority | Condition | Algorithm |
|-----------|------------|------------|
| 1 | WRatio > 90 | **WRatio** |
| 2 | token_set = 100, single-word query, Jaro > 90 | **Jaro** |
| 3 | token_set = 100, single-word query, last words equal, token_sort = Jaro | **Jaro** |
| 4 | token_set = 100, Jaro > 85, last words equal, Jaro = token_sort | **Jaro** |
| 5 | token_set = 100 | **TokenSet** |
| – | otherwise | **Not confident** |

_Pseudocode_
```
if WRatio > 90: select WRatio
elif token_set == 100 and single_word and Jaro > 90: select Jaro
elif token_set == 100 and single_word and last(q)==last(jaro_match) and token_sort==Jaro: select Jaro
elif token_set == 100 and Jaro > 85 and last(q)==last(jaro_match) and Jaro==token_sort: select Jaro
elif token_set == 100: select TokenSet
else: Not confident
```

Each record stores:
- `final_algo` — which condition fired  
- `final_match` — chosen matched ingredient  
- `final_score` — similarity score

---

### 3.5 Combined Rationale

| Layer | Technique | Purpose |
|--------|------------|----------|
| **SentenceTransformer + FAISS** | Deep-learning semantic retrieval | Identify relevant candidates efficiently |
| **RapidFuzz metrics** | Classical edit distance | Validate literal equality and format |
| **Rule-based logic** | Deterministic post-processing | Ensure best fuzzy metric is used for each case |

**Embeddings →** decide *who to compare* (semantic recall)  
**Fuzzy matching →** decide *who truly matches* (string precision)

---

## Step 4 — Integration and Join

- Join mapping (`final_match`) with Instacart `products.csv` to attach matched ingredient IDs.  
- Join mapping with OpenFoodFacts on the chosen match key.  
- Final dataset contains:
  - Instacart product IDs and categories  
  - OpenFood ingredient and nutritional data  
  - Matching algorithm, score, and confidence label

---


