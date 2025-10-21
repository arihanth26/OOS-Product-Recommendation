# Out-of-Stock Product Recommendation Engine
This repository contains the code for our CS7641 Machine Learning project. When an item is out of stock (OOS), the order is at risk. We aim to recommend very similar substitutes that shoppers accept while preserving basket value, and to flag SKUs with weak substitute coverage for planners.

## Setup

### 1. Prerequisites

Make sure you have the following installed:

- **Python 3.11+**
- **pip** 
- **git** 

Check your Python version:
```bash
python --version
```

### 2. Clone the repo 

```bash
git clone https://github.gatech.edu/Group44-OOS-Recommendation/OOS-Product-Recommendation-Engine.git
cd OOS-Product-Recommendation-Engine
```

### 3. Create and Activate the environment 

Create a new virtual environment inside the project folder:

```bash
py -3.11 -m venv .venv  
```
### 4. Activate the environment

#### macOS/Linux:

```bash
source .venv/bin/activate
```

#### Windows (PowerShell):

Update PowerShell’s execution policy to allow running scripts - This may be needed to run the following line.
```bash
 Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

```bash
.venv\Scripts\Activate.ps1
```

You’ll see (.venv) appear in your terminal prompt, confirming activation.


### 5. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Optional: freeze exact versions for reproducibility:

```bash
pip freeze > requirements-lock.txt
```

### 6. Verify Installation

```bash
python -c "import numpy, pandas, sklearn" 
```

### 7. Data Directory Setup

** Note:** Data files are not committed to Git for privacy, storage, and reproducibility reasons.  
Each collaborator must manually download and place the data locally.

### Create this folder structure:
```
OOS-Product-Recommendation-Engine/
│
├── data/                     # Local data (not in git)
│   ├── raw/                  # Original datasets
│       ├── aisles.csv
│       ├── departments.csv
│       ├── order_products__prior.csv
│       ├── order_products__train.csv
│       ├── orders.csv
│       ├── products.csv
│       ├── products_with_prices_ingredients_nutrition.csv
│   ├── processed/            # Cleaned/transformed data
│   ├── external/             # Optional APIs or external sources
│   └── README.txt            # Short note on where the data came from
│
├── notebooks/                # Jupyter notebooks
├── src/                      # Python source code
├── requirements.txt
├── .gitignore
└── .venv/
```
### The folder `data/` is excluded in `.gitignore`:
```gitignore
data/
!data/sample_*.csv
```
This allows small *example/sample data* files to be tracked for demos,  
while full datasets remain local.


## Usage
How to run training, notebooks, or Streamlit app.

## Results
One figure or short description of outcomes.

## Docs
See [docs/](docs/) for full proposal, midterm, and final reports.